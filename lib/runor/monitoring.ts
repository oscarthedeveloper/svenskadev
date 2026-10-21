/**
 * Övervakning, felloggning och återställningskontroll för Runsidan (E39).
 * Särskiljer källkritiska anomalier (källfel) från infrastrukturella haverier (systemfel),
 * samt definierar verifierbara larmgränser och kontroller efter rollback.
 */

import type { RunicInscription } from './types.ts';

export type RunicEventCategory = 'kallfel' | 'systemfel' | 'audit' | 'prestanda';
export type RunicSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface RunicLogEvent {
  id: string;
  timestamp: string;
  category: RunicEventCategory;
  severity: RunicSeverity;
  message: string;
  context?: {
    slug?: string;
    signum?: string;
    datasetVersion?: string;
    statusCode?: number;
    errorName?: string;
    durationMs?: number;
  };
}

/**
 * Larmgränser och driftsättningsmål enligt Avsnitt 10 och E39.
 */
export const ALERT_THRESHOLDS = {
  maxRollbackDurationMinutes: 30, // Godkännandekrav: under 30 minuter
  targetRollbackDurationSeconds: 60, // Internt mål: under 1 minut
  maxHttp5xxErrorRatePercent: 0.1, // Max 0.1 % serverfel
  maxLcpLatencySeconds: 2.5, // LCP mobilprofil
  maxP95LatencyMs: 1500, // API- och detaljlatens
  maxMemoryGrowthMbPerCycle: 50, // Minneskurva
} as const;

/**
 * Klassificerar en händelse för att strikt särskilja källfel från systemfel.
 * Källfel (t.ex. förlorad sten, okänd datering, alternativ tolkning) är normala
 * vetenskapliga osäkerheter och ska ALDRIG utlösa driftlarm.
 */
export function classifyRunicEvent(event: Partial<RunicLogEvent>): {
  category: RunicEventCategory;
  severity: RunicSeverity;
  requiresOpsAlert: boolean;
} {
  const msg = (event.message || '').toLowerCase();
  const errName = (event.context?.errorName || '').toLowerCase();
  const statusCode = event.context?.statusCode;

  // 1. Systemfel som kräver driftlarm (HTTP 5xx, databasbortfall, korrupt JSON)
  if (
    statusCode && statusCode >= 500 ||
    errName.includes('postgres') ||
    errName.includes('supabase') ||
    errName.includes('syntaxerror') ||
    msg.includes('databas') ||
    msg.includes('krasch') ||
    msg.includes('memory')
  ) {
    return {
      category: 'systemfel',
      severity: statusCode && statusCode >= 500 ? 'critical' : 'error',
      requiresOpsAlert: true,
    };
  }

  // 2. Källfel / vetenskapliga osäkerheter (aldrig larm till drift)
  if (
    msg.includes('förlorad') ||
    msg.includes('sockencentrum') ||
    msg.includes('okänd datering') ||
    msg.includes('osäker läsning') ||
    msg.includes('ej-avbildad') ||
    msg.includes('alternativ tolkning')
  ) {
    return {
      category: 'kallfel',
      severity: 'info',
      requiresOpsAlert: false,
    };
  }

  // 3. Revisions- och publiceringsaudit
  if (msg.includes('publicering') || msg.includes('rollback') || msg.includes('revision')) {
    return {
      category: 'audit',
      severity: 'info',
      requiresOpsAlert: false,
    };
  }

  return {
    category: event.category || 'systemfel',
    severity: event.severity || 'warning',
    requiresOpsAlert: event.severity === 'error' || event.severity === 'critical',
  };
}

export interface RollbackVerificationResult {
  passed: boolean;
  totalVerified: number;
  brokenLinksCount: number;
  brokenLinks: Array<{ slug: string; signum: string; issue: string }>;
  verifiedDatasetVersion: string;
}

/**
 * Verifierar länk- och källintegritet efter en återställning (rollback).
 * Garanterar att alla källhänvisningar till SRI-faksimil och Samnordisk är intakta.
 */
export function verifyPostRollbackCorpus(
  inscriptions: RunicInscription[],
  expectedVersion: string = '2026.1-pilot'
): RollbackVerificationResult {
  const brokenLinks: Array<{ slug: string; signum: string; issue: string }> = [];

  for (const item of inscriptions) {
    // 1. Kanonisk slug och signum
    if (!item.canonicalSlug || !item.canonicalSignum) {
      brokenLinks.push({
        slug: item.canonicalSlug || 'okänd',
        signum: item.canonicalSignum || 'okänt',
        issue: 'Saknar kanoniskt signum eller slug',
      });
    }

    // 2. Källhänvisning till SRI
    if (
      !item.source.sriVolumeTitle ||
      !item.source.printedPageStart ||
      item.source.printedPageStart <= 0
    ) {
      brokenLinks.push({
        slug: item.canonicalSlug,
        signum: item.canonicalSignum,
        issue: 'Ogiltigt källställe i Sveriges runinskrifter',
      });
    }

    // 3. Faksimillänk eller sidreferens
    if (!item.source.pdfPageStart || item.source.pdfPageStart <= 0) {
      brokenLinks.push({
        slug: item.canonicalSlug,
        signum: item.canonicalSignum,
        issue: 'Saknar digital PDF-faksimilreferens',
      });
    }

    // 4. Samnordisk UUID
    if (!item.source.externalUris.samnordiskUuid) {
      brokenLinks.push({
        slug: item.canonicalSlug,
        signum: item.canonicalSignum,
        issue: 'Saknar extern Samnordisk UUID-koppling',
      });
    }
  }

  return {
    passed: brokenLinks.length === 0,
    totalVerified: inscriptions.length,
    brokenLinksCount: brokenLinks.length,
    brokenLinks,
    verifiedDatasetVersion: expectedVersion,
  };
}
