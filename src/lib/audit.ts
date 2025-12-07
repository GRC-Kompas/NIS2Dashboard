import prisma from './db';

interface AuditLogEntry {
    organisationId: string;
    userId: string;
    action: string;
    details?: any;
}

export async function logAudit({ organisationId, userId, action, details }: AuditLogEntry) {
    try {
        await prisma.auditLog.create({
            data: {
                organisation_id: organisationId,
                user_id: userId,
                action,
                details: details ? JSON.stringify(details) : null,
            }
        });
        console.log(`Audit Logged: ${action} for Org ${organisationId} by User ${userId}`);
    } catch (e) {
        console.error('Failed to write audit log', e);
        // Do not throw, audit failure should not block main flow in MVP
    }
}
