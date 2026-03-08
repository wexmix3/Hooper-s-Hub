-- ─── SEED: 30 Real NYC Basketball Courts ────────────────────────────────────
-- Run this in Supabase SQL Editor or via: psql $DATABASE_URL < 004_seed_courts.sql
-- Only inserts if courts table is empty to avoid duplicates.

DO $$
BEGIN
  IF (SELECT count(*) FROM public.courts WHERE type = 'public') = 0 THEN

    INSERT INTO public.courts (name, type, address, borough, lat, lng, location, surface_type, indoor, has_lights, rim_count, is_bookable, amenities)
    VALUES
      ('Rucker Park', 'public', '155th St & Frederick Douglass Blvd, Manhattan', 'manhattan', 40.8291, -73.9365, ST_SetSRID(ST_MakePoint(-73.9365, 40.8291), 4326), 'asphalt', false, true, 3, false, '{}'),
      ('The Cage — West 4th Street Courts', 'public', '199 W 4th St, Manhattan', 'manhattan', 40.7328, -73.9990, ST_SetSRID(ST_MakePoint(-73.9990, 40.7328), 4326), 'asphalt', false, true, 2, false, '{}'),
      ('Dyckman Park', 'public', 'Nagle Ave & Dyckman St, Manhattan', 'manhattan', 40.8670, -73.9275, ST_SetSRID(ST_MakePoint(-73.9275, 40.8670), 4326), 'asphalt', false, true, 2, false, '{}'),
      ('Goat Park (98th Street)', 'public', 'Amsterdam Ave & W 98th St, Manhattan', 'manhattan', 40.7948, -73.9690, ST_SetSRID(ST_MakePoint(-73.9690, 40.7948), 4326), 'asphalt', false, false, 2, false, '{}'),
      ('Riverside Park (76th St)', 'public', 'Riverside Dr & W 76th St, Manhattan', 'manhattan', 40.7815, -73.9855, ST_SetSRID(ST_MakePoint(-73.9855, 40.7815), 4326), 'asphalt', false, false, 3, false, '{}'),
      ('Hamilton Fish Park', 'public', '128 Pitt St, Manhattan', 'manhattan', 40.7199, -73.9796, ST_SetSRID(ST_MakePoint(-73.9796, 40.7199), 4326), 'asphalt', false, true, 2, false, '{}'),
      ('Tompkins Square Park', 'public', 'Ave A & E 7th St, Manhattan', 'manhattan', 40.7264, -73.9818, ST_SetSRID(ST_MakePoint(-73.9818, 40.7264), 4326), 'asphalt', false, false, 2, false, '{}'),
      ('Jesse Owens Playground', 'public', '1501 Lexington Ave, Manhattan', 'manhattan', 40.8004, -73.9413, ST_SetSRID(ST_MakePoint(-73.9413, 40.8004), 4326), 'asphalt', false, true, 2, false, '{}'),
      ('Jackie Robinson Park', 'public', 'Edgecombe Ave & W 150th St, Manhattan', 'manhattan', 40.8261, -73.9414, ST_SetSRID(ST_MakePoint(-73.9414, 40.8261), 4326), 'asphalt', false, true, 2, false, '{}'),
      ('Colonel David Marcus Playground', 'public', 'W 133rd St & Amsterdam Ave, Manhattan', 'manhattan', 40.8159, -73.9527, ST_SetSRID(ST_MakePoint(-73.9527, 40.8159), 4326), 'asphalt', false, false, 2, false, '{}'),
      ('Tillary Park', 'public', 'Tillary St & Jay St, Brooklyn', 'brooklyn', 40.6952, -73.9867, ST_SetSRID(ST_MakePoint(-73.9867, 40.6952), 4326), 'asphalt', false, false, 2, false, '{}'),
      ('Rodney Park', 'public', 'Keap St & S 3rd St, Brooklyn', 'brooklyn', 40.7082, -73.9573, ST_SetSRID(ST_MakePoint(-73.9573, 40.7082), 4326), 'asphalt', false, false, 2, false, '{}'),
      ('Lincoln Terrace Park', 'public', 'Buffalo Ave & Eastern Pkwy, Brooklyn', 'brooklyn', 40.6694, -73.9327, ST_SetSRID(ST_MakePoint(-73.9327, 40.6694), 4326), 'asphalt', false, true, 4, false, '{}'),
      ('Maria Hernandez Park', 'public', 'Knickerbocker Ave & Starr St, Brooklyn', 'brooklyn', 40.7005, -73.9218, ST_SetSRID(ST_MakePoint(-73.9218, 40.7005), 4326), 'asphalt', false, false, 2, false, '{}'),
      ('McCarren Park', 'public', 'Bedford Ave & N 12th St, Brooklyn', 'brooklyn', 40.7198, -73.9513, ST_SetSRID(ST_MakePoint(-73.9513, 40.7198), 4326), 'asphalt', false, true, 4, false, '{}'),
      ('Commodore Barry Park', 'public', 'Navy St & Flushing Ave, Brooklyn', 'brooklyn', 40.6987, -73.9775, ST_SetSRID(ST_MakePoint(-73.9775, 40.6987), 4326), 'asphalt', false, false, 3, false, '{}'),
      ('Marcy Playground', 'public', 'Marcy Ave & Myrtle Ave, Brooklyn', 'brooklyn', 40.6949, -73.9491, ST_SetSRID(ST_MakePoint(-73.9491, 40.6949), 4326), 'asphalt', false, false, 2, false, '{}'),
      ('Orchard Beach Courts', 'public', 'Orchard Beach Rd, The Bronx', 'bronx', 40.8648, -73.7952, ST_SetSRID(ST_MakePoint(-73.7952, 40.8648), 4326), 'asphalt', false, false, 6, false, '{}'),
      ('Mullaly Park', 'public', 'E 164th St & River Ave, The Bronx', 'bronx', 40.8280, -73.9230, ST_SetSRID(ST_MakePoint(-73.9230, 40.8280), 4326), 'asphalt', false, true, 3, false, '{}'),
      ('St. Mary''s Park', 'public', 'St. Ann''s Ave & E 145th St, The Bronx', 'bronx', 40.8086, -73.9139, ST_SetSRID(ST_MakePoint(-73.9139, 40.8086), 4326), 'asphalt', false, false, 3, false, '{}'),
      ('Crotona Park', 'public', 'Crotona Ave & E 173rd St, The Bronx', 'bronx', 40.8380, -73.8951, ST_SetSRID(ST_MakePoint(-73.8951, 40.8380), 4326), 'asphalt', false, true, 4, false, '{}'),
      ('Franz Sigel Park', 'public', 'E 153rd St & Gerard Ave, The Bronx', 'bronx', 40.8255, -73.9235, ST_SetSRID(ST_MakePoint(-73.9235, 40.8255), 4326), 'asphalt', false, false, 2, false, '{}'),
      ('Geraldine Ferraro Playground', 'public', '109-19 49th Ave, Queens', 'queens', 40.7426, -73.9191, ST_SetSRID(ST_MakePoint(-73.9191, 40.7426), 4326), 'asphalt', false, true, 2, false, '{}'),
      ('Roy Wilkins Park', 'public', 'Merrick Blvd & Baisley Blvd, Queens', 'queens', 40.6836, -73.7646, ST_SetSRID(ST_MakePoint(-73.7646, 40.6836), 4326), 'asphalt', false, true, 4, false, '{}'),
      ('Lost Battalion Hall Rec Center', 'public', '93-29 Queens Blvd, Queens', 'queens', 40.7346, -73.8564, ST_SetSRID(ST_MakePoint(-73.8564, 40.7346), 4326), 'hardwood', true, true, 2, false, ARRAY['restroom', 'water_fountain']),
      ('Flushing Meadows Courts', 'public', 'Flushing Meadows Corona Park, Queens', 'queens', 40.7400, -73.8408, ST_SetSRID(ST_MakePoint(-73.8408, 40.7400), 4326), 'asphalt', false, true, 6, false, '{}'),
      ('PS 5 Playground', 'public', '820 Delafield Ave, Staten Island', 'staten_island', 40.6218, -74.1154, ST_SetSRID(ST_MakePoint(-74.1154, 40.6218), 4326), 'asphalt', false, false, 2, false, '{}'),
      ('Clove Lakes Park', 'public', '1150 Clove Rd, Staten Island', 'staten_island', 40.6210, -74.1105, ST_SetSRID(ST_MakePoint(-74.1105, 40.6210), 4326), 'asphalt', false, false, 2, false, '{}'),
      ('Lyons Pool & Courts', 'public', 'Victory Blvd & Bay St, Staten Island', 'staten_island', 40.6435, -74.0770, ST_SetSRID(ST_MakePoint(-74.0770, 40.6435), 4326), 'asphalt', false, false, 2, false, '{}'),
      ('Silver Lake Park', 'public', 'Victory Blvd, Staten Island', 'staten_island', 40.6325, -74.0947, ST_SetSRID(ST_MakePoint(-74.0947, 40.6325), 4326), 'asphalt', false, false, 2, false, '{}');

    RAISE NOTICE '30 public courts seeded successfully.';
  ELSE
    RAISE NOTICE 'Courts already exist — skipping seed.';
  END IF;
END $$;

-- Ensure public read RLS policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'courts' AND policyname = 'courts_public_read'
  ) THEN
    EXECUTE 'CREATE POLICY courts_public_read ON public.courts FOR SELECT USING (true)';
    RAISE NOTICE 'RLS read policy created for courts.';
  END IF;
END $$;
