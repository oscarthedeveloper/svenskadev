begin;
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
commit;
