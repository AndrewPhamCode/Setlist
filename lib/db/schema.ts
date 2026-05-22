import {
  pgTable,
  uuid,
  text,
  varchar,
  smallint,
  timestamp,
  date,
  primaryKey,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  username: varchar('username', { length: 30 }).unique(),
  displayName: varchar('display_name', { length: 50 }),
  bio: text('bio'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const shows = pgTable('shows', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  artist: varchar('artist', { length: 200 }).notNull(),
  venue: varchar('venue', { length: 200 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  showDate: date('show_date').notNull(),
  rating: smallint('rating').notNull(),
  review: text('review'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const follows = pgTable(
  'follows',
  {
    followerId: uuid('follower_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    followingId: uuid('following_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.followerId, table.followingId] })]
)

export const likes = pgTable(
  'likes',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    showId: uuid('show_id')
      .notNull()
      .references(() => shows.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.showId] })]
)

// Inferred types used throughout the app
export type Profile = typeof profiles.$inferSelect
export type Show = typeof shows.$inferSelect
export type NewShow = typeof shows.$inferInsert
export type Follow = typeof follows.$inferSelect
