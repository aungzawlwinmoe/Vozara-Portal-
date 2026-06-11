import React, { useState, useEffect } from 'react';
import { 
  User, 
  InterpreterProfile, 
  Submission, 
  Notification, 
  AuditLog, 
  TrainingRequest, 
  SystemSettings 
} from './types';
import { 
  CHECKLIST_ITEMS, 
  MOCK_USERS, 
  MOCK_INTERPRETER_PROFILES, 
  DEFAULT_MOCK_SUBMISSIONS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_AUDIT_LOGS, 
  DEFAULT_MOCK_SYSTEM_SETTINGS, 
  INITIAL_TRAINING_REQUESTS 
} from './data';

import { getInitialsAvatar } from './utils/avatar';

import { RoleSwitcher } from './components/RoleSwitcher';
import { AuthScreen } from './components/AuthScreen';
import { InterpreterDashboard } from './components/InterpreterDashboard';
import { ReviewerDashboard } from './components/ReviewerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { NotificationCenter } from './components/NotificationCenter';
import { CompanionChat } from './components/CompanionChat';

import { 
  Sparkles, 
  LogOut, 
  ShieldAlert, 
  Sliders, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  Cpu, 
  FileText 
} from 'lucide-react';

let idCounter = 0;
const generateUniqueId = (prefix: string) => {
  idCounter += 1;
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${Date.now()}_${idCounter}_${randomStr}`;
};

export default function App() {
  // --- STATE SYSTEM WITH LOCALSTORAGE SYNCING ---
  const [hasLoadedFromDb, setHasLoadedFromDb] = useState(false);
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const [dbSyncError, setDbSyncError] = useState<string | null>(null);

  const saveStateToDatabase = async (
    currentUsers = users,
    currentProfiles = interpreterProfiles,
    currentSubs = submissions,
    currentAudits = auditLogs,
    currentReqs = trainingRequests,
    currentSettings = systemSettings
  ) => {
    setIsSyncingDb(true);
    setDbSyncError(null);
    try {
      const payload = {
        users: currentUsers,
        interpreterProfiles: currentProfiles,
        submissions: currentSubs,
        auditLogs: currentAudits,
        trainingRequests: currentReqs,
        systemSettings: currentSettings,
      };
      const res = await fetch("/api/database/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: payload }),
      });
      if (!res.ok) {
        throw new Error("Failed to save state to database");
      }
    } catch (err: any) {
      console.error(err);
      setDbSyncError(err.message || "Failed to persist state");
    } finally {
      setIsSyncingDb(false);
    }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vozara_current_user');
    return saved ? JSON.parse(saved) : MOCK_USERS[0]; // Boot default as Elena Rostova
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('vozara_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [interpreterProfiles, setInterpreterProfiles] = useState<InterpreterProfile[]>(() => {
    const saved = localStorage.getItem('vozara_profiles');
    return saved ? JSON.parse(saved) : MOCK_INTERPRETER_PROFILES;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('vozara_submissions');
    const list: Submission[] = saved ? JSON.parse(saved) : DEFAULT_MOCK_SUBMISSIONS;
    const seen = new Set<string>();
    return list.map((item, idx) => {
      let uid = item.id;
      if (!uid || seen.has(uid)) {
        uid = `sub_dyn_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
      }
      seen.add(uid);
      return { ...item, id: uid };
    });
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('vozara_notifs');
    const list: Notification[] = saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    const seen = new Set<string>();
    return list.map((item, idx) => {
      let uid = item.id;
      if (!uid || seen.has(uid)) {
        uid = `notif_dyn_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
      }
      seen.add(uid);
      return { ...item, id: uid };
    });
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('vozara_audits');
    const list: AuditLog[] = saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    const seen = new Set<string>();
    return list.map((item, idx) => {
      let uid = item.id;
      if (!uid || seen.has(uid)) {
        uid = `audit_dyn_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
      }
      seen.add(uid);
      return { ...item, id: uid };
    });
  });

  const [trainingRequests, setTrainingRequests] = useState<TrainingRequest[]>(() => {
    const saved = localStorage.getItem('vozara_requests');
    const list: TrainingRequest[] = saved ? JSON.parse(saved) : INITIAL_TRAINING_REQUESTS;
    const seen = new Set<string>();
    return list.map((item, idx) => {
      let uid = item.id;
      if (!uid || seen.has(uid)) {
        uid = `treq_dyn_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
      }
      seen.add(uid);
      return { ...item, id: uid };
    });
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('vozara_settings');
    return saved ? JSON.parse(saved) : DEFAULT_MOCK_SYSTEM_SETTINGS;
  });

  // Recent banner message posted by admin
  const [adminAnnouncement, setAdminAnnouncement] = useState<{ title: string; message: string } | null>(() => {
    const saved = localStorage.getItem('vozara_announcement');
    return saved ? JSON.parse(saved) : {
      title: 'Mandatory HIPAA Assessment Update',
      message: 'Effective immediately, the HIPAA Training Assessment passing score guidelines have been updated to verify complete familiarity with target privacy regulations.'
    };
  });

  // --- PERSISTENCE LISTENERS ---
  useEffect(() => {
    localStorage.setItem('vozara_current_user', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('vozara_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('vozara_profiles', JSON.stringify(interpreterProfiles));
  }, [interpreterProfiles]);

  useEffect(() => {
    localStorage.setItem('vozara_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('vozara_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('vozara_audits', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('vozara_requests', JSON.stringify(trainingRequests));
  }, [trainingRequests]);

  useEffect(() => {
    localStorage.setItem('vozara_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  useEffect(() => {
    localStorage.setItem('vozara_announcement', adminAnnouncement ? JSON.stringify(adminAnnouncement) : '');
  }, [adminAnnouncement]);

  // --- DATABASE SYNC ACTIONS ---
  useEffect(() => {
    const loadDatabaseState = async () => {
      try {
        const res = await fetch("/api/database/state");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.state) {
            const { users: dbUsers, interpreterProfiles: dbProfiles, submissions: dbSubs, auditLogs: dbAudits, trainingRequests: dbTraining, systemSettings: dbSettings } = data.state;
            if (dbUsers && dbUsers.length > 0) setUsers(dbUsers);
            if (dbProfiles && dbProfiles.length > 0) setInterpreterProfiles(dbProfiles);
            if (dbSubs && dbSubs.length > 0) setSubmissions(dbSubs);
            if (dbAudits && dbAudits.length > 0) setAuditLogs(dbAudits);
            if (dbTraining && dbTraining.length > 0) setTrainingRequests(dbTraining);
            if (dbSettings) setSystemSettings(dbSettings);
            console.log("State loaded successfully from Cloud SQL database!");
          } else if (data.empty) {
            console.log("Cloud SQL database is fresh. Initializing with mock data...");
            await saveStateToDatabase(users, interpreterProfiles, submissions, auditLogs, trainingRequests, systemSettings);
          }
        }
      } catch (err) {
        console.error("Failed to load initial state from Cloud SQL:", err);
      } finally {
        setHasLoadedFromDb(true);
      }
    };
    loadDatabaseState();
  }, []);

  useEffect(() => {
    if (!hasLoadedFromDb) return;
    
    const handler = setTimeout(() => {
      saveStateToDatabase(users, interpreterProfiles, submissions, auditLogs, trainingRequests, systemSettings);
    }, 1500);
    
    return () => clearTimeout(handler);
  }, [users, interpreterProfiles, submissions, auditLogs, trainingRequests, systemSettings, hasLoadedFromDb]);

  // --- HELPER WRITERS ---
  const addAuditLog = (action: string, details: string, userIdInput?: string, nameInput?: string, roleInput?: string) => {
    const actingUser = currentUser || { id: 'system', name: 'System Background Coordinator', role: 'admin' as const };
    const newLog: AuditLog = {
      id: generateUniqueId('audit'),
      userId: userIdInput || actingUser.id,
      userName: nameInput || actingUser.name,
      userRole: roleInput || actingUser.role,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const throwNotification = (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const newNotif: Notification = {
      id: generateUniqueId('notif'),
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Recalculates and updates specific interpreter's rate
  const recalculateRate = (userId: string, currentSubsList: Submission[]) => {
    const approvedCount = currentSubsList.filter(s => s.userId === userId && s.status === 'approved').length;
    const totalRequirements = CHECKLIST_ITEMS.length; // 14 items
    const rate = Math.round((approvedCount / totalRequirements) * 100);

    setInterpreterProfiles(prev => prev.map(p => {
      if (p.userId === userId) {
        const wasCompleted = p.completionRate === 100;
        const isNowCompleted = rate === 100;
        
        if (!wasCompleted && isNowCompleted) {
          throwNotification(userId, '🎉 100% Onboarding Completed!', 'Excellent work! Your credentials are fully verified. Compliance staff will activate your active account.', 'success');
        }
        
        return { ...p, completionRate: rate };
      }
      return p;
    }));
  };

  // --- CORE SYSTEM METHODS ---
  
  // LOGIN / LOGOUT
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    addAuditLog('Login Success', `Logged in as ${user.name} (${user.role})`, user.id, user.name, user.role);
    throwNotification(user.id, `Logged in successfully`, `Welcome back, ${user.name}. Currently evaluating ${user.role} workspace.`, 'success');
  };

  const handleLogout = () => {
    if (currentUser) {
      addAuditLog('User Logout', `Logged out from workspace: ${currentUser.name}`, currentUser.id, currentUser.name, currentUser.role);
    }
    setCurrentUser(null);
  };

  // INTERPRETER SELF-REGISTRATION
  const handleRegister = (data: { 
    name: string; 
    email: string; 
    phone: string; 
    languagePair: string; 
    interpreterType: 'medical' | 'legal' | 'community' 
  }) => {
    const newUserId = generateUniqueId('user');
    const newUser: User = {
      id: newUserId,
      email: data.email,
      name: data.name,
      role: 'interpreter',
      status: 'active',
      createdAt: new Date().toISOString(),
      avatarUrl: getInitialsAvatar(data.name)
    };

    const newProfile: InterpreterProfile = {
      userId: newUserId,
      phone: data.phone,
      languagePair: data.languagePair,
      country: 'United States',
      timeZone: 'EST (UTC-5)',
      interpreterType: data.interpreterType,
      medicalQualified: data.interpreterType === 'medical',
      legalQualified: data.interpreterType === 'legal',
      completionRate: 0,
      riskFlag: false
    };

    setUsers(prev => [...prev, newUser]);
    setInterpreterProfiles(prev => [...prev, newProfile]);
    setCurrentUser(newUser);

    addAuditLog('Interpreter Sign-Up', `Registered new interpreter: ${data.name} for ${data.languagePair}`, newUserId, data.name, 'interpreter');
    throwNotification(newUserId, 'Welcome to Vozara!', 'Your translation compliance portal is online. Complete your modular checklist to begin matching clients.', 'info');
  };

  // FILE UPLOAD FOR MANUAL HUMAN REVIEW
  const handleUploadDocument = (itemId: string, fileName: string, fileSize: string, ocrRun: boolean, fileUrl?: string) => {
    if (!currentUser) return;

    setSubmissions(prev => {
      // Find matching submission
      const existingIdx = prev.findIndex(s => s.userId === currentUser.id && s.itemId === itemId);
      
      const uploadStatus = 'review';
      let updatedList = [...prev];

      if (existingIdx >= 0) {
        const oldSub = prev[existingIdx];
        const newVer = {
          id: generateUniqueId('v'),
          fileName,
          fileSize,
          uploadedAt: new Date().toISOString(),
          status: uploadStatus as any,
          fileUrl
        };
        
        updatedList[existingIdx] = {
          ...oldSub,
          fileName,
          fileSize,
          fileUrl: fileUrl || oldSub.fileUrl,
          status: uploadStatus,
          submittedAt: new Date().toISOString(),
          versions: [newVer, ...oldSub.versions],
          ocrVerified: false,
          ocrExtractedData: undefined,
          reviewerNotes: undefined
        };
      } else {
        const newSubId = generateUniqueId('sub');
        const newVer = {
          id: generateUniqueId('v'),
          fileName,
          fileSize,
          uploadedAt: new Date().toISOString(),
          status: uploadStatus as any,
          fileUrl
        };

        const newSub: Submission = {
          id: newSubId,
          itemId,
          userId: currentUser.id,
          fileName,
          fileSize,
          fileUrl,
          status: uploadStatus,
          submittedAt: new Date().toISOString(),
          versions: [newVer],
          ocrVerified: false,
          ocrExtractedData: undefined,
          reviewerNotes: undefined
        };
        updatedList.push(newSub);
      }

      addAuditLog('Document Uploaded', `Uploaded checklist item: "${itemId}" (File: ${fileName})`, currentUser.id, currentUser.name, 'interpreter');
      throwNotification(currentUser.id, `Document Under Review`, `Successfully uploaded "${fileName}" for "${itemId}". A compliance manager will manually review your file.`, 'info');

      // Sync and calculate completion percentage
      setTimeout(() => recalculateRate(currentUser.id, updatedList), 50);
      return updatedList;
    });
  };

  // REMOVE/DELETE DOCUMENT
  const handleDeleteDocument = (submissionId: string) => {
    if (!currentUser) return;

    setSubmissions(prev => {
      const targetSub = prev.find(s => s.id === submissionId);
      if (!targetSub) return prev;

      const filtered = prev.filter(s => s.id !== submissionId);
      addAuditLog('Delete Document', `Deleted submission payload for: "${targetSub.itemId}"`, currentUser.id, currentUser.name, 'interpreter');
      throwNotification(currentUser.id, 'Document Removed', `Submission file deleted and requirement status reset in history.`, 'warning');
      
      setTimeout(() => recalculateRate(currentUser.id, filtered), 50);
      return filtered;
    });
  };

  // REQUEST TUITION SPONSORED SEATS
  const handleRequestTraining = (type: 'medical' | 'legal') => {
    if (!currentUser) return;

    // Check if request already exists
    const exists = trainingRequests.find(t => t.userId === currentUser.id && t.trainingType === type);
    if (exists) {
      alert(`You already have an active pending tuition ticket for ${type} certification.`);
      return;
    }

    const newTicket: TrainingRequest = {
      id: generateUniqueId('t_req'),
      userId: currentUser.id,
      userName: currentUser.name,
      trainingType: type,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    setTrainingRequests(prev => [newTicket, ...prev]);
    addAuditLog('Training Ticket Raised', `Requested access sponsorship for 40-hour ${type} program`, currentUser.id, currentUser.name, 'interpreter');
    throwNotification(currentUser.id, 'Tuition Ticket Generated', `Your request for Vozara Legal/Medical support seat was queued safely.`, 'success');
  };

  // STAFF DECISION: APPROVE/REJECT ITEM
  const handleReviewOnboardingItem = (submissionId: string, action: 'approved' | 'rejected', notes: string) => {
    if (!currentUser) return;

    setSubmissions(prev => {
      const idx = prev.findIndex(s => s.id === submissionId);
      if (idx < 0) return prev;

      const target = prev[idx];
      const updatedList = [...prev];
      updatedList[idx] = {
        ...target,
        status: action,
        reviewerNotes: notes,
        reviewerId: currentUser.id,
        reviewedAt: new Date().toISOString()
      };

      addAuditLog(`Document Review: ${action.toUpperCase()}`, `Reviewed item "${target.itemId}" for target user ${target.userId}. Decisively logged notes: "${notes}"`, currentUser.id, currentUser.name, currentUser.role);
      
      throwNotification(
        target.userId, 
        action === 'approved' ? `✓ Submission Accepted: "${target.itemId}"` : `🚨 Action Block: Correct "${target.itemId}"`, 
        `Compliance Decision comments: "${notes}"`, 
        action === 'approved' ? 'success' : 'error'
      );

      // Recalculate target user rates
      setTimeout(() => recalculateRate(target.userId, updatedList), 50);
      return updatedList;
    });
  };

  // ONBOARDING INVITATIONS ENGINE
  const handleSendInvitation = async (
    targetUserId: string, 
    message: string, 
    selectedItems: string[],
    senderEmail?: string,
    recipientEmail?: string
  ): Promise<{ success: boolean; error?: string }> => {
    let emailSent = false;
    let emailErr = '';

    const u = users.find(usr => usr.id === targetUserId);
    const toEmail = recipientEmail || u?.email || 'candidate@domain.com';
    const fromEmail = senderEmail || 'onboarding@vozarals.com';

    if (u) {
      try {
        const subject = `Urgent: Complete your Vozara LS Compliance Onboarding`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
              <h2 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: -0.5px;">Vozara LS</h2>
              <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #818cf8; font-weight: bold;">Compliance & Onboarding Portal</p>
            </div>
            <div style="padding: 24px;">
              <p style="font-size: 15px; margin-top: 0; font-weight: bold;">Dear ${u.name},</p>
              <p style="font-size: 14px;">The Compliance and Certification Team has sent an interactive onboarding checklist request. Please complete the remaining requirements on the portal:</p>
              
              <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; margin: 18px 0;">
                <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: bold; color: #4f46ed;">✉️ Message from Compliance Officers:</p>
                <p style="margin: 0; font-size: 13px; font-style: italic; color: #475569;">"${message}"</p>
              </div>

              ${selectedItems && selectedItems.length > 0 ? `
              <p style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: #0f172a;">Requested Items Needing Attention:</p>
              <ul style="margin: 0 0 20px 0; padding-left: 20px; font-size: 13px; color: #334155;">
                ${selectedItems.map(itId => {
                  const itemTitle = CHECKLIST_ITEMS.find(cli => cli.id === itId)?.title || itId;
                  return `<li style="margin-bottom: 4px; font-weight: bold;">${itemTitle}</li>`;
                }).join('')}
              </ul>
              ` : ''}

              <div style="text-align: center; margin: 24px 0;">
                <a href="${window.location.origin}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 13px; display: inline-block;">Complete Compliance Checklist</a>
              </div>
              
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
              <p style="font-size: 10px; color: #64748b; margin-bottom: 0; line-height: 1.4;">This email was sent via a Google user integration from <strong>${fromEmail}</strong>. If you did not request this registration, please contact onboarding@vozarals.com.</p>
            </div>
          </div>
        `;

        const response = await fetch('/api/emails/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: toEmail,
            subject,
            body: emailHtml,
            from: fromEmail
          })
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.success) {
            emailSent = true;
          } else {
            throw new Error(resData.error || 'Server reported error during sending');
          }
        } else {
          throw new Error(`Server returned HTTP code ${response.status}`);
        }
      } catch (err: any) {
        console.warn("Direct SMTP send failed, falling back to simulated mail delivery:", err);
        emailErr = err.message || "Failed to send SMTP message via send.one.com";
      }
    }

    setInterpreterProfiles(prev => prev.map(p => {
      if (p.userId === targetUserId) {
        return {
          ...p,
          invitedToComplete: true,
          invitedAt: new Date().toISOString(),
          invitedMessage: message,
          invitedItems: selectedItems,
          invitedSenderEmail: fromEmail,
          invitedRecipientEmail: toEmail
        };
      }
      return p;
    }));

    if (u) {
      if (emailSent) {
        addAuditLog(
          'Email Sent',
          `Authorized One.com SMTP send successfully: [From: onboarding@vozarals.com | To: ${toEmail}]. Checklist invitation sent. Message details: "${message.substring(0, 80)}..."`,
          currentUser?.id,
          currentUser?.name,
          currentUser?.role
        );
        throwNotification(
          targetUserId,
          `✉️ Real Onboarding Email Sent`,
          `Checklist request delivered to ${toEmail} using One.com SMTP connection.`,
          'success'
        );
      } else {
        const logDetail = emailErr 
          ? `Local simulation fallback due to API error [${emailErr}]. Simulated: [From: ${fromEmail} | To: ${toEmail}] Message detail: ${message}`
          : `Email sending simulated: [From: ${fromEmail} | To: ${toEmail}]. Compliance onboarding checklist invitation sent to ${u.name} focusing on: ${selectedItems.join(', ') || 'all missing items'}`;

        addAuditLog(
          'Invitation Sent',
          logDetail,
          currentUser?.id,
          currentUser?.name,
          currentUser?.role
        );
        throwNotification(
          targetUserId,
          `✉️ Onboarding Invitation Sent`,
          `Delivered to ${toEmail}. Msg: ${message}`,
          emailErr ? 'warning' : 'info'
        );
      }
    }

    return { success: emailSent, error: emailErr };
  };

  const handleDeleteUser = (userId: string) => {
    const u = users.find(x => x.id === userId);
    if (!u) return;

    setUsers(prev => prev.filter(x => x.id !== userId));
    setInterpreterProfiles(prev => prev.filter(x => x.userId !== userId));
    setSubmissions(prev => prev.filter(x => x.userId !== userId));
    setTrainingRequests(prev => prev.filter(x => x.userId !== userId));

    addAuditLog(
      'Interpreter Deleted',
      `Manually deleted interpreter candidate profile: ${u.name} (${u.email}) from workspace directory and cleared all checklist documents to enforce GDPR compliance reset.`,
      currentUser?.id,
      currentUser?.name,
      currentUser?.role
    );
    throwNotification(
      currentUser?.id || 'admin',
      `🛑 Interpreter Removed`,
      `Successfully deleted candidate profile for ${u.name} from directory list.`,
      'success'
    );
  };

  const handleCreateInterpreter = (
    name: string,
    email: string,
    languagePair: string,
    interpreterType: 'medical' | 'legal' | 'community' | 'conference'
  ): string => {
    const newUserId = `user-${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      email,
      name,
      role: 'interpreter',
      status: 'active',
      createdAt: new Date().toISOString(),
      avatarUrl: getInitialsAvatar(name)
    };

    const newProfile: InterpreterProfile = {
      userId: newUserId,
      phone: '+1 (555) 123-4567',
      languagePair,
      country: 'United States',
      timeZone: 'EST (UTC-5)',
      interpreterType,
      medicalQualified: interpreterType === 'medical',
      legalQualified: interpreterType === 'legal',
      completionRate: 0,
      riskFlag: false
    };

    const newUsers = [...users, newUser];
    const newProfiles = [...interpreterProfiles, newProfile];

    setUsers(newUsers);
    setInterpreterProfiles(newProfiles);
    
    localStorage.setItem('vozara_users', JSON.stringify(newUsers));
    saveStateToDatabase(newUsers, newProfiles);

    addAuditLog(
      'Interpreter Enroll', 
      `Admin created custom candidate profile: ${name} (${email}) for language pair ${languagePair} as a ${interpreterType} interpreter.`, 
      currentUser?.id || 'admin', 
      currentUser?.name || 'Administrator', 
      currentUser?.role || 'admin'
    );

    throwNotification(
      newUserId,
      'Welcome to Vozara!',
      'Your remote translation compliance portal is online. Complete your modular checklist to begin matching clients.',
      'info'
    );

    return newUserId;
  };

  // UPDATE PROFILE UTILITIES
  const handleUpdateProfile = (updatedData: Partial<InterpreterProfile> & { name: string; phone: string }) => {
    if (!currentUser) return;

    // Save Name and update avatar automatically on User
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { 
          ...u, 
          name: updatedData.name,
          avatarUrl: getInitialsAvatar(updatedData.name)
        };
      }
      return u;
    }));
    setCurrentUser(prev => prev ? { 
      ...prev, 
      name: updatedData.name, 
      avatarUrl: getInitialsAvatar(updatedData.name)
    } : null);

    // Save details on Interpreter Profile
    setInterpreterProfiles(prev => prev.map(p => {
      if (p.userId === currentUser.id) {
        return {
          ...p,
          phone: updatedData.phone,
          languagePair: updatedData.languagePair || p.languagePair,
          country: updatedData.country || p.country,
          timeZone: updatedData.timeZone || p.timeZone,
          interpreterType: updatedData.interpreterType || p.interpreterType
        };
      }
      return p;
    }));

    addAuditLog('Profile Update', `Modified contact and language pair profile specifications.`, currentUser.id, updatedData.name, 'interpreter');
    throwNotification(currentUser.id, 'Metadata Updated', 'Your profile attributes have been safely synchronised.', 'success');
  };

  // ADMIN: DECIDE TRAINING SPONSORSHIP SEATS
  const handleApproveTraining = (reqId: string, action: 'approved' | 'rejected') => {
    setTrainingRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        const actingItem = req.trainingType === 'medical' ? 'medical_cert' : 'legal_cert';
        
        // Auto upload a simulated credential for that item!
        if (action === 'approved') {
          const mockFileName = `Sponsored_Vozara_LS_${req.trainingType.toUpperCase()}_Assistance_Graduate.pdf`;
          
          setSubmissions(subs => {
            const upList = subs.filter(s => !(s.userId === req.userId && s.itemId === actingItem));
            const newSubId = generateUniqueId('sub_auto');
            upList.push({
              id: newSubId,
              itemId: actingItem,
              userId: req.userId,
              fileName: mockFileName,
              fileSize: '2.4 MB',
              status: 'approved',
              submittedAt: new Date().toISOString(),
              reviewedAt: new Date().toISOString(),
              reviewerId: currentUser?.id,
              reviewerNotes: 'Approved automatically. Enrolled, completed, and certified via Vozara Educational sponsorship.',
              versions: [{ id: 'v1', fileName: mockFileName, fileSize: '2.4 MB', uploadedAt: new Date().toISOString(), status: 'approved' }]
            });
            
            setTimeout(() => recalculateRate(req.userId, upList), 50);
            return upList;
          });
        }

        throwNotification(req.userId, `Sponsored Seat ${action.toUpperCase()}`, `Your seat request for 40-hour ${req.trainingType} certification has been ${action}.`, action === 'approved' ? 'success' : 'warning');
        return { ...req, status: action };
      }
      return req;
    }));

    addAuditLog(`Training Approval decision: ${action.toUpperCase()}`, `Reviewed training sponsorship seat ticket: ${reqId}`, currentUser?.id || 'system', currentUser?.name || 'System', currentUser?.role || 'admin');
  };

  // ADMIN: BULK APPROVE PENDING
  const handleBulkApproveAllDocuments = () => {
    setSubmissions(prev => {
      const pendingCount = prev.filter(s => s.status === 'review').length;
      if (pendingCount === 0) {
        alert('There conform to 0 elements in the active pending review state.');
        return prev;
      }

      const updated = prev.map(sub => {
        if (sub.status === 'review') {
          throwNotification(sub.userId, '✓ Submission Accepted', `Approved automatically via administrative bulk approval tool.`, 'success');
          return {
            ...sub,
            status: 'approved' as const,
            reviewerNotes: 'Authorized via Admin Bulk Approval Tool.'
          };
        }
        return sub;
      });

      addAuditLog('Bulk Approval Execution', `Authorized batch approvals across ${pendingCount} pending queue documents.`, currentUser?.id || 'admin', currentUser?.name || 'Amelia Harris', 'admin');
      
      // Compute updates rates
      const uniqUsers = Array.from(new Set(updated.map(u => u.userId))) as string[];
      uniqUsers.forEach(uId => recalculateRate(uId, updated));

      return updated;
    });
  };

  // SYSTEM SETTINGS MUTATOR
  const handleUpdateSystemSettings = (settings: SystemSettings) => {
    setSystemSettings(settings);
    addAuditLog('Settings Customization', `Modified security and workstation bandwidth rules. Speed-enforcement: ${settings.strictSpeedRequirements ? 'YES' : 'NO'}`);
  };

  // ADMIN BROADCAST ALERT
  const handleAddAnnouncement = (title: string, msg: string) => {
    setAdminAnnouncement({ title, message: msg });
    addAuditLog('Broadcast Bulletins', `Published dashboard banner captions: "${title}"`);
    
    // Send alerts popup to ALL active interpreters
    users.forEach(u => {
      if (u.role === 'interpreter') {
        throwNotification(u.id, `🚨 Broadcast Alert: ${title}`, msg, 'warning');
      }
    });
  };

  // NOTIFICATION UTILITY CLICKERS
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotificationsAll = () => {
    setNotifications([]);
  };

  const resetAllDemoDataSystem = () => {
    if (confirm('Are you serious you would like to reset active caches? This will clear local state and restore preloaded mock lists.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div id="vozara-applet" className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col justify-between">
      
      {/* SIMULATOR ROLE CHANGER NAVIGATION */}
      <RoleSwitcher
        currentSimulatedUser={currentUser || MOCK_USERS[0]}
        allSimulatedUsers={users}
        interpreterProfiles={interpreterProfiles}
        onUserSelect={(u) => {
          setCurrentUser(u);
          throwNotification(u.id, `Simulating: ${u.name}`, `Flipped environment context matching ${u.role} perspectives.`, 'info');
        }}
      />

      {/* PORTAL MAIN HEADER */}
      <header className="bg-slate-900 text-white border-b border-white/5 py-4 px-6 sticky top-12 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-605 rounded-xl flex items-center justify-center text-white font-black text-sm tracking-tighter">
              VZ
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold tracking-tight text-sm">Vozara LS</span>
                <span className="bg-emerald-500 text-[8px] px-1.5 py-0.2 rounded-full font-black text-slate-950 uppercase">Rippling-Grid</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">Enterprise Compliance Onboarding Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-right">
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-100">{currentUser.name}</div>
                    <span className="text-[9.5px] uppercase font-bold text-indigo-400 font-mono tracking-widest">{currentUser.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* AUTO ALERT NOTIFIER BELL */}
                  <NotificationCenter
                    notifications={notifications.filter(n => n.userId === currentUser.id)}
                    onMarkAsRead={handleMarkAsRead}
                    onClearAll={handleClearNotificationsAll}
                  />

                  {/* PORT PORTAL LOGOUT */}
                  <button
                    id="system-logout-btn"
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                    title="Log out of current workspace"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <span className="text-xs text-slate-400 font-semibold italic">Awaiting profile entry...</span>
            )}
          </div>
        </div>
      </header>

      {/* MAIN VIEW AREA CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6">
        
        {/* PUBLIC BROADCAST ALERT BANNER IF APPLICABLE TO INTERPRETER */}
        {currentUser && currentUser.role === 'interpreter' && adminAnnouncement && (
          <div className="mb-6 bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-100 p-4.5 rounded-2xl flex items-start gap-3.5 relative overflow-hidden animate-fadeIn">
            <div className="absolute right-0 bottom-0 top-0 w-24 opacity-5 bg-repeat bg-[radial-gradient(#4F46E5_1px,transparent_1px)]" />
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600 shrink-0">
              <ShieldAlert className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">PORTAL BROADCAST RULES UPDATE</span>
              <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">{adminAnnouncement.title}</h4>
              <p className="text-xs text-slate-650 mt-1 leading-relaxed max-w-4xl font-semibold">{adminAnnouncement.message}</p>
            </div>
          </div>
        )}

        {/* WORKSPACE PERSPECTIVES SEPARATION */}
        {!currentUser ? (
          <AuthScreen
            allUsers={users}
            onLoginSuccess={handleLogin}
            onRegisterAccount={handleRegister}
            systemSettings={systemSettings}
          />
        ) : currentUser.role === 'interpreter' ? (
          <InterpreterDashboard
            currentUser={currentUser}
            profile={interpreterProfiles.find(p => p.userId === currentUser.id) || interpreterProfiles[0]}
            submissions={submissions.filter(s => s.userId === currentUser.id)}
            trainingRequests={trainingRequests.filter(r => r.userId === currentUser.id)}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
            onRequestTraining={handleRequestTraining}
            onUpdateProfile={handleUpdateProfile}
          />
        ) : currentUser.role === 'reviewer' ? (
          <ReviewerDashboard
            reviewerUser={currentUser}
            allInterpreters={users.filter(u => u.role === 'interpreter')}
            interpreterProfiles={interpreterProfiles}
            submissions={submissions}
            onReviewOnboardingItem={handleReviewOnboardingItem}
            onSendInvitation={handleSendInvitation}
            onSetSimulationUser={(u) => {
              setCurrentUser(u);
              throwNotification(u.id, `Impersonating: ${u.name}`, 'Swapped perspective context to assist user compilation directly.', 'info');
            }}
          />
        ) : (
          <AdminDashboard
            adminUser={currentUser}
            allUsers={users}
            interpreterProfiles={interpreterProfiles}
            submissions={submissions}
            trainingRequests={trainingRequests}
            auditLogs={auditLogs}
            systemSettings={systemSettings}
            onUpdateSystemSettings={handleUpdateSystemSettings}
            onApproveTraining={handleApproveTraining}
            onBulkApproveAllDocuments={handleBulkApproveAllDocuments}
            onSendInvitation={handleSendInvitation}
            onAddAuditLog={(act, det) => addAuditLog(act, det)}
            onAddAnnouncement={(title, msg) => handleAddAnnouncement(title, msg)}
            onDeleteUser={handleDeleteUser}
            onAddInterpreter={handleCreateInterpreter}
          />
        )}
      </main>

      {/* PORTAL SYSTEM FOOTER */}
      <footer className="bg-white border-t border-slate-150 py-6 px-6 text-xs text-slate-450 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">Vozara LS Portal</span>
            <span className="text-slate-300">|</span>
            <p>Version 3.2.0 (Stable) • HIPAA-Compliant Encryption Core</p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={resetAllDemoDataSystem}
              className="px-3 py-1 bg-slate-50 border border-slate-205 rounded-lg hover:bg-slate-200 transition-colors duration-200 font-bold text-slate-600 flex items-center gap-1 cursor-pointer"
              title="Reset state to baseline presets"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Re-Seed Sandbox Presets
            </button>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('HIPAA and GDPR logging processes are secure and private.'); }} className="hover:underline font-bold">Privacy Policy</a>
            <span className="text-slate-200">•</span>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Access rules protect PII (personally identifiable information) details across reviewers and interpreters.'); }} className="hover:underline font-bold">Workspace Rules</a>
          </div>
        </div>
      </footer>

      {/* Interative floating AI compliance chatbot helper overlay only for Admin and Reviewers */}
      {(currentUser?.role === 'admin' || currentUser?.role === 'reviewer') && (
        <CompanionChat />
      )}
    </div>
  );
}
