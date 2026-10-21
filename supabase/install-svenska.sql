-- Nyinstallation av svenska.dev i Fornsvenska.se:s Supabase-projekt.
-- Kör endast om svenska.dev-tabellerna inte redan finns.
-- Ändrar inga Fornsvenska- eller Italo-tabeller.
-- Genereras av node scripts/prepare-supabase.mjs.
begin;

-- 20261017_svenska_dev.sql
-- Svenska.dev använder egna tabeller; Italos tabeller ändras inte.
create table public.svenska_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.svenska_admins enable row level security;
grant select on public.svenska_admins to authenticated;
create policy "Administratör ser sin egen behörighet" on public.svenska_admins
  for select to authenticated using (user_id = (select auth.uid()));

create table public.svenska_nodes (
  id uuid primary key default gen_random_uuid(),
  root text not null check (root in ('sprakrad','grammatik','ordval','sprakliv')),
  parent_id uuid,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(trim(title)) > 0),
  kind text not null check (kind in ('folder','doc')),
  note text,
  position integer not null default 0,
  content jsonb,
  -- Redaktionell märkning, inte en publiceringsspärr. Sparade artiklar är publika.
  utkast boolean not null default true,
  unique (id, root),
  foreign key (parent_id, root) references public.svenska_nodes(id, root) on delete cascade
);
create unique index svenska_nodes_siblings on public.svenska_nodes (root, parent_id, slug) nulls not distinct;
create index svenska_nodes_order on public.svenska_nodes (root, parent_id, position);
alter table public.svenska_nodes enable row level security;
grant select on public.svenska_nodes to anon, authenticated;
grant insert, update, delete on public.svenska_nodes to authenticated;
create policy "Publikt språkarkiv" on public.svenska_nodes for select to anon, authenticated using (true);
create policy "Administratörer skapar" on public.svenska_nodes for insert to authenticated
  with check (exists (select 1 from public.svenska_admins where user_id = (select auth.uid())));
create policy "Administratörer redigerar" on public.svenska_nodes for update to authenticated
  using (exists (select 1 from public.svenska_admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.svenska_admins where user_id = (select auth.uid())));
create policy "Administratörer tar bort" on public.svenska_nodes for delete to authenticated
  using (exists (select 1 from public.svenska_admins where user_id = (select auth.uid())));

-- 20261017_editorial_workflow.sql
-- Endast publicerat innehåll ligger i svenska_nodes. Utkast har egen RLS-skyddad tabell.
create function public.svenska_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.svenska_admins where user_id = (select auth.uid()));
$$;
revoke all on function public.svenska_is_admin() from public;
grant execute on function public.svenska_is_admin() to anon, authenticated;
revoke all on public.svenska_admins from anon, authenticated;
grant select on public.svenska_admins to authenticated;

create table public.svenska_drafts (
  node_id uuid primary key references public.svenska_nodes(id) on delete cascade,
  content jsonb not null,
  revision integer not null default 1,
  dirty boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.svenska_drafts enable row level security;
revoke all on public.svenska_drafts from anon, authenticated;
grant select, insert, update, delete on public.svenska_drafts to authenticated;
create policy "Enbart redaktionen ser utkast" on public.svenska_drafts for all to authenticated
  using ((select public.svenska_is_admin())) with check ((select public.svenska_is_admin()));
-- Bevara allt befintligt innehåll som publicerat vid uppgradering.
insert into public.svenska_drafts (node_id, content, dirty)
  select id, content, false from public.svenska_nodes where kind = 'doc' and content is not null;
update public.svenska_nodes set utkast = (kind = 'doc' and content is null);

drop policy "Publikt språkarkiv" on public.svenska_nodes;
create policy "Publicerat arkiv eller administratör" on public.svenska_nodes for select to anon, authenticated
  using (kind = 'folder' or content is not null or (select public.svenska_is_admin()));
revoke all on public.svenska_nodes from anon, authenticated;
grant select on public.svenska_nodes to anon, authenticated;
grant insert, update, delete on public.svenska_nodes to authenticated;

create table public.svenska_settings (
  id boolean primary key default true check (id),
  initialized boolean not null default false
);
insert into public.svenska_settings (initialized) select exists(select 1 from public.svenska_nodes);
alter table public.svenska_settings enable row level security;
revoke all on public.svenska_settings from anon, authenticated;
grant select on public.svenska_settings to anon, authenticated;
grant update on public.svenska_settings to authenticated;
create policy "Läs installationsstatus" on public.svenska_settings for select to anon, authenticated using (true);
create policy "Administratör ändrar installationsstatus" on public.svenska_settings for update to authenticated
  using ((select public.svenska_is_admin())) with check ((select public.svenska_is_admin()));

-- Låsningen gör jämförelse och uppdatering atomära. Gamla flikar får en konflikt.
create function public.svenska_save_draft(p_node_id uuid, p_content jsonb, p_revision integer) returns integer
language plpgsql security invoker set search_path = '' as $$
declare v_revision integer;
begin
  if not public.svenska_is_admin() then raise exception 'Administratörsbehörighet krävs'; end if;
  perform 1 from public.svenska_nodes where id = p_node_id and kind = 'doc' for update;
  if not found then raise exception 'Artikeln finns inte'; end if;
  select revision into v_revision from public.svenska_drafts where node_id = p_node_id;
  if coalesce(v_revision, 0) <> p_revision then raise exception 'Artikeln har ändrats i en annan flik. Ladda om innan du fortsätter.'; end if;
  insert into public.svenska_drafts (node_id, content, revision, dirty)
    values (p_node_id, p_content, 1, true)
    on conflict (node_id) do update set content = p_content, revision = svenska_drafts.revision + 1, dirty = true, updated_at = now()
    returning revision into v_revision;
  return v_revision;
end;
$$;
create function public.svenska_publish(p_node_id uuid, p_revision integer) returns integer
language plpgsql security invoker set search_path = '' as $$
declare v_draft public.svenska_drafts%rowtype;
begin
  if not public.svenska_is_admin() then raise exception 'Administratörsbehörighet krävs'; end if;
  perform 1 from public.svenska_nodes where id = p_node_id and kind = 'doc' for update;
  if not found then raise exception 'Artikeln finns inte'; end if;
  select * into v_draft from public.svenska_drafts where node_id = p_node_id for update;
  if not found or v_draft.revision <> p_revision then raise exception 'Utkastet har ändrats. Ladda om sidan.'; end if;
  if coalesce(trim(v_draft.content->>'title'), '') = '' or coalesce(trim(v_draft.content->>'intro'), '') = '' then
    raise exception 'Fyll i titel och ingress före publicering';
  end if;
  update public.svenska_nodes set content = v_draft.content || '{"utkast":false}'::jsonb,
    title = v_draft.content->>'title', note = v_draft.content->>'subtitle', utkast = false where id = p_node_id;
  update public.svenska_drafts set dirty = false, revision = revision + 1, updated_at = now() where node_id = p_node_id;
  return v_draft.revision + 1;
end;
$$;
create function public.svenska_unpublish(p_node_id uuid, p_revision integer) returns integer
language plpgsql security invoker set search_path = '' as $$
declare v_revision integer;
begin
  if not public.svenska_is_admin() then raise exception 'Administratörsbehörighet krävs'; end if;
  perform 1 from public.svenska_nodes where id = p_node_id and kind = 'doc' for update;
  if not found then raise exception 'Artikeln finns inte'; end if;
  select revision into v_revision from public.svenska_drafts where node_id = p_node_id for update;
  if v_revision is null or v_revision <> p_revision then raise exception 'Utkastet har ändrats. Ladda om sidan.'; end if;
  update public.svenska_nodes set content = null, utkast = true where id = p_node_id;
  update public.svenska_drafts set dirty = true, revision = revision + 1, updated_at = now() where node_id = p_node_id;
  return v_revision + 1;
end;
$$;
create function public.svenska_move_node(p_node_id uuid, p_direction integer) returns void
language plpgsql security invoker set search_path = '' as $$
declare v_node public.svenska_nodes%rowtype; v_ids uuid[]; v_index integer; v_other uuid; v_position integer;
begin
  if not public.svenska_is_admin() then raise exception 'Administratörsbehörighet krävs'; end if;
  if p_direction not in (-1,1) then raise exception 'Ogiltig riktning'; end if;
  -- En gemensam transaktionsspärr för ordningsändringar, även mellan olika föräldrar.
  perform pg_catalog.pg_advisory_xact_lock(781024);
  select * into v_node from public.svenska_nodes where id = p_node_id;
  if not found then raise exception 'Sidan finns inte'; end if;
  select array_agg(id order by position,id) into v_ids from public.svenska_nodes
    where root = v_node.root and parent_id is not distinct from v_node.parent_id;
  v_index := array_position(v_ids,p_node_id);
  v_other := v_ids[v_index + p_direction];
  if v_other is null then return; end if;
  -- Normalisera först så att även äldre dubbletter av position får tydlig ordning.
  update public.svenska_nodes n set position = x.ordinality::integer
    from unnest(v_ids) with ordinality x(id,ordinality) where n.id = x.id;
  v_position := v_index + p_direction;
  update public.svenska_nodes set position = case when id = p_node_id then v_position else v_index end
    where id in (p_node_id,v_other);
end;
$$;
revoke all on function public.svenska_save_draft(uuid,jsonb,integer), public.svenska_publish(uuid,integer), public.svenska_unpublish(uuid,integer), public.svenska_move_node(uuid,integer) from public;
grant execute on function public.svenska_save_draft(uuid,jsonb,integer), public.svenska_publish(uuid,integer), public.svenska_unpublish(uuid,integer), public.svenska_move_node(uuid,integer) to authenticated;

-- 20261017_homepage.sql
-- Samma RLS och administratörskonton som för de befintliga webbplatsinställningarna.
alter table public.svenska_settings add column if not exists homepage jsonb;
alter table public.svenska_settings add column if not exists homepage_revision integer not null default 0;

-- 20261019_thesis_pilot.sql
-- Tabell för publicerad avhandlingskonfiguration (endast publicerade rader synliga för anon).
create table if not exists public.svenska_thesis_editions (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  content jsonb not null,
  published boolean not null default true,
  revision integer not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.svenska_thesis_editions enable row level security;
revoke all on public.svenska_thesis_editions from anon, authenticated;
grant select on public.svenska_thesis_editions to anon, authenticated;
grant insert, update, delete on public.svenska_thesis_editions to authenticated;

create policy "Publikt publicerad avhandlingsutgåva eller administratör"
  on public.svenska_thesis_editions
  for select to anon, authenticated
  using (published = true or (select public.svenska_is_admin()));

create policy "Administratörer hanterar avhandlingsutgåva"
  on public.svenska_thesis_editions
  for all to authenticated
  using ((select public.svenska_is_admin()))
  with check ((select public.svenska_is_admin()));

-- Privat utkasttabell för avhandlingspiloten (helt dold för anon och icke-admin).
create table if not exists public.svenska_thesis_drafts (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  content jsonb not null,
  revision integer not null default 1,
  dirty boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.svenska_thesis_drafts enable row level security;
revoke all on public.svenska_thesis_drafts from anon, authenticated;
grant select, insert, update, delete on public.svenska_thesis_drafts to authenticated;

create policy "Enbart redaktionen ser avhandlingsutkast"
  on public.svenska_thesis_drafts
  for all to authenticated
  using ((select public.svenska_is_admin()))
  with check ((select public.svenska_is_admin()));

-- Atomär sparning av avhandlingsutkast med revisionslåsning mot flikkonflikter.
create or replace function public.svenska_save_thesis_draft(
  p_slug text,
  p_content jsonb,
  p_revision integer
) returns integer
language plpgsql security invoker set search_path = '' as $$
declare
  v_revision integer;
begin
  if not public.svenska_is_admin() then
    raise exception 'Administratörsbehörighet krävs';
  end if;
  if coalesce(trim(p_content->>'title'), '') = '' or coalesce(trim(p_content->>'intro'), '') = '' then
    raise exception 'Fyll i titel och introduktion för avhandlingsutgåvan';
  end if;
  select revision into v_revision from public.svenska_thesis_drafts where slug = p_slug for update;
  if coalesce(v_revision, 0) <> p_revision then
    raise exception 'Avhandlingsutkastet har ändrats i en annan flik. Ladda om sidan innan du fortsätter.';
  end if;
  insert into public.svenska_thesis_drafts (slug, content, revision, dirty, updated_at)
    values (p_slug, p_content, 1, true, now())
    on conflict (slug) do update
      set content = p_content,
          revision = public.svenska_thesis_drafts.revision + 1,
          dirty = true,
          updated_at = now()
    returning revision into v_revision;
  return v_revision;
end;
$$;

-- Atomär publicering av avhandlingsutkast till public.svenska_thesis_editions.
create or replace function public.svenska_publish_thesis(
  p_slug text,
  p_revision integer
) returns integer
language plpgsql security invoker set search_path = '' as $$
declare
  v_draft public.svenska_thesis_drafts%rowtype;
  v_next_rev integer;
begin
  if not public.svenska_is_admin() then
    raise exception 'Administratörsbehörighet krävs';
  end if;
  select * into v_draft from public.svenska_thesis_drafts where slug = p_slug for update;
  if not found or v_draft.revision <> p_revision then
    raise exception 'Avhandlingsutkastet har ändrats. Ladda om sidan.';
  end if;
  if coalesce(trim(v_draft.content->>'title'), '') = '' or coalesce(trim(v_draft.content->>'intro'), '') = '' then
    raise exception 'Fyll i titel och introduktion före publicering';
  end if;
  v_next_rev := v_draft.revision + 1;
  insert into public.svenska_thesis_editions (slug, content, published, revision, updated_at)
    values (p_slug, v_draft.content, true, v_next_rev, now())
    on conflict (slug) do update
      set content = v_draft.content,
          published = true,
          revision = v_next_rev,
          updated_at = now();
  update public.svenska_thesis_drafts
    set dirty = false,
        revision = v_next_rev,
        updated_at = now()
    where slug = p_slug;
  return v_next_rev;
end;
$$;

-- Atomär avpublicering (döljer den anpassade utgåvan för anonyma besökare utan att radera utkastet).
create or replace function public.svenska_unpublish_thesis(
  p_slug text,
  p_revision integer
) returns integer
language plpgsql security invoker set search_path = '' as $$
declare
  v_revision integer;
begin
  if not public.svenska_is_admin() then
    raise exception 'Administratörsbehörighet krävs';
  end if;
  select revision into v_revision from public.svenska_thesis_drafts where slug = p_slug for update;
  if v_revision is null or v_revision <> p_revision then
    raise exception 'Avhandlingsutkastet har ändrats. Ladda om sidan.';
  end if;
  update public.svenska_thesis_editions
    set published = false,
        revision = v_revision + 1,
        updated_at = now()
    where slug = p_slug;
  update public.svenska_thesis_drafts
    set dirty = true,
        revision = v_revision + 1,
        updated_at = now()
    where slug = p_slug;
  return v_revision + 1;
end;
$$;

-- Atomär återställning av utkast till senast publicerade version.
create or replace function public.svenska_restore_thesis_published(
  p_slug text,
  p_revision integer
) returns integer
language plpgsql security invoker set search_path = '' as $$
declare
  v_pub public.svenska_thesis_editions%rowtype;
  v_draft_rev integer;
begin
  if not public.svenska_is_admin() then
    raise exception 'Administratörsbehörighet krävs';
  end if;
  select revision into v_draft_rev from public.svenska_thesis_drafts where slug = p_slug for update;
  if v_draft_rev is null or v_draft_rev <> p_revision then
    raise exception 'Avhandlingsutkastet har ändrats. Ladda om sidan.';
  end if;
  select * into v_pub from public.svenska_thesis_editions where slug = p_slug;
  if not found then
    raise exception 'Ingen publicerad utgåva att återställa från';
  end if;
  update public.svenska_thesis_drafts
    set content = v_pub.content,
        dirty = false,
        revision = v_draft_rev + 1,
        updated_at = now()
    where slug = p_slug;
  return v_draft_rev + 1;
end;
$$;

revoke all on function
  public.svenska_save_thesis_draft(text, jsonb, integer),
  public.svenska_publish_thesis(text, integer),
  public.svenska_unpublish_thesis(text, integer),
  public.svenska_restore_thesis_published(text, integer)
from public;

grant execute on function
  public.svenska_save_thesis_draft(text, jsonb, integer),
  public.svenska_publish_thesis(text, integer),
  public.svenska_unpublish_thesis(text, integer),
  public.svenska_restore_thesis_published(text, integer)
to authenticated;

-- 20261021_runic_storage.sql
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

-- 20261022_runic_editorial.sql
-- ============================================================================
-- E34: Redaktionellt arbetsflöde, granskningskö och ändringshistorik (Audit Log)
-- ============================================================================

-- 1. Utöka svenska_runor_drafts med redaktionella statusfält
alter table public.svenska_runor_drafts
  add column if not exists status text not null default 'kandidat'
    check (status in ('kandidat', 'under_granskning', 'godkand_for_publicering', 'avvisad')),
  add column if not exists assigned_reviewer text,
  add column if not exists rejection_reason text;

create index if not exists svenska_runor_drafts_status_idx
  on public.svenska_runor_drafts(status);

-- 2. Ändringshistorik och revisionslogg (svenska_runor_audit_log)
create table if not exists public.svenska_runor_audit_log (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  signum text not null,
  action text not null check (action in ('status_change', 'field_update', 'rollback', 'import_conflict', 'published')),
  actor text not null,
  reason text not null check (length(trim(reason)) > 0),
  previous_state jsonb,
  new_state jsonb,
  created_at timestamptz not null default now()
);

create index if not exists svenska_runor_audit_log_slug_idx
  on public.svenska_runor_audit_log(slug);
create index if not exists svenska_runor_audit_log_created_at_idx
  on public.svenska_runor_audit_log(created_at desc);

alter table public.svenska_runor_audit_log enable row level security;
revoke all on public.svenska_runor_audit_log from anon, authenticated;
grant select, insert on public.svenska_runor_audit_log to authenticated;

create policy "Enbart administratörer ser och skriver i runologisk ändringshistorik"
  on public.svenska_runor_audit_log
  for all to authenticated
  using ((select public.svenska_is_admin()))
  with check ((select public.svenska_is_admin()));

-- 3. Funktion för att ändra redaktionell status och logga ändringen
create or replace function public.svenska_set_runic_draft_status(
  p_slug text,
  p_new_status text,
  p_actor text,
  p_reason text,
  p_reviewer text default null
) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  v_draft public.svenska_runor_drafts%rowtype;
  v_old_status text;
begin
  if not public.svenska_is_admin() then
    raise exception 'Administratörsbehörighet krävs';
  end if;

  select * into v_draft from public.svenska_runor_drafts where slug = p_slug for update;
  if not found then
    raise exception 'Utkast med slug % hittades inte', p_slug;
  end if;

  v_old_status := v_draft.status;

  update public.svenska_runor_drafts
  set status = p_new_status,
      assigned_reviewer = coalesce(p_reviewer, assigned_reviewer),
      dirty = true,
      updated_at = now()
  where slug = p_slug;

  insert into public.svenska_runor_audit_log (
    slug,
    signum,
    action,
    actor,
    reason,
    previous_state,
    new_state
  ) values (
    p_slug,
    v_draft.signum,
    'status_change',
    p_actor,
    p_reason,
    jsonb_build_object('status', v_old_status, 'assigned_reviewer', v_draft.assigned_reviewer),
    jsonb_build_object('status', p_new_status, 'assigned_reviewer', coalesce(p_reviewer, v_draft.assigned_reviewer))
  );

  return jsonb_build_object(
    'slug', p_slug,
    'previous_status', v_old_status,
    'new_status', p_new_status,
    'updated', true
  );
end;
$$;

-- 4. Funktion för att återställa (rollback) ett utkast till en tidigare revision
create or replace function public.svenska_rollback_runic_draft(
  p_slug text,
  p_target_content jsonb,
  p_actor text,
  p_reason text
) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  v_draft public.svenska_runor_drafts%rowtype;
  v_prev_content jsonb;
begin
  if not public.svenska_is_admin() then
    raise exception 'Administratörsbehörighet krävs';
  end if;

  select * into v_draft from public.svenska_runor_drafts where slug = p_slug for update;
  if not found then
    raise exception 'Utkast med slug % hittades inte', p_slug;
  end if;

  v_prev_content := v_draft.content;

  update public.svenska_runor_drafts
  set content = p_target_content,
      revision = v_draft.revision + 1,
      dirty = true,
      updated_at = now()
  where slug = p_slug;

  insert into public.svenska_runor_audit_log (
    slug,
    signum,
    action,
    actor,
    reason,
    previous_state,
    new_state
  ) values (
    p_slug,
    v_draft.signum,
    'rollback',
    p_actor,
    p_reason,
    jsonb_build_object('revision', v_draft.revision, 'content', v_prev_content),
    jsonb_build_object('revision', v_draft.revision + 1, 'content', p_target_content)
  );

  return jsonb_build_object(
    'slug', p_slug,
    'action', 'rollback',
    'new_revision', v_draft.revision + 1
  );
end;
$$;

commit;
