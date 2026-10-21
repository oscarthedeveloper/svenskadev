begin;

-- ============================================================================
-- E21: Lagringsmodell, import och skrivskydd för Runsidan på fornsvenska.se
-- ============================================================================

-- 1. Metadata för publicerade runologiska datasetversioner (t.ex. '2026.1-pilot')
create table if not exists public.svenska_runor_datasets (
  version text primary key check (version ~ '^[0-9]{4}\.[0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  inscription_count integer not null check (inscription_count >= 0),
  checksum_sha256 text not null check (length(checksum_sha256) = 64),
  published_at timestamptz not null default now(),
  published_by text
);

alter table public.svenska_runor_datasets enable row level security;
revoke all on public.svenska_runor_datasets from anon, authenticated;
grant select on public.svenska_runor_datasets to anon, authenticated;
grant insert, update, delete on public.svenska_runor_datasets to authenticated;

create policy "Publikt läsbara datasetmetadata"
  on public.svenska_runor_datasets
  for select to anon, authenticated
  using (true);

create policy "Administratörer hanterar datasetmetadata"
  on public.svenska_runor_datasets
  for all to authenticated
  using ((select public.svenska_is_admin()))
  with check ((select public.svenska_is_admin()));

-- 2. Publicerade inskriftsutgåvor (endast published = true synliga för anonyma besökare)
create table if not exists public.svenska_runor_editions (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  signum text not null unique,
  content jsonb not null,
  published boolean not null default true,
  dataset_version text not null references public.svenska_runor_datasets(version) on update cascade,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists svenska_runor_editions_signum_idx on public.svenska_runor_editions(signum);
create index if not exists svenska_runor_editions_published_idx on public.svenska_runor_editions(published);
create index if not exists svenska_runor_editions_version_idx on public.svenska_runor_editions(dataset_version);

alter table public.svenska_runor_editions enable row level security;
revoke all on public.svenska_runor_editions from anon, authenticated;
grant select on public.svenska_runor_editions to anon, authenticated;
grant insert, update, delete on public.svenska_runor_editions to authenticated;

create policy "Publikt publicerade inskrifter eller administratör"
  on public.svenska_runor_editions
  for select to anon, authenticated
  using (published = true or (select public.svenska_is_admin()));

create policy "Administratörer hanterar inskriftsutgåvor"
  on public.svenska_runor_editions
  for all to authenticated
  using ((select public.svenska_is_admin()))
  with check ((select public.svenska_is_admin()));

-- 3. Kuraterade arbetsutkast (helt skyddade och osynliga för externa/anonyma besökare)
create table if not exists public.svenska_runor_drafts (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  signum text not null unique,
  content jsonb not null,
  revision integer not null default 1,
  dirty boolean not null default true,
  manual_curation boolean not null default false,
  curation_notes text,
  updated_at timestamptz not null default now()
);

alter table public.svenska_runor_drafts enable row level security;
revoke all on public.svenska_runor_drafts from anon, authenticated;
grant select, insert, update, delete on public.svenska_runor_drafts to authenticated;

create policy "Enbart redaktionen ser och hanterar runutkast"
  on public.svenska_runor_drafts
  for all to authenticated
  using ((select public.svenska_is_admin()))
  with check ((select public.svenska_is_admin()));

-- 4. Funktion för att importera/uppdatera ett utkast med skydd för manuella rättelser
create or replace function public.svenska_import_runic_draft(
  p_slug text,
  p_signum text,
  p_content jsonb,
  p_overwrite_manual boolean default false
) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  v_existing public.svenska_runor_drafts%rowtype;
  v_result_rev integer;
begin
  if not public.svenska_is_admin() then
    raise exception 'Administratörsbehörighet krävs';
  end if;

  select * into v_existing from public.svenska_runor_drafts where slug = p_slug for update;

  if found and v_existing.manual_curation and not p_overwrite_manual then
    -- Manuell rättelse bevaras och skrivs inte över
    return jsonb_build_object(
      'slug', p_slug,
      'status', 'preserved_manual_curation',
      'revision', v_existing.revision
    );
  end if;

  insert into public.svenska_runor_drafts (
    slug,
    signum,
    content,
    revision,
    dirty,
    manual_curation,
    curation_notes,
    updated_at
  ) values (
    p_slug,
    p_signum,
    p_content,
    1,
    true,
    false,
    null,
    now()
  )
  on conflict (slug) do update
    set signum = p_signum,
        content = p_content,
        revision = public.svenska_runor_drafts.revision + 1,
        dirty = true,
        updated_at = now()
    returning revision into v_result_rev;

  return jsonb_build_object(
    'slug', p_slug,
    'status', 'imported',
    'revision', v_result_rev
  );
end;
$$;

-- 5. Atomär funktion för att publicera en hel datasetversion från godkända utkast
create or replace function public.svenska_publish_runic_dataset(
  p_version text,
  p_title text,
  p_checksum text,
  p_publisher text default 'Redaktionen'
) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  v_draft_count integer;
  v_edition_count integer;
begin
  if not public.svenska_is_admin() then
    raise exception 'Administratörsbehörighet krävs';
  end if;

  select count(*) into v_draft_count from public.svenska_runor_drafts;

  if v_draft_count = 0 then
    raise exception 'Inga utkast finns att publicera';
  end if;

  -- 1. Skapa eller uppdatera datasetmetadata
  insert into public.svenska_runor_datasets (
    version,
    title,
    inscription_count,
    checksum_sha256,
    published_at,
    published_by
  ) values (
    p_version,
    p_title,
    v_draft_count,
    p_checksum,
    now(),
    p_publisher
  )
  on conflict (version) do update
    set title = p_title,
        inscription_count = v_draft_count,
        checksum_sha256 = p_checksum,
        published_at = now(),
        published_by = p_publisher;

  -- 2. Kopiera/uppdatera publicerade editions från drafts
  insert into public.svenska_runor_editions (
    slug,
    signum,
    content,
    published,
    dataset_version,
    revision,
    updated_at
  )
  select
    slug,
    signum,
    content,
    true,
    p_version,
    revision,
    now()
  from public.svenska_runor_drafts
  on conflict (slug) do update
    set signum = excluded.signum,
        content = excluded.content,
        published = true,
        dataset_version = p_version,
        revision = public.svenska_runor_editions.revision + 1,
        updated_at = now();

  -- 3. Markera alla utkast som icke-dirty
  update public.svenska_runor_drafts set dirty = false;

  select count(*) into v_edition_count
  from public.svenska_runor_editions
  where dataset_version = p_version;

  return jsonb_build_object(
    'version', p_version,
    'count', v_edition_count,
    'status', 'published'
  );
end;
$$;

commit;
