export type UserRole = 'interpreter' | 'reviewer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
  avatarUrl?: string;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
}

export interface InterpreterProfile {
  userId: string;
  phone: string;
  languagePair: string;
  country: string;
  timeZone: string;
  interpreterType: 'medical' | 'legal' | 'community' | 'conference';
  medicalQualified: boolean;
  legalQualified: boolean;
  completionRate: number;
  riskFlag: boolean;
  riskReason?: string;
  invitedToComplete?: boolean;
  invitedAt?: string;
  invitedMessage?: string;
  invitedItems?: string[];
  invitedSenderEmail?: string;
  invitedRecipientEmail?: string;
}

export type SectionType = 
  | 'personal_id'
  | 'technical_workstation'
  | 'training_certs'
  | 'agreements_compliance'
  | 'education_language';

export interface ChecklistItem {
  id: string;
  section: SectionType;
  title: string;
  description: string;
  requiredExtensions: string[];
  externalLinks?: { label: string; url: string }[];
  isCrucial: boolean;
}

export type ComplianceStatus = 'approved' | 'review' | 'rejected' | 'empty';

export interface FileVersion {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: 'approved' | 'review' | 'rejected';
}

export interface Submission {
  id: string;
  itemId: string;
  userId: string;
  fileName: string;
  fileSize: string;
  status: ComplianceStatus;
  notes?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewerId?: string;
  reviewerNotes?: string;
  fileUrl?: string; // Simulated blob or standard local mockup
  versions: FileVersion[];
  ocrVerified?: boolean;
  ocrExtractedData?: {
    confidence: number;
    details: string;
    detectedValues?: Record<string, string>;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface TrainingRequest {
  id: string;
  userId: string;
  userName: string;
  trainingType: 'medical' | 'legal';
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export interface SystemSettings {
  allowSelfRegistration: boolean;
  strictSpeedRequirements: boolean;
  minDownloadSpeed: number; // Mbps
  minUploadSpeed: number; // Mbps
  autoVirusScanSimulation: boolean;
  aiOcrVerificationEnabled: boolean;
}
