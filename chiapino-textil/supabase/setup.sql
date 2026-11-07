-- Textil Chiapino: base de datos del stock.
-- Pegar entero en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.

-- ---------- productos ----------
create table if not exists public.productos (
  id          text primary key,
  nombre      text not null,
  marca       text not null default '',
  categoria   text not null,
  precio      bigint check (precio is null or precio > 0),
  stock       integer not null default 0 check (stock >= 0),
  descripcion text not null default '',
  img         text,
  visible     boolean not null default true,
  creado      timestamptz not null default now(),
  actualizado timestamptz not null default now()
);

create or replace function public.tocar_actualizado() returns trigger
language plpgsql as $$
begin
  new.actualizado := now();
  return new;
end $$;

drop trigger if exists productos_actualizado on public.productos;
create trigger productos_actualizado before update on public.productos
  for each row execute function public.tocar_actualizado();

-- ---------- quién puede editar ----------
-- Sólo los mails de esta tabla pueden cambiar el stock. Nadie la puede leer desde la web.
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'))
$$;
grant execute on function public.es_admin() to anon, authenticated;

-- ---------- permisos de productos ----------
alter table public.productos enable row level security;

drop policy if exists "web lee visibles" on public.productos;
create policy "web lee visibles" on public.productos
  for select to anon, authenticated using (visible or public.es_admin());

drop policy if exists "admin agrega" on public.productos;
create policy "admin agrega" on public.productos
  for insert to authenticated with check (public.es_admin());

drop policy if exists "admin edita" on public.productos;
create policy "admin edita" on public.productos
  for update to authenticated using (public.es_admin()) with check (public.es_admin());

drop policy if exists "admin borra" on public.productos;
create policy "admin borra" on public.productos
  for delete to authenticated using (public.es_admin());

grant select on public.productos to anon, authenticated;
grant insert, update, delete on public.productos to authenticated;

-- ---------- fotos ----------
-- Carpeta pública para ver; sólo los admins suben, cambian o borran.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true;

drop policy if exists "admin sube fotos" on storage.objects;
create policy "admin sube fotos" on storage.objects
  for insert to authenticated with check (bucket_id = 'fotos' and public.es_admin());

drop policy if exists "admin cambia fotos" on storage.objects;
create policy "admin cambia fotos" on storage.objects
  for update to authenticated using (bucket_id = 'fotos' and public.es_admin());

drop policy if exists "admin borra fotos" on storage.objects;
create policy "admin borra fotos" on storage.objects
  for delete to authenticated using (bucket_id = 'fotos' and public.es_admin());

-- ---------- catálogo inicial ----------
-- Cantidades de ejemplo: el dueño las corrige desde el panel. No pisa productos que ya existan.
insert into public.productos (id, nombre, marca, categoria, precio, stock, descripcion, img) values
  ('silverman-overlock-gt917d', 'Overlock Silverman SM-GT917D-4H', 'Silverman', 'industriales', null, 3, 'Overlock industrial de 4 hilos con panel electrónico.', 'img/silverman-overlock.jpg'),
  ('silverman-recta', 'Recta industrial Silverman', 'Silverman', 'industriales', null, 2, 'Recta industrial con motor incorporado.', 'img/silverman-recta.jpg'),
  ('recta-gc8882e', 'Recta Shanggong GC8882E', 'Shanggong', 'industriales', 812700, 4, 'Máquina recta industrial con motor incorporado.', null),
  ('recta-multifuncion', 'Recta multifunción', 'Shanggong', 'industriales', 1105650, 2, 'Recta industrial con funciones electrónicas.', null),
  ('collareta-silverman', 'Tapa costura / collareta Silverman', 'Silverman', 'industriales', 1417500, 1, 'Para dobladillos y terminaciones de prendas de punto.', null),
  ('overlock-multifuncion', 'Overlock multifunción Shanggong', 'Shanggong', 'industriales', 1852200, 3, 'Overlock industrial de alta velocidad.', null),
  ('overlock-4h', 'Overlock 4 hilos Shanggong', 'Shanggong', 'industriales', 1058400, 0, 'Overlock industrial de 4 hilos.', null),
  ('overlock-3h', 'Overlock 3 hilos Shanggong', 'Shanggong', 'industriales', 1039500, 5, 'Overlock industrial de 3 hilos.', null),
  ('ojaladora-cf781d', 'Ojaladora Shanggong CF781D', 'Shanggong', 'industriales', 3241350, 1, 'Ojaladora electrónica para producción.', null),
  ('doble-arrastre', 'Doble arrastre Shanggong', 'Shanggong', 'industriales', 1171800, 2, 'Recta de doble arrastre para telas pesadas.', null),
  ('lumina-milano-color', 'Lumina Milano Color', 'Lumina', 'familiares', null, 4, 'Familiar de trabajo pesado, con accesorios incluidos.', 'img/lumina-milano.jpg'),
  ('brother-bm3850', 'Brother BM3850', 'Brother', 'familiares', null, 2, 'Edición Patchwork & Quilting, con mesa extensora.', 'img/brother-bm3850.jpg'),
  ('brother-bm2800', 'Brother BM2800', 'Brother', 'familiares', null, 5, 'Familiar con selector de puntadas.', 'img/brother-bm2800.jpg'),
  ('buona-veneto', 'Buona Veneto', 'Buona', 'familiares', null, 1, 'Familiar con accesorios incluidos.', 'img/buona-veneto.jpg'),
  ('buono-parma', 'Buono Parma', 'Buono', 'familiares', null, 3, 'Familiar. En la foto, junto a la overlock Trento.', 'img/buono-parma-trento.jpg'),
  ('buono-trento', 'Overlock Buono Trento', 'Buono', 'familiares', null, 0, 'Overlock familiar.', 'img/buono-parma-trento.jpg'),
  ('singer-familiar', 'Máquina familiar Singer', 'Singer', 'familiares', null, 0, 'Cargá el modelo exacto desde el panel.', null),
  ('hilo-costura', 'Hilo de costura', '', 'hilos', null, 40, 'Varios colores.', null),
  ('hilo-bordar', 'Hilo de bordar', '', 'hilos', null, 12, 'Varios colores.', null),
  ('lumina-verona', 'Cortadora Lumina Verona', 'Lumina', 'cortadoras', null, 2, 'Máquina de cortar telas, corte limpio y suave.', 'img/lumina-verona.jpg')
on conflict (id) do nothing;

-- ---------- quién administra ----------
-- Cambiá el mail por el tuyo (para probar) y después agregá el del dueño. Pueden ser varios.
insert into public.admins (email) values ('genitachia@gmail.com') on conflict do nothing;

-- ---------- lo que sabe el bot ----------
-- Info que el dueño le enseña al chat desde el panel (envíos, pagos, cambios, fallas...). La lee el chat.
create table if not exists public.bot_info (
  id          bigint generated always as identity primary key,
  tema        text not null check (length(tema) between 1 and 120),
  texto       text not null check (length(texto) between 1 and 2000),
  creado      timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
drop trigger if exists bot_info_actualizado on public.bot_info;
create trigger bot_info_actualizado before update on public.bot_info
  for each row execute function public.tocar_actualizado();

alter table public.bot_info enable row level security;
drop policy if exists "todos leen" on public.bot_info;
create policy "todos leen" on public.bot_info for select to anon, authenticated using (true);
drop policy if exists "admin agrega" on public.bot_info;
create policy "admin agrega" on public.bot_info for insert to authenticated with check (public.es_admin());
drop policy if exists "admin edita" on public.bot_info;
create policy "admin edita" on public.bot_info for update to authenticated using (public.es_admin()) with check (public.es_admin());
drop policy if exists "admin borra" on public.bot_info;
create policy "admin borra" on public.bot_info for delete to authenticated using (public.es_admin());
grant select on public.bot_info to anon, authenticated;
grant insert, update, delete on public.bot_info to authenticated;

-- Preguntas que el bot no supo responder. Sólo las ve el admin; el chat las anota con anotar_pregunta().
create table if not exists public.bot_preguntas (
  id       bigint generated always as identity primary key,
  pregunta text not null,
  veces    integer not null default 1,
  creado   timestamptz not null default now(),
  ultima   timestamptz not null default now()
);
alter table public.bot_preguntas enable row level security;
drop policy if exists "admin lee" on public.bot_preguntas;
create policy "admin lee" on public.bot_preguntas for select to authenticated using (public.es_admin());
drop policy if exists "admin borra" on public.bot_preguntas;
create policy "admin borra" on public.bot_preguntas for delete to authenticated using (public.es_admin());
grant select, delete on public.bot_preguntas to authenticated;

-- Con topes (200 en la lista, 30 nuevas por hora) para que nadie la llene de basura.
create or replace function public.anotar_pregunta(p text) returns void
language plpgsql security definer set search_path = public as $$
declare
  q text := left(regexp_replace(trim(coalesce(p, '')), '\s+', ' ', 'g'), 200);
begin
  if length(q) < 4 then return; end if;
  update bot_preguntas set veces = veces + 1, ultima = now() where lower(pregunta) = lower(q);
  if found then return; end if;
  if (select count(*) from bot_preguntas) >= 200 then return; end if;
  if (select count(*) from bot_preguntas where creado > now() - interval '1 hour') >= 30 then return; end if;
  insert into bot_preguntas (pregunta) values (q);
end $$;
revoke all on function public.anotar_pregunta(text) from public;
grant execute on function public.anotar_pregunta(text) to anon, authenticated;
