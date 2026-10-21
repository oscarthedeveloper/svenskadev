import type { Metadata } from "next";
import StudyFrame from "@/components/StudyFrame";
import ThesisPilotClient from "@/components/thesis/ThesisPilotClient";
import { getAdminSession } from "@/lib/session";
import { getThesisPilotState } from "@/lib/thesis/server";
import { parseThesisUrlState } from "@/lib/thesis/url-state";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const rawParams = await searchParams;
  const previewRequested = rawParams.forhandsgranska === "1";
  const state = await getThesisPilotState({
    preferDraftForAdmin: previewRequested,
  });

  const blockIndexing = state.isPreviewingDraft || !state.published;

  return {
    title: `${state.config.title} — Sydvästsvensk person- och numerusböjning`,
    description: state.config.subtitle,
    alternates: {
      canonical: "/sprakliv/person-och-numerus",
    },
    openGraph: {
      title: `${state.config.title} · svenska.dev`,
      description: state.config.subtitle,
      locale: "sv_SE",
      type: "article",
    },
    robots: blockIndexing
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export default async function ThesisPilotPage({ searchParams }: Props) {
  const rawParams = await searchParams;
  const previewRequested = rawParams.forhandsgranska === "1";
  const [{ isAdmin }, state] = await Promise.all([
    getAdminSession(),
    getThesisPilotState({ preferDraftForAdmin: previewRequested }),
  ]);

  const initialUrlState = parseThesisUrlState(rawParams);

  return (
    <StudyFrame title={state.config.title} active="/sprakliv">
      <ThesisPilotClient
        edition={state.edition}
        config={state.config}
        initialUrlState={initialUrlState}
        isAdmin={isAdmin}
        isPreviewingDraft={state.isPreviewingDraft}
        hasDraftChanges={state.hasDraftChanges}
      />
    </StudyFrame>
  );
}
