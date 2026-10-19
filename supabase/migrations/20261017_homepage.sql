begin;
-- Samma RLS och administratörskonton som för de befintliga webbplatsinställningarna.
alter table public.svenska_settings add column if not exists homepage jsonb;
alter table public.svenska_settings add column if not exists homepage_revision integer not null default 0;
commit;
