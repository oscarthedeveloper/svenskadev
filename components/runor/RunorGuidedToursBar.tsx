'use client';

import React, { useState } from 'react';
import { GUIDED_TOURS, type GuidedTour, type GuidedTourStep } from '@/lib/runor/guided-tours';

interface Props {
  onSelectInscription: (slug: string) => void;
  selectedSlug?: string | null;
}

export default function RunorGuidedToursBar({
  onSelectInscription,
  selectedSlug,
}: Props) {
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const activeTour: GuidedTour | undefined = GUIDED_TOURS.find((t) => t.id === activeTourId);
  const currentStep: GuidedTourStep | undefined = activeTour?.steps[currentStepIndex];

  const handleStartTour = (tour: GuidedTour) => {
    setActiveTourId(tour.id);
    setCurrentStepIndex(0);
    const firstStep = tour.steps[0];
    if (firstStep) {
      onSelectInscription(firstStep.slug);
    }
  };

  const handleEndTour = () => {
    setActiveTourId(null);
    setCurrentStepIndex(0);
  };

  const handleNextStep = () => {
    if (!activeTour) return;
    const nextIdx = (currentStepIndex + 1) % activeTour.steps.length;
    setCurrentStepIndex(nextIdx);
    const nextStep = activeTour.steps[nextIdx];
    if (nextStep) {
      onSelectInscription(nextStep.slug);
    }
  };

  const handlePrevStep = () => {
    if (!activeTour) return;
    const prevIdx = (currentStepIndex - 1 + activeTour.steps.length) % activeTour.steps.length;
    setCurrentStepIndex(prevIdx);
    const prevStep = activeTour.steps[prevIdx];
    if (prevStep) {
      onSelectInscription(prevStep.slug);
    }
  };

  const handleJumpToStep = (index: number) => {
    if (!activeTour) return;
    setCurrentStepIndex(index);
    const step = activeTour.steps[index];
    if (step) {
      onSelectInscription(step.slug);
    }
  };

  return (
    <section
      className="guided-tours-wrapper"
      aria-label="Källbundna guidningar"
      style={{
        marginBottom: '1rem',
        padding: '0.75rem 1rem',
        background: '#fcfbf7',
        border: '1px solid var(--line, #e2ded4)',
        borderRadius: '6px',
      }}
    >
      {/* Turväljare (Pills) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--accent, #8b2500)',
              letterSpacing: '0.04em',
            }}
          >
            🧭 Tematiska guidningar (E33):
          </span>

          {GUIDED_TOURS.map((tour) => {
            const isThisTourActive = activeTourId === tour.id;
            return (
              <button
                key={tour.id}
                type="button"
                onClick={() => (isThisTourActive ? handleEndTour() : handleStartTour(tour))}
                aria-pressed={isThisTourActive}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: isThisTourActive ? 700 : 500,
                  borderRadius: '16px',
                  border: isThisTourActive
                    ? '1px solid #2c5282'
                    : '1px solid var(--line, #cbd5e0)',
                  background: isThisTourActive ? '#ebf8ff' : '#fff',
                  color: isThisTourActive ? '#2b6cb0' : 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tour.title}
              </button>
            );
          })}
        </div>

        {activeTourId && (
          <button
            type="button"
            onClick={handleEndTour}
            style={{
              fontSize: '11px',
              color: '#718096',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            ✕ Avsluta guidning
          </button>
        )}
      </div>

      {/* Aktiv Guidningspanel */}
      {activeTour && currentStep && (
        <div
          className="active-tour-player"
          role="region"
          aria-label={`Aktiv guidning: ${activeTour.title}`}
          aria-live="polite"
          aria-atomic="true"
          style={{
            marginTop: '0.75rem',
            padding: '1rem',
            background: '#fff',
            border: '1px solid #bee3f8',
            borderRadius: '6px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#2b6cb0',
                  textTransform: 'uppercase',
                }}
              >
                {activeTour.title} · Stopp {currentStep.stepNumber} av {activeTour.steps.length}
              </span>
              <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '16px', fontWeight: 600 }}>
                {currentStep.canonicalSignum} · {currentStep.title}
              </h4>
            </div>

            {/* Stegknappar */}
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handlePrevStep}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e0',
                  background: '#fff',
                  cursor: 'pointer',
                  minHeight: '28px',
                }}
                title="Föregående stopp"
              >
                ← Föregående
              </button>

              {activeTour.steps.map((st, idx) => (
                <button
                  key={st.canonicalSignum}
                  type="button"
                  onClick={() => handleJumpToStep(idx)}
                  aria-current={idx === currentStepIndex ? 'step' : undefined}
                  aria-label={`Gå till stopp ${st.stepNumber}: ${st.canonicalSignum}`}
                  style={{
                    minWidth: '28px',
                    minHeight: '28px',
                    padding: 0,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '11px',
                    fontWeight: idx === currentStepIndex ? 700 : 500,
                    borderRadius: '50%',
                    border: idx === currentStepIndex ? '2px solid #2b6cb0' : '1px solid #cbd5e0',
                    background: idx === currentStepIndex ? '#ebf8ff' : '#fff',
                    color: idx === currentStepIndex ? '#2b6cb0' : '#4a5568',
                    cursor: 'pointer',
                  }}
                >
                  {st.stepNumber}
                </button>
              ))}

              <button
                type="button"
                onClick={handleNextStep}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e0',
                  background: '#fff',
                  cursor: 'pointer',
                  minHeight: '28px',
                }}
                title="Nästa stopp"
              >
                Nästa →
              </button>
            </div>
          </div>

          <p style={{ margin: '0 0 0.5rem 0', fontSize: '13px', lineHeight: 1.5, color: '#2d3748' }}>
            {currentStep.historicalContext}
          </p>

          <div
            style={{
              fontSize: '11px',
              color: '#718096',
              borderTop: '1px dashed #e2e8f0',
              paddingTop: '0.4rem',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <span>
              📚 <strong>Källa:</strong> {currentStep.sourceCitation}
            </span>
            <a
              href={`/runor/${currentStep.slug}`}
              style={{
                color: '#2b6cb0',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Öppna fullständig källvy för {currentStep.canonicalSignum} →
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
