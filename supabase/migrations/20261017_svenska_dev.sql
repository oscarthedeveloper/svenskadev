-- Svenska.dev använder egna tabeller; Italos tabeller ändras inte.
begin;
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
commit;
