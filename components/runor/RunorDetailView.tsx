'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { RunicInscription } from '@/lib/runor/types';
import { RUNIC_LINGUISTIC_BRIDGES } from '@/lib/runor/library';
import { getGuidedReadingForSignum } from '@/lib/runor/reading-segments';
import RunorReadingGuide from './RunorReadingGuide';

interface Props {
  inscription: RunicInscription;
  previousSlug?: string | null;
  nextSlug?: string | null;
}

export default function RunorDetailView({ inscription, previousSlug, nextSlug }: Props) {
  const item = inscription;
  const guidedReading = getGuidedReadingForSignum(item.canonicalSignum);
  const firstImg = item.images[0];
  const isLost = item.carrier.preservationStatus === 'forlorad';
  const isFragment = item.carrier.preservationStatus === 'bevarad_i_fragment';

  // Kontrollera om inskriften har flyttats (både fyndplats och nuvarande placering)
  const originalPlacement = item.placements.find(
    (p) => p.type === 'fyndplats' || p.type === 'ursprunglig_plats'
  );
  const currentPlacement = item.placements.find(
    (p) => p.type === 'nuvarande_placering'
  );
  const isRelocated = Boolean(
    originalPlacement &&
      currentPlacement &&
      originalPlacement.placeName !== currentPlacement.placeName
  );

  // Kontrollera om inskriften innehåller fornyrðislag eller versmått
  const isMetrical = Boolean(
    item.editorialNotes?.toLowerCase().includes('fornyrðislag') ||
      item.editorialNotes?.toLowerCase().includes('versmått') ||
      item.editorialNotes?.toLowerCase().includes('strof') ||
      item.canonicalSignum === 'Vs 24' ||
      item.canonicalSignum === 'Sö 179' ||
      item.canonicalSignum === 'Öl 1' ||
      item.canonicalSignum === 'Ög 136'
  );

  // Tillstånd för bildzoom/lightbox
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copiedCitation, setCopiedCitation] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
    setZoomLevel(1);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setZoomLevel(1);
  }, []);

  // Tangentbordslyssnare för ESC-stängning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isModalOpen, closeModal]);

  const handleCopyCitation = async () => {
    const citation = `${item.source.author} (${item.source.publicationYear}). ${item.source.sriVolumeTitle}. Sveriges runinskrifter, s. ${item.source.printedPageStart}${item.source.printedPageEnd ? `–${item.source.printedPageEnd}` : ''}. Signum: ${item.canonicalSignum}.`;
    try {
      await navigator.clipboard.writeText(citation);
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <article className="runor-detail-container">
      {/* Brödsmulor & Navigering */}
      <nav className="runor-detail-nav" aria-label="Brödsmulor">
        <div className="breadcrumbs">
          <Link href="/">svenska.dev</Link>
          <span aria-hidden="true">/</span>
          <Link href="/runor">Runor</Link>
          <span aria-hidden="true">/</span>
          <span className="current">{item.canonicalSignum}</span>
        </div>

        <div className="detail-prev-next">
          {previousSlug ? (
            <Link href={`/runor/${previousSlug}`} className="nav-arrow-link" title="Föregående inskrift">
              ← Föregående
            </Link>
          ) : (
            <span className="nav-arrow-disabled">← Föregående</span>
          )}
          <span className="nav-sep">·</span>
          {nextSlug ? (
            <Link href={`/runor/${nextSlug}`} className="nav-arrow-link" title="Nästa inskrift">
              Nästa →
            </Link>
          ) : (
            <span className="nav-arrow-disabled">Nästa →</span>
          )}
        </div>
      </nav>

      {/* Inskriftens Huvudrubrik */}
      <header className="runor-detail-header">
        <div className="detail-meta-top">
          <span className="detail-signum-badge">{item.canonicalSignum}</span>
          <span className="detail-province-badge">{item.placements[0]?.province || item.provinceCode}</span>
          <span className={`detail-status-badge status-${item.carrier.preservationStatus}`}>
            {isLost ? 'Förlorad inskrift' : isFragment ? 'Fragment' : 'Bevarad'}
          </span>
          {isMetrical && <span className="detail-metrical-badge">Versmått (Fornyrðislag)</span>}
          <span className="detail-review-badge">Granskad pilot v1.0</span>
        </div>

        <h1 className="detail-title">{item.name || item.canonicalSignum}</h1>

        {item.aliases && item.aliases.length > 0 && (
          <p className="detail-aliases">
            <strong>Kända alias & äldre källbeteckningar:</strong> {item.aliases.join(', ')}
          </p>
        )}
      </header>

      {/* Särskilda Svårfallsbanners (E26) */}
      {isLost && (
        <aside className="detail-callout-banner banner-lost" role="note" aria-label="Förlorad inskrift">
          <div className="banner-icon" aria-hidden="true">⚠️</div>
          <div className="banner-text">
            <strong>Förlorat källmaterial:</strong> Denna runinskrift är inte bevarad i dagsläget.
            Uppgifter, läsning och tolkning baseras på äldre antikvariska förlagor och avskrifter sammanställda i{' '}
            <em>{item.source.sriVolumeTitle}</em>.
            Angiven kartkoordinat representerar sockencentrum som approximativt sökläge — ingen artificiell exakt koordinat har påförts.
          </div>
        </aside>
      )}

      {isRelocated && (
        <aside className="detail-callout-banner banner-relocated" role="note" aria-label="Flyttad runsten">
          <div className="banner-icon" aria-hidden="true">📍</div>
          <div className="banner-text">
            <strong>Flyttad runsten:</strong> Runstenen har flyttats från sin ursprungliga fyndplats (
            <em>{originalPlacement?.placeName}, {originalPlacement?.parish}</em>) till sin nuvarande placering (
            <em>{currentPlacement?.placeName}, {currentPlacement?.parish}</em>). Båda lägena finns registrerade i databasen och kan granskas separat på kartan.
          </div>
        </aside>
      )}

      {/* Grid med Två Huvudkolumner: Textläsning vs Bild & Källa */}
      <div className="runor-detail-layout">
        {/* Vänsterkolumn: Tolkning och Textversioner */}
        <div className="detail-content-column">
          {/* 1. Huvudtolkning (Svensk källöversättning från SRI) */}
          <section className="detail-section translation-highlight-box">
            <h2 className="section-eyebrow">Auktoritativ svensk tolkning (SRI)</h2>
            <blockquote className="detail-quote">
              <p>{item.textLayer.translationSwedish || 'Ingen översättning registrerad i källan.'}</p>
            </blockquote>
            {item.editorialNotes && (
              <div className="editorial-note-box">
                <strong>Redaktionell not:</strong> {item.editorialNotes}
              </div>
            )}
          </section>

          {/* Stegad läsning och källplansch (E32 / Krav K11) */}
          {guidedReading && (
            <RunorReadingGuide guide={guidedReading} />
          )}

          {/* 2. Textlager och läsningar */}
          <section className="detail-section text-layers-section">
            <h2 className="section-heading">Källtext & Normaliseringar</h2>

            {/* Runor & Translitterering */}
            <div className="text-layer-card">
              <div className="layer-header">
                <h3>Translitterering (diplomatisk avskrift)</h3>
                <span className="layer-tag">Bokstavstrogen</span>
              </div>
              <pre className="layer-code">
                <code>{item.textLayer.readingTransliteration || 'Ingen translitterering tillgänglig'}</code>
              </pre>
              <p className="layer-help">
                Återger ristade runtecken bokstavstroget. Tecknet <code>×</code> eller <code>+</code> anger ordskiljetecken; hakparenteser <code>[…]</code> markerar skadade eller rekonstruerade partier.
              </p>
            </div>

            {/* Normaliserad Runsvenska */}
            {item.textLayer.normalizationRunicSwedish && (
              <div className="text-layer-card">
                <div className="layer-header">
                  <h3>Normalisering till runsvenska</h3>
                  <span className="layer-tag">Vikingatida standardspråk</span>
                </div>
                <p className="layer-text font-serif italic">
                  {item.textLayer.normalizationRunicSwedish}
                </p>
              </div>
            )}

            {/* Normaliserad Fornvästnordiska */}
            {item.textLayer.normalizationOldWestNorse && (
              <div className="text-layer-card">
                <div className="layer-header">
                  <h3>Normalisering till fornvästnordiska</h3>
                  <span className="layer-tag">Klassisk litterär form</span>
                </div>
                <p className="layer-text font-serif italic">
                  {item.textLayer.normalizationOldWestNorse}
                </p>
              </div>
            )}

            {/* Engelsk översättning */}
            {item.textLayer.translationEnglish && (
              <div className="text-layer-card">
                <div className="layer-header">
                  <h3>Engelsk översättning</h3>
                  <span className="layer-tag">International reference</span>
                </div>
                <p className="layer-text text-neutral-800">
                  {item.textLayer.translationEnglish}
                </p>
              </div>
            )}

            {/* Alternativa tolkningar (om sådana finns) */}
            {item.textLayer.alternativeInterpretations && item.textLayer.alternativeInterpretations.length > 0 && (
              <div className="text-layer-card alt-interpretations-card">
                <div className="layer-header">
                  <h3>Alternativa läsningar & forskningstolkningar</h3>
                  <span className="layer-tag">Forskningsdebatt</span>
                </div>
                <div className="alt-interpretations-list">
                  {item.textLayer.alternativeInterpretations.map((alt, idx) => (
                    <div key={idx} className="alt-interpretation-item">
                      <div className="alt-meta">
                        <strong>{alt.author}</strong> ({alt.year})
                      </div>
                      <p className="alt-text font-serif italic">”{alt.text}”</p>
                      {alt.note && <p className="alt-note">{alt.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 3. Datering och Ristare */}
          <section className="detail-section">
            <h2 className="section-heading">Tid, stil & ristarsignatur</h2>
            <div className="info-keyvalues">
              <div className="info-kv">
                <span className="info-key">Tidsperiod:</span>
                <span className="info-val">{item.dating.periodLabel}</span>
              </div>
              <div className="info-kv">
                <span className="info-key">Källans dateringsansats:</span>
                <span className="info-val">{item.dating.originalSourceLabel}</span>
              </div>
              {item.dating.earliestYear && item.dating.latestYear && (
                <div className="info-kv">
                  <span className="info-key">Strukturerat tidsintervall:</span>
                  <span className="info-val">
                    ca {item.dating.earliestYear}–{item.dating.latestYear} e.Kr.
                  </span>
                </div>
              )}
              {item.dating.datingMethod && (
                <div className="info-kv">
                  <span className="info-key">Dateringsmetod & stil:</span>
                  <span className="info-val">{item.dating.datingMethod}</span>
                </div>
              )}
              <div className="info-kv">
                <span className="info-key">Ristarsignatur:</span>
                <span className="info-val">
                  {item.textLayer.carverAttribution || (item.textLayer.isSigned ? 'Signerad i texten' : 'Osignerad inskrift')}
                </span>
              </div>
            </div>
          </section>

          {/* 4. Språkhistoriska korsreferenser till grammatik & artiklar (E28) */}
          {RUNIC_LINGUISTIC_BRIDGES.filter((b) => b.signum === item.canonicalSignum).length > 0 && (
            <section className="detail-section">
              <h2 className="section-heading">Språkhistoria & Grammatiska korsreferenser</h2>
              <div className="linguistic-bridges-list">
                {RUNIC_LINGUISTIC_BRIDGES.filter((b) => b.signum === item.canonicalSignum).map((bridge, idx) => (
                  <div key={idx} className="linguistic-bridge-card">
                    <h4 className="bridge-title">{bridge.topic}</h4>
                    <p className="bridge-desc">{bridge.description}</p>
                    <Link href={bridge.targetHref} className="bridge-link">
                      Fördjupa i {bridge.targetHref.startsWith('/sprakliv') ? 'Språkliv' : bridge.targetHref.startsWith('/grammatik') ? 'Grammatik' : 'Språkråd'} ↗
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Högerkolumn: Bild, Fysisk bärare & Geografi & Källhänvisning */}
        <div className="detail-sidebar-column">
          {/* 1. Bildvisning med zoomstöd */}
          <section className="detail-sidebar-box image-box">
            <div className="sidebar-box-header">
              <h3>Föremålsbild / Plansch</h3>
              <span className="license-tag">{firstImg?.license || 'Public Domain'}</span>
            </div>
            <div className="detail-image-wrapper">
              {firstImg ? (
                <button
                  type="button"
                  className="image-zoom-trigger"
                  onClick={openModal}
                  aria-label="Klicka för att zooma in på källplanschen"
                  title="Klicka för att granska i full storlek med zoom"
                >
                  <Image
                    src={firstImg.imageUrl}
                    alt={firstImg.caption || item.name || item.canonicalSignum}
                    width={600}
                    height={450}
                    className="detail-img"
                    priority
                    unoptimized
                  />
                  <span className="zoom-hint-badge" aria-hidden="true">🔍 Zooma plansch</span>
                </button>
              ) : (
                <div className="no-image-box">
                  <p><strong>Ingen bild bevarad</strong></p>
                  <p className="no-image-subtext">Detta förlorade objekt saknar fotografisk avbildning i Sveriges runinskrifter.</p>
                </div>
              )}
            </div>
            {firstImg && (
              <div className="image-caption-area">
                <p className="image-caption-text">{firstImg.caption}</p>
                <div className="image-attribution">
                  <span>Upphovsman: {firstImg.photographerOrArtist}</span>
                  {firstImg.year && <span> · År: {firstImg.year}</span>}
                </div>
              </div>
            )}
          </section>

          {/* 2. Geografiska placeringar */}
          <section className="detail-sidebar-box">
            <div className="sidebar-box-header">
              <h3>Plats & Fyndomständigheter</h3>
            </div>
            <div className="placements-list">
              {item.placements.map((p, idx) => (
                <div key={idx} className="placement-entry">
                  <div className="placement-type-badge">
                    {p.type === 'fyndplats'
                      ? 'Ursprunglig fyndplats'
                      : p.type === 'nuvarande_placering'
                      ? 'Nuvarande placering'
                      : 'Känd placering'}
                  </div>
                  <h4 className="placement-name">{p.placeName}</h4>
                  <p className="placement-geo-detail">
                    {p.parish} {p.hundred ? `· ${p.hundred}` : ''} · {p.province}
                  </p>
                  {p.coordinatesWgs84 && (
                    <div className="placement-coords">
                      <span className="coords-label">WGS84:</span>{' '}
                      <code>
                        {p.coordinatesWgs84[1].toFixed(4)}° N, {p.coordinatesWgs84[0].toFixed(4)}° Ö
                      </code>
                      <span className={`precision-badge precision-${p.precision}`}>
                        {p.precision === 'sockencentrum'
                          ? 'Sockencentrum (approximativ)'
                          : p.precision.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                  {p.sourceNote && <p className="placement-note">{p.sourceNote}</p>}
                </div>
              ))}
            </div>
          </section>

          {/* 3. Fysisk bärare */}
          <section className="detail-sidebar-box">
            <div className="sidebar-box-header">
              <h3>Bärare & Material</h3>
            </div>
            <div className="info-keyvalues">
              <div className="info-kv">
                <span className="info-key">Föremålstyp:</span>
                <span className="info-val">{item.carrier.type.replace('_', ' ')}</span>
              </div>
              <div className="info-kv">
                <span className="info-key">Material:</span>
                <span className="info-val">{item.carrier.material || 'Okänt material'}</span>
              </div>
              <div className="info-kv">
                <span className="info-key">Bevarandestatus:</span>
                <span className="info-val">{item.carrier.preservationStatus.replace(/_/g, ' ')}</span>
              </div>
              {item.carrier.heightCm && (
                <div className="info-kv">
                  <span className="info-key">Mått:</span>
                  <span className="info-val">
                    {item.carrier.heightCm} cm hög {item.carrier.widthCm ? `× ${item.carrier.widthCm} cm bred` : ''}
                  </span>
                </div>
              )}
              {item.carrier.currentLocationDescription && (
                <div className="info-kv">
                  <span className="info-key">Placeringsnot:</span>
                  <span className="info-val">{item.carrier.currentLocationDescription}</span>
                </div>
              )}
            </div>
          </section>

          {/* 4. Källor & Faksimil */}
          <section className="detail-sidebar-box source-box">
            <div className="sidebar-box-header">
              <h3>Källhänvisningar & Faksimil</h3>
              <button
                type="button"
                className="copy-citation-btn"
                onClick={handleCopyCitation}
                title="Kopiera vetenskaplig källhänvisning"
              >
                {copiedCitation ? '✓ Kopierad!' : '📋 Kopiera citat'}
              </button>
            </div>
            <div className="source-details">
              <p className="source-title">
                <strong>{item.source.sriVolumeTitle}</strong>
              </p>
              <p className="source-author">
                Utgivare: {item.source.author} ({item.source.publicationYear})
              </p>
              <div className="source-pages">
                <span>Tryckt sidintervall: s. {item.source.printedPageStart}–{item.source.printedPageEnd}</span>
                <span>PDF-sidintervall: s. {item.source.pdfPageStart}–{item.source.pdfPageEnd}</span>
                {item.source.plateNumber && <span>Plansch: {item.source.plateNumber}</span>}
                {item.source.figureNumber && <span>Figur: {item.source.figureNumber}</span>}
              </div>

              {item.source.externalUris && (
                <div className="source-external-links">
                  {item.source.externalUris.raaRunorUri && (
                    <a
                      href={item.source.externalUris.raaRunorUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="external-link-btn"
                    >
                      Öppna i Riksantikvarieämbetet Runor ↗
                    </a>
                  )}
                  {item.source.externalUris.samnordiskUuid && (
                    <div className="uuid-display">
                      <span className="uuid-label">Samnordisk UUID:</span>
                      <code>{item.source.externalUris.samnordiskUuid}</code>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Tillgänglig Bildzoom-modal (Lightbox) */}
      {isModalOpen && firstImg && (
        <div
          className="runor-image-modal-backdrop"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={`Bildzoom för ${item.canonicalSignum}`}
        >
          <div
            className="runor-image-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>{item.canonicalSignum} · Källplansch</h3>
                <span className="modal-source-ref">{item.source.sriVolumeTitle} ({item.source.plateNumber || 'Plansch'})</span>
              </div>
              <div className="modal-controls">
                <button
                  type="button"
                  className="modal-ctrl-btn"
                  onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
                  title="Zooma ut"
                  disabled={zoomLevel <= 1}
                >
                  −
                </button>
                <span className="zoom-indicator">{Math.round(zoomLevel * 100)} %</span>
                <button
                  type="button"
                  className="modal-ctrl-btn"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                  title="Zooma in"
                  disabled={zoomLevel >= 2.5}
                >
                  +
                </button>
                <button
                  type="button"
                  className="modal-ctrl-btn modal-reset-btn"
                  onClick={() => setZoomLevel(1)}
                  title="Återställ storlek"
                >
                  Återställ
                </button>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={closeModal}
                  aria-label="Stäng bildzoom"
                  title="Stäng (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="modal-image-viewport">
              <div
                className="modal-image-scaler"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                }}
              >
                <Image
                  src={firstImg.imageUrl}
                  alt={firstImg.caption || item.canonicalSignum}
                  width={1100}
                  height={825}
                  className="modal-full-img"
                  unoptimized
                />
              </div>
            </div>

            <div className="modal-footer">
              <p className="modal-caption">{firstImg.caption}</p>
              <div className="modal-meta">
                <span>Upphovsman: {firstImg.photographerOrArtist} ({firstImg.year || 'Publiceringsår'})</span>
                <span> · Licens: {firstImg.license}</span>
                <span className="modal-esc-hint"> · Tryck [Esc] för att stänga</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
