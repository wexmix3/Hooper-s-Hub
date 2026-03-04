-- Seed: 8 fictional private/bookable courts for testing
-- (Real public court data is seeded via the scripts/seed-nyc-courts.ts script)

insert into public.courts (
  name, type, address, borough, location, lat, lng,
  surface_type, indoor, has_lights, rim_count, rim_height,
  court_dimensions, hourly_rate, is_bookable, description, amenities
) values
(
  'Court 23 — Midtown',
  'private', '350 W 42nd St, New York, NY 10036', 'manhattan',
  ST_GeographyFromText('POINT(-73.9934 40.7580)'), 40.7580, -73.9934,
  'hardwood', true, true, 4, '10ft',
  '94x50 (full)', 3500,
  true,
  'Premium hardwood courts in the heart of Midtown. Perfect for pickup games and skill sessions.',
  ARRAY['locker_room', 'restroom', 'water_fountain', 'parking']
),
(
  'Brooklyn Cage',
  'private', '140 Broadway, Brooklyn, NY 11211', 'brooklyn',
  ST_GeographyFromText('POINT(-73.9570 40.7091)'), 40.7091, -73.9570,
  'rubber', true, true, 2, '10ft',
  '84x50 (full)', 2500,
  true,
  'Industrial-style cage court in Williamsburg. Full court, top-of-the-line rubber surface.',
  ARRAY['restroom', 'water_fountain', 'wifi']
),
(
  'Queens ProHoop',
  'private', '37-11 Northern Blvd, Long Island City, NY 11101', 'queens',
  ST_GeographyFromText('POINT(-73.9302 40.7458)'), 40.7458, -73.9302,
  'sport_court', true, true, 4, '10ft',
  '94x50 (full)', 3000,
  true,
  'Two full Sport Court surfaces side by side. Great for leagues and team training.',
  ARRAY['locker_room', 'restroom', 'water_fountain', 'vending', 'parking']
),
(
  'The Bronx Arena',
  'private', '851 Grand Concourse, Bronx, NY 10451', 'bronx',
  ST_GeographyFromText('POINT(-73.9268 40.8301)'), 40.8301, -73.9268,
  'hardwood', true, true, 2, '10ft',
  'Half-court', 1800,
  true,
  'Classic Bronx gym with a hardwood half-court. Great for skill work and 3-on-3.',
  ARRAY['restroom', 'water_fountain']
),
(
  'Harlem Hardwood',
  'private', '2340 Adam Clayton Powell Jr Blvd, New York, NY 10030', 'manhattan',
  ST_GeographyFromText('POINT(-73.9497 40.8143)'), 40.8143, -73.9497,
  'hardwood', true, true, 4, '10ft',
  '94x50 (full)', 4000,
  true,
  'High-end facility in historic Harlem. NBA-regulation court with glass backboards.',
  ARRAY['locker_room', 'restroom', 'water_fountain', 'bleachers', 'pro_shop']
),
(
  'Lower East Side Courts',
  'private', '174 Delancey St, New York, NY 10002', 'manhattan',
  ST_GeographyFromText('POINT(-73.9882 40.7183)'), 40.7183, -73.9882,
  'rubber', true, true, 4, '10ft',
  '94x50 (full)', 2800,
  true,
  'Modern indoor facility steps from the Williamsburg Bridge. Open late nights.',
  ARRAY['restroom', 'water_fountain', 'wifi', 'vending']
),
(
  'BK Ballers Gym',
  'private', '540 Atlantic Ave, Brooklyn, NY 11217', 'brooklyn',
  ST_GeographyFromText('POINT(-73.9780 40.6840)'), 40.6840, -73.9780,
  'hardwood', true, true, 6, '10ft',
  '94x50 (full)', 3200,
  true,
  'Three full courts in Boerum Hill. NYC''s best run-of-the-mill gym for serious players.',
  ARRAY['locker_room', 'restroom', 'water_fountain', 'bleachers', 'parking']
),
(
  'Astoria Indoor Courts',
  'private', '23-07 31st Ave, Astoria, NY 11106', 'queens',
  ST_GeographyFromText('POINT(-73.9293 40.7722)'), 40.7722, -73.9293,
  'sport_court', true, true, 2, '10ft',
  'Half-court x2', 2200,
  true,
  'Two half-courts in the heart of Astoria. Perfect for 3-on-3 tournaments.',
  ARRAY['restroom', 'water_fountain', 'parking']
);

-- Generate time slots for the next 14 days for each private court
do $$
declare
  court_rec record;
  slot_date date;
  slot_hour integer;
begin
  for court_rec in select id, hourly_rate from public.courts where is_bookable = true loop
    for i in 0..13 loop
      slot_date := current_date + i;
      for slot_hour in 6..21 loop
        insert into public.time_slots (court_id, date, start_time, end_time, price, status)
        values (
          court_rec.id,
          slot_date,
          make_time(slot_hour, 0, 0),
          make_time(slot_hour + 1, 0, 0),
          court_rec.hourly_rate,
          'available'
        );
      end loop;
    end loop;
  end loop;
end;
$$;
