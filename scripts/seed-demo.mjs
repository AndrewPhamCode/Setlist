// Run with: node --env-file=.env.local scripts/seed-demo.mjs
import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const DATABASE_URL = process.env.DATABASE_URL

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const sql = postgres(DATABASE_URL, { prepare: false })

const USERS = [
  {
    email: 'alex@setlist.demo',
    password: 'Demo1234!',
    username: 'alexrivera',
    displayName: 'Alex Rivera',
    bio: 'Concert addict • 200+ shows • Bay Area 🎸',
    shows: [
      ['Radiohead', 'Outside Lands', 'San Francisco, CA', '2023-08-11', 5, 'Thom Yorke was transcendent. The Creep encore had everyone in tears.'],
      ['Tame Impala', 'The Forum', 'Los Angeles, CA', '2023-03-15', 5, 'The visuals were unlike anything I\'ve seen. Kevin Parker is on another level.'],
      ['Tyler, the Creator', 'Chase Center', 'San Francisco, CA', '2023-10-08', 5, 'IGOR live was a religious experience. Nobody puts on a show like Tyler.'],
      ['Kendrick Lamar', 'Kia Forum', 'Los Angeles, CA', '2023-08-02', 5, 'Untouchable. The Big Steppers set was flawless start to finish.'],
      ['LCD Soundsystem', 'Bill Graham Civic', 'San Francisco, CA', '2022-11-12', 5, 'All My Friends live is a peak human experience. I cried. No shame.'],
      ['Frank Ocean', 'Coachella', 'Indio, CA', '2023-04-14', 5, 'Historic. Just historic. Worth every second of the wait.'],
      ['The Weeknd', 'Levi\'s Stadium', 'Santa Clara, CA', '2023-07-22', 4, 'After Hours til Dawn was visually stunning. Massive staging.'],
      ['Bon Iver', 'Fox Theater', 'Oakland, CA', '2022-09-30', 5, 'Skinny Love acoustic was devastating in the best possible way.'],
      ['Mac DeMarco', 'The Fillmore', 'San Francisco, CA', '2023-09-05', 4, 'So intimate and funny. Mac is effortlessly charming live.'],
      ['Flume', 'Bill Graham Civic', 'San Francisco, CA', '2023-05-19', 4, null],
      ['Billie Eilish', 'Shoreline Amphitheatre', 'Mountain View, CA', '2022-07-18', 4, 'Happier Than Ever tour was emotional despite the giant venue.'],
      ['Disclosure', 'Oracle Park', 'San Francisco, CA', '2023-06-11', 4, null],
    ],
  },
  {
    email: 'melody@setlist.demo',
    password: 'Demo1234!',
    username: 'melodychen',
    displayName: 'Melody Chen',
    bio: 'Pop girlie • R&B soul • front row every time 💜',
    shows: [
      ['Beyoncé', 'Levi\'s Stadium', 'Santa Clara, CA', '2023-07-29', 5, 'Renaissance is the greatest live show I have ever witnessed. She is a god.'],
      ['SZA', 'Chase Center', 'San Francisco, CA', '2023-12-10', 5, 'SOS tour was emotionally overwhelming. She sang every song perfectly.'],
      ['Harry Styles', 'Chase Center', 'San Francisco, CA', '2022-09-16', 5, 'Love On Tour exceeded every expectation. Pure joy for 3 hours straight.'],
      ['The Weeknd', 'Levi\'s Stadium', 'Santa Clara, CA', '2023-07-22', 5, 'After Hours til Dawn is the most cinematic concert I\'ve been to.'],
      ['Doja Cat', 'Shoreline Amphitheatre', 'Mountain View, CA', '2023-09-22', 4, 'Scarlet tour was weird, creative, and amazing. Only Doja could pull it off.'],
      ['Bad Bunny', 'Estadio Azteca', 'Mexico City, MX', '2022-12-09', 5, 'Most Fun ever. The energy was indescribable.'],
      ['Ariana Grande', 'SAP Center', 'San Jose, CA', '2019-09-18', 5, 'Thank U Next era Ari was peak pop perfection.'],
      ['Post Malone', 'Chase Center', 'San Francisco, CA', '2023-08-14', 3, 'Good energy but setlist felt a bit scattered.'],
      ['Lizzo', 'Bill Graham Civic', 'San Francisco, CA', '2022-04-07', 5, 'The most fun, body-positive, joy-filled show. Left feeling incredible.'],
      ['Drake', 'Chase Center', 'San Francisco, CA', '2023-10-28', 4, 'It\'s All A Blur was actually really good. Touching Toronto throwback sections.'],
    ],
  },
  {
    email: 'jay@setlist.demo',
    password: 'Demo1234!',
    username: 'basshead_jay',
    displayName: 'Jay Park',
    bio: 'Electronic music obsessive • raves not concerts • rave till dawn 🎛️',
    shows: [
      ['Flume', 'The Gorge Amphitheatre', 'George, WA', '2023-09-02', 5, 'Palaces live is something else entirely. The bass was physical.'],
      ['Four Tet', 'Printworks London', 'London, UK', '2023-03-18', 5, 'The most intimate and transcendent electronic show I\'ve ever seen.'],
      ['Bicep', 'Bill Graham Civic', 'San Francisco, CA', '2023-04-22', 5, 'Glue AV live is an out-of-body experience. Sound design was perfect.'],
      ['Bonobo', 'Greek Theatre', 'Berkeley, CA', '2023-10-14', 5, 'Seeing a full live band do Bonobo music is genuinely emotional. Stunning.'],
      ['Jon Hopkins', '1015 Folsom', 'San Francisco, CA', '2022-08-19', 5, 'Singularity live was overwhelming in the best way. Pure atmosphere.'],
      ['ODESZA', 'Oracle Park', 'San Francisco, CA', '2023-06-03', 5, 'The drumline intro alone was worth the price of the ticket.'],
      ['Disclosure', 'The Warfield', 'San Francisco, CA', '2022-11-05', 4, 'Energy never dropped for the full set. White Noise live is unreal.'],
      ['Jamie xx', 'Coachella', 'Indio, CA', '2023-04-16', 5, 'In Waves live set was transcendent. One of the best DJ sets I\'ve ever seen.'],
      ['Caribou', 'Fox Theater', 'Oakland, CA', '2022-10-07', 4, 'Odessa live was ethereal. Dan Snaith is a genius.'],
      ['Aphex Twin', 'Field Day', 'London, UK', '2023-06-03', 5, 'Completely unhinged and genius. The visuals were nightmare fuel in the best way.'],
    ],
  },
  {
    email: 'vinyl@setlist.demo',
    password: 'Demo1234!',
    username: 'vinylrevival',
    displayName: 'Sam Kowalski',
    bio: 'Indie folk devotee • cries at Fleet Foxes • Chicago 🌿',
    shows: [
      ['The National', 'Riviera Theatre', 'Chicago, IL', '2023-09-27', 5, 'Bloodbuzz Ohio live always destroys me. 20 years and Matt Berninger still gives everything.'],
      ['Phoebe Bridgers', 'Auditorium Theatre', 'Chicago, IL', '2022-06-04', 5, 'Funeral with the full orchestra was the most beautiful thing I have ever heard live.'],
      ['Big Thief', 'Thalia Hall', 'Chicago, IL', '2022-09-24', 5, 'Adrianne Lenker is genuinely one of the greatest songwriters alive. Spellbinding.'],
      ['Fleet Foxes', 'Riviera Theatre', 'Chicago, IL', '2023-10-20', 5, 'Helplessness Blues live made me ugly cry in the best possible way.'],
      ['Bon Iver', 'Millennium Park', 'Chicago, IL', '2022-07-29', 5, 'For Emma outdoors under the stars. A perfect night.'],
      ['Arcade Fire', 'United Center', 'Chicago, IL', '2022-04-02', 4, 'Wake Up live still gives me chills every single time.'],
      ['Sufjan Stevens', 'Chicago Theatre', 'Chicago, IL', '2023-05-12', 5, 'Carrie & Lowell live was harrowing and healing all at once.'],
      ['Beach House', 'Thalia Hall', 'Chicago, IL', '2022-10-15', 5, 'Space Song live in a small venue is everything. Ethereal.'],
      ['Waxahatchee', 'Lincoln Hall', 'Chicago, IL', '2023-03-09', 4, 'Tiger\'s Blood era Katie Crutchfield is on fire. Intimate and powerful.'],
      ['Wilco', 'Millennium Park', 'Chicago, IL', '2023-08-18', 4, 'Jeff Tweedy is a treasure. Jesus Etc live always hits differently outdoors.'],
    ],
  },
]

async function seedUser(userData) {
  const { email, password, username, displayName, bio, shows } = userData

  // Sign up (ignore error if already exists)
  await supabase.auth.signUp({ email, password }).catch(() => {})

  // Sign in to get ID
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) {
    console.error(`  ✗ Failed to sign in ${email}:`, error?.message)
    return
  }
  const userId = data.user.id

  // Upsert profile
  await sql`
    INSERT INTO profiles (id, username, display_name, bio)
    VALUES (${userId}, ${username}, ${displayName}, ${bio})
    ON CONFLICT (id) DO UPDATE SET
      username = ${username},
      display_name = ${displayName},
      bio = ${bio}
  `

  // Clear + re-insert shows
  await sql`DELETE FROM shows WHERE user_id = ${userId}`
  for (const [artist, venue, city, show_date, rating, review] of shows) {
    await sql`
      INSERT INTO shows (user_id, artist, venue, city, show_date, rating, review)
      VALUES (${userId}, ${artist}, ${venue}, ${city}, ${show_date}, ${rating}, ${review})
    `
  }

  console.log(`  ✓ ${displayName} (@${username}) — ${shows.length} shows`)
}

async function main() {
  console.log('Seeding demo users...\n')
  for (const user of USERS) {
    await seedUser(user)
  }
  console.log('\nDone! Demo profiles:')
  USERS.forEach(u => console.log(`  /u/${u.username}  (${u.email} / ${u.password})`))
  await sql.end()
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
