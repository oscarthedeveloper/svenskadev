import Link from 'next/link';
import StudyFrame from '@/components/StudyFrame';
import LoginForm from '@/components/admin/LoginForm';
import RunicEditorialAdmin from '@/components/admin/RunicEditorialAdmin';
import { getAdminSession } from '@/lib/session';
import { HAS_SUPABASE } from '@/lib/supabase/config';
import { getDatabaseSetup } from '@/lib/supabase/setup';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { RUNIC_PILOT_INSCRIPTIONS } from '@/lib/runor/pilot-data';
import type { EditorialDraftItem, RunicAuditLogEntry } from '@/lib/runor/editorial';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Administration · Runsidan (E34)',
  description: 'Redaktionellt arbetsflöde, granskningskö och ändringshistorik för runmaterialet.',
  robots: { index: false, follow: false },
};

export default async function RunicAdminPage() {
  const [{ isAdmin, username }, setup] = await Promise.all([
    getAdminSession(),
    getDatabaseSetup(),
  ]);

  let drafts: EditorialDraftItem[] = [];
  let auditLog: RunicAuditLogEntry[] = [];

  if (isAdmin && HAS_SUPABASE) {
    try {
      const supabase = await createSupabaseServerClient();

      const { data: dbDrafts } = await supabase
        .from('svenska_runor_drafts')
        .select('slug, signum, revision, dirty, manual_curation, status, assigned_reviewer, curation_notes, rejection_reason, updated_at')
        .order('signum', { ascending: true });

      if (dbDrafts && dbDrafts.length > 0) {
        drafts = dbDrafts.map((d) => ({
          slug: d.slug,
          signum: d.signum,
          status: (d.status || 'kandidat') as EditorialDraftItem['status'],
          revision: d.revision || 1,
          dirty: Boolean(d.dirty),
          manualCuration: Boolean(d.manual_curation),
          assignedReviewer: d.assigned_reviewer || null,
          curationNotes: d.curation_notes || null,
          rejectionReason: d.rejection_reason || null,
          updatedAt: d.updated_at || new Date().toISOString(),
        }));
      }

      const { data: dbLogs } = await supabase
        .from('svenska_runor_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (dbLogs) {
        auditLog = dbLogs.map((l) => ({
          id: l.id,
          slug: l.slug,
          signum: l.signum,
          action: l.action,
          actor: l.actor,
          reason: l.reason,
          previousState: l.previous_state,
          newState: l.new_state,
          createdAt: l.created_at,
        }));
      }
    } catch {
      // Fallback
    }
  }

  // Om databasen inte har initierats än, använd piloturvalet som standardkö
  if (drafts.length === 0) {
    drafts = RUNIC_PILOT_INSCRIPTIONS.map((item, idx) => ({
      slug: item.canonicalSlug,
      signum: item.canonicalSignum,
      status: idx < 12 ? 'godkand_for_publicering' : idx < 17 ? 'under_granskning' : 'kandidat',
      revision: 1,
      dirty: false,
      manualCuration: true,
      assignedReviewer: 'Antigravity Runor Curator (E08/E09)',
      curationNotes: item.editorialNotes || null,
      rejectionReason: null,
      updatedAt: item.reviewedAt || new Date().toISOString(),
    }));
  }

  return (
    <StudyFrame title="Administration · Runsidan">
      <div className="admin-stage thesis-admin-stage" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        <section className="admin-card thesis-admin-card" aria-labelledby="runor-admin-title">
          <div className="admin-card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="eyebrow" style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, color: '#8b1e0f' }}>
              Redaktionellt arbetsflöde · Runsidan (E34)
            </span>
            <span
              className={`admin-status ${isAdmin ? 'connected' : ''}`}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                background: isAdmin ? '#c6f6d5' : '#edf2f7',
                color: isAdmin ? '#22543d' : '#4a5568',
              }}
            >
              {!HAS_SUPABASE
                ? 'Lokal utveckling (filfallback)'
                : isAdmin
                ? `Inloggad som ${username}`
                : 'Ej inloggad'}
            </span>
          </div>

          <h1 id="runor-admin-title" style={{ fontSize: '24px', margin: '0 0 0.5rem 0' }}>
            Runologiskt arbetsflöde & ändringshistorik
          </h1>
          <p style={{ fontSize: '14px', color: '#4a5568', margin: '0 0 1.5rem 0' }}>
            Hantera arbetsflödet för runinskrifter: <strong>kandidat → under granskning → godkänd för publicering</strong>.
            Alla manuella rättelser loggas med aktör, tidsstämpel och motivering i enlighet med Krav K12 och K13.
            Publik visning finns på <Link href="/runor">/runor ↗</Link>.
          </p>

          {!isAdmin ? (
            <LoginForm />
          ) : (
            <RunicEditorialAdmin
              initialDrafts={drafts}
              initialAuditLog={auditLog}
              adminUsername={username || 'Redaktör'}
            />
          )}
        </section>
      </div>
    </StudyFrame>
  );
}
