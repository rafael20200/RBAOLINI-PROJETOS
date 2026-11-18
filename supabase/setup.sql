-- RBAOLINI-PROJETOS | Execute no Supabase > SQL Editor
-- Primeiro crie o usuário em Authentication > Users > Add user.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  technologies text[] not null default '{}',
  category text not null default 'Projeto',
  image_url text,
  video_url text,
  project_url text,
  published boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_published_order_idx on public.projects (published, display_order, created_at desc);

create or replace function public.is_portfolio_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admin_users where user_id = (select auth.uid())); $$;
revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to authenticated;

alter table public.admin_users enable row level security;
alter table public.projects enable row level security;
revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.projects from anon, authenticated;
grant select on table public.projects to anon, authenticated;
grant insert, update, delete on table public.projects to authenticated;

drop policy if exists "Public reads published projects" on public.projects;
create policy "Public reads published projects" on public.projects for select to anon, authenticated
using (published = true or (select public.is_portfolio_admin()));
drop policy if exists "Admins insert projects" on public.projects;
create policy "Admins insert projects" on public.projects for insert to authenticated
with check ((select public.is_portfolio_admin()));
drop policy if exists "Admins update projects" on public.projects;
create policy "Admins update projects" on public.projects for update to authenticated
using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));
drop policy if exists "Admins delete projects" on public.projects;
create policy "Admins delete projects" on public.projects for delete to authenticated
using ((select public.is_portfolio_admin()));

-- Crie no Storage um bucket PUBLIC chamado project-images.
drop policy if exists "Public can view project images" on storage.objects;
create policy "Public can view project images" on storage.objects for select to anon, authenticated
using (bucket_id = 'project-images');
drop policy if exists "Admins upload project images" on storage.objects;
create policy "Admins upload project images" on storage.objects for insert to authenticated
with check (bucket_id = 'project-images' and (select public.is_portfolio_admin()));
drop policy if exists "Admins update project images" on storage.objects;
create policy "Admins update project images" on storage.objects for update to authenticated
using (bucket_id = 'project-images' and (select public.is_portfolio_admin()))
with check (bucket_id = 'project-images' and (select public.is_portfolio_admin()));
drop policy if exists "Admins delete project images" on storage.objects;
create policy "Admins delete project images" on storage.objects for delete to authenticated
using (bucket_id = 'project-images' and (select public.is_portfolio_admin()));

-- Depois de criar o usuário em Authentication > Users, copie o UUID e execute:
-- insert into public.admin_users (user_id) values ('511763fb-888d-4ff6-a565-df5d294966d4');
