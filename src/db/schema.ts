import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
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
  role: text('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const bookChapters = pgTable('book_chapters', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  chapterNumber: smallint('chapter_number').unique().notNull(),
  priceIdr: integer('price_idr').default(0).notNull(),
  releaseDate: date('release_date'),
  isFree: boolean('is_free').default(false).notNull(),
  pdfPath: text('pdf_path'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const chapterPurchases = pgTable(
  'chapter_purchases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    chapterId: uuid('chapter_id')
      .notNull()
      .references(() => bookChapters.id),
    purchasedAt: timestamp('purchased_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique().on(table.userId, table.chapterId)]
);

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
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const questionnaireResponses = pgTable('questionnaire_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  answers: jsonb('answers'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const appSettings = pgTable('app_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
