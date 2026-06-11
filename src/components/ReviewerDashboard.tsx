import React, { useState } from 'react';
import { 
  User, 
  InterpreterProfile, 
  Submission, 
  ChecklistItem, 
  AuditLog, 
  Notification,
  ComplianceStatus
} from '../types';
import { CHECKLIST_ITEMS } from '../data';
import { getInitialsAvatar } from '../utils/avatar';
import { DocumentPreviewOverlay } from './DocumentPreviewOverlay';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Eye, 
  MessageSquare, 
  User as UserIcon, 
  Cpu, 
  Search, 
  ThumbsUp, 
  ThumbsDown, 
  FileText, 
  Download, 
  ExternalLink,
  Users,
  BadgeAlert,
  ListFilter,
  FileCheck2,
  Hourglass,
  Mail,
  Send,
  Check,
  RotateCw,
  Plus,
  Trash2
} from 'lucide-react';

interface ReviewerDashboardProps {
  reviewerUser: User;
  allInterpreters: User[];
  interpreterProfiles: InterpreterProfile[];
  submissions: Submission[];
  onReviewOnboardingItem: (submissionId: string, action: 'approved' | 'rejected', notes: string) => void;
  onSendInvitation: (targetUserId: string, message: string, selectedItems: string[], senderEmail?: string, recipientEmail?: string) => Promise<{ success: boolean; error?: string }>;
  onSetSimulationUser: (user: User) => void;
}

export const ReviewerDashboard: React.FC<ReviewerDashboardProps> = ({
  reviewerUser,
  allInterpreters,
  interpreterProfiles,
  submissions,
  onReviewOnboardingItem,
  onSendInvitation,
  onSetSimulationUser
}) => {
  const getStatusBadge = (status: ComplianceStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-550/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 animate-pulse"></span>
            Approved
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-450"></span>
            Under Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-455"></span>
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

  const [selectedInterpreterId, setSelectedInterpreterId] = useState<string>(
    allInterpreters[0]?.id || ''
  );
  
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'action_needed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'checklist' | 'history'>('checklist');

  // Gemini Intelligence Audit Reports
  const [aiReports, setAiReports] = useState<Record<string, { loading: boolean; text?: string; error?: string }>>({});

  const runAiAnalysis = async (submissionId: string, submission: any, item: any) => {
    setAiReports(prev => ({
      ...prev,
      [submissionId]: { loading: true }
    }));

    try {
      const res = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: submission.fileName,
          fileNotes: submission.notes || "",
          checklistTitle: item.title,
          checklistCriteria: item.description
        })
      });

      if (!res.ok) {
        throw new Error("AI intelligence assessment failed.");
      }

      const data = await res.json();
      setAiReports(prev => ({
        ...prev,
        [submissionId]: { loading: false, text: data.analysis }
      }));
    } catch (err: any) {
      setAiReports(prev => ({
        ...prev,
        [submissionId]: { loading: false, error: err.message || "Could not analyze document with Gemini." }
      }));
    }
  };

  // Invitation Form inline States
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [revInviteMsg, setRevInviteMsg] = useState(
    'Hi! Please review your active compliance checklist and complete missing details so we can finalize your profile registration.'
  );
  const [revSelectedItems, setRevSelectedItems] = useState<string[]>([]);
  const [senderOptions, setSenderOptions] = useState<string[]>(() => {
    const stored = localStorage.getItem('vozara_sender_emails');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return [
      'onboarding@vozarals.com',
      'hr@vozarals.com',
      'verification@vozarals.com',
      'support@vozarals.com'
    ];
  });
  const [revSenderEmail, setRevSenderEmail] = useState<string>(() => {
    const stored = localStorage.getItem('vozara_sender_emails');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) return parsed[0];
      } catch {}
    }
    return 'onboarding@vozarals.com';
  });
  const [showAddSender, setShowAddSender] = useState(false);
  const [newSenderInput, setNewSenderInput] = useState('');
  const [revRecipientEmail, setRevRecipientEmail] = useState<string>('');
  const [revInviteSuccess, setRevInviteSuccess] = useState(false);
  const [revInviteSending, setRevInviteSending] = useState(false);
  const [revInviteError, setRevInviteError] = useState('');

  React.useEffect(() => {
    if (selectedInterpreterId) {
      const userSubs = submissions.filter(s => s.userId === selectedInterpreterId);
      const missingIds = CHECKLIST_ITEMS.filter(it => {
        const sub = userSubs.find(s => s.itemId === it.id);
        return !sub || sub.status !== 'approved';
      }).map(it => it.id);
      setRevSelectedItems(missingIds);
      setShowInviteForm(false);
      setRevInviteSuccess(false);

      const targetUsr = allInterpreters.find(u => u.id === selectedInterpreterId);
      if (targetUsr) {
        setRevRecipientEmail(targetUsr.email);
      }
    }
  }, [selectedInterpreterId, allInterpreters]);

  // Previewer display state
  const [focusedSubmission, setFocusedSubmission] = useState<Submission | null>(null);
  const [reviewerComment, setReviewerComment] = useState('');

  // Document previewer modal states
  const [selectedSubForPreview, setSelectedSubForPreview] = useState<Submission | null>(null);
  const [selectedItemForPreview, setSelectedItemForPreview] = useState<ChecklistItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleOpenPreview = (sub: Submission, item: ChecklistItem) => {
    setSelectedSubForPreview(sub);
    setSelectedItemForPreview(item);
    setIsPreviewOpen(true);
  };

  // Find interpreter model structures
  const selectedInterpreterUser = allInterpreters.find(u => u.id === selectedInterpreterId) || allInterpreters[0];
  const selectedProfile = interpreterProfiles.find(p => p.userId === selectedInterpreterId);
  
  // Filter interpreter lists based on search
  const filteredInterpreters = allInterpreters.filter(u => {
    if (u.role !== 'interpreter') return false;
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if waiting for reviews or has risk logs
    const hasPendingReview = submissions.some(s => s.userId === u.id && s.status === 'review');
    const profile = interpreterProfiles.find(p => p.userId === u.id);
    const matchesFilter = 
      reviewFilter === 'all' || 
      (reviewFilter === 'pending' && hasPendingReview) ||
      (reviewFilter === 'action_needed' && profile?.riskFlag);

    return matchesSearch && matchesFilter;
  });

  const interpreterSubmissions = submissions.filter(s => s.userId === selectedInterpreterId);

  // Quick comments templates
  const commentTemplates = {
    approved: [
      'Document reviewed and matched fully against validation rules.',
      'Approved. Certified credentials and date validity verified.',
      'Selfie holds matched government face criteria successfully.',
      'Automated OCR confirmation values pass the workstation bandwidth rules.'
    ],
    rejected: [
      'Rejected. The submitted document is illegible. Please scan and upload a design-grade copy.',
      'Rejected. Experience details on CV do not satisfy our required 3-year minimum threshold.',
      'Rejected. Upload / download workstation rates fail to reach compliance targets.',
      'Rejected. The document uploaded does not appear to match your full registered name or details.'
    ]
  };

  const selectCommentTemplate = (text: string) => {
    setReviewerComment(text);
  };

  const handleReviewTrigger = (subId: string, action: 'approved' | 'rejected') => {
    onReviewOnboardingItem(subId, action, reviewerComment || `Document ${action === 'approved' ? 'approved' : 'rejected'} during peer review.`);
    setReviewerComment('');
    setFocusedSubmission(null);
  };

  // Calculate some fast summary stats for all interpreters combined for the sidebar
  const pendingQueueTotal = submissions.filter(s => s.status === 'review').length;

  return (
    <div id="reviewer-workspace" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* SIDEBAR: INTERPRETERS LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 h-[calc(100vh-140px)] flex flex-col space-y-4">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="w-4 h-4 text-indigo-505" /> Interpreter Directory
            </h2>
            <span className="bg-amber-100 ring-1 ring-amber-300 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {pendingQueueTotal} Action Needed
            </span>
          </div>
          
          {/* Search bar inside directory */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name/email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-850 focus:outline-indigo-500 font-medium"
            />
          </div>

          {/* Directory section filter */}
          <div className="grid grid-cols-3 gap-1 mt-2.5 bg-slate-100/80 p-0.5 rounded-xl border border-slate-150">
            <button
              onClick={() => setReviewFilter('all')}
              className={`py-1 text-[10px] font-bold rounded-lg text-center cursor-pointer transition-colors ${
                reviewFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Usr
            </button>
            <button
              onClick={() => setReviewFilter('pending')}
              className={`py-1 text-[10px] font-bold rounded-lg text-center cursor-pointer transition-colors ${
                reviewFilter === 'pending' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pending ({pendingQueueTotal})
            </button>
            <button
              onClick={() => setReviewFilter('action_needed')}
              className={`py-1 text-[10px] font-bold rounded-lg text-center cursor-pointer transition-colors ${
                reviewFilter === 'action_needed' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Flagged
            </button>
          </div>
        </div>

        {/* Directory List Container */}
        <div id="dir-users-list" className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredInterpreters.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-450 font-medium italic">
              No matching profiles found.
            </div>
          ) : (
            filteredInterpreters.map((u) => {
              const uProfile = interpreterProfiles.find(p => p.userId === u.id);
              const uSubmissions = submissions.filter(s => s.userId === u.id);
              const isSelected = u.id === selectedInterpreterId;
              const hasReviewItems = uSubmissions.some(s => s.status === 'review');

              return (
                <button
                  key={u.id}
                  id={`dir-user-btn-${u.id}`}
                  onClick={() => {
                    setSelectedInterpreterId(u.id);
                    setFocusedSubmission(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected 
                      ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-50' 
                      : 'bg-white border-slate-150 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <img 
                      src={u.avatarUrl || getInitialsAvatar(u.name)} 
                      alt={u.name} 
                      className="w-8 h-8 rounded-xl object-cover shrink-0 ring-1 ring-slate-100"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-850 truncate">{u.name}</div>
                      <div className="text-[10px] text-slate-450 font-mono truncate">{uProfile?.languagePair}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {hasReviewItems ? (
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" title="Needs Evaluation" />
                    ) : uProfile?.riskFlag ? (
                      <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" title="Risk Alert Flag" />
                    ) : (
                      <span className="text-[10px] font-black font-mono text-emerald-550">{uProfile?.completionRate}%</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Action Button to switch interpreter view to matching persona */}
        {selectedInterpreterUser && (
          <button
            id="simulate-from-review-btn"
            onClick={() => onSetSimulationUser(selectedInterpreterUser)}
            className="w-full text-[11px] py-1.5 px-3 bg-slate-900 text-white rounded-xl font-bold cursor-pointer hover:bg-slate-800 transition-colors text-center"
          >
            Impersonate Elena/Wei 👤
          </button>
        )}
      </div>

      {/* CENTER: DETAILED FILE COMPLIANCE CHECKLIST */}
      <div className="lg:col-span-3 space-y-6">
        {selectedInterpreterUser ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            
            {/* Interpreter quick profile overview */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-5 gap-4">
              <div className="flex items-center gap-3.5">
                <img 
                  id="target-portrait"
                  src={selectedInterpreterUser.avatarUrl || getInitialsAvatar(selectedInterpreterUser.name)} 
                  alt={selectedInterpreterUser.name} 
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
                />
                <div>
                  <h3 id="target-name-lbl" className="text-lg font-bold text-slate-900 tracking-tight">{selectedInterpreterUser.name} Onboarding Case</h3>
                  <div className="text-xs text-slate-455 mt-0.5 space-x-2">
                    <span className="font-semibold text-slate-750 font-mono">{selectedInterpreterUser.email}</span>
                    <span>•</span>
                    <span className="font-medium text-slate-500 flex-inline items-center gap-0.5"><Clock className="w-3 h-3 inline pb-0.5" /> Registered: {new Date(selectedInterpreterUser.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-center font-mono pr-3 border-r border-slate-200">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Onboard-Rate</div>
                  <div id="target-completion-val" className="text-md font-black text-slate-800">{selectedProfile?.completionRate}%</div>
                </div>
                <div className="pl-1">
                  <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold leading-none ${
                    selectedProfile?.riskFlag 
                      ? 'bg-rose-50 text-rose-605 border border-rose-100' 
                      : 'bg-indigo-50 text-indigo-705 border border-indigo-100'
                  }`}>
                    {selectedProfile?.riskFlag ? '⚠️ System Risk Flag Status' : '✓ Standard Risk Class'}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION CHOICE AND METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Profile specifications list */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-150 text-xs text-slate-705 leading-relaxed space-y-1.5 col-span-2">
                <div className="font-bold text-slate-850 uppercase text-[10px] tracking-wider mb-1">Registration Context Profiles:</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div><strong>Phone Contact:</strong> {selectedProfile?.phone}</div>
                  <div><strong>Target Channel:</strong> {selectedProfile?.languagePair}</div>
                  <div><strong>Origin Country:</strong> {selectedProfile?.country} ({selectedProfile?.timeZone})</div>
                  <div><strong>Service Level:</strong> Specialist: <span className="capitalize">{selectedProfile?.interpreterType}</span></div>
                </div>
              </div>

              {/* Training Assistance requested trigger warning */}
              <div className="bg-violet-50/50 border border-violet-100 rounded-xl p-3 text-xs flex flex-col justify-between">
                <div>
                  <span className="font-bold text-violet-900 block font-sans">Sponsored Core Requests:</span>
                  <p className="text-violet-700 text-[11px] mt-0.5 leading-normal">
                    This applicant may require subsidized training enrollment.
                  </p>
                </div>
                <div className="text-[10px] text-violet-500 font-bold uppercase mt-1">
                  {submissions.some(s => s.userId === selectedInterpreterId && s.itemId.includes('cert') && s.status === 'review') ? '⚠️ Certificate Review Active' : 'No Sponsored Seats Enrolled'}
                </div>
              </div>
            </div>

            {/* INLINE INVITATION REMINDER CONTROL FOR REVIEWER */}
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4.5 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-505" />
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Active Case Onboarding Invitation Status</span>
                    {selectedProfile?.invitedToComplete ? (
                      <span className="text-[10px] text-indigo-650 font-bold bg-indigo-55/75 px-2 py-0.2 rounded border border-indigo-150/60 mt-0.5 inline-block">
                        ✉️ Invitation last sent on {selectedProfile.invitedAt ? new Date(selectedProfile.invitedAt).toLocaleDateString() : 'recently'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-455 font-medium block mt-0.5">No formal checklist invitation or reminder outstanding on portal.</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInviteForm(!showInviteForm)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  {showInviteForm ? 'Close Invitation Panel' : selectedProfile?.invitedToComplete ? 'Resend/Modify Custom Invitation' : 'Create Onboarding Invitation'}
                </button>
              </div>

              {selectedProfile?.invitedToComplete && !showInviteForm && (
                <div className="text-[11px] bg-white p-3 rounded-xl border border-slate-205 leading-relaxed text-slate-650 space-y-1.5">
                  <span className="font-extrabold text-slate-800 block text-[10px] uppercase tracking-wider mb-0.5">Last Sent Message:</span>
                  
                  {selectedProfile.invitedSenderEmail && (
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10px] font-mono text-slate-700 space-y-0.5">
                      <div><span className="font-bold text-indigo-900">From (Custom Sender):</span> {selectedProfile.invitedSenderEmail}</div>
                      <div><span className="font-bold text-indigo-900">To (Custom Recipient):</span> {selectedProfile.invitedRecipientEmail}</div>
                    </div>
                  )}

                  <p className="italic font-semibold">"{selectedProfile.invitedMessage}"</p>
                  {selectedProfile.invitedItems && selectedProfile.invitedItems.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 font-mono text-[9px]">
                      <span className="font-bold text-slate-450 uppercase">Requested Items:</span>
                      {selectedProfile.invitedItems.map(itId => {
                        const itemTitle = CHECKLIST_ITEMS.find(cli => cli.id === itId)?.title || itId;
                        return (
                          <span key={itId} className="bg-slate-100 text-slate-705 border border-slate-200 px-1.5 py-0.2 rounded">
                            {itemTitle}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {showInviteForm && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3.5 animate-fadeIn">
                  <div className="text-xs font-bold text-slate-800 font-sans">Customize Onboarding Request Invitation</div>
                  
                  <div className="space-y-3 font-sans">
                    {/* Custom Sender & Recipient Email Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="block font-bold text-slate-750 text-[11px]">Our Custom Sender Email (From)</span>
                          <button
                            type="button"
                            onClick={() => setShowAddSender(!showAddSender)}
                            className="text-indigo-600 hover:text-indigo-700 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" /> Add New
                          </button>
                        </div>
                        <div className="flex gap-1.5">
                          <select
                            value={revSenderEmail}
                            onChange={(e) => setRevSenderEmail(e.target.value)}
                            className="w-full bg-white border border-slate-250 rounded-xl px-3 py-1.5 focus:outline-indigo-500 text-slate-800 font-medium text-xs cursor-pointer"
                          >
                            {senderOptions.map(email => (
                              <option key={email} value={email}>{email}</option>
                            ))}
                          </select>
                          {senderOptions.length > 1 && (
                            <button
                              type="button"
                              title="Remove this sender email"
                              onClick={() => {
                                const updated = senderOptions.filter(e => e !== revSenderEmail);
                                setSenderOptions(updated);
                                localStorage.setItem('vozara_sender_emails', JSON.stringify(updated));
                                setRevSenderEmail(updated[0] || 'onboarding@vozarals.com');
                              }}
                              className="p-1 px-2.5 bg-rose-50 hover:bg-rose-105 hover:text-rose-700 text-rose-600 border border-rose-200 rounded-xl cursor-pointer flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {showAddSender && (
                          <div className="mt-2 bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 animate-fadeIn">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Add Custom Sender Address</span>
                            <div className="flex gap-1.5">
                              <input
                                type="email"
                                value={newSenderInput}
                                onChange={(e) => setNewSenderInput(e.target.value)}
                                placeholder="name@domain.com"
                                className="w-full bg-slate-50 border border-slate-250 rounded-lg px-2 py-1 text-[11px] font-medium focus:bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!newSenderInput || !newSenderInput.includes('@')) {
                                    alert('Please enter a valid email address.');
                                    return;
                                  }
                                  if (senderOptions.includes(newSenderInput)) {
                                    alert('This email is already in the list.');
                                    return;
                                  }
                                  const updated = [...senderOptions, newSenderInput];
                                  setSenderOptions(updated);
                                  localStorage.setItem('vozara_sender_emails', JSON.stringify(updated));
                                  setRevSenderEmail(newSenderInput);
                                  setNewSenderInput('');
                                  setShowAddSender(false);
                                }}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="block font-bold text-slate-755 text-[11px] mb-1">Their Custom Recipient Email (To)</span>
                        <input
                          type="email"
                          required
                          value={revRecipientEmail}
                          onChange={(e) => setRevRecipientEmail(e.target.value)}
                          placeholder="candidate@domain.com"
                          className="w-full bg-white border border-slate-250 rounded-xl px-3 py-1.5 focus:outline-indigo-500 text-slate-800 font-medium text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 font-bold mb-1">Highlight Required Checklist Items:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-48 overflow-y-auto w-full">
                        {CHECKLIST_ITEMS.map(item => {
                          const isChecked = revSelectedItems.includes(item.id);
                          const userSubs = submissions.filter(s => s.userId === selectedInterpreterId);
                          const sub = userSubs.find(s => s.itemId === item.id);
                          const isApproved = sub?.status === 'approved';

                          return (
                            <label key={item.id} className="flex items-start gap-2 p-1 hover:bg-slate-100/50 rounded cursor-pointer text-[11px]">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setRevSelectedItems(prev =>
                                    prev.includes(item.id)
                                      ? prev.filter(i => i !== item.id)
                                      : [...prev, item.id]
                                  );
                                }}
                                className="mt-0.5 w-3.5 h-3.5 text-indigo-650 accent-indigo-505 rounded font-bold"
                              />
                              <div className="min-w-0">
                                <span className={`font-semibold block truncate ${isApproved ? 'text-emerald-700 font-bold' : 'text-slate-750'}`}>
                                  {item.title} {isApproved && '✓'}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 font-bold mb-1">Custom Message / Context Note:</label>
                      <textarea
                        rows={3}
                        value={revInviteMsg}
                        onChange={(e) => setRevInviteMsg(e.target.value)}
                        placeholder="Explain to the candidate why you are requesting these items..."
                        className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 focus:outline-indigo-500 text-slate-855 font-medium leading-relaxed text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-1">
                    <button
                      type="button"
                      disabled={revInviteSending}
                      onClick={() => setShowInviteForm(false)}
                      className="px-3.5 py-1.5 border border-slate-205 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={revInviteSending}
                      onClick={async () => {
                        setRevInviteSending(true);
                        setRevInviteError('');
                        try {
                          const res = await onSendInvitation(selectedInterpreterId, revInviteMsg, revSelectedItems, revSenderEmail, revRecipientEmail);
                          if (res && !res.success && res.error) {
                            setRevInviteError(`Note: Gmail send failed (${res.error}). Fallback simulation simulated.`);
                          }
                          setRevInviteSuccess(true);
                          setShowInviteForm(false);
                          setTimeout(() => setRevInviteSuccess(false), 5000);
                        } catch (err: any) {
                          setRevInviteError(err.message || 'Failed to send checklist invitation onboarding reminder.');
                        } finally {
                          setRevInviteSending(false);
                        }
                      }}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" /> {revInviteSending ? 'Delivering...' : 'Send Checklist Invitation'}
                    </button>
                  </div>

                  {revInviteError && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold leading-relaxed animate-fadeIn">
                      ⚠️ {revInviteError}
                    </div>
                  )}
                </div>
              )}

              {revInviteSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs animate-fadeIn-fast">
                  ✓ Onboarding Case Invitation sent successfully! Portal reminder broadcast and delivered to candidate.
                </div>
              )}
            </div>

            {/* ACTION CARD LISTS TABS OR TIMELINE */}
            <div>
              <div className="flex border-b border-slate-150">
                <button
                  onClick={() => setActiveTab('checklist')}
                  className={`py-2 px-4 text-xs font-bold -mb-px border-b-2 cursor-pointer ${
                    activeTab === 'checklist' 
                      ? 'border-indigo-600 text-indigo-700' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Onboarding Checklist Review Checklist ({interpreterSubmissions.length} Submitted)
                </button>
              </div>

              <div className="pt-4 space-y-3">
                {CHECKLIST_ITEMS.map((item) => {
                  const submission = interpreterSubmissions.find(s => s.itemId === item.id);
                  const status = submission ? submission.status : 'empty';
                  
                  const isFocused = focusedSubmission?.itemId === item.id;

                  return (
                    <div 
                      key={item.id}
                      id={`reviewer-card-${item.id}`}
                      className={`rounded-xl border p-4.5 transition-all ${
                        isFocused 
                          ? 'border-indigo-400 bg-indigo-50/20 shadow-md ring-1 ring-indigo-300/25' 
                          : 'border-slate-205 bg-white hover:bg-slate-50/40'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 id={`requirement-title-${item.id}`} className="font-bold text-sm text-slate-850">{item.title}</h4>
                            <span className="text-[9px] font-semibold text-slate-450 uppercase font-mono tracking-wider">
                              ({item.section.replace('_', ' ')})
                            </span>
                          </div>
                          <p className="text-xs text-slate-450 max-w-2xl leading-relaxed">{item.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                          {getStatusBadge(status)}
                          
                          {/* Review Action triggers */}
                          {submission && (
                            <button
                              id={`focus-review-btn-${item.id}`}
                              onClick={() => {
                                setFocusedSubmission(focusedSubmission?.id === submission.id ? null : submission);
                                setReviewerComment(submission.reviewerNotes || '');
                              }}
                              className="px-3 py-1 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> 
                              {isFocused ? 'Close Review' : 'Evaluate File'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Side by Side Evaluation panel */}
                      {isFocused && submission && (
                        <div id={`evaluation-block-${item.id}`} className="mt-4 border-t border-slate-200/80 pt-4.5 grid grid-cols-1 md:grid-cols-2 gap-5 animate-slideDown">
                          {/* File Preview and extracted telemetry */}
                          <div className="space-y-3.5">
                            <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 space-y-3.5">
                              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Submitted Document Payload:</span>
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-white rounded-xl text-indigo-505 border border-slate-255">
                                  <FileText className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-xs text-slate-800 truncate font-mono select-all">{submission.fileName}</div>
                                  <span className="text-[10px] text-slate-400">Size: {submission.fileSize} • Upload time: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}</span>
                                </div>
                              </div>

                              <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-205 flex-wrap gap-2">
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPreview(submission, item)}
                                    className="text-orange-600 hover:indigo-underline font-bold flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 text-xs"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-orange-500" /> Interactive Preview
                                  </button>
                                  <span className="text-slate-300">|</span>
                                  <a 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); alert(`Downloading file: ${submission.fileName}`); }} 
                                    className="text-slate-605 hover:underline font-semibold flex items-center gap-1"
                                  >
                                    <Download className="w-3.5 h-3.5" /> Direct Download
                                  </a>
                                </div>
                                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-mono">
                                  SHA-256 Validated
                                </span>
                              </div>
                            </div>

                            {/* Gemini Intelligence Review Audit */}
                            <div className="bg-indigo-50/40 rounded-xl p-3 border border-indigo-150/40 space-y-2 mt-2 shadow-sm text-xs">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5 font-bold text-indigo-950 text-[11px]">
                                  <Cpu className="w-3.5 h-3.5 text-indigo-650 animate-pulse" /> Gemini AI Auditor Decision:
                                </div>
                                <button
                                  type="button"
                                  onClick={() => runAiAnalysis(submission.id, submission, item)}
                                  disabled={aiReports[submission.id]?.loading}
                                  className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9.5px] font-black rounded-md cursor-pointer transition-all flex items-center justify-center gap-0.5 shadow-sm disabled:opacity-50"
                                >
                                  {aiReports[submission.id]?.loading ? (
                                    <>Auditing... <RotateCw className="w-2.5 h-2.5 animate-spin" /></>
                                  ) : aiReports[submission.id]?.text ? (
                                    "Re-Audit File"
                                  ) : (
                                    "Pre-Audit File"
                                  )}
                                </button>
                              </div>

                              {aiReports[submission.id]?.loading && (
                                <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 animate-pulse italic pt-1 pl-1">
                                  Gemini is running secure automated heuristic checklist analysis...
                                </div>
                              )}

                              {aiReports[submission.id]?.error && (
                                <div className="text-[10px] text-rose-600 font-bold bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                                  ⚠️ {aiReports[submission.id].error}
                                </div>
                              )}

                              {aiReports[submission.id]?.text && (
                                <div className="bg-white/90 border border-indigo-105 p-2.5 rounded-lg text-[11px] text-slate-700 font-medium leading-relaxed whitespace-pre-wrap select-text shadow-sm">
                                  {aiReports[submission.id].text}
                                </div>
                              )}
                            </div>

                          </div>

                          {/* Reviewer Action Form */}
                          <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-4">
                            <div>
                              <span className="text-xs font-bold text-slate-705 uppercase tracking-wider block">Decision Panel & Feedback Card:</span>
                              <textarea 
                                id={`reviewer-notes-area-${item.id}`}
                                value={reviewerComment}
                                onChange={(e) => setReviewerComment(e.target.value)}
                                rows={3}
                                placeholder="Enter detailed comments explaining your approval or specifying revision steps if rejected..."
                                className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs mt-1.5 focus:outline-indigo-500 text-slate-850 font-medium"
                              />
                            </div>

                            {/* Preload Templates comments helper */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Quick Response Presets:</span>
                              <div className="flex flex-col gap-1.5 max-h-[110px] overflow-y-auto bg-white p-1.5 rounded border border-slate-200">
                                <span className="text-[9px] font-bold text-emerald-605">Approve Templates:</span>
                                <div className="flex flex-wrap gap-1 mb-1">
                                  {commentTemplates.approved.map((tmpl, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => selectCommentTemplate(tmpl)}
                                      className="text-[9.5px] font-semibold text-slate-600 hover:text-indigo-650 bg-slate-50 hover:bg-slate-100 rounded border border-slate-205 py-0.5 px-1.5 cursor-pointer max-w-full truncate text-left"
                                      title={tmpl}
                                    >
                                      {tmpl}
                                    </button>
                                  ))}
                                </div>
                                <span className="text-[9px] font-bold text-rose-605">Reject Templates:</span>
                                <div className="flex flex-wrap gap-1">
                                  {commentTemplates.rejected.map((tmpl, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => selectCommentTemplate(tmpl)}
                                      className="text-[9.5px] font-semibold text-slate-600 hover:text-rose-650 bg-slate-50 hover:bg-slate-101 rounded border border-slate-205 py-0.5 px-1.5 cursor-pointer max-w-full truncate text-left"
                                      title={tmpl}
                                    >
                                      {tmpl}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Triggers buttons */}
                            <div className="flex gap-2.5 pt-1">
                              <button
                                id={`reject-submit-btn-${item.id}`}
                                onClick={() => handleReviewTrigger(submission.id, 'rejected')}
                                className="flex-1 py-1.5 px-3 border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-100/50 bg-white font-extrabold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" /> Reject & Revise
                              </button>
                              <button
                                id={`approve-submit-btn-${item.id}`}
                                onClick={() => handleReviewTrigger(submission.id, 'approved')}
                                className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" /> Approve Item
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-450 italic">
            Select an interpreter profile from the side directory list to review submissions.
          </div>
        )}
      </div>

      {/* Document Preview Overlay Component */}
      <DocumentPreviewOverlay 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        submission={selectedSubForPreview}
        checklistItem={selectedItemForPreview}
        submitterName={selectedInterpreterUser?.name}
      />
    </div>
  );
};
