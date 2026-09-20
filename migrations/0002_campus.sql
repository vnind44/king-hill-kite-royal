-- Campus Lost & Found schema. Roles, karma, and trust are server-owned.

create table if not exists campus_users (
  id              text primary key,
  email           text not null,
  display_name    text not null default '',
  student_id      text not null default '',
  phone           text not null default '',
  campus_zone     text not null default 'Main Campus',
  role            text not null default 'STUDENT',
  karma_points    integer not null default 0,
  trust_score     integer not null default 100,
  items_returned  integer not null default 0,
  recovered_items integer not null default 0,
  false_claims    integer not null default 0,
  incognito_finder boolean not null default false,
  conceal_residence boolean not null default false,
  smart_match_push boolean not null default true,
  claim_alerts    boolean not null default true,
  quiet_mode      boolean not null default false,
  theme           text not null default 'system',
  created_at      timestamptz not null default now(),
  last_login_at   timestamptz not null default now(),
  constraint campus_users_role_chk check (role in ('STUDENT', 'STAFF', 'ADMIN'))
);

create table if not exists desks (
  id           text primary key,
  name         text not null,
  location     text not null,
  hours        text not null,
  is_open      boolean not null default true,
  tag          text,
  vault_count  integer not null default 0,
  locker_note  text,
  staff_name   text,
  staff_role   text,
  is_high_value boolean not null default false,
  is_24_hours  boolean not null default false,
  detail_notes text
);

create table if not exists items (
  id                  text primary key,
  reporter_id         text not null references campus_users(id),
  title               text not null,
  category            text not null,
  description         text not null default '',
  color               text not null default '',
  brand               text not null default '',
  identifying_marks   text not null default '',
  item_type           text not null,
  status              text not null,
  location            text not null,
  location_zone       text not null default 'Main Campus',
  photo_url           text,
  photo_path          text,
  custody_desk_id     text references desks(id),
  match_score         integer,
  match_item_id       text,
  match_explanation   text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint items_type_chk check (item_type in ('LOST', 'FOUND')),
  constraint items_status_chk check (status in (
    'SEARCHING', 'UNDER_REVIEW', 'MATCHED', 'CLAIM_PENDING',
    'READY_FOR_PICKUP', 'HANDED_OVER', 'RETURNED', 'REJECTED'
  ))
);

create index if not exists items_created_idx on items (created_at desc);
create index if not exists items_reporter_idx on items (reporter_id);
create index if not exists items_type_status_idx on items (item_type, status);

create table if not exists claims (
  id                text primary key,
  item_id           text not null references items(id),
  claimant_id       text not null references campus_users(id),
  verification_note text not null default '',
  status            text not null,
  reviewed_by       text references campus_users(id),
  reviewed_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint claims_status_chk check (status in (
    'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED',
    'HANDOVER_PENDING', 'COMPLETED'
  ))
);

create index if not exists claims_item_idx on claims (item_id);
create index if not exists claims_claimant_idx on claims (claimant_id);

create table if not exists handovers (
  id                    text primary key,
  claim_id              text not null references claims(id),
  item_id               text not null references items(id),
  desk_id               text references desks(id),
  pin_hash              text not null,
  status                text not null default 'PENDING',
  expires_at            timestamptz not null,
  completed_at          timestamptz,
  completed_by_staff_id text references campus_users(id),
  created_at            timestamptz not null default now(),
  constraint handovers_status_chk check (status in ('PENDING', 'COMPLETED', 'EXPIRED'))
);

create table if not exists notifications (
  id         text primary key,
  user_id    text not null references campus_users(id),
  type       text not null,
  title      text not null,
  body       text not null,
  item_id    text,
  claim_id   text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on notifications (user_id, created_at desc);

create table if not exists activity (
  id         text primary key,
  user_id    text not null,
  type       text not null,
  item_id    text,
  claim_id   text,
  message    text not null,
  created_at timestamptz not null default now()
);

create index if not exists activity_user_idx on activity (user_id, created_at desc);

insert into desks (id, name, location, hours, is_open, tag, vault_count, locker_note, staff_name, staff_role, is_high_value, is_24_hours, detail_notes)
values
  ('library', 'Main Library Help Desk', 'Ground floor atrium, adjacent to the information desk', 'Open · Closes at 8:00 PM', true, 'Primary Hub', 0, 'Smart lockers available', 'Desk attendant', 'Library staff', false, false, 'Secure drop with logged custody receipts and PIN lockers.'),
  ('student-center', 'Student Center Info Hub', 'First floor welcome desk, north lobby', 'Open · Closes at 10:00 PM', true, null, 0, 'Walk-in ready', 'Attendant on duty', 'Campus staff', false, false, 'Fast verification and public meeting handoff tables.'),
  ('admin-block', 'Administration Block Reception', 'Room 102, staff reception', 'Open · Closes at 6:00 PM', true, null, 0, 'ID verification on site', 'Reception', 'Campus services', false, false, 'Photo ID check required for high-value releases.'),
  ('security', 'Security Office', 'Campus gateway, security annex', 'Open 24/7', true, 'High value', 0, 'Dual-officer signoff for high-value items', 'Duty officer', 'Campus security', true, true, 'Reserved custody for laptops, credentials, and jewelry.')
on conflict (id) do nothing;
