"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="home-shell"><div className="archive-page"><p className="eyebrow">Tillfälligt avbrott</p><h1>Arkivet kunde inte hämtas.</h1><p>Försök igen om en stund. Om du administrerar webbplatsen, kontrollera Supabase-anslutningen och att båda migrationerna är körda.</p><div className="hero-actions"><button className="button button-primary" onClick={reset}>Försök igen</button><Link className="text-link" href="/">Till startsidan →</Link></div></div></main>;
}
