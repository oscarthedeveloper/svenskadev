begin;

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

commit;
