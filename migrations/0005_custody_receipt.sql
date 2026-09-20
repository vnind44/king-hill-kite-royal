-- Physical receipt: a found item is not in official custody until area staff confirms.

alter table items add column if not exists in_custody boolean not null default false;
alter table items add column if not exists custody_staff_id text;
alter table items add column if not exists custody_confirmed_at timestamptz;

update items
set in_custody = true, custody_confirmed_at = coalesce(custody_confirmed_at, updated_at)
where item_type = 'FOUND'
  and id in ('seed-keys', 'seed-id', 'seed-bag-found');

insert into items (
  id, reporter_id, title, category, description, color, brand, identifying_marks,
  item_type, status, location, location_zone, custody_desk_id, in_custody, created_at, updated_at
) values (
  'seed-bottle', 'campus-desk', 'Blue water bottle', 'Bottles & drinkware',
  'Insulated bottle left on a Library desk.', 'Blue', '',
  'Dent on the cap, campus sticker on the side',
  'FOUND', 'UNDER_REVIEW', 'Library', 'Library', 'library', false,
  now() - interval '90 minutes', now() - interval '90 minutes'
)
on conflict (id) do nothing;
