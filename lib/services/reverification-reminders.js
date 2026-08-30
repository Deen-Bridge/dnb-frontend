/**
 * Re-verification reminder notification seam.
 *
 * This intentionally remains behind a service function until the announcements
 * infrastructure exposes its delivery endpoint. Callers can rely on the
 * resolved acknowledgement shape without coupling the UI to that future API.
 */

/**
 * Queue a re-verification reminder for one mentor credential.
 *
 * @param {{ mentorId: string, credentialId: string, credentialType: string, expiresAt: string|null }} reminder
 * @returns {Promise<{ queued: true, notificationId: string, queuedAt: string }>}
 */
export async function sendReverificationReminder(reminder) {
  if (!reminder?.mentorId) {
    throw new Error("mentorId is required");
  }
  if (!reminder?.credentialId) {
    throw new Error("credentialId is required");
  }
  if (!reminder?.credentialType) {
    throw new Error("credentialType is required");
  }

  // TODO: Replace this acknowledgement with the announcements service call
  // once targeted announcement delivery is available.
  await Promise.resolve();

  return {
    queued: true,
    notificationId: `reverification_${reminder.mentorId}_${reminder.credentialId}_${Date.now()}`,
    queuedAt: new Date().toISOString(),
  };
}
