import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('interpreter'), // 'interpreter' | 'reviewer' | 'admin'
  avatarUrl: text('avatar_url'),
  status: text('status').notNull().default('active'), // 'active' | 'pending' | 'suspended'
  createdAt: timestamp('created_at').defaultNow(),
});

export const interpreterProfiles = pgTable('interpreter_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }).unique(),
  phone: text('phone'),
  languagePair: text('language_pair'),
  country: text('country'),
  timeZone: text('time_zone'),
  interpreterType: text('interpreter_type'), // 'medical' | 'legal' | 'community' | 'conference'
  medicalQualified: boolean('medical_qualified').default(false),
  legalQualified: boolean('legal_qualified').default(false),
  completionRate: integer('completion_rate').default(0),
  riskFlag: boolean('risk_flag').default(false),
  riskReason: text('risk_reason'),
  invitedToComplete: boolean('invited_to_complete').default(false),
  invitedAt: timestamp('invited_at'),
  invitedMessage: text('invited_message'),
  invitedItems: text('invited_items'), // JSON stringified array of checklist item ids
  invitedSenderEmail: text('invited_sender_email'),
  invitedRecipientEmail: text('invited_recipient_email'),
});

export const submissions = pgTable('submissions', {
  id: text('id').primaryKey(), // Custom string id e.g. "sub_x"
  itemId: text('item_id').notNull(),
  userId: text('user_id').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: text('file_size').notNull(),
  status: text('status').notNull().default('review'), // 'approved' | 'review' | 'rejected' | 'empty'
  notes: text('notes'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewerId: text('reviewer_id'),
  reviewerNotes: text('reviewer_notes'),
  fileUrl: text('file_url'),
  versions: text('versions'), // JSON string of FileVersion[]
  ocrVerified: boolean('ocr_verified').default(false),
  ocrExtractedData: text('ocr_extracted_data'), // JSON string of extracted details
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id'),
  userName: text('user_name'),
  userRole: text('user_role'),
  action: text('action').notNull(),
  details: text('details').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const trainingRequests = pgTable('training_requests', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  trainingType: text('training_type').notNull(), // 'medical' | 'legal'
  status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
  requestedAt: timestamp('requested_at').defaultNow(),
});

export const systemSettings = pgTable('system_settings', {
  id: integer('id').primaryKey().default(1),
  allowSelfRegistration: boolean('allow_self_registration').default(true),
  strictSpeedRequirements: boolean('strict_speed_requirements').default(false),
  minDownloadSpeed: integer('min_download_speed').default(50),
  minUploadSpeed: integer('min_upload_speed').default(10),
  autoVirusScanSimulation: boolean('auto_virus_scan_simulation').default(true),
  aiOcrVerificationEnabled: boolean('ai_ocr_verification_enabled').default(true),
});
