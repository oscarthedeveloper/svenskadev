'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import StudyFrame from '@/components/StudyFrame';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RunorError({ error, reset }: Props) {
  useEffect(() => {
    console.error('Runor error:', error);
  }, [error]);

  return (
    <StudyFrame title="Ett fel uppstod — Sveriges runinskrifter" active="/runor">
      <div style={{ maxWidth: '640px', margin: '60px auto', textAlign: 'center', padding: '0 16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#991b1b', marginBottom: '12px' }}>
          Ett tekniskt fel uppstod vid visning av runinskriften
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
          Ett oväntat fel inträffade vid hämtning av data eller rendering av kartunderlaget.
          Du kan försöka ladda om komponenten eller återgå till huvudsidan för runor.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            style={{
              background: '#8b1e0f',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Försök igen
          </button>
          <Link
            href="/runor"
            style={{
              background: 'transparent',
              color: 'var(--text-main)',
              border: '1px solid var(--line)',
              padding: '10px 18px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Till katalogen
          </Link>
        </div>
      </div>
    </StudyFrame>
  );
}
