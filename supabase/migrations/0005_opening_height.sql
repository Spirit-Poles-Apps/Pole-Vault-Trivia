-- Night Final: each player chooses an opening height (1.50 m - 5.30 m,
-- 5 cm steps). Each right answer raises their bar 15 cm in the app.
-- Points still decide the standings; this column is display only.
--
-- Safe to run on a live database: adds a nullable column, so existing
-- players and older app builds keep working.

alter table players
  add column if not exists opening_height_cm smallint
  check (
    opening_height_cm is null
    or (opening_height_cm between 150 and 530 and opening_height_cm % 5 = 0)
  );

comment on column players.opening_height_cm is
  'Player-chosen opening height in centimetres (150-530, 5 cm steps).';
