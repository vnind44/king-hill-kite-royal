-- Admin-assigned staff duties. ADMIN always has full control in application logic.

create table if not exists staff_permissions (
  user_id               text primary key references campus_users(id) on delete cascade,
  can_confirm_receipt   boolean not null default true,
  can_verify_claims     boolean not null default true,
  can_complete_handover boolean not null default true,
  updated_by            text,
  updated_at            timestamptz not null default now()
);

insert into staff_permissions (user_id, can_confirm_receipt, can_verify_claims, can_complete_handover)
select id, true, true, true from campus_users where role in ('STAFF', 'ADMIN')
on conflict (user_id) do nothing;
