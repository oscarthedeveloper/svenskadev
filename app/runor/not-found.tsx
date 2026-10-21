import Link from 'next/link';
import StudyFrame from '@/components/StudyFrame';

export default function RunorNotFound() {
  return (
    <StudyFrame title="Inskriften hittades inte — Sveriges runinskrifter" active="/runor">
      <div style={{ maxWidth: '640px', margin: '60px auto', textAlign: 'center', padding: '0 16px' }}>
        <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>ᚱ</span>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#8b1e0f', marginBottom: '12px' }}>
          Runinskriften kunde inte hittas
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
          Den efterfrågade adressen matchar varken en känd kanonisk signum, alias eller publicerad inskrift i pilotutgåvan.
          Kontrollera stavningen eller gå tillbaka till katalogen för att söka bland samtliga registrerade stenar och fragment.
        </p>
        <Link
          href="/runor"
          style={{
            display: 'inline-block',
            background: '#8b1e0f',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          ← Tillbaka till runkatalogen
        </Link>
      </div>
    </StudyFrame>
  );
}
