/**
 * scripts/seed-runs.ts
 * Seeds the runs table with 12 realistic sample pickup games.
 *
 * Requires courts to already be seeded (looks up court IDs by name).
 * Uses organizer_id = null + organizer_name for display (needs migration 004).
 *
 * Usage:
 *   npm run seed:runs
 */

import path from 'path'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: path.join(process.cwd(), '.env.local') })
config({ path: path.join(process.cwd(), '.env') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

/** Returns a date string YYYY-MM-DD that is `daysFromNow` days in the future */
function futureDate(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().split('T')[0]
}

const RUN_DEFINITIONS = [
  {
    courtName: 'Rucker Park',
    title: 'Sunday Full Court at Rucker',
    description: 'Competitive full-court 5v5 at the most iconic court in the world. All welcome but come ready to play. Runs as long as players show up.',
    skill_level: 'advanced',
    daysFromNow: 1,
    start_time: '09:00:00',
    end_time: '12:00:00',
    spots_total: 10,
    spots_filled: 7,
    organizer_name: 'Mike R.',
  },
  {
    courtName: 'The Cage — West 4th Street Courts',
    title: 'Weeknight Cage Runs',
    description: 'The Cage on a Tuesday — if you\'ve been here you know what it is. Bring your game and expect serious competition. Winners stay, losers wait.',
    skill_level: 'advanced',
    daysFromNow: 2,
    start_time: '18:00:00',
    end_time: '21:00:00',
    spots_total: 8,
    spots_filled: 5,
    organizer_name: 'Coach D.',
  },
  {
    courtName: 'Dyckman Park',
    title: 'Dyckman Open Runs',
    description: 'All levels welcome at one of Manhattan\'s legendary courts. Bring your A game. Dyckman runs are no joke but we keep it respectful.',
    skill_level: 'any',
    daysFromNow: 3,
    start_time: '10:00:00',
    end_time: '14:00:00',
    spots_total: 12,
    spots_filled: 4,
    organizer_name: 'Jay B.',
  },
  {
    courtName: 'Lincoln Terrace Park',
    title: 'BK Full Court — Crown Heights',
    description: 'Wednesday evening full court at Lincoln Terrace. Intermediate to advanced players. Good vibes, competitive but not reckless. Organized runs, call your fouls.',
    skill_level: 'intermediate',
    daysFromNow: 5,
    start_time: '19:00:00',
    end_time: '22:00:00',
    spots_total: 10,
    spots_filled: 6,
    organizer_name: 'Dre T.',
  },
  {
    courtName: 'Lost Battalion Hall Rec Center',
    title: 'Queens Pickup — Lost Battalion',
    description: 'Indoor hardwood pickup games at one of Queens\' best facilities. All levels, good refereed runs. Show up 15 min early to get on a team.',
    skill_level: 'any',
    daysFromNow: 4,
    start_time: '17:30:00',
    end_time: '20:30:00',
    spots_total: 10,
    spots_filled: 3,
    organizer_name: 'Q. Williams',
  },
  {
    courtName: "St. Mary's Park",
    title: 'Bronx After Work — St. Mary\'s',
    description: 'Thursday evening runs in the South Bronx. Competitive intermediate level. We run half court to full court depending on numbers. No ball-hogging.',
    skill_level: 'intermediate',
    daysFromNow: 6,
    start_time: '18:00:00',
    end_time: '21:00:00',
    spots_total: 8,
    spots_filled: 5,
    organizer_name: 'Rell B.',
  },
  {
    courtName: 'Tompkins Square Park',
    title: 'Early Bird at Tompkins Square',
    description: 'Saturday morning runs before the park gets busy. Good energy, mix of skill levels. Bring water, there\'s a fountain nearby. All welcome.',
    skill_level: 'any',
    daysFromNow: 7,
    start_time: '07:00:00',
    end_time: '10:00:00',
    spots_total: 8,
    spots_filled: 2,
    organizer_name: 'Sam K.',
  },
  {
    courtName: 'Marcy Playground',
    title: 'Marcy Projects Runs',
    description: 'Sunday afternoon hoops at the Marcy Houses courts. Advanced competition, serious players only. Come with respect and be ready to run.',
    skill_level: 'advanced',
    daysFromNow: 8,
    start_time: '14:00:00',
    end_time: '18:00:00',
    spots_total: 10,
    spots_filled: 8,
    organizer_name: 'Stacks',
  },
  {
    courtName: 'Silver Lake Park',
    title: 'SI Weekend Warriors',
    description: 'Staten Island players — Saturday morning pickup. All levels, bring your friends. Running 3v3 to 5v5 based on turnout. Family-friendly atmosphere.',
    skill_level: 'any',
    daysFromNow: 9,
    start_time: '11:00:00',
    end_time: '14:00:00',
    spots_total: 8,
    spots_filled: 3,
    organizer_name: 'Tony M.',
  },
  {
    courtName: 'Hoops Klub Brooklyn',
    title: 'Indoor 5v5 at Hoops Klub',
    description: 'Organized indoor pickup at Brooklyn\'s premier court. Monday nights, intermediate players. Hardwood, refs, the whole thing. $10/person on Venmo to hold your spot.',
    skill_level: 'intermediate',
    daysFromNow: 10,
    start_time: '20:00:00',
    end_time: '22:30:00',
    spots_total: 10,
    spots_filled: 6,
    organizer_name: 'Hoops Klub',
  },
  {
    courtName: 'Lincoln Terrace Park',
    title: 'Crown Heights Pickup',
    description: 'Beginner-friendly runs in Crown Heights. Open to newer players who want to get experience playing in a structured pickup environment. Good vibes, teaching atmosphere.',
    skill_level: 'beginner',
    daysFromNow: 11,
    start_time: '16:00:00',
    end_time: '18:00:00',
    spots_total: 8,
    spots_filled: 3,
    organizer_name: 'Coach Ray',
  },
  {
    courtName: 'McCarren Park',
    title: 'North Brooklyn Runs — McCarren',
    description: 'Williamsburg/Greenpoint area runs on Sunday afternoon. Four courts, organized by skill level. Text the number on the post to get on a team.',
    skill_level: 'intermediate',
    daysFromNow: 12,
    start_time: '13:00:00',
    end_time: '17:00:00',
    spots_total: 10,
    spots_filled: 4,
    organizer_name: 'Willie G.',
  },
]

async function seed() {
  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!)

  // Check schema supports organizer_name
  const { error: schemaCheck } = await supabase
    .from('runs')
    .select('organizer_name')
    .limit(0)

  if (schemaCheck) {
    console.error('❌  Schema missing organizer_name column. Apply migration 004_enhancements.sql first.')
    process.exit(1)
  }

  // Check if already seeded
  const { count: existing } = await supabase
    .from('runs')
    .select('*', { count: 'exact', head: true })

  if (existing && existing > 0) {
    console.log(`✓  ${existing} runs already exist — nothing to seed.`)
    return
  }

  // Fetch all courts to look up IDs by name
  const { data: courts, error: courtsErr } = await supabase
    .from('courts')
    .select('id, name')

  if (courtsErr || !courts?.length) {
    console.error('❌  No courts found. Run seed:courts first.')
    process.exit(1)
  }

  const courtMap = new Map(courts.map((c: { id: string; name: string }) => [c.name, c.id]))

  let seeded = 0
  let failed = 0

  console.log(`\n🏃 Seeding ${RUN_DEFINITIONS.length} sample pickup runs…`)

  for (const run of RUN_DEFINITIONS) {
    const courtId = courtMap.get(run.courtName)
    if (!courtId) {
      console.error(`  ✗ Court not found: "${run.courtName}" — skipping run "${run.title}"`)
      failed++
      continue
    }

    const { error } = await supabase.from('runs').insert({
      court_id: courtId,
      organizer_id: null,
      organizer_name: run.organizer_name,
      title: run.title,
      description: run.description,
      skill_level: run.skill_level,
      date: futureDate(run.daysFromNow),
      start_time: run.start_time,
      end_time: run.end_time,
      spots_total: run.spots_total,
      spots_filled: run.spots_filled,
      status: run.spots_filled >= run.spots_total ? 'full' : 'open',
    })

    if (error) {
      console.error(`  ✗ "${run.title}" — ${error.message}`)
      failed++
    } else {
      console.log(`  ✓ ${run.title} (${run.courtName}) — ${run.spots_filled}/${run.spots_total} spots`)
      seeded++
    }
  }

  console.log(`\n✅ Done. ${seeded}/${RUN_DEFINITIONS.length} runs seeded. ${failed > 0 ? `${failed} failed.` : ''}`)
}

seed().catch((err: Error) => {
  console.error('❌  Seed failed:', err.message)
  process.exit(1)
})
