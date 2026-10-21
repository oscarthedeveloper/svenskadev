import type { Metadata } from 'next';
import StudyFrame from '@/components/StudyFrame';
import RunorDirectoryClient from '@/components/runor/RunorDirectoryClient';
import RunorServerListReserve from '@/components/runor/RunorServerListReserve';
import { getRunicCorpusState } from '@/lib/runor/server';

export const metadata: Metadata = {
  title: 'Sveriges runinskrifter — fornsvenska.se',
  description:
    'Digital textutgåva och källkatalog baserad på Sveriges runinskrifter (SRI) och Samnordisk runtextdatabas. Verifierade läsningar, faksimillänkar och kartor.',
  alternates: {
    canonical: 'https://fornsvenska.se/runor',
  },
  openGraph: {
    title: 'Sveriges runinskrifter — fornsvenska.se',
    description:
      'Digital textutgåva och källkatalog baserad på Sveriges runinskrifter (SRI) och Samnordisk runtextdatabas. Verifierade läsningar, faksimillänkar och kartor.',
    url: 'https://fornsvenska.se/runor',
    siteName: 'fornsvenska.se',
    type: 'website',
  },
};

export default async function RunorPage() {
  const corpus = await getRunicCorpusState();

  return (
    <StudyFrame title="Sveriges runinskrifter" active="/runor">
      {/* Interaktiv klientkomponent med sökning, kartvy och filter */}
      <RunorDirectoryClient inscriptions={corpus.inscriptions} />

      {/* Tillgänglig serverrenderad listreserv för sökmotorer och webbläsare utan JavaScript */}
      <noscript>
        <div style={{ marginTop: '32px' }}>
          <RunorServerListReserve inscriptions={corpus.inscriptions} />
        </div>
      </noscript>
    </StudyFrame>
  );
}
