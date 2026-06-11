import { db } from './index.ts';
import { users, interpreterProfiles, submissions, auditLogs, trainingRequests, systemSettings } from './schema.ts';
import { sql } from 'drizzle-orm';

export interface DbState {
  users: any[];
  interpreterProfiles: any[];
  submissions: any[];
  auditLogs: any[];
  trainingRequests: any[];
  systemSettings: any;
}

export async function getDbState(): Promise<DbState | null> {
  try {
    const listUsers = await db.select().from(users);
    if (listUsers.length === 0) {
      return null;
    }
    const listProfiles = await db.select().from(interpreterProfiles);
    const listSubmissions = await db.select().from(submissions);
    const listLogs = await db.select().from(auditLogs);
    const listTraining = await db.select().from(trainingRequests);
    const settingsList = await db.select().from(systemSettings);

    const mappedSubmissions = listSubmissions.map(s => {
      let versionsParsed = [];
      let ocrExtractedParsed = undefined;
      try {
        if (s.versions) versionsParsed = JSON.parse(s.versions);
      } catch (e) {
        console.warn("Failed parsing versions for", s.id);
      }
      try {
        if (s.ocrExtractedData) ocrExtractedParsed = JSON.parse(s.ocrExtractedData);
      } catch (e) {
        console.warn("Failed parsing ocrExtractedData for", s.id);
      }
      return {
        id: s.id,
        itemId: s.itemId,
        userId: s.userId,
        fileName: s.fileName,
        fileSize: s.fileSize,
        status: s.status,
        notes: s.notes || undefined,
        submittedAt: s.submittedAt ? s.submittedAt.toISOString() : undefined,
        reviewedAt: s.reviewedAt ? s.reviewedAt.toISOString() : undefined,
        reviewerId: s.reviewerId || undefined,
        reviewerNotes: s.reviewerNotes || undefined,
        fileUrl: s.fileUrl || undefined,
        ocrVerified: s.ocrVerified || false,
        ocrExtractedData: ocrExtractedParsed,
        versions: versionsParsed,
      };
    });

    const mappedProfiles = listProfiles.map(p => {
      let invitedItemsParsed = undefined;
      try {
        if (p.invitedItems) {
          invitedItemsParsed = JSON.parse(p.invitedItems);
        }
      } catch (e) {}

      return {
        userId: p.userId,
        phone: p.phone || '',
        languagePair: p.languagePair || 'Spanish ↔ English',
        country: p.country || 'USA',
        timeZone: p.timeZone || 'EST',
        interpreterType: p.interpreterType || 'medical',
        medicalQualified: p.medicalQualified || false,
        legalQualified: p.legalQualified || false,
        completionRate: p.completionRate || 0,
        riskFlag: p.riskFlag || false,
        riskReason: p.riskReason || undefined,
        invitedToComplete: p.invitedToComplete || false,
        invitedAt: p.invitedAt ? p.invitedAt.toISOString() : undefined,
        invitedMessage: p.invitedMessage || undefined,
        invitedSenderEmail: p.invitedSenderEmail || undefined,
        invitedRecipientEmail: p.invitedRecipientEmail || undefined,
        invitedItems: invitedItemsParsed,
      };
    });

    const mappedLogs = listLogs.map(l => ({
      id: l.id.toString(),
      userId: l.userId || '',
      userName: l.userName || '',
      userRole: l.userRole || 'interpreter',
      action: l.action,
      details: l.details,
      timestamp: l.timestamp ? l.timestamp.toISOString() : new Date().toISOString()
    }));

    const mappedTraining = listTraining.map(t => ({
      id: t.id.toString(),
      userId: t.userId,
      userName: t.userName,
      trainingType: t.trainingType,
      status: t.status,
      requestedAt: t.requestedAt ? t.requestedAt.toISOString() : new Date().toISOString()
    }));

    const rawSettings = (settingsList[0] || {}) as any;
    const mappedSettings = {
      allowSelfRegistration: rawSettings.allowSelfRegistration ?? true,
      strictSpeedRequirements: rawSettings.strictSpeedRequirements ?? false,
      minDownloadSpeed: rawSettings.minDownloadSpeed ?? 50,
      minUploadSpeed: rawSettings.minUploadSpeed ?? 10,
      autoVirusScanSimulation: rawSettings.autoVirusScanSimulation ?? true,
      aiOcrVerificationEnabled: rawSettings.aiOcrVerificationEnabled ?? true,
    };

    return {
      users: listUsers,
      interpreterProfiles: mappedProfiles,
      submissions: mappedSubmissions,
      auditLogs: mappedLogs,
      trainingRequests: mappedTraining,
      systemSettings: mappedSettings,
    };
  } catch (error) {
    console.error("Failed to query DB state:", error);
    throw new Error("Failed to query DB state", { cause: error });
  }
}

export async function saveDbState(state: DbState): Promise<void> {
  try {
    // 1. Users
    for (const u of state.users) {
      await db.insert(users)
        .values({
          uid: u.uid || u.id || 'unknown',
          email: u.email,
          name: u.name,
          role: u.role || 'interpreter',
          avatarUrl: u.avatarUrl,
          status: u.status || 'active',
        })
        .onConflictDoUpdate({
          target: users.uid,
          set: {
            email: u.email,
            name: u.name,
            role: u.role || 'interpreter',
            avatarUrl: u.avatarUrl,
            status: u.status || 'active',
          }
        });
    }

    // 2. Profiles
    for (const p of state.interpreterProfiles) {
      await db.insert(interpreterProfiles)
        .values({
          userId: p.userId,
          phone: p.phone,
          languagePair: p.languagePair,
          country: p.country,
          timeZone: p.timeZone,
          interpreterType: p.interpreterType,
          medicalQualified: p.medicalQualified,
          legalQualified: p.legalQualified,
          completionRate: p.completionRate,
          riskFlag: p.riskFlag,
          riskReason: p.riskReason,
          invitedToComplete: p.invitedToComplete,
          invitedAt: p.invitedAt ? new Date(p.invitedAt) : null,
          invitedMessage: p.invitedMessage,
          invitedItems: p.invitedItems ? JSON.stringify(p.invitedItems) : null,
          invitedSenderEmail: p.invitedSenderEmail,
          invitedRecipientEmail: p.invitedRecipientEmail,
        })
        .onConflictDoUpdate({
          target: interpreterProfiles.userId,
          set: {
            phone: p.phone,
            languagePair: p.languagePair,
            country: p.country,
            timeZone: p.timeZone,
            interpreterType: p.interpreterType,
            medicalQualified: p.medicalQualified,
            legalQualified: p.legalQualified,
            completionRate: p.completionRate,
            riskFlag: p.riskFlag,
            riskReason: p.riskReason,
            invitedToComplete: p.invitedToComplete,
            invitedAt: p.invitedAt ? new Date(p.invitedAt) : null,
            invitedMessage: p.invitedMessage,
            invitedItems: p.invitedItems ? JSON.stringify(p.invitedItems) : null,
            invitedSenderEmail: p.invitedSenderEmail,
            invitedRecipientEmail: p.invitedRecipientEmail,
          }
        });
    }

    // 3. Submissions
    for (const s of state.submissions) {
      await db.insert(submissions)
        .values({
          id: s.id,
          itemId: s.itemId,
          userId: s.userId,
          fileName: s.fileName,
          fileSize: s.fileSize,
          status: s.status,
          notes: s.notes,
          submittedAt: s.submittedAt ? new Date(s.submittedAt) : new Date(),
          reviewedAt: s.reviewedAt ? new Date(s.reviewedAt) : null,
          reviewerId: s.reviewerId,
          reviewerNotes: s.reviewerNotes,
          fileUrl: s.fileUrl,
          versions: s.versions ? JSON.stringify(s.versions) : null,
          ocrVerified: s.ocrVerified,
          ocrExtractedData: s.ocrExtractedData ? JSON.stringify(s.ocrExtractedData) : null,
        })
        .onConflictDoUpdate({
          target: submissions.id,
          set: {
            itemId: s.itemId,
            userId: s.userId,
            fileName: s.fileName,
            fileSize: s.fileSize,
            status: s.status,
            notes: s.notes,
            submittedAt: s.submittedAt ? new Date(s.submittedAt) : new Date(),
            reviewedAt: s.reviewedAt ? new Date(s.reviewedAt) : null,
            reviewerId: s.reviewerId,
            reviewerNotes: s.reviewerNotes,
            fileUrl: s.fileUrl,
            versions: s.versions ? JSON.stringify(s.versions) : null,
            ocrVerified: s.ocrVerified,
            ocrExtractedData: s.ocrExtractedData ? JSON.stringify(s.ocrExtractedData) : null,
          }
        });
    }

    // 4. Audit Logs
    // We clear then insert logs, or simply insert only
    if (state.auditLogs?.length > 0) {
      // Direct insertion to keep historic logs
      for (const l of state.auditLogs) {
        // Simple insert or match id
        const logId = parseInt(l.id, 10);
        if (isNaN(logId)) {
          await db.insert(auditLogs).values({
            userId: l.userId,
            userName: l.userName,
            userRole: l.userRole,
            action: l.action,
            details: l.details,
            timestamp: l.timestamp ? new Date(l.timestamp) : new Date(),
          });
        }
      }
    }

    // 5. Training Requests
    for (const t of state.trainingRequests) {
      const treqId = parseInt(t.id, 10);
      if (isNaN(treqId)) {
        await db.insert(trainingRequests).values({
          userId: t.userId,
          userName: t.userName,
          trainingType: t.trainingType,
          status: t.status,
          requestedAt: t.requestedAt ? new Date(t.requestedAt) : new Date(),
        });
      } else {
        await db.insert(trainingRequests)
          .values({
            id: treqId,
            userId: t.userId,
            userName: t.userName,
            trainingType: t.trainingType,
            status: t.status,
            requestedAt: t.requestedAt ? new Date(t.requestedAt) : new Date(),
          })
          .onConflictDoUpdate({
            target: trainingRequests.id,
            set: {
              status: t.status,
            }
          });
      }
    }

    // 6. Settings
    if (state.systemSettings) {
      await db.insert(systemSettings)
        .values({
          id: 1,
          allowSelfRegistration: state.systemSettings.allowSelfRegistration,
          strictSpeedRequirements: state.systemSettings.strictSpeedRequirements,
          minDownloadSpeed: state.systemSettings.minDownloadSpeed,
          minUploadSpeed: state.systemSettings.minUploadSpeed,
          autoVirusScanSimulation: state.systemSettings.autoVirusScanSimulation,
          aiOcrVerificationEnabled: state.systemSettings.aiOcrVerificationEnabled,
        })
        .onConflictDoUpdate({
          target: systemSettings.id,
          set: {
            allowSelfRegistration: state.systemSettings.allowSelfRegistration,
            strictSpeedRequirements: state.systemSettings.strictSpeedRequirements,
            minDownloadSpeed: state.systemSettings.minDownloadSpeed,
            minUploadSpeed: state.systemSettings.minUploadSpeed,
            autoVirusScanSimulation: state.systemSettings.autoVirusScanSimulation,
            aiOcrVerificationEnabled: state.systemSettings.aiOcrVerificationEnabled,
          }
        });
    }

  } catch (err) {
    console.error("Failed to save DB state:", err);
    throw new Error("Failed to save DB state", { cause: err });
  }
}
