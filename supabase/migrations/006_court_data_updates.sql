-- ─── 006: Court Data Updates ─────────────────────────────────────────────────
-- Updates venue data, iconic court descriptions, and marks closed facilities.
-- Column reference: indoor (bool), photos (text[]), hourly_rate (int cents),
--   amenities (text[]), neighborhood, num_courts, booking_status, description

-- ─── Bookable Indoor Venues ───────────────────────────────────────────────────

UPDATE public.courts SET
  name = 'Basketball City at Pier 36',
  address = '299 South St, New York, NY 10002',
  borough = 'manhattan',
  neighborhood = 'Lower East Side',
  lat = 40.7103, lng = -73.9862,
  indoor = true,
  surface_type = 'hardwood',
  num_courts = 7,
  description = 'NYC''s premier basketball facility with seven air-conditioned hardwood courts, glass backboards, electronic scoreboards, locker rooms, and a deck with East River views of the Brooklyn Bridge and Statue of Liberty. Available for league play, private rentals, and events.',
  amenities = ARRAY['locker_room', 'water_fountain', 'parking', 'restroom'],
  court_dimensions = '94ft x 50ft',
  hourly_rate = 25000,
  is_bookable = true,
  booking_status = 'coming_soon'
WHERE name ILIKE '%basketball city%' OR name ILIKE '%pier 36%';

UPDATE public.courts SET
  address = 'Downtown Brooklyn, NY',
  borough = 'brooklyn',
  neighborhood = 'Fort Greene',
  indoor = true,
  surface_type = 'hardwood',
  num_courts = 2,
  description = 'Premium basketball facility in Downtown Brooklyn with pro-grade maple flooring, LED scoreboards, air conditioning, Dr. Dish shooting machines, and bleacher seating. Full-court and half-court rentals for pickup runs, team practices, tournaments, and events.',
  amenities = ARRAY['locker_room', 'water_fountain', 'restroom'],
  court_dimensions = '94ft x 50ft',
  hourly_rate = 10000,
  is_bookable = true,
  booking_status = 'coming_soon'
WHERE name ILIKE '%hoops klub%';

UPDATE public.courts SET
  address = 'Pier 62, 23rd St & Hudson River Park, New York, NY 10011',
  borough = 'manhattan',
  neighborhood = 'Chelsea',
  lat = 40.7466, lng = -74.0082,
  indoor = true,
  surface_type = 'hardwood',
  num_courts = 2,
  description = 'Two maple basketball courts inside Chelsea Piers'' air-conditioned Field House. Offers youth classes, adult leagues, travel basketball, summer camps, and hourly court rentals. On-site parking and locker rooms.',
  amenities = ARRAY['locker_room', 'water_fountain', 'parking', 'restroom'],
  court_dimensions = '84ft x 50ft',
  hourly_rate = 35000,
  is_bookable = true,
  booking_status = 'coming_soon'
WHERE name ILIKE '%chelsea piers%';

UPDATE public.courts SET
  name = 'Artistic Stitch Sports Complex',
  address = '28-17 Steinway St, Astoria, NY 11103',
  borough = 'queens',
  neighborhood = 'Astoria',
  lat = 40.7721, lng = -73.9156,
  indoor = true,
  surface_type = 'hardwood',
  num_courts = 1,
  description = 'Indoor basketball facility in Astoria with one full court (30'' x 66'') and half-court option. Hardwood flooring, NBA-grade rims with adjustable height. Open for court rentals, open runs, birthday parties, and lessons. Open 7 AM to 2 AM.',
  amenities = ARRAY['locker_room', 'water_fountain', 'parking'],
  court_dimensions = '30ft x 66ft',
  hourly_rate = 13000,
  is_bookable = true,
  booking_status = 'coming_soon'
WHERE name ILIKE '%artistic%';

-- Aviator Sports: indoor facility CLOSED April 2025
UPDATE public.courts SET
  description = 'PERMANENTLY CLOSED as of April 2025. Aviator Sports'' indoor facility at Floyd Bennett Field closed when their National Park Service contract expired.',
  is_bookable = false,
  booking_status = NULL
WHERE name ILIKE '%aviator%';

UPDATE public.courts SET
  address = '32-73 Steinway St, Long Island City, NY 11103',
  borough = 'queens',
  neighborhood = 'Astoria',
  indoor = true,
  surface_type = 'hardwood',
  num_courts = 1,
  description = 'Full indoor basketball court at Vibe Fitness near Astoria, Elmhurst, and Jackson Heights. Measures 30'' x 66'' with hardwood flooring and four professional NBA-grade rims. Available for private rentals, basketball, soccer, and volleyball.',
  amenities = ARRAY['locker_room', 'water_fountain'],
  court_dimensions = '30ft x 66ft',
  hourly_rate = 10000,
  is_bookable = true,
  booking_status = 'coming_soon'
WHERE name ILIKE '%vibe fitness%' OR name ILIKE '%vibe bqe%';

UPDATE public.courts SET
  address = '67-09 108th St, Forest Hills, NY 11375',
  borough = 'queens',
  neighborhood = 'Forest Hills',
  lat = 40.7263, lng = -73.8317,
  indoor = true,
  surface_type = 'hardwood',
  num_courts = 1,
  description = 'Community center gymnasium in Forest Hills with indoor basketball court available for rentals, leagues, and events. Also offers volleyball, pickleball, and multi-purpose event space.',
  amenities = ARRAY['locker_room', 'water_fountain', 'restroom'],
  hourly_rate = 10000,
  is_bookable = true,
  booking_status = 'coming_soon'
WHERE name ILIKE '%commonpoint%';

-- ─── Iconic Public Courts ─────────────────────────────────────────────────────

UPDATE public.courts SET
  name = 'Holcombe Rucker Park',
  address = '280 W 155th St, New York, NY 10039',
  neighborhood = 'Harlem',
  lat = 40.8295, lng = -73.9365,
  num_courts = 3,
  has_lights = true,
  description = 'The most famous streetball court in the world. Home of the Entertainers Basketball Classic (EBC), where NBA legends like Kobe, KD, and LeBron have played. Serious competitive runs year-round, especially electric during summer tournaments.',
  amenities = ARRAY['bleachers', 'water_fountain']
WHERE name ILIKE '%rucker%';

UPDATE public.courts SET
  name = 'The Cage at West 4th Street',
  address = 'W 4th St & 6th Ave, New York, NY 10012',
  neighborhood = 'Greenwich Village',
  lat = 40.7315, lng = -73.9996,
  num_courts = 2,
  has_lights = true,
  description = 'Iconic fenced-in court in the heart of Greenwich Village. One of the most filmed basketball courts in the world. Intense, fast-paced pickup games with players of all backgrounds battling in front of packed sidewalk crowds. Summer league games are legendary.',
  amenities = ARRAY['bleachers']
WHERE name ILIKE '%west 4th%' OR name ILIKE '%the cage%';

UPDATE public.courts SET
  name = 'Dyckman Park Basketball Courts',
  address = 'Dyckman St & Nagle Ave, New York, NY 10040',
  neighborhood = 'Inwood',
  lat = 40.8662, lng = -73.9264,
  num_courts = 2,
  has_lights = true,
  description = 'Home of the legendary Dyckman Basketball Tournament, one of NYC''s biggest summer streetball events. The park transforms into an arena with bleachers and thousands of spectators. Competitive runs all year, but summer is when Dyckman truly comes alive.',
  amenities = ARRAY['bleachers', 'water_fountain']
WHERE name ILIKE '%dyckman%';

UPDATE public.courts SET
  name = 'Tompkins Square Park Basketball Courts',
  address = 'E 7th St & Ave A, New York, NY 10009',
  neighborhood = 'East Village',
  lat = 40.7265, lng = -73.9818,
  num_courts = 2,
  has_lights = true,
  description = 'Classic East Village outdoor courts with solid pickup runs. Good mix of regulars and visitors, competitive but welcoming. Surrounded by the park''s trees and East Village energy.',
  amenities = ARRAY['water_fountain']
WHERE name ILIKE '%tompkins%';

UPDATE public.courts SET
  name = 'St. Mary''s Park Basketball Courts',
  address = 'St. Ann''s Ave & E 145th St, Bronx, NY 10455',
  neighborhood = 'Mott Haven',
  lat = 40.8094, lng = -73.9130,
  num_courts = 4,
  has_lights = true,
  description = 'One of the Bronx''s top basketball destinations with four outdoor courts. Strong local runs, especially on weekends. Renovated courts with good surface quality. Part of the larger St. Mary''s Park recreation area.',
  amenities = ARRAY['water_fountain', 'restroom']
WHERE name ILIKE '%st. mary%' OR name ILIKE '%saint mary%';

-- ─── Update location geography for courts with new lat/lng ────────────────────
UPDATE public.courts SET
  location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
WHERE name IN (
  'Basketball City at Pier 36',
  'Chelsea Piers Field House',
  'Artistic Stitch Sports Complex',
  'Commonpoint Queens – Central',
  'Holcombe Rucker Park',
  'The Cage at West 4th Street',
  'Dyckman Park Basketball Courts',
  'Tompkins Square Park Basketball Courts',
  'St. Mary''s Park Basketball Courts'
);
