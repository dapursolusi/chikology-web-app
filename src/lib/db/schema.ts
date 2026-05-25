import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const moodEnum = pgEnum('mood', [
  'very_calm',
  'calm',
  'neutral',
  'stressed',
  'very_stressed',
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  mood: moodEnum('mood'),
  stressTier: integer('stress_tier'),
  content: text('content'),
  recommendation: text('recommendation'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
