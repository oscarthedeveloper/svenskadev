import Link from 'next/link';
import type { RunicInscription } from '@/lib/runor/types';

interface Props {
  inscriptions: RunicInscription[];
}

/**
 * Serverrenderad listreserv för Runsidan (E22).
 * Garanterar full tillgänglighet, SEO-indexering och textläsning
 * även om WebGL, JavaScript eller Leaflet inte är tillgängligt.
 */
export default function RunorServerListReserve({ inscriptions }: Props) {
  return (
    <section className="runor-server-reserve" aria-label="Serverrenderad inskriftslista">
      <div className="runor-server-reserve-header">
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
          Katalog över publicerade runinskrifter ({inscriptions.length} st)
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
          Fullständig textbaserad katalog för skärmläsare, sökmotorer och webbläsare utan JavaScript.
          Varje inskrift är direktlänkad med verifierad källtext och förlagehänvisning till <em>Sveriges runinskrifter</em>.
        </p>
      </div>

      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {inscriptions.map((item) => {
          const placement = item.placements[0];
          const isLost = item.carrier.preservationStatus === 'forlorad';

          return (
            <li
              key={item.id}
              style={{
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '14px 18px',
                background: 'var(--bg-card, #ffffff)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '16px', margin: 0 }}>
                  <Link
                    href={`/runor/${item.canonicalSlug}`}
                    style={{ color: '#8b1e0f', textDecoration: 'none', fontWeight: 700 }}
                  >
                    {item.canonicalSignum}
                    {item.name ? ` · ${item.name}` : ''}
                  </Link>
                </h3>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: isLost ? '#fef3c7' : '#ecfdf5',
                    color: isLost ? '#92400e' : '#065f46',
                  }}
                >
                  {isLost ? 'Förlorad inskrift' : item.carrier.type}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span><strong>Plats:</strong> {placement ? `${placement.parish}, ${placement.province}` : 'Okänd'}</span>
                <span><strong>Datering:</strong> {item.dating.originalSourceLabel}</span>
                <span><strong>Källa:</strong> {item.source.sriVolumeTitle}, s. {item.source.printedPageStart}</span>
              </div>

              {item.textLayer.translationSwedish && (
                <blockquote
                  style={{
                    margin: '6px 0 0 0',
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontStyle: 'italic',
                    color: 'var(--text-main)',
                    borderLeft: '3px solid #cbd5e1',
                    background: '#f8fafc',
                    borderRadius: '0 4px 4px 0',
                  }}
                >
                  ”{item.textLayer.translationSwedish}”
                </blockquote>
              )}
            </li>
          );
        })}
      </ol>

      <div style={{ marginTop: '20px', padding: '12px 16px', background: '#f8fafc', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <strong>Dataset:</strong> <code>2026.1-pilot</code> (fastställd 2026-10-22) · Omfattning: 20 granskade inskrifter (Öland, Uppland, Östergötland, Södermanland, Västmanland). Källor: <em>Sveriges runinskrifter</em> och <em>Samnordisk runtextdatabas</em>. Rättelser: <a href="mailto:kontakt@fornsvenska.se" style={{ color: '#8b1e0f' }}>kontakt@fornsvenska.se</a>.
      </div>
    </section>
  );
}
