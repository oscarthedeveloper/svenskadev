import { cache } from 'react';
import { getAdminSession } from '@/lib/session';
import { getDatabaseSetup } from '@/lib/supabase/setup';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { RunicInscription } from './types.ts';
import { validateRunicInscription } from './validation.ts';
import { RUNIC_PILOT_INSCRIPTIONS } from './pilot-data.ts';
import { RUNIC_COMBINED_CORPUS_50 } from './batch1-data.ts';
import { toPublicPublishedItem, type RunicPublishedInscription } from './contract.ts';

export interface RunicCorpusState {
  inscriptions: RunicInscription[];
  publishedItems: RunicPublishedInscription[];
  isFallback: boolean;
  needsMigration: boolean;
  datasetVersion: string;
  source: 'database' | 'file-fallback';
}

export interface RunicDatasetMetadata {
  version: string;
  title: string;
  inscriptionCount: number;
  checksumSha256: string;
  publishedAt: string;
  publishedBy: string | null;
}

export interface GetRunicCorpusOptions {
  preferDraftForAdmin?: boolean;
  version?: '2026.1-pilot' | '2026.2-batch1';
}

/**
 * Hämtar runbeståndet med transparent databaslagring och robust filreserv.
 * Faller tillbaka till RUNIC_PILOT_INSCRIPTIONS eller RUNIC_COMBINED_CORPUS_50 om databasen saknas.
 */
export const getRunicCorpusState = cache(
  async (options?: GetRunicCorpusOptions): Promise<RunicCorpusState> => {
    const isBatch1 = options?.version === '2026.2-batch1';
    const fallbackInscriptions = isBatch1 ? RUNIC_COMBINED_CORPUS_50 : RUNIC_PILOT_INSCRIPTIONS;
    const fallbackVersion = isBatch1 ? '2026.2-batch1' : '2026.1-pilot';

    const fallbackPublished: RunicPublishedInscription[] = [];
    for (const item of fallbackInscriptions) {
      const pub = toPublicPublishedItem(item);
      if (pub) fallbackPublished.push(pub);
    }

    const fallbackResult: RunicCorpusState = {
      inscriptions: fallbackInscriptions,
      publishedItems: fallbackPublished,
      isFallback: true,
      needsMigration: false,
      datasetVersion: fallbackVersion,
      source: 'file-fallback',
    };

    try {
      const setup = await getDatabaseSetup();
      if (setup.status !== 'ready') {
        return {
          ...fallbackResult,
          needsMigration: setup.status === 'needs-migration',
        };
      }

      const { isAdmin } = await getAdminSession();
      const supabase = await createSupabaseServerClient();

      // Om admin begär förhandsgranskning av utkast
      if (isAdmin && options?.preferDraftForAdmin) {
        const { data: drafts, error: draftError } = await supabase
          .from('svenska_runor_drafts')
          .select('slug, signum, content, revision, dirty, manual_curation')
          .order('signum', { ascending: true });

        if (!draftError && drafts && drafts.length > 0) {
          const loadedInscriptions: RunicInscription[] = [];
          const loadedPublished: RunicPublishedInscription[] = [];

          for (const row of drafts) {
            const raw = row.content as unknown as RunicInscription;
            const validation = validateRunicInscription(raw);
            if (validation.valid) {
              loadedInscriptions.push(raw);
              const pub = toPublicPublishedItem(raw);
              if (pub) loadedPublished.push(pub);
            }
          }

          if (loadedInscriptions.length > 0) {
            return {
              inscriptions: loadedInscriptions,
              publishedItems: loadedPublished,
              isFallback: false,
              needsMigration: false,
              datasetVersion: 'drafts-in-progress',
              source: 'database',
            };
          }
        }
      }

      // Standard publik läsning från svenska_runor_editions
      const { data: editions, error: edError } = await supabase
        .from('svenska_runor_editions')
        .select('slug, signum, content, dataset_version, published')
        .eq('published', true)
        .order('signum', { ascending: true });

      if (edError) {
        // Tabellen finns inte ännu i databasen
        if (
          edError.code === '42P01' ||
          edError.code === 'PGRST205' ||
          edError.code === '42703'
        ) {
          return {
            ...fallbackResult,
            needsMigration: true,
          };
        }
        return fallbackResult;
      }

      if (!editions || editions.length === 0) {
        // Databasen har migrerats men är tom: använd filreserven
        return fallbackResult;
      }

      const inscriptions: RunicInscription[] = [];
      const publishedItems: RunicPublishedInscription[] = [];
      const datasetVersion = editions[0]?.dataset_version || '2026.1-pilot';

      for (const row of editions) {
        const raw = row.content as unknown as RunicInscription;
        const validation = validateRunicInscription(raw);
        if (validation.valid) {
          inscriptions.push(raw);
          const pub = toPublicPublishedItem(raw);
          if (pub) publishedItems.push(pub);
        }
      }

      return {
        inscriptions,
        publishedItems,
        isFallback: false,
        needsMigration: false,
        datasetVersion,
        source: 'database',
      };
    } catch {
      return fallbackResult;
    }
  }
);

/**
 * Hämtar en enskild inskrift via slug eller signum från databasen eller reservlagret.
 */
export async function getRunicInscriptionState(
  slugOrSignum: string,
  options?: GetRunicCorpusOptions
): Promise<RunicInscription | null> {
  const corpus = await getRunicCorpusState(options);
  const norm = slugOrSignum.toLowerCase().trim();

  return (
    corpus.inscriptions.find(
      (i) =>
        i.canonicalSlug.toLowerCase() === norm ||
        i.canonicalSignum.toLowerCase() === norm ||
        i.id.toLowerCase() === norm
    ) || null
  );
}
