-- Enable PostGIS for geospatial queries
create extension if not exists postgis;

-- ─── PROFILES ──────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text not null,
  avatar_url text,
  skill_level text check (skill_level in ('beginner', 'intermediate', 'advanced', 'any')) default 'any',
  borough text,
  created_at timestamptz default now()
);

-- ─── COURTS ────────────────────────────────────────────────────────────────────
create table public.courts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('public', 'private')),
  address text not null,
  borough text not null check (borough in ('manhattan', 'brooklyn', 'queens', 'bronx', 'staten_island')),
  location geography(Point, 4326) not null,
  lat double precision not null,
  lng double precision not null,
  surface_type text check (surface_type in ('asphalt', 'concrete', 'hardwood', 'rubber', 'sport_court', 'other')),
  indoor boolean default false,
  has_lights boolean default false,
  rim_count integer default 2,
  rim_height text default '10ft',
  court_dimensions text,
  photos text[] default '{}',
  hourly_rate integer,
  is_bookable boolean default false,
  owner_id uuid references auth.users(id),
  description text,
  amenities text[] default '{}',
  avg_rating numeric(3,2) default 0,
  review_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index courts_location_idx on public.courts using gist(location);
create index courts_borough_idx on public.courts(borough);
create index courts_type_idx on public.courts(type);
create index courts_bookable_idx on public.courts(is_bookable);

-- ─── TIME SLOTS ────────────────────────────────────────────────────────────────
create table public.time_slots (
  id uuid primary key default gen_random_uuid(),
  court_id uuid references public.courts(id) on delete cascade not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  status text not null check (status in ('available', 'held', 'booked', 'cancelled')) default 'available',
  booked_by uuid references auth.users(id),
  held_until timestamptz,
  stripe_session_id text,
  price integer not null,
  created_at timestamptz default now()
);

create index slots_court_date_idx on public.time_slots(court_id, date);
create index slots_status_idx on public.time_slots(status);
create index slots_held_until_idx on public.time_slots(held_until) where status = 'held';

-- ─── BOOKINGS ──────────────────────────────────────────────────────────────────
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  court_id uuid references public.courts(id) not null,
  slot_id uuid references public.time_slots(id) not null,
  stripe_payment_intent text,
  amount integer not null,
  status text check (status in ('confirmed', 'cancelled', 'completed')) default 'confirmed',
  created_at timestamptz default now()
);

create index bookings_user_idx on public.bookings(user_id);
create index bookings_court_idx on public.bookings(court_id);

-- ─── REVIEWS ───────────────────────────────────────────────────────────────────
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  court_id uuid references public.courts(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  tags text[] default '{}',
  photos text[] default '{}',
  created_at timestamptz default now(),
  unique(court_id, user_id)
);

-- ─── CROWD REPORTS ─────────────────────────────────────────────────────────────
create table public.crowd_reports (
  id uuid primary key default gen_random_uuid(),
  court_id uuid references public.courts(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  crowd_level text not null check (crowd_level in ('empty', 'few_people', 'half_full', 'packed')),
  photo_url text,
  reported_at timestamptz default now()
);

create index crowd_reports_court_time_idx on public.crowd_reports(court_id, reported_at desc);

-- ─── PICKUP GAMES (RUNS) ───────────────────────────────────────────────────────
create table public.runs (
  id uuid primary key default gen_random_uuid(),
  court_id uuid references public.courts(id) on delete cascade not null,
  organizer_id uuid references auth.users(id) not null,
  title text not null,
  date date not null,
  start_time time not null,
  end_time time,
  spots_total integer not null check (spots_total between 2 and 30),
  spots_filled integer default 1,
  skill_level text check (skill_level in ('beginner', 'intermediate', 'advanced', 'any')) default 'any',
  description text,
  status text check (status in ('open', 'full', 'cancelled', 'completed')) default 'open',
  created_at timestamptz default now()
);

create index runs_date_idx on public.runs(date);
create index runs_court_idx on public.runs(court_id);
create index runs_status_idx on public.runs(status);

-- ─── RUN PARTICIPANTS ──────────────────────────────────────────────────────────
create table public.run_participants (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.runs(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  joined_at timestamptz default now(),
  unique(run_id, user_id)
);

-- ─── RUN CHAT MESSAGES ─────────────────────────────────────────────────────────
create table public.run_messages (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.runs(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  message text not null,
  created_at timestamptz default now()
);

create index run_messages_run_idx on public.run_messages(run_id, created_at);

-- ─── ROW LEVEL SECURITY ────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.courts enable row level security;
alter table public.time_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.crowd_reports enable row level security;
alter table public.runs enable row level security;
alter table public.run_participants enable row level security;
alter table public.run_messages enable row level security;

-- Profiles
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = user_id);

-- Courts
create policy "Courts are viewable by everyone" on public.courts for select using (true);
create policy "Court owners can update" on public.courts for update using (auth.uid() = owner_id);
create policy "Authenticated users can insert courts" on public.courts for insert with check (auth.uid() = owner_id);

-- Time slots
create policy "Slots are viewable by everyone" on public.time_slots for select using (true);
create policy "Court owners manage slots" on public.time_slots for all using (
  court_id in (select id from public.courts where owner_id = auth.uid())
);

-- Bookings
create policy "Users see own bookings" on public.bookings for select using (auth.uid() = user_id);
create policy "Users can create bookings" on public.bookings for insert with check (auth.uid() = user_id);

-- Reviews
create policy "Reviews are public" on public.reviews for select using (true);
create policy "Authenticated users can review" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on public.reviews for update using (auth.uid() = user_id);

-- Crowd reports
create policy "Crowd reports are public" on public.crowd_reports for select using (true);
create policy "Auth users can report" on public.crowd_reports for insert with check (auth.uid() = user_id);

-- Runs
create policy "Runs are public" on public.runs for select using (true);
create policy "Auth users create runs" on public.runs for insert with check (auth.uid() = organizer_id);
create policy "Organizers manage runs" on public.runs for update using (auth.uid() = organizer_id);

-- Run participants
create policy "Participants are public" on public.run_participants for select using (true);
create policy "Users can join runs" on public.run_participants for insert with check (auth.uid() = user_id);
create policy "Users can leave runs" on public.run_participants for delete using (auth.uid() = user_id);

-- Run messages
create policy "Run messages visible to all" on public.run_messages for select using (true);
create policy "Auth users can send messages" on public.run_messages for insert with check (auth.uid() = user_id);

-- ─── FUNCTIONS ─────────────────────────────────────────────────────────────────

-- Auto-update avg_rating on review change
create or replace function update_court_rating()
returns trigger as $$
begin
  update public.courts set
    avg_rating = (select coalesce(avg(rating), 0) from public.reviews where court_id = NEW.court_id),
    review_count = (select count(*) from public.reviews where court_id = NEW.court_id)
  where id = NEW.court_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_review_change
  after insert or update or delete on public.reviews
  for each row execute function update_court_rating();

-- Auto-update spots_filled when participants join/leave
create or replace function update_run_spots()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.runs set
      spots_filled = spots_filled + 1,
      status = case when spots_filled + 1 >= spots_total then 'full' else 'open' end
    where id = NEW.run_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.runs set
      spots_filled = greatest(spots_filled - 1, 1),
      status = 'open'
    where id = OLD.run_id;
    return OLD;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_participant_change
  after insert or delete on public.run_participants
  for each row execute function update_run_spots();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, display_name, avatar_url)
  values (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Release held slots whose hold has expired (call via cron or pg_cron)
create or replace function release_expired_holds()
returns void as $$
begin
  update public.time_slots
  set status = 'available', booked_by = null, held_until = null, stripe_session_id = null
  where status = 'held' and held_until < now();
end;
$$ language plpgsql security definer;

-- ─── REALTIME ──────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.crowd_reports;
alter publication supabase_realtime add table public.run_messages;
alter publication supabase_realtime add table public.run_participants;
alter publication supabase_realtime add table public.time_slots;
