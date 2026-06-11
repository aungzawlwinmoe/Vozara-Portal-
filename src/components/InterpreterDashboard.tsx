import React, { useState, useRef } from 'react';
import { 
  User, 
  InterpreterProfile, 
  ChecklistItem, 
  Submission, 
  TrainingRequest, 
  Notification, 
  AuditLog, 
  SectionType,
  ComplianceStatus
} from '../types';
import { CHECKLIST_ITEMS } from '../data';
import { getInitialsAvatar } from '../utils/avatar';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Upload, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  History, 
  User as UserIcon, 
  Globe, 
  Wifi, 
  BookOpen, 
  Award, 
  FileCheck, 
  Cpu, 
  Phone, 
  MapPin, 
  RotateCw, 
  Play, 
  AlertTriangle,
  Flame,
  MousePointerClick,
  FileSpreadsheet,
  FileSignature,
  Eye
} from 'lucide-react';
import { DocumentPreviewOverlay } from './DocumentPreviewOverlay';

interface InterpreterDashboardProps {
  currentUser: User;
  profile: InterpreterProfile;
  submissions: Submission[];
  trainingRequests: TrainingRequest[];
  onUploadDocument: (itemId: string, fileName: string, fileSize: string, ocrRun: boolean, fileUrl?: string) => void;
  onDeleteDocument: (submissionId: string) => void;
  onRequestTraining: (type: 'medical' | 'legal') => void;
  onUpdateProfile: (updatedProfile: Partial<InterpreterProfile> & { name: string; phone: string }) => void;
}

export const InterpreterDashboard: React.FC<InterpreterDashboardProps> = ({
  currentUser,
  profile,
  submissions,
  trainingRequests,
  onUploadDocument,
  onDeleteDocument,
  onRequestTraining,
  onUpdateProfile
}) => {
  const [activeSection, setActiveSection] = useState<SectionType | 'all'>('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [customFiles, setCustomFiles] = useState<Record<string, { name: string; size: string; fileUrl?: string }>>({});
  const [ocrCheckbox, setOcrCheckbox] = useState<Record<string, boolean>>({});
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profilePhone, setProfilePhone] = useState(profile.phone);
  const [profileLang, setProfileLang] = useState(profile.languagePair);
  const [profileCountry, setProfileCountry] = useState(profile.country);
  const [profileZone, setProfileZone] = useState(profile.timeZone);
  const [profileType, setProfileType] = useState(profile.interpreterType);

  // Speed test simulation state
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);
  const [speedProgress, setSpeedProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [pingSpeed, setPingSpeed] = useState<number | null>(null);
  const [copiedSpeed, setCopiedSpeed] = useState(false);

  // Premium Document Preview States
  const [selectedSubForPreview, setSelectedSubForPreview] = useState<Submission | null>(null);
  const [selectedItemForPreview, setSelectedItemForPreview] = useState<ChecklistItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleOpenPreview = (sub: Submission, item: ChecklistItem) => {
    setSelectedSubForPreview(sub);
    setSelectedItemForPreview(item);
    setIsPreviewOpen(true);
  };

  // Drag and drop helper state
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({});

  const sectionDetails: Record<SectionType, { title: string; color: string; bg: string; text: string; icon: any }> = {
    personal_id: { 
      title: 'Personal & Identification', 
      color: 'border-blue-500', 
      bg: 'bg-blue-500/10', 
      text: 'text-blue-500',
      icon: UserIcon 
    },
    technical_workstation: { 
      title: 'Technical & Workstation', 
      color: 'border-sky-500', 
      bg: 'bg-sky-500/10', 
      text: 'text-sky-500',
      icon: Wifi 
    },
    training_certs: { 
      title: 'Training & Certifications', 
      color: 'border-violet-500', 
      bg: 'bg-violet-500/10', 
      text: 'text-violet-500',
      icon: Award 
    },
    agreements_compliance: { 
      title: 'Agreements & Signing', 
      color: 'border-emerald-500', 
      bg: 'bg-emerald-500/10', 
      text: 'text-emerald-500',
      icon: FileSignature 
    },
    education_language: { 
      title: 'Education & Languages', 
      color: 'border-amber-500', 
      bg: 'bg-amber-500/10', 
      text: 'text-amber-500',
      icon: BookOpen 
    }
  };

  const getStatusBadge = (status: ComplianceStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-550/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Approved
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Under Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Action Required
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            Not Submitted
          </span>
        );
    }
  };

  // Profile save helper
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: profileName,
      phone: profilePhone,
      languagePair: profileLang,
      country: profileCountry,
      timeZone: profileZone,
      interpreterType: profileType
    });
    setEditingProfile(false);
  };

  // Simulated Speed test runner
  const runSpeedTest = () => {
    setIsTestingSpeed(true);
    setSpeedProgress(0);
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setPingSpeed(null);

    const interval = setInterval(() => {
      setSpeedProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTestingSpeed(false);
          // Set final random speeds satisfying or slightly failing to show OCR check
          // 85% chance of passing, 15% failing
          const passes = Math.random() > 0.15;
          setDownloadSpeed(passes ? Math.floor(Math.random() * 180) + 30 : Math.floor(Math.random() * 15) + 4);
          setUploadSpeed(passes ? Math.floor(Math.random() * 90) + 15 : Math.floor(Math.random() * 7) + 2);
          setPingSpeed(Math.floor(Math.random() * 25) + 3);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const copySpeedResults = () => {
    if (downloadSpeed && uploadSpeed && pingSpeed) {
      const text = `Vozara Workstation Speed Results:
Download: ${downloadSpeed} Mbps
Upload: ${uploadSpeed} Mbps
Ping: ${pingSpeed} ms
Status: ${downloadSpeed >= 20 && uploadSpeed >= 10 ? 'PASSED REQUIRED CRITERIA' : 'FAILED REQUIRED CRITERIA'}`;
      navigator.clipboard.writeText(text);
      setCopiedSpeed(true);
      setTimeout(() => setCopiedSpeed(false), 2000);
    }
  };

  // Drag-and-drop mechanics
  const handleDrag = (e: React.DragEvent, itemId: string, isOver: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [itemId]: isOver }));
  };

  const handleDrop = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [itemId]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const url = URL.createObjectURL(file);
      setCustomFiles(prev => ({
        ...prev,
        [itemId]: { 
          name: file.name, 
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          fileUrl: url 
        }
      }));
    }
  };

  // Form submission simulated
  const triggerSimUpload = (itemId: string, sampleName?: string, sampleSize?: string) => {
    let name = sampleName || customFiles[itemId]?.name || `${itemId.toUpperCase()}_Document.pdf`;
    let size = sampleSize || customFiles[itemId]?.size || '1.4 MB';
    let fileUrl = !sampleName ? customFiles[itemId]?.fileUrl : undefined;
    const doOcr = ocrCheckbox[itemId] ?? true;

    // Trigger upload
    onUploadDocument(itemId, name, size, doOcr, fileUrl);

    // Clear temp files state
    setCustomFiles(prev => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
  };

  // Pre-configured templates to make demo super swift
  const sampleUploadTemplates: Record<string, { name: string; size: string }[]> = {
    resume: [
      { name: 'Elena_Rostova_Resume_Main.pdf', size: '1.2 MB' },
      { name: 'CV_Interpreter_Advanced_Healthcare.docx', size: '840 KB' },
      { name: 'Short_Interpreter_Qualifications.pdf', size: '2.1 MB' }
    ],
    government_id: [
      { name: 'Passport_Scan_International.pdf', size: '3.4 MB' },
      { name: 'Drivers_License_Front_Back.jpg', size: '1.9 MB' }
    ],
    selfie_id: [
      { name: 'Selfie_Holding_ID_Verification.png', size: '2.6 MB' }
    ],
    speed_test: [
      { name: 'HighSpeedOffice_Result_Speedtest.png', size: '560 KB' },
      { name: 'PoorSpeedScreenshot_Underlimit.png', size: '480 KB' } // Fail demo
    ],
    workstation_photo: [
      { name: 'Workstation_QuietDesk_DualEar.jpg', size: '4.2 MB' }
    ],
    hipaa_cert: [
      { name: 'HIPAA_Compliance_Cert_2026.pdf', size: '920 KB' }
    ],
    fwa_cert: [
      { name: 'CMS_Medicare_FWA_Completion.pdf', size: '1.1 MB' }
    ],
    lms_training: [
      { name: 'LMS_Core_Vozara_Syllabus.pdf', size: '800 KB' }
    ],
    medical_cert: [
      { name: '40Hr_Medical_Interpreter_Federation_Cert.pdf', size: '1.8 MB' }
    ],
    legal_cert: [
      { name: '40Hr_National_Legal_Interpreter_Exam.pdf', size: '2.4 MB' }
    ],
    contractor_agreement: [
      { name: 'ICA_FullySigned_HelloSign_Secure.pdf', size: '2.3 MB' }
    ],
    code_conduct: [
      { name: 'Bhub_Ethics_Conduct_Signed.pdf', size: '1.5 MB' }
    ],
    education_diploma: [
      { name: 'University_Translation_Diploma_Apostille.pdf', size: '3.1 MB' },
      { name: 'ALTA_Language_Score_Report.jpg', size: '890 KB' }
    ],
    english_proficiency: [
      { name: 'EFSET_FullScore_C2_Proficient.pdf', size: '690 KB' },
      { name: 'EFSET_Intermediate_B2_Flagged.pdf', size: '650 KB' } // Fail demo
    ]
  };

  // Calculate totals
  const totalCerts = submissions.length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;
  const reviewCount = submissions.filter(s => s.status === 'review').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;
  const totalRequirements = CHECKLIST_ITEMS.length;
  const missingCount = totalRequirements - submissions.filter(s => s.status === 'approved' || s.status === 'review').length;

  return (
    <div id="interpreter-viewport" className="space-y-6">
      {/* HEADER WITH PROFILE OVERVIEW */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img 
              id="interpreter-avatar"
              src={currentUser.avatarUrl || getInitialsAvatar(currentUser.name)} 
              alt={currentUser.name} 
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-50/50"
            />
            <div className={`absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide text-white ${
              profile.completionRate === 100 ? 'bg-emerald-500' : 'bg-slate-705'
            }`}>
              {profile.completionRate === 100 ? 'Verified' : 'Onboarding'}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 id="interpreter-name-heading" className="text-xl font-bold text-slate-900 tracking-tight">{currentUser.name}</h1>
              {profile.riskFlag && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-md border border-red-200 font-semibold animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> Flags Active
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
              <span className="font-semibold text-slate-750">{currentUser.email}</span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-0.5"><Globe className="w-3.5 h-3.5 text-slate-400" /> {profile.languagePair}</span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-0.5 font-mono text-xs text-slate-400"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {profile.country} ({profile.timeZone})</span>
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-[10px] bg-slate-100 text-slate-650 px-2 py-0.5 rounded-md font-semibold font-sans capitalize">
                Type: {profile.interpreterType}
              </span>
              {profile.medicalQualified && (
                <span className="text-[10px] bg-emerald-50 text-emerald-705 px-2 py-0.5 rounded-md font-semibold border border-emerald-100 flex items-center gap-0.5">
                  <FileCheck className="w-3 h-3" /> Medical Qualified
                </span>
              )}
              {profile.legalQualified && (
                <span className="text-[10px] bg-indigo-50 text-indigo-705 px-2 py-0.5 rounded-md font-semibold border border-indigo-100 flex items-center gap-0.5">
                  <FileCheck className="w-3 h-3" /> Legal Qualified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-3 w-full lg:w-auto">
          <button
            id="edit-profile-btn"
            onClick={() => setEditingProfile(!editingProfile)}
            className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          >
            {editingProfile ? 'Cancel Editing' : 'Update Profile'}
          </button>
          
          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center gap-3">
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Compliance Score</div>
              <div id="compliance-sc-val" className={`text-lg font-extrabold font-display ${
                profile.completionRate >= 90 ? 'text-emerald-550' : profile.completionRate >= 50 ? 'text-orange-500' : 'text-slate-500'
              }`}>{profile.completionRate}%</div>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Timeline Status</div>
              <div className="text-xs font-semibold text-slate-755 flex items-center gap-1 mt-0.5">
                {profile.completionRate === 100 ? (
                  <span className="text-emerald-600 flex items-center gap-0.5">🟢 Completed Onboarding</span>
                ) : (
                  <span className="text-orange-500 flex items-center gap-0.5">🟠 Active Onboarding</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COMPLIANCE CHECKLIST INVITATION REQUEST BANNER */}
      {profile.invitedToComplete && (
        <div id="compliance-invitation-banner" className="bg-gradient-to-r from-indigo-600 to-slate-800 text-white rounded-2xl p-5 border border-indigo-700/50 shadow-md relative overflow-hidden animate-fadeIn">
          <div className="absolute right-0 bottom-0 top-0 w-32 opacity-15 bg-repeat bg-[radial-gradient(#FFF_1px,transparent_1px)]" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
            <div className="space-y-1.5 max-w-3xl text-left">
              <span className="text-[10px] bg-white/20 text-indigo-100 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                ✉️ Active Compliance Invitation Reminder
              </span>
              <h2 className="text-md font-extrabold tracking-tight mt-1">
                Review request submitted by the Certification & Compliance Team
              </h2>

              {profile.invitedSenderEmail && (
                <div className="bg-black/25 text-[10.5px] font-mono py-1 px-2.5 rounded-lg border border-white/10 flex flex-col sm:flex-row sm:gap-4 mt-1 text-indigo-100">
                  <div><span className="text-white font-bold">From (Sender):</span> {profile.invitedSenderEmail}</div>
                  <div><span className="text-white font-bold">To (Your Received Email):</span> {profile.invitedRecipientEmail}</div>
                </div>
              )}

              <p className="text-xs text-indigo-100 leading-relaxed font-semibold">
                "{profile.invitedMessage || 'Please review your active compliance checklist and complete missing details so we can finalize your profile registration.'}"
              </p>

              {profile.invitedItems && profile.invitedItems.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px]">
                  <span className="font-extrabold text-white uppercase tracking-wider text-[9px] mr-1">Target Items Highlighted:</span>
                  {profile.invitedItems.map(itId => {
                    const item = CHECKLIST_ITEMS.find(cli => cli.id === itId);
                    const sub = submissions.find(s => s.itemId === itId);
                    const isDone = sub?.status === 'approved';
                    
                    return (
                      <span key={itId} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold border ${
                        isDone 
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200' 
                          : 'bg-indigo-500/30 border-indigo-400 text-indigo-100'
                      }`}>
                        {item?.title || itId} {isDone ? '✓ Completed' : '• Pending'}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="shrink-0 text-left">
              <button
                type="button"
                onClick={() => {
                  // Find the first uncompleted highlighted item and focus on it
                  const firstPending = profile.invitedItems?.find(itId => {
                    const sub = submissions.find(s => s.itemId === itId);
                    return !sub || sub.status !== 'approved';
                  });
                  if (firstPending) {
                    setExpandedItem(firstPending);
                    setTimeout(() => {
                      const labelEl = document.getElementById(`item-card-${firstPending}`);
                      if (labelEl) labelEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 50);
                  } else {
                    const checklistBlock = document.getElementById('checklist-header');
                    if (checklistBlock) checklistBlock.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-4.5 py-2 bg-white hover:bg-slate-100 text-indigo-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Start Checklist Completion
              </button>
            </div>
          </div>
        </div>
      )}

      {editingProfile && (
        <form onSubmit={handleSaveProfile} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl shadow-inner space-y-4 animate-fadeIn">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <UserIcon className="w-4 h-4 text-slate-500" /> Modify Registration Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-550 mb-1">Full Name</label>
              <input 
                type="text" 
                value={profileName} 
                onChange={e => setProfileName(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-xl px-3 py-1.5 text-sm focus:outline-indigo-500 text-slate-800 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-550 mb-1">Contact Phone</label>
              <input 
                type="text" 
                value={profilePhone} 
                onChange={e => setProfilePhone(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-xl px-3 py-1.5 text-sm focus:outline-indigo-500 text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-550 mb-1">Language Pair</label>
              <input 
                type="text" 
                value={profileLang} 
                onChange={e => setProfileLang(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-xl px-3 py-1.5 text-sm focus:outline-indigo-500 text-slate-800 font-medium"
                placeholder="Russian ↔ English"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-550 mb-1">Country</label>
              <input 
                type="text" 
                value={profileCountry} 
                onChange={e => setProfileCountry(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-xl px-3 py-1.5 text-sm focus:outline-indigo-500 text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-550 mb-1">Time Zone</label>
              <input 
                type="text" 
                value={profileZone} 
                onChange={e => setProfileZone(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-xl px-3 py-1.5 text-sm focus:outline-indigo-500 text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-550 mb-1">Interpreter Specialist Type</label>
              <select 
                value={profileType} 
                onChange={e => setProfileType(e.target.value as any)}
                className="w-full bg-white border border-slate-250 rounded-xl px-3 py-1.5 text-xs focus:outline-indigo-500 text-slate-800 font-semibold"
              >
                <option value="medical">Medical Specialist</option>
                <option value="legal">Legal Specialist</option>
                <option value="community">Community / General</option>
                <option value="conference">Conference / Formal</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={() => setEditingProfile(false)}
              className="px-3.5 py-1.5 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-1.5 bg-orange-500 hover:bg-orange-650 text-xs font-bold text-white rounded-lg shadow-sm shadow-orange-100 transition-colors cursor-pointer"
            >
              Save Profile Updates
            </button>
          </div>
        </form>
      )}

      {profile.riskFlag && (
        <div className="bg-amber-50 border border-amber-250 p-4 rounded-2xl flex items-start gap-3 animate-fadeIn">
          <div className="p-1.5 bg-amber-550/15 rounded-lg text-amber-550">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 id="risk-warning-title" className="text-sm font-bold text-slate-900">Compliance Staff Review Comments & Warnings</h4>
            <p className="text-xs text-slate-650 mt-1 leading-relaxed">
              {profile.riskReason || 'Your profile has active action blocks. Please scroll down to check items marked under "Action Required" and upload upgraded documents.'}
            </p>
          </div>
        </div>
      )}

      {/* COMPLIANCE PROGRESS BAR */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div>
            <h2 id="overall-completion-heading" className="text-sm font-bold text-slate-500 uppercase tracking-widest font-display">Overall Compliance Completion</h2>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span id="overall-percentage" className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">{profile.completionRate}%</span>
              <span className="text-sm font-bold text-slate-450">Finished</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span id="requirements-fraction-count" className="text-sm font-semibold text-slate-755 font-display">
              {approvedCount} of {totalRequirements} Requirements Secured
            </span>
            <p className="text-xs text-slate-400 mt-1">Includes core items needed to initiate translation work.</p>
          </div>
        </div>

        {/* PROGRESS METER */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex ring-1 ring-slate-100">
          <div 
            id="compliance-progress-bar"
            style={{ width: `${profile.completionRate}%` }} 
            className="h-full bg-orange-500 transition-all duration-1000 ease-out rounded-full"
          />
        </div>

        {/* STATUS CARDS METRIC GRID */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
            <div id="metric-approved-count" className="text-xl font-black text-emerald-555 font-display">{approvedCount}</div>
            <div className="text-[10px] font-bold text-slate-450 uppercase mt-0.5">Approved</div>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
            <div id="metric-review-count" className="text-xl font-black text-orange-500 font-display">{reviewCount}</div>
            <div className="text-[10px] font-bold text-slate-450 uppercase mt-0.5">Pending Review</div>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
            <div id="metric-rejected-count" className="text-xl font-black text-rose-500 font-display">{rejectedCount}</div>
            <div className="text-[10px] font-bold text-slate-450 uppercase mt-0.5">Rejected</div>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
            <div id="metric-missing-count" className="text-xl font-black text-slate-400 font-display">{missingCount}</div>
            <div className="text-[10px] font-bold text-slate-450 uppercase mt-0.5">Missing</div>
          </div>
          <div className="bg-orange-50/40 p-3.5 rounded-xl border border-orange-100/50 text-center col-span-2 md:col-span-1">
            <div className="text-xs font-black text-orange-755 flex items-center justify-center gap-0.5 font-display">
              <Flame className="w-4 h-4 text-orange-555 fill-orange-500" /> HIPAA Ready
            </div>
            <div className="text-[9px] font-bold text-orange-555 uppercase mt-1">GDPR & HIPAA Safe</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHECKLISTS (COLUMN 1 & 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 id="checklist-header" className="font-bold text-slate-800 text-md font-display tracking-tight">Onboarding Requirements Checklist</h2>
            
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button 
                id="filter-all-btn"
                onClick={() => setActiveSection('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSection === 'all' 
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-100' 
                    : 'bg-slate-100 text-slate-650 hover:bg-slate-205 md:hover:bg-slate-200'
                }`}
              >
                All Sections
              </button>
              {Object.entries(sectionDetails).map(([key, details]) => {
                const IconComp = details.icon;
                return (
                  <button
                    key={key}
                    id={`filter-${key}-btn`}
                    onClick={() => setActiveSection(key as SectionType)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      activeSection === key 
                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-100' 
                        : 'bg-slate-100 text-slate-650 hover:bg-slate-205'
                    }`}
                  >
                    <IconComp className="w-3 h-3" />
                    <span>{details.title.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div id="checklist-flow-container" className="space-y-3">
            {CHECKLIST_ITEMS.filter(item => activeSection === 'all' || item.section === activeSection).map((item) => {
              const submission = submissions.find(s => s.itemId === item.id);
              const status = submission ? submission.status : 'empty';
              const isExpanded = expandedItem === item.id;
              const hasFile = submission && submission.fileName;
              
              const sectMeta = sectionDetails[item.section];
              const IconComponent = sectMeta.icon;
              const isHighlighted = profile.invitedToComplete && profile.invitedItems?.includes(item.id);

              return (
                <div 
                  key={item.id}
                  id={`item-card-${item.id}`}
                  className={`bg-white rounded-xl border transition-all duration-200 shadow-sm hover:ring-2 hover:ring-slate-100 overflow-hidden ${
                    isExpanded 
                      ? 'border-slate-300 ring-2 ring-slate-100' 
                      : isHighlighted 
                        ? 'border-indigo-400 ring-2 ring-indigo-500/20' 
                        : 'border-slate-200'
                  }`}
                >
                  <div 
                    id={`clickable-header-${item.id}`}
                    onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${sectMeta.bg} ${sectMeta.text}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{item.title}</h4>
                          {item.isCrucial && (
                            <span className="text-[9px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.2 rounded border border-amber-200">
                              Core
                            </span>
                          )}
                          {isHighlighted && (
                            <span className="text-[9px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.2 rounded animate-pulse shadow-sm">
                              ✉️ Requested
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-450 truncate max-w-[280px] sm:max-w-md">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {getStatusBadge(status)}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div id={`details-${item.id}`} className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4 animate-slideDown">
                      {/* Description & Rules */}
                      <div className="bg-white rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
                        <span className="font-bold text-slate-700">Onboarding Rules & Objectives:</span>
                        <p className="text-slate-600 leading-relaxed">{item.description}</p>
                        
                        <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1 border-t border-slate-100">
                          <span className="text-slate-450">Accepted Format Extensions:</span>
                          <div className="flex gap-1.5">
                            {item.requiredExtensions.map(ext => (
                              <span key={ext} className="bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-650 tracking-wider">
                                .{ext.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Training request panel for medical/legal certificates */}
                      {(item.id === 'medical_cert' || item.id === 'legal_cert') && (
                        <div className="bg-orange-50/50 border border-orange-200/50 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="font-bold text-orange-950 flex items-center gap-1">
                              <BookOpen className="w-4 h-4 text-orange-500" /> Let Vozara Assist with Certifications!
                            </div>
                            <p className="text-slate-650 mt-0.5 leading-normal max-w-lg">
                              Don't hold a 40-hour certificate yet? Tap request ticket. Compliance Reviewers will arrange enrollment in our complimentary Vozara Certification.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRequestTraining(item.id === 'medical_cert' ? 'medical' : 'legal')}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg shadow-sm shadow-orange-100 font-bold text-xs shrink-0 cursor-pointer text-center transition-all"
                          >
                            Generate Request Ticket
                          </button>
                        </div>
                      )}

                      {/* Third Party Resources or Links */}
                      {item.externalLinks && item.externalLinks.length > 0 && (
                        <div className="bg-white rounded-xl p-3 border border-slate-100 space-y-1.5">
                          <span className="text-xs font-bold text-slate-650 flex items-center gap-1">
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" /> Mandatory Course Resource:
                          </span>
                          <div className="flex flex-col gap-1.5 pl-4.5">
                            {item.externalLinks.map((lnk, i) => (
                              <a 
                                key={i} 
                                href={lnk.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-xs text-orange-600 hover:underline font-semibold flex items-center gap-1"
                              >
                                {lnk.label} <ExternalLink className="w-3 h-3" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display active file version details and reviewer response */}
                      {hasFile && (
                        <div className="bg-slate-100 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase text-slate-450 tracking-wider">Active Submission:</span>
                              <div className="font-semibold text-slate-800 truncate font-mono mt-0.5">{submission.fileName}</div>
                              <div className="text-[10px] text-slate-455 mt-0.5">Size: {submission.fileSize} | Upload Date: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'Pending'}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenPreview(submission, item)}
                                className="p-1 px-2.5 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors border border-orange-100 flex items-center gap-1 font-bold text-xs cursor-pointer shadow-sm shadow-orange-50"
                              >
                                <Eye className="w-3.5 h-3.5" /> Document Preview
                              </button>
                              <button
                                id={`delete-btn-${submission.id}`}
                                onClick={() => onDeleteDocument(submission.id)}
                                className="p-1 px-2.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors border border-rose-100 flex items-center gap-1 font-bold text-xs cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            </div>
                          </div>

                          {submission.reviewerNotes && (
                            <div className="bg-white/80 rounded-lg p-2.5 border border-slate-205">
                              <div className="font-bold text-slate-705 flex items-center gap-1">
                                <FileCheck className="w-3.5 h-3.5 text-slate-500" /> Reviewer Decision Feedback Log:
                              </div>
                              <p className="text-slate-600 italic mt-0.5 select-text">"{submission.reviewerNotes}"</p>
                              {submission.reviewedAt && (
                                <div className="text-[9px] text-slate-400 mt-1">Logged timestamp: {new Date(submission.reviewedAt).toLocaleString()}</div>
                              )}
                            </div>
                          )}




                          {/* File Version History */}
                          {submission.versions && submission.versions.length > 1 && (
                            <div className="pt-2 border-t border-slate-200">
                              <div className="text-[10px] font-bold text-slate-450 uppercase flex items-center gap-1">
                                <History className="w-3 h-3" /> Historical Version Auditing ({submission.versions.length})
                              </div>
                              <div className="mt-1 space-y-1.5 pl-3">
                                {submission.versions.map((ver, i) => (
                                  <div key={ver.id} className="flex items-center justify-between text-[11px] text-slate-600 hover:text-slate-900 border-l border-slate-300 pl-2">
                                    <span className="truncate max-w-[200px] font-mono">{ver.fileName} ({ver.fileSize})</span>
                                    <span className="shrink-0 text-slate-450 text-[10px]">{new Date(ver.uploadedAt).toLocaleDateString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Upload Interaction Zone */}
                      {(!hasFile || status === 'rejected') && (
                        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                          <div 
                            onDragEnter={(e) => handleDrag(e, item.id, true)}
                            onDragOver={(e) => handleDrag(e, item.id, true)}
                            onDragLeave={(e) => handleDrag(e, item.id, false)}
                            onDrop={(e) => handleDrop(e, item.id)}
                            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                              dragActive[item.id] 
                                ? 'border-indigo-550 bg-indigo-50/40 ring-4 ring-indigo-50' 
                                : 'border-slate-250 bg-slate-50/50 hover:bg-slate-50'
                            }`}
                          >
                             <input 
                              type="file" 
                              id={`file-input-${item.id}`}
                              className="hidden" 
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const f = e.target.files[0];
                                  const url = URL.createObjectURL(f);
                                  setCustomFiles(prev => ({
                                    ...prev,
                                    [item.id]: { 
                                      name: f.name, 
                                      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                                      fileUrl: url
                                    }
                                  }));
                                }
                              }}
                            />
                            
                            <div className="max-w-xs mx-auto space-y-1">
                              <div className="mx-auto w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-650">
                                <Upload className="w-5 h-5" />
                              </div>
                              <label 
                                htmlFor={`file-input-${item.id}`}
                                className="block text-xs font-bold text-slate-800 hover:text-indigo-605 cursor-pointer"
                              >
                                Drag & Drop here, or <span className="text-indigo-600 underline">Browse Local Files</span>
                              </label>
                              <p className="text-[10px] text-slate-450 font-medium">Accept PDF, DOC, Images up to 25 MB</p>
                            </div>
                          </div>

                          {customFiles[item.id] && (
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-150 flex items-center justify-between gap-3 text-xs">
                              <div className="truncate shrink">
                                <span className="text-[9px] uppercase font-bold text-slate-400">Chosen File:</span>
                                <div className="font-semibold text-slate-800 truncate font-mono mt-0.5">{customFiles[item.id].name}</div>
                                <div className="text-[10px] text-slate-450 mt-0.5">Estimated size: {customFiles[item.id].size}</div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setCustomFiles(prev => {
                                    const copy = { ...prev };
                                    delete copy[item.id];
                                    return copy;
                                  })}
                                  className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-205 px-2 py-1 rounded"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => triggerSimUpload(item.id)}
                                  className="text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded"
                                >
                                  Submit File
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* WORKSTATION UTILITY PANELS (COLUMN 3) */}
        <div className="space-y-6">
          {/* SPEED TEST GAUGE MODULE */}
          <div className="bg-white rounded-2xl p-5 border border-slate-201 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-850 text-sm flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-sky-505" /> Workstation Speed Evaluator
              </h3>
              <p className="text-xs text-slate-450 mt-0.5">Test real connection specs to verify compliance rules (20 Mbps down / 10 Mbps up).</p>
            </div>

            {/* Test Animation */}
            {isTestingSpeed ? (
              <div className="relative py-6 flex flex-col items-center justify-center space-y-2">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-sky-500 animate-spin border-t-transparent" />
                  <span className="font-mono text-xs font-black text-sky-550 animate-pulse">{speedProgress}%</span>
                </div>
                <div className="text-center font-mono text-[10px] text-slate-550 bg-slate-50 px-2 py-0.5 rounded border border-slate-150 tracking-widest uppercase">
                  Simulating packet flows...
                </div>
              </div>
            ) : downloadSpeed !== null && uploadSpeed !== null ? (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-3 animate-fadeIn">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white rounded-lg p-2.5 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Download</span>
                    <span id="speedtest-down-val" className={`font-mono text-lg font-black ${
                      downloadSpeed >= 20 ? 'text-emerald-555' : 'text-rose-500'
                    }`}>{downloadSpeed} <span className="text-[10px] font-medium text-slate-400">Mbps</span></span>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Upload</span>
                    <span id="speedtest-up-val" className={`font-mono text-lg font-black ${
                      uploadSpeed >= 10 ? 'text-emerald-555' : 'text-rose-500'
                    }`}>{uploadSpeed} <span className="text-[10px] font-medium text-slate-400">Mbps</span></span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] px-1 font-mono">
                  <span className="text-slate-450">Latency: {pingSpeed}ms</span>
                  {downloadSpeed >= 20 && uploadSpeed >= 10 ? (
                    <span id="speedtest-pass-badge" className="text-emerald-555 font-extrabold flex items-center gap-0.5 bg-emerald-55 bg-emerald-50 px-2 py-0.5 rounded">🟢 MET REQUIREMENTS</span>
                  ) : (
                    <span id="speedtest-fail-badge" className="text-rose-505 font-extrabold flex items-center gap-0.5 bg-rose-50 px-2 py-0.5 rounded">🔴 BELOW MINIMUMS</span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/50 flex gap-2">
                  <button
                    type="button"
                    onClick={copySpeedResults}
                    className="flex-1 py-1 px-2.5 bg-white border border-slate-200 text-[10px] font-bold text-slate-655 hover:bg-slate-100 rounded-lg text-center cursor-pointer"
                  >
                    {copiedSpeed ? 'Copied Stats!' : 'Copy Stats'}
                  </button>
                  <button
                    type="button"
                    onClick={runSpeedTest}
                    className="flex-1 py-1 px-2.5 bg-sky-50 hover:bg-sky-100 text-[10px] font-bold text-sky-700 rounded-lg text-center cursor-pointer"
                  >
                    Test Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 text-center space-y-3.5">
                <div className="mx-auto w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-450">
                  <Wifi className="w-5 h-5 text-slate-500" />
                </div>
                <div className="max-w-[200px] mx-auto">
                  <p className="text-xs text-slate-700 font-semibold leading-normal">Simulate Workstation Speeds Local Adapter</p>
                  <p className="text-[10px] text-slate-450 mt-0.5">Runs instantaneous signal probe metrics to verify interface bandwidth directly.</p>
                </div>
                <button
                  type="button"
                  id="run-speedtest-btn"
                  onClick={runSpeedTest}
                  className="w-full bg-slate-900 text-white font-bold py-1.5 rounded-lg text-xs hover:bg-slate-800 cursor-pointer"
                >
                  "Run Local Speed Test"
                </button>
              </div>
            )}
          </div>

          {/* ACTIVE ASSISTANCE TRAINING TICKETS */}
          <div className="bg-white rounded-2xl p-5 border border-slate-201 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-850 text-sm flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-violet-505" /> training & Certification requests
              </h3>
              <p className="text-xs text-slate-450 mt-0.5">Monitor tickets requesting access to Vozara-supported interpreter training.</p>
            </div>

            {trainingRequests.length === 0 ? (
              <div className="border border-dashed border-slate-205 rounded-xl p-4 text-center text-xs text-slate-450">
                No active tickets. If you need a 40-hr Medical/Legal certification, click "Generate Request Ticket" inside those checklist requirements items.
              </div>
            ) : (
              <div className="space-y-2.5">
                {trainingRequests.map((req) => (
                  <div key={req.id} id={`training-ticket-${req.id}`} className="bg-slate-50 rounded-xl p-3 border border-slate-150 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="capitalize text-slate-800 font-mono">{req.trainingType} Certification Program</span>
                      {req.status === 'pending' && (
                        <span className="bg-amber-50 text-amber-70s hover:bg-amber-100 border border-amber-200 rounded px-1.5 py-0.2 text-[9px] font-bold">
                          Pending Setup
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="bg-emerald-55 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded px-1.5 py-0.2 text-[9px] font-bold">
                          Seat Arranged
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 mt-1 text-[10px]">Requested timestamp: {new Date(req.requestedAt).toLocaleDateString()}</p>
                    <div className="mt-2 text-[11px] leading-relaxed text-slate-650 bg-white p-2 rounded border border-slate-100">
                      {req.status === 'pending' 
                        ? 'Compliance review staff will soon email you details and enroll you in the 40-hour tuition program.'
                        : 'Congrats! You have been sponsored access. Head to your register email inbox to execute credentials.'
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SUPPORT AND ESCALATION CARDS */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-5 text-white space-y-4 shadow">
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase text-indigo-300 tracking-wider">Onboarding Support Center</h4>
              <h3 className="font-bold text-sm">Need help submitting credentials?</h3>
              <p className="text-xs text-indigo-150 leading-relaxed">
                Connect with our dedicated medical and legal compliance officers for quick guidance:
              </p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-indigo-200">Review Hotline:</span>
                <span className="font-mono text-[11px] font-semibold text-white">+1 (800) 555-LS-HELP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-200">Support Chat mail:</span>
                <span className="font-mono text-[11px] font-semibold text-white">onboarding@vozarals.com</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/20 text-xs flex items-start gap-2 text-indigo-100">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-normal">
                Approved documents remain persistent on file for 12 months. Certificate validation rules are HIPAA-approved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Overlay Component */}
      <DocumentPreviewOverlay 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        submission={selectedSubForPreview}
        checklistItem={selectedItemForPreview}
        submitterName={currentUser.name}
      />
    </div>
  );
};
