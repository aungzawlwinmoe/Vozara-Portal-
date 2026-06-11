import { ChecklistItem, User, InterpreterProfile, Submission, SystemSettings, AuditLog, TrainingRequest, Notification, ComplianceStatus } from './types';

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  // SECTION 1: Personal & Identification
  {
    id: 'resume',
    section: 'personal_id',
    title: 'Resume / CV',
    description: 'Document outlining at least 3 years of professional interpreting experience. Company names and employment dates must be clearly visible.',
    requiredExtensions: ['PDF', 'DOC', 'DOCX'],
    isCrucial: true
  },
  {
    id: 'government_id',
    section: 'personal_id',
    title: 'Government-Issued ID',
    description: 'A valid passport, driver’s license, or national identity card (upload front and back/inside cover pages).',
    requiredExtensions: ['PDF', 'PNG', 'JPG', 'JPEG'],
    isCrucial: true
  },
  {
    id: 'selfie_id',
    section: 'personal_id',
    title: 'Selfie Holding ID',
    description: 'An eye-level clear photograph of yourself holding your government identity card next to your face. Verify your name and photo are legible.',
    requiredExtensions: ['PNG', 'JPG', 'JPEG'],
    isCrucial: true
  },

  // SECTION 2: Technical & Workstation Requirements
  {
    id: 'speed_test',
    section: 'technical_workstation',
    title: 'Internet Speed Test Screenshot',
    description: 'Run speed test at speedtest.net. Requires minimum 20 Mbps download and 10 Mbps upload speeds. Upload speedtest results screenshot.',
    requiredExtensions: ['PNG', 'JPG', 'JPEG'],
    externalLinks: [{ label: 'Speedtest.net', url: 'https://www.speedtest.net' }],
    isCrucial: true
  },
  {
    id: 'workstation_photo',
    section: 'technical_workstation',
    title: 'Workstation Environment Photo',
    description: 'Submit an overview photo of your workspace showing a quiet, private area with desk, ergonomic chair, laptop/PC, and dual-ear noise cancelling headset.',
    requiredExtensions: ['PNG', 'JPG', 'JPEG'],
    isCrucial: false
  },

  // SECTION 3: Mandatory Training & Certifications
  {
    id: 'hipaa_cert',
    section: 'training_certs',
    title: 'HIPAA Training Certificate',
    description: 'Complete the HIPAA Security and Privacy Assessment evaluating healthcare data protection protocols.',
    requiredExtensions: ['PDF', 'PNG', 'JPG'],
    externalLinks: [{ label: 'HIPAA Training Assessment', url: 'https://www.flexiquiz.com/SC/N/HIPAA_TRAINING_ASSESSMENT' }],
    isCrucial: true
  },
  {
    id: 'fwa_cert',
    section: 'training_certs',
    title: 'FWA (Fraud, Waste & Abuse) Cert',
    description: 'FWA Certificate covering medicare compliance core protocols. Complete the CMS handbook training.',
    requiredExtensions: ['PDF', 'PNG', 'JPG'],
    externalLinks: [{ label: 'CMS FWA Training Portal', url: 'https://www.cms.gov/Outreach-and-Education/MLN/WBT/MLN3995723-MLNPartsCD/FWA/story.html' }],
    isCrucial: true
  },
  {
    id: 'lms_training',
    section: 'training_certs',
    title: 'LMS Core Onboarding Training',
    description: 'Complete the integrated Vozara MLT platform tutorial explaining specialized interpreting mechanics.',
    requiredExtensions: ['PDF', 'PNG', 'JPG'],
    externalLinks: [{ label: 'MLT Onboarding flexiquiz', url: 'https://www.flexiquiz.com/SC/N/MLT_ONBOARDING_TRAINING' }],
    isCrucial: true
  },
  {
    id: 'medical_cert',
    section: 'training_certs',
    title: 'Medical Interpreter Cert (40-Hour)',
    description: 'Certified Medical Interpreter (CMI) credential or evidence of 40-hour healthcare interpreter training. If you do not have one, request training assistance below.',
    requiredExtensions: ['PDF', 'PNG', 'JPG'],
    isCrucial: false
  },
  {
    id: 'legal_cert',
    section: 'training_certs',
    title: 'Legal Interpreter Cert (40-Hour)',
    description: 'Certificate demonstrating legal interpreter credentials or 40-hour court/juridical interpretation training curriculum. Training assistance programs can be requested.',
    requiredExtensions: ['PDF', 'PNG', 'JPG'],
    isCrucial: false
  },

  // SECTION 4: Agreements & Compliance Documents
  {
    id: 'contractor_agreement',
    section: 'agreements_compliance',
    title: 'Independent Contractor Agreement',
    description: 'A legally binding services agreement. Click HelloSign, execute the document, download the executed copy, and submit here.',
    requiredExtensions: ['PDF'],
    externalLinks: [{ label: 'Execute ICA Sign-sheet', url: 'https://app.hellosign.com/s/7B95aQkA' }],
    isCrucial: true
  },
  {
    id: 'code_conduct',
    section: 'agreements_compliance',
    title: 'Bhub Code of Conduct Sign-sheet',
    description: 'Review Bhub Professional Ethics guidelines. Access HelloSign to securely sign, complete, and upload signed form.',
    requiredExtensions: ['PDF'],
    externalLinks: [{ label: 'Sign Code of Conduct', url: 'https://app.hellosign.com/s/J3JwHE6R' }],
    isCrucial: true
  },

  // SECTION 5: Education & Language Proficiency
  {
    id: 'education_diploma',
    section: 'education_language',
    title: 'High School Diploma / Language Certificate',
    description: 'High School Diploma from country of target language OR official language certification testing (ALTA, Cambridge, HSK, etc) showing score >= 10.',
    requiredExtensions: ['PDF', 'PNG', 'JPG', 'JPEG'],
    isCrucial: true
  },
  {
    id: 'english_proficiency',
    section: 'education_language',
    title: 'EF SET English Certificate',
    description: 'Proof of English fluency. Complete the standard EF SET 50-minute test. Full C1 or C2 level required across both reading & listening modules.',
    requiredExtensions: ['PDF'],
    externalLinks: [{ label: 'EF SET English test', url: 'https://www.efset.org/ef-set-50/' }],
    isCrucial: true
  }
];

export const MOCK_USERS: User[] = [
  // Interpreters
  {
    id: 'user_elena',
    email: 'elena@vozarals.com',
    name: 'Elena Rostova',
    role: 'interpreter',
    status: 'active',
    createdAt: '2026-05-01T09:00:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'user_carlos',
    email: 'carlos@vozarals.com',
    name: 'Carlos Mendez',
    role: 'interpreter',
    status: 'active',
    createdAt: '2026-05-10T10:30:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'user_wei',
    email: 'wei@vozarals.com',
    name: 'Wei Zhang',
    role: 'interpreter',
    status: 'active',
    createdAt: '2026-05-20T14:15:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'user_sarah',
    email: 'sarah@vozarals.com',
    name: 'Sarah Jenkins',
    role: 'interpreter',
    status: 'pending',
    createdAt: '2026-06-05T08:12:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120'
  },

  // Reviewers
  {
    id: 'user_reviewer_1',
    email: 'reviews@vozarals.com',
    name: 'Marcus Vance',
    role: 'reviewer',
    status: 'active',
    createdAt: '2026-01-15T08:00:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120'
  },

  // Admins
  {
    id: 'user_admin_1',
    email: 'admin@vozarals.com',
    name: 'Amelia Harris',
    role: 'admin',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'
  }
];

export const MOCK_INTERPRETER_PROFILES: InterpreterProfile[] = [
  {
    userId: 'user_elena',
    phone: '+1 (555) 724-8192',
    languagePair: 'Russian ↔ English',
    country: 'United States',
    timeZone: 'EST (UTC-5)',
    interpreterType: 'medical',
    medicalQualified: true,
    legalQualified: false,
    completionRate: 78,
    riskFlag: false
  },
  {
    userId: 'user_carlos',
    phone: '+34 612 890 412',
    languagePair: 'Spanish ↔ English',
    country: 'Spain',
    timeZone: 'CET (UTC+1)',
    interpreterType: 'conference',
    medicalQualified: true,
    legalQualified: true,
    completionRate: 100,
    riskFlag: false
  },
  {
    userId: 'user_wei',
    phone: '+86 138 9012 3456',
    languagePair: 'Mandarin ↔ English',
    country: 'China',
    timeZone: 'CST (UTC+8)',
    interpreterType: 'legal',
    medicalQualified: false,
    legalQualified: true,
    completionRate: 35,
    riskFlag: true,
    riskReason: 'Speed test results failed to meet minimal upload rate three consecutive trials.'
  },
  {
    userId: 'user_sarah',
    phone: '+44 7911 123456',
    languagePair: 'French ↔ English',
    country: 'United Kingdom',
    timeZone: 'GMT (UTC+0)',
    interpreterType: 'community',
    medicalQualified: false,
    legalQualified: false,
    completionRate: 7,
    riskFlag: false
  }
];

export const DEFAULT_MOCK_SUBMISSIONS: Submission[] = [
  // Elena's Uploads
  {
    id: 'sub_elena_resume',
    itemId: 'resume',
    userId: 'user_elena',
    fileName: 'Elena_Rostova_Medical_CV_2026.pdf',
    fileSize: '1.2 MB',
    status: 'approved',
    submittedAt: '2026-05-15T10:00:00Z',
    reviewedAt: '2026-05-16T14:30:00Z',
    reviewerId: 'user_reviewer_1',
    reviewerNotes: 'Strong credentialing. Document displays 5 years clinical translation at NY Methodist.',
    fileUrl: 'https://vozarals-storage.com/users/elena/Elena_Rostova_Medical_CV_2026.pdf',
    versions: [
      { id: 'v1', fileName: 'Elena_Rostova_Medical_CV_2026.pdf', fileSize: '1.2 MB', uploadedAt: '2026-05-15T10:00:00Z', status: 'approved' }
    ]
  },
  {
    id: 'sub_elena_gov_id',
    itemId: 'government_id',
    userId: 'user_elena',
    fileName: 'Elena_US_Passport_Scan.pdf',
    fileSize: '4.8 MB',
    status: 'review',
    submittedAt: '2026-06-09T17:22:00Z',
    fileUrl: 'https://vozarals-storage.com/users/elena/Elena_US_Passport_Scan.pdf',
    versions: [
      { id: 'v2', fileName: 'Elena_US_Passport_Scan.pdf', fileSize: '4.8 MB', uploadedAt: '2026-06-09T17:22:00Z', status: 'review' }
    ]
  },
  {
    id: 'sub_elena_selfie_id',
    itemId: 'selfie_id',
    userId: 'user_elena',
    fileName: 'Elena_Holding_Passport_Verification.jpg',
    fileSize: '2.4 MB',
    status: 'approved',
    submittedAt: '2026-05-15T10:45:00Z',
    reviewedAt: '2026-05-16T14:40:00Z',
    reviewerId: 'user_reviewer_1',
    reviewerNotes: 'Selfie matched passport facial metrics, facial features clearly resolved.',
    fileUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    versions: [
      { id: 'v3', fileName: 'Elena_Holding_Passport_Verification.jpg', fileSize: '2.4 MB', uploadedAt: '2026-05-15T10:45:00Z', status: 'approved' }
    ]
  },
  {
    id: 'sub_elena_speed_test',
    itemId: 'speed_test',
    userId: 'user_elena',
    fileName: 'Speedtest_HomeOffice_150_80.png',
    fileSize: '650 KB',
    status: 'approved',
    submittedAt: '2026-05-15T11:02:00Z',
    reviewedAt: '2026-05-16T14:45:00Z',
    reviewerId: 'user_reviewer_1',
    reviewerNotes: 'Approved automatically. OCR results: Download = 152.1 Mbps, Upload = 81.3 Mbps.',
    ocrVerified: true,
    ocrExtractedData: {
      confidence: 99,
      details: 'Viber speed capture verified. Downstream: 152.1 Mbps | Upstream: 81.3 Mbps | Latency: 11ms.',
      detectedValues: { download: '152.1 Mbps', upload: '81.3 Mbps', server: 'Comcast New York' }
    },
    fileUrl: 'https://vozarals-storage.com/users/elena/Speedtest_HomeOffice_150_80.png',
    versions: [
      { id: 'v4', fileName: 'Speedtest_HomeOffice_150_80.png', fileSize: '650 KB', uploadedAt: '2026-05-15T11:02:00Z', status: 'approved' }
    ]
  },
  {
    id: 'sub_elena_hipaa_cert',
    itemId: 'hipaa_cert',
    userId: 'user_elena',
    fileName: 'Elena_Rostova_HIPAA_Certificate.pdf',
    fileSize: '890 KB',
    status: 'approved',
    submittedAt: '2026-05-15T12:05:00Z',
    reviewedAt: '2026-05-16T14:52:00Z',
    reviewerId: 'user_reviewer_1',
    fileUrl: 'https://vozarals-storage.com/users/elena/Elena_Rostova_HIPAA_Certificate.pdf',
    versions: [
      { id: 'v6', fileName: 'Elena_Rostova_HIPAA_Certificate.pdf', fileSize: '890 KB', uploadedAt: '2026-05-15T12:05:00Z', status: 'approved' }
    ]
  },
  {
    id: 'sub_elena_fwa_cert',
    itemId: 'fwa_cert',
    userId: 'user_elena',
    fileName: 'Elena_FWA_Certification_CMS.pdf',
    fileSize: '1.1 MB',
    status: 'approved',
    submittedAt: '2026-05-15T12:20:00Z',
    reviewedAt: '2026-05-16T14:56:00Z',
    reviewerId: 'user_reviewer_1',
    fileUrl: 'https://vozarals-storage.com/users/elena/Elena_FWA_Certification_CMS.pdf',
    versions: [
      { id: 'v7', fileName: 'Elena_FWA_Certification_CMS.pdf', fileSize: '1.1 MB', uploadedAt: '2026-05-15T12:20:00Z', status: 'approved' }
    ]
  },
  {
    id: 'sub_elena_lms_training',
    itemId: 'lms_training',
    userId: 'user_elena',
    fileName: 'Elena_Vozara_LMS_Onboarding.pdf',
    fileSize: '950 KB',
    status: 'approved',
    submittedAt: '2026-05-15T14:40:00Z',
    reviewedAt: '2026-05-16T15:00:00Z',
    reviewerId: 'user_reviewer_1',
    fileUrl: 'https://vozarals-storage.com/users/elena/Elena_Vozara_LMS_Onboarding.pdf',
    versions: [
      { id: 'v8', fileName: 'Elena_Vozara_LMS_Onboarding.pdf', fileSize: '950 KB', uploadedAt: '2026-05-15T14:40:00Z', status: 'approved' }
    ]
  },
  {
    id: 'sub_elena_contractor_agreement',
    itemId: 'contractor_agreement',
    userId: 'user_elena',
    fileName: 'Elena_ICA_Signed_HelloSign.pdf',
    fileSize: '2.1 MB',
    status: 'approved',
    submittedAt: '2026-05-15T15:00:00Z',
    reviewedAt: '2026-05-16T15:10:00Z',
    reviewerId: 'user_reviewer_1',
    fileUrl: 'https://vozarals-storage.com/users/elena/Elena_ICA_Signed_HelloSign.pdf',
    versions: [
      { id: 'v9', fileName: 'Elena_ICA_Signed_HelloSign.pdf', fileSize: '2.1 MB', uploadedAt: '2026-05-15T15:00:00Z', status: 'approved' }
    ]
  },
  {
    id: 'sub_elena_code_conduct',
    itemId: 'code_conduct',
    userId: 'user_elena',
    fileName: 'Elena_Bhub_CodeOfConduct_Signed.pdf',
    fileSize: '1.4 MB',
    status: 'approved',
    submittedAt: '2026-05-15T15:15:00Z',
    reviewedAt: '2026-05-16T15:15:00Z',
    reviewerId: 'user_reviewer_1',
    fileUrl: 'https://vozarals-storage.com/users/elena/Elena_Bhub_CodeOfConduct_Signed.pdf',
    versions: [
      { id: 'v10', fileName: 'Elena_Bhub_CodeOfConduct_Signed.pdf', fileSize: '1.4 MB', uploadedAt: '2026-05-15T15:15:00Z', status: 'approved' }
    ]
  },
  {
    id: 'sub_elena_english_proficiency',
    itemId: 'english_proficiency',
    userId: 'user_elena',
    fileName: 'Elena_EFSET_French_English_CEFR_C2.pdf',
    fileSize: '710 KB',
    status: 'approved',
    submittedAt: '2026-05-15T16:00:00Z',
    reviewedAt: '2026-05-16T15:30:00Z',
    reviewerId: 'user_reviewer_1',
    ocrVerified: true,
    ocrExtractedData: {
      confidence: 100,
      details: 'EFSET Score Certified. Reading Section: 82/100 (C2 Proficient). Listening Section: 78/100 (C2 Proficient). Total Level: C2 Superb.',
      detectedValues: { cefrLevel: 'C2 Proficient', readingScore: '82/100', listeningScore: '78/100' }
    },
    fileUrl: 'https://vozarals-storage.com/users/elena/Elena_EFSET_French_English_CEFR_C2.pdf',
    versions: [
      { id: 'v11', fileName: 'Elena_EFSET_French_English_CEFR_C2.pdf', fileSize: '710 KB', uploadedAt: '2026-05-15T16:00:00Z', status: 'approved' }
    ]
  },

  // Carlos Mendezes (Spanish ↔ English) - 100% completed
  ...CHECKLIST_ITEMS.map((item) => ({
    id: `sub_carlos_${item.id}`,
    itemId: item.id,
    userId: 'user_carlos',
    fileName: `Carlos_Mendez_${item.id.toUpperCase()}_Approved.pdf`,
    fileSize: '1.3 MB',
    status: 'approved' as ComplianceStatus,
    submittedAt: '2026-05-12T09:00:00Z',
    reviewedAt: '2026-05-13T11:00:00Z',
    reviewerId: 'user_reviewer_1',
    reviewerNotes: 'Automated bulk checklist confirmation, elements validated.',
    fileUrl: 'https://vozarals-storage.com/users/carlos/document.pdf',
    versions: [
      { id: 'vc1', fileName: `Carlos_Mendez_${item.id.toUpperCase()}_Approved.pdf`, fileSize: '1.3 MB', uploadedAt: '2026-05-12T09:00:00Z', status: 'approved' as const }
    ]
  })),

  // Wei Zhang - 30% completed. Has some rejected items, and submitted Speed Test.
  {
    id: 'sub_wei_resume',
    itemId: 'resume',
    userId: 'user_wei',
    fileName: 'Wei_Zhang_CV_Short.pdf',
    fileSize: '920 KB',
    status: 'rejected',
    submittedAt: '2026-05-22T08:00:00Z',
    reviewedAt: '2026-05-23T10:00:00Z',
    reviewerId: 'user_reviewer_1',
    reviewerNotes: 'Rejected: Your CV displays only 1.5 years of translating experience. Vozara requires a min of 3 years of demonstrated clinical or commercial translation records.',
    fileUrl: 'https://vozarals-storage.com/users/wei/Wei_Zhang_CV_Short.pdf',
    versions: [
      { id: 'vw1', fileName: 'Wei_Zhang_CV_Short.pdf', fileSize: '920 KB', uploadedAt: '2026-05-22T08:00:00Z', status: 'rejected' }
    ]
  },
  {
    id: 'sub_wei_speed_test',
    itemId: 'speed_test',
    userId: 'user_wei',
    fileName: 'Wei_Home_FastSpeed.png',
    fileSize: '410 KB',
    status: 'rejected',
    submittedAt: '2026-05-22T08:15:00Z',
    reviewedAt: '2026-05-23T10:15:00Z',
    reviewerId: 'user_reviewer_1',
    reviewerNotes: 'Rejected: Upload rate resolved as 6.2 Mbps, which is below our 10 Mbps workstation minimum threshold.',
    ocrVerified: true,
    ocrExtractedData: {
      confidence: 98,
      details: 'OCR Warning. Detected download speed: 45.1 Mbps (PASS). Detected upload speed: 6.2 Mbps (FAIL). Minimum 10 Mbps uploaded is critical.',
      detectedValues: { download: '45.1 Mbps', upload: '6.2 Mbps' }
    },
    fileUrl: 'https://vozarals-storage.com/users/wei/Wei_Home_FastSpeed.png',
    versions: [
      { id: 'vw2', fileName: 'Wei_Home_FastSpeed.png', fileSize: '410 KB', uploadedAt: '2026-05-22T08:15:00Z', status: 'rejected' }
    ]
  },
  {
    id: 'sub_wei_gov_id',
    itemId: 'government_id',
    userId: 'user_wei',
    fileName: 'Wei_Beijing_ID_NationalCard.jpg',
    fileSize: '1.8 MB',
    status: 'approved',
    submittedAt: '2026-05-22T08:30:00Z',
    reviewedAt: '2026-05-23T10:20:00Z',
    reviewerId: 'user_reviewer_1',
    reviewerNotes: 'National ID card recognized. Details match registration profile name.',
    fileUrl: 'https://vozarals-storage.com/users/wei/Wei_Beijing_ID_NationalCard.jpg',
    versions: [
      { id: 'vw3', fileName: 'Wei_Beijing_ID_NationalCard.jpg', fileSize: '1.8 MB', uploadedAt: '2026-05-22T08:30:00Z', status: 'approved' }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    userId: 'user_elena',
    title: 'Speed Test Approved',
    message: 'Your workstation internet speed screenshot was auto-verified and approved successfully (Downstream: 152 Mbps, Upstream: 81 Mbps).',
    type: 'success',
    read: true,
    createdAt: '2026-05-16T14:45:00Z'
  },
  {
    id: 'notif_2',
    userId: 'user_elena',
    title: 'HIPAA Certificate Accepted',
    message: 'Your HIPAA Training submission has been reviewed and approved by reviewer Amelia Harris.',
    type: 'success',
    read: false,
    createdAt: '2026-05-16T14:52:00Z'
  },
  {
    id: 'notif_3',
    userId: 'user_wei',
    title: 'Upload Requirements Warning',
    message: 'Your speed test submission was flagged as Rejected because upload speeds do not satisfy the 10 Mbps workstation rule.',
    type: 'error',
    read: false,
    createdAt: '2026-05-23T10:15:00Z'
  },
  {
    id: 'notif_4',
    userId: 'user_elena',
    title: 'Government ID Pending Review',
    message: 'You have submitted a new document for your Government-Issued ID requirement. Compliance staff will review this shortly.',
    type: 'info',
    read: false,
    createdAt: '2026-06-09T17:22:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit_1',
    userId: 'user_elena',
    userName: 'Elena Rostova',
    userRole: 'interpreter',
    action: 'Document Upload',
    details: 'Uploaded speed_test file: Speedtest_HomeOffice_150_80.png (650 KB)',
    timestamp: '2026-05-15T11:02:00Z'
  },
  {
    id: 'audit_2',
    userId: 'user_reviewer_1',
    userName: 'Marcus Vance',
    userRole: 'reviewer',
    action: 'Document Approval',
    details: 'Approved government_id for Elena Rostova',
    timestamp: '2026-05-16T14:40:00Z'
  },
  {
    id: 'audit_3',
    userId: 'user_wei',
    userName: 'Wei Zhang',
    userRole: 'interpreter',
    action: 'Document Upload',
    details: 'Uploaded CV file: Wei_Zhang_CV_Short.pdf (920 KB)',
    timestamp: '2026-05-22T08:00:00Z'
  },
  {
    id: 'audit_4',
    userId: 'user_reviewer_1',
    userName: 'Marcus Vance',
    userRole: 'reviewer',
    action: 'Document Rejection',
    details: 'Rejected speed_test for Wei Zhang (Reason: Upload speed rate 6.2 Mbps below 10 Mbps limitation).',
    timestamp: '2026-05-23T10:15:00Z'
  }
];

export const DEFAULT_MOCK_SYSTEM_SETTINGS: SystemSettings = {
  allowSelfRegistration: true,
  strictSpeedRequirements: true,
  minDownloadSpeed: 20,
  minUploadSpeed: 10,
  autoVirusScanSimulation: true,
  aiOcrVerificationEnabled: true
};

export const INITIAL_TRAINING_REQUESTS: TrainingRequest[] = [
  {
    id: 't_req_1',
    userId: 'user_wei',
    userName: 'Wei Zhang',
    trainingType: 'medical',
    status: 'pending',
    requestedAt: '2026-05-24T11:00:00Z'
  }
];
