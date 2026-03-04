/**
 * Migration runner — applies SQL migrations to Supabase
 *
 * Usage:
 *   npx tsx scripts/migrate.ts
 *
 * Add DATABASE_URL to .env.local to skip auto-detection:
 *   Find it at: Supabase Dashboard → Settings → Database → URI tab → Session mode
 */

// Load .env.local FIRST before any env reads
import { configDotenv } from 'dotenv'
configDotenv({ path: '.env.local' })

import { readFileSync } from 'fs'
import { join } from 'path'
import pg from 'pg'

const { Client } = pg

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const projectRef = supabaseUrl.replace('https://', '').split('.')[0]
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const dbPassword = process.env.DATABASE_PASSWORD ?? ''

console.log(`Project ref: ${projectRef}`)

// Connection strings to try in order
const connectionStrings = [
  process.env.DATABASE_URL,
  // Supabase Session mode pooler
  dbPassword
    ? `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`
    : null,
  // Try service role as password (works in some Supabase configurations)
  `postgresql://postgres.${projectRef}:${serviceKey}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${projectRef}:${serviceKey}@aws-0-us-east-2.pooler.supabase.com:5432/postgres`,
  // Direct connection
  dbPassword
    ? `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`
    : null,
].filter(Boolean) as string[]

async function tryConnect(connStr: string): Promise<pg.Client | null> {
  const client = new Client({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  })
  try {
    await client.connect()
    return client
  } catch {
    try { await client.end() } catch {}
    return null
  }
}

const MIGRATION_FILES = [
  'supabase/migrations/001_schema.sql',
  'supabase/migrations/002_seed_public_courts.sql',
]

async function runMigrations() {
  console.log(`\n🔌 Connecting to Supabase (project: ${projectRef})…`)

  let client: pg.Client | null = null
  for (const connStr of connectionStrings) {
    const displayStr = connStr.replace(serviceKey, '***').replace(dbPassword || 'SKIP', '***')
    process.stdout.write(`  Trying ${displayStr.substring(0, 70)}… `)
    client = await tryConnect(connStr)
    if (client) {
      console.log('✅ Connected')
      break
    }
    console.log('❌')
  }

  if (!client) {
    console.error('\n⚠️  Could not connect automatically.')
    console.error('\nFix: Add DATABASE_URL to .env.local\n')
    console.error('1. Open: https://supabase.com/dashboard/project/' + projectRef + '/settings/database')
    console.error('2. Scroll to "Connection string" → select "URI" tab → Session mode')
    console.error('3. Copy the URI and add to .env.local:')
    console.error('   DATABASE_URL=postgresql://postgres.PROJECT:[password]@aws-0-region.pooler.supabase.com:5432/postgres\n')
    process.exit(1)
  }

  for (const file of MIGRATION_FILES) {
    const sql = readFileSync(join(process.cwd(), file), 'utf8')
    console.log(`\n📄 Applying ${file}…`)

    // Split on statement boundaries and run each one
    const statements = sql
      .split(/;(?=\s*(?:--|$|\n\s*(?:create|alter|insert|drop|grant|do|update|select)\s))/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 5 && !s.startsWith('--'))

    let ok = 0, skipped = 0, failed = 0
    for (const stmt of statements) {
      try {
        await client.query(stmt)
        ok++
      } catch (err: any) {
        if (
          err.message.includes('already exists') ||
          err.message.includes('duplicate key') ||
          err.code === '42P07' || // table already exists
          err.code === '42710' || // object already exists
          err.code === '42P04'    // database already exists
        ) {
          skipped++
        } else {
          console.error(`   ⚠️  ${err.message.substring(0, 100)}`)
          failed++
        }
      }
    }
    console.log(`   ✅ ${ok} statements OK, ${skipped} already existed, ${failed} errors`)
  }

  await client.end()
  console.log('\n🎉 Migrations complete!')
}

runMigrations().catch(console.error)
