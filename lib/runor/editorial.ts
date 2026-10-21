/**
 * Redaktionellt arbetsflöde, granskningsregler och ändringshistorik (E34).
 * Implementerar kandidat -> under_granskning -> godkand_for_publicering / avvisad.
 */

export type EditorialStatus =
  | 'kandidat'
  | 'under_granskning'
  | 'godkand_for_publicering'
  | 'avvisad';

export interface RunicAuditLogEntry {
  id: string;
  slug: string;
  signum: string;
  action: 'status_change' | 'field_update' | 'rollback' | 'import_conflict' | 'published';
  actor: string;
  reason: string;
  previousState: Record<string, unknown> | null;
  newState: Record<string, unknown> | null;
  createdAt: string;
}

export interface EditorialDraftItem {
  slug: string;
  signum: string;
  status: EditorialStatus;
  revision: number;
  dirty: boolean;
  manualCuration: boolean;
  assignedReviewer: string | null;
  curationNotes: string | null;
  rejectionReason: string | null;
  updatedAt: string;
}

/**
 * Tillåtna statusövergångar enligt det redaktionella regelverket.
 * Förhindrar ogiltiga hopp (t.ex. att en avvisad post publiceras direkt utan ny granskning).
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<EditorialStatus, EditorialStatus[]> = {
  kandidat: ['under_granskning', 'avvisad'],
  under_granskning: ['godkand_for_publicering', 'avvisad', 'kandidat'],
  godkand_for_publicering: ['under_granskning', 'kandidat'], // Kan återkallas för komplettering
  avvisad: ['kandidat'], // Måste återstartas som kandidat före ny granskning
};

/**
 * Kontrollerar om en statusövergång är tillåten.
 */
export function isValidStatusTransition(
  fromStatus: EditorialStatus,
  toStatus: EditorialStatus
): boolean {
  if (fromStatus === toStatus) return true;
  const allowed = ALLOWED_STATUS_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

/**
 * Granskningsregler för publicering:
 * En post får ALDRIG sättas till 'godkand_for_publicering' utan att:
 * 1. Granskare är tilldelad och registrerad (ej anonym).
 * 2. Skäl/motivering är angiven.
 * 3. Källhänvisning finns dokumenterad.
 */
export function validateApprovalForPublication(draft: {
  assignedReviewer?: string | null;
  reason?: string;
  hasSourceCitation?: boolean;
}): { approved: boolean; error?: string } {
  if (!draft.assignedReviewer || draft.assignedReviewer.trim().length === 0) {
    return {
      approved: false,
      error: 'En specifik granskare måste vara registrerad för att godkänna en post.',
    };
  }

  if (!draft.reason || draft.reason.trim().length < 5) {
    return {
      approved: false,
      error: 'En redaktionell motivering på minst 5 tecken krävs vid godkännande.',
    };
  }

  if (draft.hasSourceCitation === false) {
    return {
      approved: false,
      error: 'Källhänvisning till Sveriges runinskrifter saknas eller är ofullständig.',
    };
  }

  return { approved: true };
}

/**
 * Skapar ett formaterat revisionslogg-objekt vid fältändringar eller återställningar.
 */
export function createAuditLogRecord(params: {
  slug: string;
  signum: string;
  action: RunicAuditLogEntry['action'];
  actor: string;
  reason: string;
  previousState: Record<string, unknown> | null;
  newState: Record<string, unknown> | null;
}): Omit<RunicAuditLogEntry, 'id' | 'createdAt'> {
  if (!params.reason || params.reason.trim().length === 0) {
    throw new Error('Ändringsorsak (reason) är obligatorisk för alla redaktionella ändringar.');
  }

  return {
    slug: params.slug,
    signum: params.signum,
    action: params.action,
    actor: params.actor,
    reason: params.reason.trim(),
    previousState: params.previousState,
    newState: params.newState,
  };
}
