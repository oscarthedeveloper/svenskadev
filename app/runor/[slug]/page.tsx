import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import StudyFrame from '@/components/StudyFrame';
import RunorDetailView from '@/components/runor/RunorDetailView';
import { getRunicCorpusState } from '@/lib/runor/server';
import { resolveRunicSlug, generateRunicMetadata, generateRunicStructuredData } from '@/lib/runor/routes';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const corpus = await getRunicCorpusState();
  return corpus.inscriptions.map((item) => ({
    slug: item.canonicalSlug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const corpus = await getRunicCorpusState();
  return generateRunicMetadata(slug, corpus.inscriptions) as Metadata;
}

export default async function InscriptionDetailPage({ params }: Props) {
  const { slug } = await params;
  const corpus = await getRunicCorpusState();

  const resolution = resolveRunicSlug(slug, corpus.inscriptions);

  if (resolution.type === 'redirect' && resolution.canonicalSlug) {
    redirect(`/runor/${resolution.canonicalSlug}`);
  }

  if (resolution.type === 'not_found' || !resolution.inscription) {
    notFound();
  }

  const { inscription, previousSlug, nextSlug } = resolution;
  const jsonLd = generateRunicStructuredData(inscription);

  return (
    <StudyFrame title={`${inscription.canonicalSignum} · ${inscription.name || 'Runinskrift'}`} active="/runor">
      {/* Schema.org strukturerad data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <RunorDetailView
        inscription={inscription}
        previousSlug={previousSlug}
        nextSlug={nextSlug}
      />
    </StudyFrame>
  );
}
