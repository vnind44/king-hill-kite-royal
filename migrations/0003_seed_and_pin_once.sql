-- One-time pickup PIN (plaintext kept only until first reveal), plus a
-- public campus registry so guests can browse without a demo login.

alter table handovers add column if not exists pin_once text;
alter table handovers add column if not exists pin_revealed boolean not null default false;

insert into campus_users (id, email, display_name, student_id, role, campus_zone)
values
  ('campus-desk', 'desk@campus.invalid', 'Library Help Desk', 'STAFF-DESK', 'STAFF', 'Library'),
  ('campus-owner', 'owner@campus.invalid', 'Campus member', 'GUEST-SEED', 'STUDENT', 'Library')
on conflict (id) do nothing;

insert into items (
  id, reporter_id, title, category, description, color, brand, identifying_marks,
  item_type, status, location, location_zone, custody_desk_id, created_at, updated_at
) values
  (
    'seed-keys', 'campus-desk', 'Room keys', 'Keys',
    'A tagged set of room keys left on a bench.', 'Silver', '',
    'Blue lanyard, room number on the tag',
    'FOUND', 'UNDER_REVIEW', 'Student Center', 'Student Center', 'student-center',
    now() - interval '6 hours', now() - interval '6 hours'
  ),
  (
    'seed-id', 'campus-desk', 'Student ID', 'IDs & cards',
    'Student identity card found near reception.', 'White', '',
    'Name partially visible on the reverse',
    'FOUND', 'UNDER_REVIEW', 'Administration Block', 'Administration Block', 'admin-block',
    now() - interval '4 hours', now() - interval '4 hours'
  ),
  (
    'seed-bag-found', 'campus-desk', 'Black backpack', 'Bags & luggage',
    'Black backpack with a laptop sleeve and a torn front pocket.', 'Black', '',
    'Small tear on the front pocket, laptop sleeve inside',
    'FOUND', 'UNDER_REVIEW', 'Library', 'Library', 'library',
    now() - interval '3 hours', now() - interval '3 hours'
  ),
  (
    'seed-bag-lost', 'campus-owner', 'Black backpack', 'Bags & luggage',
    'Black backpack with a laptop sleeve and a torn front pocket.', 'Black', '',
    'Contains lecture notes and a water bottle',
    'LOST', 'SEARCHING', 'Library', 'Library', null,
    now() - interval '5 hours', now() - interval '5 hours'
  )
on conflict (id) do nothing;

update items set
  match_score = 90,
  match_item_id = 'seed-bag-lost',
  match_explanation = 'category 25/25, title 25/25, color 15/15, location 15/15, brand 0/10, description 10/10',
  status = 'MATCHED',
  updated_at = now()
where id = 'seed-bag-found' and match_item_id is null;

update items set
  match_score = 90,
  match_item_id = 'seed-bag-found',
  match_explanation = 'category 25/25, title 25/25, color 15/15, location 15/15, brand 0/10, description 10/10',
  status = 'MATCHED',
  updated_at = now()
where id = 'seed-bag-lost' and match_item_id is null;
