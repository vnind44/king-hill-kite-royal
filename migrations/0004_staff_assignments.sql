-- Area-based staff duty. Role is global; custody power is per assigned area.

create table if not exists staff_assignments (
  id           text primary key,
  user_id      text not null references campus_users(id) on delete cascade,
  area         text not null,
  duty         text not null default 'PRIMARY',
  active       boolean not null default true,
  assigned_by  text not null,
  created_at   timestamptz not null default now(),
  revoked_at   timestamptz,
  constraint staff_assignments_duty_chk check (duty in ('PRIMARY', 'BACKUP'))
);

create index if not exists staff_assignments_user_idx on staff_assignments (user_id);
create index if not exists staff_assignments_area_idx on staff_assignments (area) where active;

insert into staff_assignments (id, user_id, area, duty, active, assigned_by)
select 'assign-library-staff', id, 'Library', 'PRIMARY', true, id
from campus_users
where email = 'staff@campus.edu'
on conflict (id) do nothing;
