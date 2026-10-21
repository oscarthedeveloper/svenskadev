import 'server-only';
import { cache } from 'react';
import { getAdminSession } from '@/lib/session';
import { getDatabaseSetup } from '@/lib/supabase/setup';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  DEFAULT_THESIS_EDITORIAL_CONFIG,
  resolveThesisEditionWithConfig,
  validateThesisEditorialConfig,
  type ThesisEditorialConfig,
} from './editorial-config.ts';
import type { ThesisPilotEdition } from './types.ts';

export const THESIS_PILOT_SLUG = 'person-och-numerus';

export interface LoadedThesisPilotState {
  config: ThesisEditorialConfig;
  edition: ThesisPilotEdition;
  revision: number;
  published: boolean;
  hasDraftChanges: boolean;
  needsMigration: boolean;
  isPreviewingDraft: boolean;
}

export const getThesisPilotState = cache(
  async (options?: { preferDraftForAdmin?: boolean }): Promise<LoadedThesisPilotState> => {
    const setup = await getDatabaseSetup();
    const fallbackConfig = DEFAULT_THESIS_EDITORIAL_CONFIG;
    const fallbackEdition = resolveThesisEditionWithConfig(fallbackConfig);

    if (setup.status !== 'ready') {
      return {
        config: fallbackConfig,
        edition: fallbackEdition,
        revision: 0,
        published: true,
        hasDraftChanges: false,
        needsMigration: setup.status === 'needs-migration',
        isPreviewingDraft: false,
      };
    }

    const { isAdmin } = await getAdminSession();
    const supabase = await createSupabaseServerClient();

    const { data: pubRow, error: pubError } = await supabase
      .from('svenska_thesis_editions')
      .select('content, published, revision')
      .eq('slug', THESIS_PILOT_SLUG)
      .maybeSingle();

    if (
      pubError?.code === '42P01' ||
      pubError?.code === 'PGRST205' ||
      pubError?.code === '42703'
    ) {
      return {
        config: fallbackConfig,
        edition: fallbackEdition,
        revision: 0,
        published: true,
        hasDraftChanges: false,
        needsMigration: true,
        isPreviewingDraft: false,
      };
    }

    let draftRow: { content: unknown; revision: number; dirty: boolean } | null = null;
    if (isAdmin) {
      const { data: dRow, error: dErr } = await supabase
        .from('svenska_thesis_drafts')
        .select('content, revision, dirty')
        .eq('slug', THESIS_PILOT_SLUG)
        .maybeSingle();
      if (!dErr && dRow) {
        draftRow = dRow as { content: unknown; revision: number; dirty: boolean };
      }
    }

    const publishedConfig =
      pubRow?.content && !validateThesisEditorialConfig(pubRow.content)
        ? (pubRow.content as ThesisEditorialConfig)
        : fallbackConfig;

    const draftConfig =
      draftRow?.content && !validateThesisEditorialConfig(draftRow.content)
        ? (draftRow.content as ThesisEditorialConfig)
        : null;

    const useDraft = Boolean(isAdmin && options?.preferDraftForAdmin && draftConfig);
    const activeConfig = useDraft && draftConfig ? draftConfig : publishedConfig;

    return {
      config: activeConfig,
      edition: resolveThesisEditionWithConfig(activeConfig),
      revision: draftRow?.revision ?? pubRow?.revision ?? 0,
      published: pubRow ? Boolean(pubRow.published) : true,
      hasDraftChanges: Boolean(draftRow?.dirty),
      needsMigration: false,
      isPreviewingDraft: Boolean(useDraft && draftRow?.dirty),
    };
  }
);
