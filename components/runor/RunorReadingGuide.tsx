'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import type { GuidedReadingInscription, ReadingSegment } from '@/lib/runor/reading-segments';

interface Props {
  guide: GuidedReadingInscription;
}

export default function RunorReadingGuide({ guide }: Props) {
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSegments = guide.segments.length;
  const currentSegment: ReadingSegment | undefined = guide.segments[activeSegmentIndex];

  const handleNext = useCallback(() => {
    setActiveSegmentIndex((prev) => (prev + 1) % totalSegments);
  }, [totalSegments]);

  const handlePrev = useCallback(() => {
    setActiveSegmentIndex((prev) => (prev - 1 + totalSegments) % totalSegments);
  }, [totalSegments]);

  // Tangentbordsnavigering (vänster/höger piltangent)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorera om användaren skriver i ett formulär
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        // Pausa/starta vid mellanslag om guide-sektionen har fokus
        if (containerRef.current?.contains(document.activeElement)) {
          e.preventDefault();
          setIsPlaying((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Automatisk stegning (läsanimation)
  useEffect(() => {
    if (!isPlaying) return;

    // Respektera prefers-reduced-motion
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsPlaying(false);
      return;
    }

    const timer = setInterval(() => {
      setActiveSegmentIndex((prev) => {
        if (prev + 1 >= totalSegments) {
          // Stanna vid slutet eller loopa kontrollerat
          return 0;
        }
        return prev + 1;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [isPlaying, totalSegments]);

  return (
    <section
      ref={containerRef}
      className="reading-guide-container"
      aria-label={`Stegad läsguide för ${guide.canonicalSignum}`}
      tabIndex={0}
      style={{
        marginTop: '2rem',
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'var(--surface-sunken, #f8f6f0)',
        border: '1px solid var(--line, #e2ded4)',
        borderRadius: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <span
            style={{
              display: 'inline-block',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--accent, #8b2500)',
              marginBottom: '0.25rem',
            }}
          >
            Krav K11 · Interaktiv läsväg & plansch
          </span>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            📖 Stegad läsning: {guide.title}
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowOverlay(!showOverlay)}
            className="guide-toggle-btn"
            aria-pressed={showOverlay}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '4px',
              border: '1px solid var(--line, #ccc)',
              background: showOverlay ? '#2c5282' : '#fff',
              color: showOverlay ? '#fff' : 'inherit',
              cursor: 'pointer',
            }}
          >
            {showOverlay ? '👁️ Markering på' : '⚪ Dölj markering'}
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="guide-play-btn"
            aria-pressed={isPlaying}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '4px',
              border: '1px solid var(--line, #ccc)',
              background: isPlaying ? '#c53030' : '#276749',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            {isPlaying ? '⏸ Pausa stegning' : '▶ Spela läsning'}
          </button>
        </div>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--muted, #555)', margin: '0 0 1rem 0' }}>
        {guide.editorialRationale}
      </p>

      {/* Plansch med interaktivt läs-overlay */}
      <div
        className="guide-image-viewport"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          margin: '0 auto 1.25rem auto',
          background: '#1a1a1a',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <Image
          src={guide.imageUrl}
          alt={`Källplansch för ${guide.canonicalSignum}`}
          width={600}
          height={650}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            opacity: showOverlay ? 0.92 : 1,
          }}
          priority
          unoptimized
        />

        {/* Läsmarkör i procentuella koordinater */}
        {showOverlay && currentSegment && (
          <div
            className="reading-segment-box"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: `${currentSegment.boundingBoxPercent.x}%`,
              top: `${currentSegment.boundingBoxPercent.y}%`,
              width: `${currentSegment.boundingBoxPercent.width}%`,
              height: `${currentSegment.boundingBoxPercent.height}%`,
              border: currentSegment.isUncertain
                ? '3px dashed #d69e2e'
                : '3px solid #e53e3e',
              background: currentSegment.isUncertain
                ? 'rgba(214, 158, 46, 0.22)'
                : 'rgba(229, 62, 62, 0.18)',
              borderRadius: '6px',
              boxShadow: '0 0 12px rgba(229, 62, 62, 0.6)',
              pointerEvents: 'none',
              transition: 'all 0.35s ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '-24px',
                left: '0',
                background: currentSegment.isUncertain ? '#d69e2e' : '#e53e3e',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '3px',
                whiteSpace: 'nowrap',
              }}
            >
              Segment {currentSegment.order}: {currentSegment.readingDirection}
            </span>
          </div>
        )}
      </div>

      {/* Segmentknappar */}
      <div
        className="guide-step-buttons"
        style={{
          display: 'flex',
          gap: '0.4rem',
          justifyContent: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={handlePrev}
          disabled={activeSegmentIndex === 0 && !isPlaying}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '4px',
            border: '1px solid var(--line, #ccc)',
            background: '#fff',
            cursor: 'pointer',
          }}
          title="Föregående del (Vänsterpil)"
        >
          ← Föregående
        </button>

        {guide.segments.map((seg, idx) => (
          <button
            key={seg.id}
            type="button"
            onClick={() => {
              setActiveSegmentIndex(idx);
              setIsPlaying(false);
            }}
            aria-current={idx === activeSegmentIndex ? 'step' : undefined}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: idx === activeSegmentIndex ? 700 : 500,
              borderRadius: '4px',
              border: idx === activeSegmentIndex ? '2px solid #2c5282' : '1px solid var(--line, #ccc)',
              background: idx === activeSegmentIndex ? '#ebf8ff' : '#fff',
              color: idx === activeSegmentIndex ? '#2b6cb0' : 'inherit',
              cursor: 'pointer',
            }}
          >
            {seg.order}. {seg.label.split(' ')[0]}
          </button>
        ))}

        <button
          type="button"
          onClick={handleNext}
          disabled={activeSegmentIndex === totalSegments - 1 && !isPlaying}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '4px',
            border: '1px solid var(--line, #ccc)',
            background: '#fff',
            cursor: 'pointer',
          }}
          title="Nästa del (Högerpil)"
        >
          Nästa →
        </button>
      </div>

      {/* Kort med aktivt segment och textlager */}
      {currentSegment && (
        <div
          className="active-segment-card"
          role="region"
          aria-label={`Aktivt lässegment ${currentSegment.order}`}
          aria-live="polite"
          aria-atomic="true"
          tabIndex={0}
          style={{
            background: '#fff',
            border: '1px solid var(--line, #e2ded4)',
            borderRadius: '6px',
            padding: '1.25rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>
              Segment {currentSegment.order} av {totalSegments}: {currentSegment.label}
            </h4>

            <div style={{ display: 'flex', gap: '0.4rem', fontSize: '11px' }}>
              <span
                style={{
                  background: '#edf2f7',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  color: '#4a5568',
                }}
              >
                Läsriktning: {currentSegment.readingDirection}
              </span>
              {currentSegment.isUncertain && (
                <span
                  style={{
                    background: '#feebc8',
                    color: '#7b341e',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                  }}
                >
                  ⚠️ Osäker läsning
                </span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--muted, #666)', fontWeight: 600, display: 'block' }}>
              Bokstavstrogen runskrift (Translitterering):
            </span>
            <code
              style={{
                display: 'block',
                background: '#f7fafc',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '13px',
                color: '#2d3748',
                fontFamily: 'monospace',
                marginTop: '3px',
              }}
            >
              {currentSegment.transliteration}
            </code>
          </div>

          <div style={{ marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--muted, #666)', fontWeight: 600, display: 'block' }}>
              Normaliserad text:
            </span>
            <p style={{ margin: '3px 0 0 0', fontStyle: 'italic', fontSize: '14px', color: '#1a202c' }}>
              {currentSegment.normalization}
            </p>
          </div>

          <div style={{ marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--muted, #666)', fontWeight: 600, display: 'block' }}>
              Svensk källtolkning:
            </span>
            <p style={{ margin: '3px 0 0 0', fontWeight: 500, fontSize: '14px', color: '#2c5282' }}>
              «{currentSegment.translation}»
            </p>
          </div>

          {currentSegment.notes && (
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '12px', color: '#718096', borderTop: '1px dashed #e2e8f0', paddingTop: '0.5rem' }}>
              💡 <em>Källnot: {currentSegment.notes}</em>
            </p>
          )}
        </div>
      )}

      {/* Tillgänglighetsfotnot: Läsning utan overlay */}
      <details style={{ fontSize: '12px', color: 'var(--muted, #666)' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
          Visa hela lässekvensen som sammanhängande text (Krav K11)
        </summary>
        <ol style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
          {guide.segments.map((seg) => (
            <li key={seg.id} style={{ marginBottom: '0.4rem' }}>
              <strong>{seg.label}:</strong> {seg.translation}{' '}
              <span style={{ color: '#718096', fontStyle: 'italic' }}>({seg.normalization})</span>
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
