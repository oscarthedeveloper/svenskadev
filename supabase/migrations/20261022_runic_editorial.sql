begin;

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
