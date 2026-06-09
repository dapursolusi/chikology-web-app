import { relations } from 'drizzle-orm';
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

export const proofStatusEnum = pgEnum('proof_status', [
  'pending',
  'approved',
  'rejected',
]);

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

export const paymentProofs = pgTable('payment_proofs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  chapterId: uuid('chapter_id')
    .notNull()
    .references(() => bookChapters.id),
  proofPath: text('proof_path').notNull(),
  status: proofStatusEnum('status').default('pending').notNull(),
  rejectionReason: text('rejection_reason'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
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

export const accessEventTypeEnum = pgEnum('access_event_type', [
  'view_started',
  'download_requested',
  'access_denied',
]);

export const chapterAccessLogs = pgTable(
  'chapter_access_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    chapterId: uuid('chapter_id')
      .notNull()
      .references(() => bookChapters.id),
    eventType: accessEventTypeEnum('event_type').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique().on(
      table.userId,
      table.chapterId,
      table.eventType,
      table.createdAt
    ),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  chapterAccessLogs: many(chapterAccessLogs),
}));

export const bookChaptersRelations = relations(bookChapters, ({ many }) => ({
  chapterAccessLogs: many(chapterAccessLogs),
}));

export const chapterAccessLogsRelations = relations(
  chapterAccessLogs,
  ({ one }) => ({
    user: one(users, {
      fields: [chapterAccessLogs.userId],
      references: [users.id],
    }),
    chapter: one(bookChapters, {
      fields: [chapterAccessLogs.chapterId],
      references: [bookChapters.id],
    }),
  })
);
