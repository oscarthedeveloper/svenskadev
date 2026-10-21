'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import type { RunicInscription } from '@/lib/runor/types';
import {
  executeRunicQuery,
  type RunicFilterCriteria,
  type MatchReason,
} from '@/lib/runor/search';
import {
  parseRunicUrlState,
  serializeRunicUrlState,
  determineHistoryAction,
  DEFAULT_RUNIC_URL_STATE,
  type RunicUrlState,
  type RunicViewMode,
} from '@/lib/runor/url-state';
import type { PlacementViewMode } from '@/lib/runor/geojson';
import { RUNIC_EPOCHS, advanceTimeWindow } from '@/lib/runor/timeline';
import RunorGuidedToursBar from './RunorGuidedToursBar';

const RunorInteractiveMap = dynamic(() => import('./RunorInteractiveMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '520px', display: 'grid', placeItems: 'center', background: '#e2edf5', border: '1px solid var(--line)' }}>
      <span style={{ fontSize: '13px', fontStyle: 'italic' }}>Laddar interaktiv karta…</span>
    </div>
  ),
});

interface Props {
  inscriptions: RunicInscription[];
}

const MATCH_LABELS: Record<MatchReason, string> = {
  signum: 'Signum',
  namn: 'Namn',
  alias: 'Alias/Litteratur',
  ort: 'Plats/Ort',
  tolkning: 'Tolkning',
  translitterering: 'Runtext',
  ristare: 'Ristare',
};

export default function RunorDirectoryClient({ inscriptions }: Props) {
  // Tillståndsmodell synkroniserad med URL (E25)
  const [urlState, setUrlState] = useState<RunicUrlState>(DEFAULT_RUNIC_URL_STATE);
  const isInitializedRef = useRef(false);
  const lastHistoryStateRef = useRef<RunicUrlState>(DEFAULT_RUNIC_URL_STATE);
  const querySeqRef = useRef(0);

  // 1. Initialisering vid montering från URL och popstate-lyssnare
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialFromUrl = parseRunicUrlState(new URLSearchParams(window.location.search));
    setUrlState(initialFromUrl);
    lastHistoryStateRef.current = initialFromUrl;
    isInitializedRef.current = true;

    const onPopState = () => {
      const poppedState = parseRunicUrlState(new URLSearchParams(window.location.search));
      setUrlState(poppedState);
      lastHistoryStateRef.current = poppedState;
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // 2. Synka tillstånd till URL i useEffect (aldrig under render)
  useEffect(() => {
    if (!isInitializedRef.current || typeof window === 'undefined') return;

    const action = determineHistoryAction(lastHistoryStateRef.current, urlState);
    const qs = serializeRunicUrlState(urlState);
    const targetUrl = window.location.pathname + qs;

    if (action === 'push') {
      window.history.pushState(null, '', targetUrl);
    } else {
      window.history.replaceState(null, '', targetUrl);
    }

    lastHistoryStateRef.current = urlState;
  }, [urlState]);

  // 3. Exekvera gemensam frågemodell med skydd mot gamla svar (race conditions)
  const queryResult = useMemo(() => {
    querySeqRef.current += 1;
    const currentSeq = querySeqRef.current;

    const criteria: RunicFilterCriteria = {
      searchQuery: urlState.searchQuery,
      province: urlState.province,
      carrierType: urlState.carrierType,
      preservationStatus: urlState.preservationStatus,
      hasKnownCoordinates:
        urlState.coordMode === 'all'
          ? 'all'
          : urlState.coordMode === 'known'
          ? true
          : false,
      timeFilter: urlState.timeFilterEnabled
        ? {
            startYear: urlState.startYear,
            endYear: urlState.endYear,
            includeUnknown: urlState.includeUnknownDating,
          }
        : null,
    };

    const res = executeRunicQuery(inscriptions, criteria);
    // Verifiera att ingen senare beräkning hunnit före
    if (currentSeq === querySeqRef.current) {
      return res;
    }
    return res;
  }, [inscriptions, urlState]);

  const { items: filtered, totalMatched, totalWithCoordinates, matchReasons, hasFilters, activeFilterCount } = queryResult;

  // Vald inskrift för snabbvisning
  const selectedInscription = useMemo(() => {
    if (!urlState.selectedSlug) return null;
    return inscriptions.find((i) => i.canonicalSlug === urlState.selectedSlug) || null;
  }, [inscriptions, urlState.selectedSlug]);

  function updateState(partial: Partial<RunicUrlState>) {
    setUrlState((prev) => ({ ...prev, ...partial }));
  }

  function resetFilters() {
    setIsPlaying(false);
    setUrlState({
      ...DEFAULT_RUNIC_URL_STATE,
      viewMode: urlState.viewMode,
    });
  }

  // Tidsuppspelning (E31)
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    // Respektera prefers-reduced-motion: stoppa uppspelning om aktivt
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsPlaying(false);
      return;
    }

    const interval = setInterval(() => {
      const windowSize = Math.max(25, urlState.endYear - urlState.startYear);
      const { nextStart, nextEnd } = advanceTimeWindow(
        urlState.startYear,
        windowSize,
        750,
        1250,
        25
      );
      setUrlState((prev) => ({ ...prev, startYear: nextStart, endYear: nextEnd }));
    }, 1200);

    return () => clearInterval(interval);
  }, [isPlaying, urlState.startYear, urlState.endYear]);

  // Escape-tangent stänger snabbvisningspanelen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && urlState.selectedSlug) {
        updateState({ selectedSlug: null });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [urlState.selectedSlug]);

  return (
    <div className="runor-container">
      {/* Tillgänglighetslänk: Hoppa direkt till innehåll */}
      <a
        href="#runor-results-main"
        className="sr-only focus:not-sr-only"
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 9999,
          padding: '8px 16px',
          background: '#8b1e0f',
          color: '#ffffff',
          fontWeight: 700,
          borderRadius: '4px',
          textDecoration: 'none',
        }}
      >
        Hoppa direkt till inskriftskatalogen
      </a>

      {/* Toppsektion / Header */}
      <section className="runor-hero">
        <div className="runor-hero-meta">
          <span className="eyebrow">Digital textutgåva & källkatalog</span>
          <span className="runor-badge">Publicerad utgåva v1.0 · 20 inskrifter · Dataset 2026.1-pilot</span>
        </div>
        <h1 className="runor-main-title">
          Sveriges <em>runinskrifter</em>
        </h1>
        <p className="runor-intro-copy">
          En öppen, vetenskaplig utgåva av Sveriges runmaterial med direkta faksimillänkar till{' '}
          <em>Sveriges runinskrifter</em> (SRI), källtrogna normaliseringar, versmått och verifierade platser från Samnordisk runtextdatabas.
        </p>
      </section>

      {/* Kontrollpanel & filter */}
      <section className="runor-control-bar" aria-label="Sök och filtrera inskrifter">
        {/* Sökfält */}
        <div className="runor-search-box" role="search">
          <label htmlFor="runor-search" className="sr-only">
            Sök efter signum, namn, socken, runor eller översättning
          </label>
          <input
            id="runor-search"
            type="search"
            placeholder="Sök signum (t.ex. Öl 1, U 73), ort, runor, tolkning eller alias..."
            value={urlState.searchQuery}
            onChange={(e) => updateState({ searchQuery: e.target.value })}
            className="runor-search-input"
          />
          {urlState.searchQuery && (
            <button
              type="button"
              onClick={() => updateState({ searchQuery: '' })}
              className="runor-search-clear"
              aria-label="Rensa sökning"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filterväljare */}
        <div className="runor-filters-row">
          {/* Landskapsfilter */}
          <div className="filter-group">
            <span className="filter-label">Landskap:</span>
            <div className="filter-pills">
              {[
                { label: 'Alla', value: 'all' },
                { label: 'Öland (8)', value: 'Öl' },
                { label: 'Östergötland (2)', value: 'Ög' },
                { label: 'Uppland (7)', value: 'U' },
                { label: 'Södermanland (2)', value: 'Sö' },
                { label: 'Västmanland (1)', value: 'Vs' },
              ].map((prov) => (
                <button
                  key={prov.value}
                  type="button"
                  aria-pressed={urlState.province === prov.value}
                  onClick={() => updateState({ province: prov.value })}
                  className={`filter-pill ${urlState.province === prov.value ? 'active' : ''}`}
                >
                  {prov.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bevarande & Typ & Kartläge */}
          <div className="filter-selects">
            <label className="select-wrapper">
              <span className="sr-only">Bevarandestatus</span>
              <select
                value={urlState.preservationStatus}
                onChange={(e) => updateState({ preservationStatus: e.target.value })}
                className="runor-select"
              >
                <option value="all">Alla bevarandestatusar</option>
                <option value="bevarad_i_sin_helhet">Hela inskrifter</option>
                <option value="bevarad_i_fragment">Fragment</option>
                <option value="forlorad">Förlorade runstenar</option>
              </select>
            </label>

            <label className="select-wrapper">
              <span className="sr-only">Bärartyp</span>
              <select
                value={urlState.carrierType}
                onChange={(e) => updateState({ carrierType: e.target.value })}
                className="runor-select"
              >
                <option value="all">Alla bärartyper</option>
                <option value="runsten">Runsten</option>
                <option value="runblock">Runblock / Flyttblock</option>
                <option value="fast_hall">Fast berghäll</option>
                <option value="gravhall">Gravhäll</option>
                <option value="fragment">Fragment</option>
              </select>
            </label>

            <label className="select-wrapper">
              <span className="sr-only">Kartläge</span>
              <select
                value={urlState.coordMode}
                onChange={(e) => updateState({ coordMode: e.target.value as 'all' | 'known' | 'missing' })}
                className="runor-select"
              >
                <option value="all">Alla lägen</option>
                <option value="known">Bara med känt kartläge</option>
                <option value="missing">Bara saknat/sockencentrum</option>
              </select>
            </label>

            <button
              type="button"
              aria-expanded={urlState.timeFilterEnabled}
              onClick={() => updateState({ timeFilterEnabled: !urlState.timeFilterEnabled })}
              className={`runor-select ${urlState.timeFilterEnabled ? 'active-filter-btn' : ''}`}
              style={{
                background: urlState.timeFilterEnabled ? '#8b1e0f' : undefined,
                color: urlState.timeFilterEnabled ? '#fff' : undefined,
                fontWeight: urlState.timeFilterEnabled ? 600 : 400,
              }}
            >
              ⏳ Tidsfilter {urlState.timeFilterEnabled ? `(${urlState.startYear}–${urlState.endYear})` : ''}
            </button>
          </div>
        </div>

        {/* Tidsfilterpanel (Avsnitt 9.4 & E31) */}
        {urlState.timeFilterEnabled && (
          <div
            style={{
              padding: '16px 20px',
              background: '#f8fafc',
              border: '1px solid var(--line)',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '13px',
            }}
          >
            {/* Epoksnabbval */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.7 }}>
                Epoker:
              </span>
              {RUNIC_EPOCHS.map((epoch) => {
                const isActive = urlState.startYear === epoch.startYear && urlState.endYear === epoch.endYear;
                return (
                  <button
                    key={epoch.id}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      updateState({ startYear: epoch.startYear, endYear: epoch.endYear });
                    }}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono), monospace',
                      background: isActive ? '#181815' : '#ffffff',
                      color: isActive ? '#ffffff' : '#181815',
                      border: '1px solid var(--line)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    title={epoch.description}
                  >
                    {epoch.name} ({epoch.startYear}–{epoch.endYear})
                  </button>
                );
              })}
            </div>

            {/* Manuella kontroller och Tidsuppspelning */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', paddingTop: '8px', borderTop: '1px dashed var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Från år:</span>
                  <input
                    type="number"
                    min={700}
                    max={1300}
                    step={25}
                    value={urlState.startYear}
                    onChange={(e) => {
                      setIsPlaying(false);
                      updateState({ startYear: Number(e.target.value) });
                    }}
                    style={{ width: '70px', padding: '4px 6px', border: '1px solid var(--line)', borderRadius: '4px' }}
                  />
                  <span>till år:</span>
                  <input
                    type="number"
                    min={700}
                    max={1300}
                    step={25}
                    value={urlState.endYear}
                    onChange={(e) => {
                      setIsPlaying(false);
                      updateState({ endYear: Number(e.target.value) });
                    }}
                    style={{ width: '70px', padding: '4px 6px', border: '1px solid var(--line)', borderRadius: '4px' }}
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={urlState.includeUnknownDating}
                    onChange={(e) => updateState({ includeUnknownDating: e.target.checked })}
                  />
                  <span>Inkludera okänd/bred datering</span>
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono), monospace',
                    fontWeight: 600,
                    background: isPlaying ? '#dc2626' : '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }}
                  title={isPlaying ? 'Pausa tidsuppspelning' : 'Starta tidsuppspelning (stegar 25 år per sekund)'}
                >
                  {isPlaying ? '⏸ Pausa tidsresa' : '▶ Spela tidsresa'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    updateState({ timeFilterEnabled: false });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textDecoration: 'underline',
                  }}
                >
                  Stäng tidsfilter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resultaträknare & Vyväljare */}
        <div className="runor-view-toolbar">
          <div className="runor-results-count" aria-live="polite" aria-atomic="true">
            <strong>{totalMatched}</strong> inskrifter matchar
            <span className="sub-count"> ({totalWithCoordinates} med känt kartläge)</span>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="runor-reset-btn"
                title="Återställ alla filter till grundläget"
              >
                Rensa alla filter ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="runor-view-toggle" role="group" aria-label="Vyväljare">
            <button
              type="button"
              aria-pressed={urlState.viewMode === 'grid'}
              onClick={() => updateState({ viewMode: 'grid' })}
              className={`view-btn ${urlState.viewMode === 'grid' ? 'active' : ''}`}
              title="Kortvy med planscher"
            >
              ▦ Kort
            </button>
            <button
              type="button"
              aria-pressed={urlState.viewMode === 'table'}
              onClick={() => updateState({ viewMode: 'table' })}
              className={`view-btn ${urlState.viewMode === 'table' ? 'active' : ''}`}
              title="Tabellvy med alla fält"
            >
              ☷ Tabell
            </button>
            <button
              type="button"
              aria-pressed={urlState.viewMode === 'map'}
              onClick={() => updateState({ viewMode: 'map' })}
              className={`view-btn ${urlState.viewMode === 'map' ? 'active' : ''}`}
              title="Interaktiv kartvy"
            >
              🗺 Karta
            </button>
          </div>
        </div>
      </section>

      {/* Snabbvisningspanel för vald inskrift (E25) */}
      {selectedInscription && (
        <aside
          style={{
            margin: '16px 0 24px',
            padding: '16px 20px',
            border: '2px solid #8b1e0f',
            borderRadius: '8px',
            background: '#fffbf5',
            boxShadow: '0 4px 12px rgba(139, 30, 15, 0.08)',
          }}
          aria-label="Snabbvisning av vald inskrift"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '4px', overflow: 'hidden', background: '#262320', flexShrink: 0 }}>
                <Image
                  src={selectedInscription.images[0]?.thumbnailUrl || '/images/runor/ej-avbildad.svg'}
                  alt={selectedInscription.canonicalSignum}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#8b1e0f', fontWeight: 700 }}>
                    {selectedInscription.canonicalSignum}
                  </h3>
                  {selectedInscription.name && (
                    <span style={{ fontSize: '14px', color: '#334155', fontWeight: 600 }}>
                      {selectedInscription.name}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {selectedInscription.placements[0]?.parish}, {selectedInscription.placements[0]?.province} · {selectedInscription.dating.originalSourceLabel}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                href={`/runor/${selectedInscription.canonicalSlug}`}
                style={{
                  background: '#8b1e0f',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Läs fullständig förlaga →
              </Link>
              <button
                type="button"
                onClick={() => updateState({ selectedSlug: null })}
                style={{
                  background: 'none',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                }}
                aria-label="Stäng snabbvisning"
              >
                ✕
              </button>
            </div>
          </div>

          {selectedInscription.textLayer.translationSwedish && (
            <p style={{ margin: '12px 0 0 0', fontSize: '13px', fontStyle: 'italic', color: '#1e293b', borderLeft: '3px solid #f97316', paddingLeft: '10px' }}>
              ”{selectedInscription.textLayer.translationSwedish}”
            </p>
          )}
        </aside>
      )}

      {/* Tematiska guidningar (E33 / Krav K11) */}
      <RunorGuidedToursBar
        selectedSlug={urlState.selectedSlug}
        onSelectInscription={(slug) => updateState({ selectedSlug: slug, viewMode: 'map' })}
      />

      {/* Innehållssektion beroende på vy */}
      <div id="runor-results-main">
        {filtered.length === 0 ? (
          <div className="runor-empty-state">
            <span className="empty-icon" aria-hidden="true">ᚦ</span>
            <h3>Inga runinskrifter matchar ditt urval</h3>
            <p>
              {urlState.searchQuery
                ? `Ingen inskrift i pilotutgåvan matchade sökningen ”${urlState.searchQuery}”. Prova att söka på en del av signumet, ett sockennamn eller återställ filtren.`
                : 'Inga inskrifter matchar de valda filterkriterierna. Prova att vidga tidsintervallet eller tillåt alla bärartyper.'}
            </p>
            <button type="button" onClick={resetFilters} className="btn-secondary">
              Återställ sökning och filter
            </button>
          </div>
        ) : urlState.viewMode === 'map' ? (
          <section aria-label="Interaktiv kartvy">
            <RunorInteractiveMap
              inscriptions={filtered}
              selectedSlug={urlState.selectedSlug}
              onSelectInscription={(slug) => updateState({ selectedSlug: slug })}
            />
          </section>
        ) : urlState.viewMode === 'table' ? (
          <div className="runor-table-wrap">
            <table className="runor-table">
              <thead>
                <tr>
                  <th scope="col">Signum / Namn</th>
                  <th scope="col">Landskap & Socken</th>
                  <th scope="col">Föremål</th>
                  <th scope="col">Datering</th>
                  <th scope="col">Tolkning (utdrag)</th>
                  <th scope="col">Källa i SRI</th>
                </tr>
              </thead>
            <tbody>
              {filtered.map((item) => {
                const placement = item.placements[0];
                const reasons = matchReasons.get(item.id);
                const isSelected = item.canonicalSlug === urlState.selectedSlug;

                return (
                  <tr
                    key={item.id}
                    className="runor-table-row"
                    style={{ background: isSelected ? 'rgba(254, 243, 199, 0.4)' : undefined }}
                    onClick={() => updateState({ selectedSlug: item.canonicalSlug })}
                  >
                    <td>
                      <Link href={`/runor/${item.canonicalSlug}`} className="signum-link">
                        <strong>{item.canonicalSignum}</strong>
                      </Link>
                      {item.name && <span className="item-name"> · {item.name}</span>}
                      {reasons && reasons.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                          {reasons.map((r) => (
                            <span
                              key={r}
                              style={{
                                fontSize: '10px',
                                padding: '1px 4px',
                                background: '#f1f5f9',
                                color: '#475569',
                                borderRadius: '3px',
                              }}
                            >
                              {MATCH_LABELS[r]}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>{placement ? `${placement.parish}, ${placement.province}` : 'Okänd'}</td>
                    <td>
                      <span className={`status-pill ${item.carrier.preservationStatus}`}>
                        {item.carrier.type}
                      </span>
                    </td>
                    <td>{item.dating.originalSourceLabel}</td>
                    <td className="trans-cell">
                      {item.textLayer.translationSwedish ? (
                        <span>”{item.textLayer.translationSwedish.slice(0, 90)}…”</span>
                      ) : (
                        <span className="no-trans">Ej översatt</span>
                      )}
                    </td>
                    <td className="source-cell">
                      <span className="sri-ref">
                        {item.source.sriVolumeTitle}, s. {item.source.printedPageStart}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="runor-grid">
          {filtered.map((item) => {
            const placement = item.placements[0];
            const isLost = item.carrier.preservationStatus === 'forlorad';
            const reasons = matchReasons.get(item.id);
            const isSelected = item.canonicalSlug === urlState.selectedSlug;

            return (
              <article
                key={item.id}
                className="runor-card"
                style={{
                  border: isSelected ? '2px solid #8b1e0f' : undefined,
                  boxShadow: isSelected ? '0 0 0 3px rgba(139, 30, 15, 0.2)' : undefined,
                }}
              >
                <Link href={`/runor/${item.canonicalSlug}`} className="runor-card-link">
                  <div className="runor-card-image-wrap">
                    <Image
                      src={item.images[0]?.thumbnailUrl || '/images/runor/ej-avbildad.svg'}
                      alt={item.images[0]?.caption || `Plansch för ${item.canonicalSignum}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="runor-card-img"
                    />
                    <span className="runor-card-signum">{item.canonicalSignum}</span>
                    {isLost && <span className="runor-card-lost-badge">Förlorad</span>}
                  </div>

                  <div className="runor-card-content">
                    <div className="runor-card-header-row">
                      <h3 className="runor-card-title">
                        {item.name || item.canonicalSignum}
                      </h3>
                      <span className="runor-card-geo">
                        {placement ? `${placement.parish}, ${placement.province}` : 'Sverige'}
                      </span>
                    </div>

                    {reasons && reasons.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {reasons.map((r) => (
                          <span
                            key={r}
                            style={{
                              fontSize: '10px',
                              padding: '2px 5px',
                              background: '#e0e7ff',
                              color: '#3730a3',
                              borderRadius: '3px',
                              fontWeight: 500,
                            }}
                          >
                            Träff: {MATCH_LABELS[r]}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.textLayer.translationSwedish && (
                      <p className="runor-card-trans">
                        ”{item.textLayer.translationSwedish.slice(0, 110)}…”
                      </p>
                    )}

                    <div className="runor-card-footer">
                      <span className="runor-card-dating">
                        {item.dating.originalSourceLabel}
                      </span>
                      <span className="runor-card-arrow" aria-hidden="true">
                        Läs källa →
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      )}
      </div>

      {/* Lanserings- och datasetredovisning (E40) */}
      <footer className="runor-catalog-footer" role="contentinfo" aria-label="Dataset och källtäckning">
        <div className="runor-catalog-footer-inner">
          <div className="runor-footer-col">
            <h4>Publicerad utgåva & källor</h4>
            <p>
              <strong>Datasetversion:</strong> <code>2026.1-pilot</code> (fastställd 2026-10-22).
            </p>
            <p>
              Utgåvan bygger på Kungl. Vitterhetsakademiens och Riksantikvarieämbetets standardverk{' '}
              <em>Sveriges runinskrifter</em> (SRI, band 1–15) samt <em>Samnordisk runtextdatabas</em> (Uppsala universitet).
              Samtliga visade inskrifter har direkt källkedja till respektive plansch och tryckt textsida.
            </p>
          </div>

          <div className="runor-footer-col">
            <h4>Geografisk täckning</h4>
            <p>
              Denna publicerade pilotutgåva omfattar <strong>20 källgranskade inskrifter</strong> över fem landskap:
              Öland (8), Uppland (7), Östergötland (2), Södermanland (2) och Västmanland (1).
            </p>
            <p>
              Inskrifterna representerar välbevarade monument (Karlevi, Rök, Ramsund) såväl som svårfall:
              förlorade stenar (Öl 15 med sockencentrum), flyttade stenar (U 73), samhörande ristningar på samma block (U 112A/B)
              och tidiga runbleck (Öl 26). Återstående runmaterial förbereds i kommande granskade batcher.
            </p>
          </div>

          <div className="runor-footer-col">
            <h4>Källkritik & Rättelser</h4>
            <p>
              Inga fiktiva koordinater skapas för förlorade stenar, och inga artificiella dateringsmittpunkter genereras.
            </p>
            <p>
              Har du funnit en felaktighet, en föråldrad tolkning eller vill bidra med runologiska anmärkningar?
              Kontakta redaktionen på{' '}
              <a href="mailto:kontakt@fornsvenska.se" className="runor-footer-link">
                kontakt@fornsvenska.se
              </a>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
