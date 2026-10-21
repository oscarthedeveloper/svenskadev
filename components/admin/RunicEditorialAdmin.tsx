'use client';

import React, { useState } from 'react';
import type { EditorialStatus, RunicAuditLogEntry, EditorialDraftItem } from '@/lib/runor/editorial';
import { ALLOWED_STATUS_TRANSITIONS, isValidStatusTransition } from '@/lib/runor/editorial';

interface Props {
  initialDrafts: EditorialDraftItem[];
  initialAuditLog: RunicAuditLogEntry[];
  adminUsername: string;
}

export default function RunicEditorialAdmin({
  initialDrafts,
  initialAuditLog,
  adminUsername,
}: Props) {
  const [drafts, setDrafts] = useState<EditorialDraftItem[]>(initialDrafts);
  const [auditLog, setAuditLog] = useState<RunicAuditLogEntry[]>(initialAuditLog);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedDraftSlug, setSelectedDraftSlug] = useState<string | null>(null);
  const [statusReason, setStatusReason] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const selectedDraft = drafts.find((d) => d.slug === selectedDraftSlug);

  const filteredDrafts = drafts.filter((d) => {
    if (selectedStatusFilter === 'all') return true;
    return d.status === selectedStatusFilter;
  });

  const countByStatus = {
    kandidat: drafts.filter((d) => d.status === 'kandidat').length,
    under_granskning: drafts.filter((d) => d.status === 'under_granskning').length,
    godkand_for_publicering: drafts.filter((d) => d.status === 'godkand_for_publicering').length,
    avvisad: drafts.filter((d) => d.status === 'avvisad').length,
  };

  const handleStatusChange = (newStatus: EditorialStatus) => {
    if (!selectedDraft) return;

    if (!isValidStatusTransition(selectedDraft.status, newStatus)) {
      alert(`Övergång från ${selectedDraft.status} till ${newStatus} är inte tillåten enligt arbetsflödesreglerna.`);
      return;
    }

    if (!statusReason.trim()) {
      alert('En redaktionell motivering (orsak) måste anges för att ändra status.');
      return;
    }

    setIsUpdating(true);
    // Uppdatera klienttillstånd
    const updatedDrafts = drafts.map((d) => {
      if (d.slug === selectedDraft.slug) {
        return {
          ...d,
          status: newStatus,
          assignedReviewer: d.assignedReviewer || adminUsername,
          updatedAt: new Date().toISOString(),
        };
      }
      return d;
    });

    const newAuditEntry: RunicAuditLogEntry = {
      id: `audit-${Date.now()}`,
      slug: selectedDraft.slug,
      signum: selectedDraft.signum,
      action: 'status_change',
      actor: adminUsername,
      reason: statusReason.trim(),
      previousState: { status: selectedDraft.status },
      newState: { status: newStatus },
      createdAt: new Date().toISOString(),
    };

    setDrafts(updatedDrafts);
    setAuditLog([newAuditEntry, ...auditLog]);
    setIsUpdating(false);
    setStatusReason('');
    setNotification(`Status för ${selectedDraft.signum} uppdaterades till "${newStatus}".`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Notis */}
      {notification && (
        <div
          role="status"
          style={{
            padding: '10px 16px',
            background: '#c6f6d5',
            color: '#22543d',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          ✓ {notification}
        </div>
      )}

      {/* Sammanfattningskort med räknare */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        <button
          type="button"
          onClick={() => setSelectedStatusFilter('all')}
          style={{
            padding: '1rem',
            borderRadius: '6px',
            border: selectedStatusFilter === 'all' ? '2px solid #2b6cb0' : '1px solid #e2e8f0',
            background: selectedStatusFilter === 'all' ? '#ebf8ff' : '#fff',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#718096', fontWeight: 600 }}>Alla poster</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#2d3748', marginTop: '4px' }}>{drafts.length}</div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusFilter('kandidat')}
          style={{
            padding: '1rem',
            borderRadius: '6px',
            border: selectedStatusFilter === 'kandidat' ? '2px solid #dd6b20' : '1px solid #e2e8f0',
            background: selectedStatusFilter === 'kandidat' ? '#fffaf0' : '#fff',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#dd6b20', fontWeight: 600 }}>Kandidater</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#c05621', marginTop: '4px' }}>{countByStatus.kandidat}</div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusFilter('under_granskning')}
          style={{
            padding: '1rem',
            borderRadius: '6px',
            border: selectedStatusFilter === 'under_granskning' ? '2px solid #3182ce' : '1px solid #e2e8f0',
            background: selectedStatusFilter === 'under_granskning' ? '#ebf8ff' : '#fff',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#3182ce', fontWeight: 600 }}>Under granskning</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#2b6cb0', marginTop: '4px' }}>{countByStatus.under_granskning}</div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusFilter('godkand_for_publicering')}
          style={{
            padding: '1rem',
            borderRadius: '6px',
            border: selectedStatusFilter === 'godkand_for_publicering' ? '2px solid #38a169' : '1px solid #e2e8f0',
            background: selectedStatusFilter === 'godkand_for_publicering' ? '#f0fff4' : '#fff',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#38a169', fontWeight: 600 }}>Godkända för release</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#276749', marginTop: '4px' }}>{countByStatus.godkand_for_publicering}</div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusFilter('avvisad')}
          style={{
            padding: '1rem',
            borderRadius: '6px',
            border: selectedStatusFilter === 'avvisad' ? '2px solid #e53e3e' : '1px solid #e2e8f0',
            background: selectedStatusFilter === 'avvisad' ? '#fff5f5' : '#fff',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#e53e3e', fontWeight: 600 }}>Avvisade</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#9b2c2c', marginTop: '4px' }}>{countByStatus.avvisad}</div>
        </button>
      </div>

      {/* Tvåspaltslayout: Granskningskö vs Detalj & Historik */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.2fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Vänster: Kö med poster */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', background: '#f7fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 600, fontSize: '14px' }}>
            Granskningskö ({filteredDrafts.length} poster)
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '600px', overflowY: 'auto' }}>
            {filteredDrafts.map((draft) => {
              const isSelected = draft.slug === selectedDraftSlug;
              return (
                <li
                  key={draft.slug}
                  onClick={() => setSelectedDraftSlug(draft.slug)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #edf2f7',
                    background: isSelected ? '#ebf8ff' : '#fff',
                    cursor: 'pointer',
                    transition: 'background 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: '14px', color: '#2d3748' }}>{draft.signum}</strong>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        background:
                          draft.status === 'godkand_for_publicering'
                            ? '#c6f6d5'
                            : draft.status === 'under_granskning'
                            ? '#bee3f8'
                            : draft.status === 'avvisad'
                            ? '#fed7d7'
                            : '#feebc8',
                        color:
                          draft.status === 'godkand_for_publicering'
                            ? '#22543d'
                            : draft.status === 'under_granskning'
                            ? '#2a4365'
                            : draft.status === 'avvisad'
                            ? '#742a2a'
                            : '#744210',
                      }}
                    >
                      {draft.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>
                    Rev {draft.revision} · {draft.manualCuration ? '✏️ Manuell rättelse' : 'Råimport'} · Granskare: {draft.assignedReviewer || 'Ingen tilldelad'}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Höger: Detaljredigering och revisionshistorik */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {selectedDraft ? (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>
                  {selectedDraft.signum} ({selectedDraft.slug})
                </h3>
                <a
                  href={`/runor/${selectedDraft.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '12px', color: '#2b6cb0', textDecoration: 'none', fontWeight: 600 }}
                >
                  Förhandsgranska publik sida ↗
                </a>
              </div>

              <div style={{ fontSize: '12px', color: '#4a5568', marginBottom: '1rem' }}>
                <div><strong>Nuvarande status:</strong> {selectedDraft.status}</div>
                <div><strong>Revision:</strong> {selectedDraft.revision}</div>
                <div><strong>Tilldelad granskare:</strong> {selectedDraft.assignedReviewer || 'Ingen'}</div>
                <div><strong>Senast uppdaterad:</strong> {new Date(selectedDraft.updatedAt).toLocaleString('sv-SE')}</div>
              </div>

              {/* Statusändringskontroller */}
              <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '13px', textTransform: 'uppercase', color: '#4a5568' }}>
                  Ändra redaktionell status (E34)
                </h4>

                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Motivering / Skäl (obligatorisk vid statusändring):
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Ange sakgranskningsmotivering, t.ex. 'Korrigerat läsning av rad 2 mot SRI bd 13 s. 72'..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '12px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e0',
                    marginBottom: '0.75rem',
                  }}
                />

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {ALLOWED_STATUS_TRANSITIONS[selectedDraft.status]?.map((nextStatus) => (
                    <button
                      key={nextStatus}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(nextStatus)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid #cbd5e0',
                        cursor: 'pointer',
                        background:
                          nextStatus === 'godkand_for_publicering'
                            ? '#276749'
                            : nextStatus === 'under_granskning'
                            ? '#2b6cb0'
                            : nextStatus === 'avvisad'
                            ? '#9b2c2c'
                            : '#4a5568',
                        color: '#fff',
                      }}
                    >
                      Flytta till: {nextStatus.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', background: '#f7fafc', border: '1px dashed #cbd5e0', borderRadius: '6px', textAlign: 'center', color: '#718096', fontSize: '13px' }}>
              Välj en inskrift i granskningskön till vänster för att granska och ändra status.
            </div>
          )}

          {/* Ändringshistorik (Audit Log) */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1rem', background: '#f7fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 600, fontSize: '14px' }}>
              Revisionslogg & Ändringshistorik ({auditLog.length} händelser)
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '350px', overflowY: 'auto' }}>
              {auditLog.map((log) => (
                <li
                  key={log.id}
                  style={{
                    padding: '0.6rem 1rem',
                    borderBottom: '1px solid #edf2f7',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{log.signum}</strong>
                    <span style={{ color: '#718096', fontSize: '11px' }}>
                      {new Date(log.createdAt).toLocaleString('sv-SE')}
                    </span>
                  </div>
                  <div style={{ marginTop: '2px' }}>
                    <span style={{ fontWeight: 600, color: '#2b6cb0' }}>{log.action}</span> av <em>{log.actor}</em>: {log.reason}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
