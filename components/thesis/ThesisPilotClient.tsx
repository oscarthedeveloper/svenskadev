"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ThesisEditorialConfig } from "@/lib/thesis/editorial-config";
import type {
  GrammaticalTense,
  ParadigmId,
  ThesisPilotEdition,
} from "@/lib/thesis/types";
import {
  DEFAULT_THESIS_URL_STATE,
  serializeThesisUrlState,
  type ThesisUrlState,
} from "@/lib/thesis/url-state";
import Karta10SvgMap from "./Karta10SvgMap";
import Tabla28And29Panel from "./Tabla28And29Panel";
import Figur6ChangeModel from "./Figur6ChangeModel";
import NordicAtlasSection from "./NordicAtlasSection";
import CaseStudiesSection from "./CaseStudiesSection";
import SourceAndGlossaryPanel from "./SourceAndGlossaryPanel";
import { NORDIC_ATLAS_DATA } from "@/lib/thesis/atlas-data";
import { CASE_STUDIES_DATA } from "@/lib/thesis/case-studies-data";

export default function ThesisPilotClient({
  edition,
  config,
  initialUrlState,
  isAdmin,
  isPreviewingDraft,
  hasDraftChanges,
}: {
  edition: ThesisPilotEdition;
  config: ThesisEditorialConfig;
  initialUrlState: ThesisUrlState;
  isAdmin: boolean;
  isPreviewingDraft: boolean;
  hasDraftChanges: boolean;
}) {
  const [urlState, setUrlState] = useState<ThesisUrlState>(initialUrlState);
  const [copyMessage, setCopyMessage] = useState<string>("");
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (typeof window !== "undefined") {
      const nextHref = serializeThesisUrlState(
        urlState,
        window.location.pathname
      );
      const currentHref = window.location.pathname + window.location.search;
      if (nextHref !== currentHref) {
        window.history.replaceState(null, "", nextHref);
      }
    }
  }, [urlState]);

  function updateState(patch: Partial<ThesisUrlState>) {
    setUrlState((prev) => ({ ...prev, ...patch }));
    setCopyMessage("");
  }

  function handleSelectRegion(regionId: string) {
    const region =
      edition.regions.find((r) => r.id === regionId) ?? edition.regions[0];
    updateState({
      regionId: region.id,
      subAreaId: null,
      paradigmId: region.paradigmId,
    });
  }

  function handleSelectSubArea(regionId: string, subAreaId: string | null) {
    const region =
      edition.regions.find((r) => r.id === regionId) ?? edition.regions[0];
    updateState({
      regionId: region.id,
      subAreaId,
      paradigmId: region.paradigmId,
    });
  }

  function handleSelectParadigm(paradigmId: ParadigmId) {
    const region =
      edition.regions.find((r) => r.paradigmId === paradigmId) ??
      edition.regions[0];
    updateState({
      regionId: region.id,
      subAreaId: null,
      paradigmId: region.paradigmId,
    });
  }

  function handleReset() {
    updateState(DEFAULT_THESIS_URL_STATE);
  }

  async function handleCopyShareUrl() {
    if (typeof window === "undefined") return;
    const fullUrl =
      window.location.origin +
      serializeThesisUrlState(urlState, window.location.pathname);
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopyMessage("Delbar länk kopierad!");
    } catch {
      setCopyMessage(fullUrl);
    }
  }

  const selectedRegion =
    edition.regions.find((r) => r.id === urlState.regionId) ??
    edition.regions[0];
  const selectedParadigm =
    edition.paradigms.find((p) => p.id === selectedRegion.paradigmId) ??
    edition.paradigms[0];
  const selectedSubArea = urlState.subAreaId
    ? selectedRegion.subAreas.find((s) => s.id === urlState.subAreaId) ?? null
    : null;

  const regionLabels: Record<string, string> = {};
  for (const r of edition.regions) {
    regionLabels[r.id] =
      config.regionOverrides[r.id]?.customLabel ?? r.name;
  }

  const activeEditorialSourceNote =
    config.regionOverrides[selectedRegion.id]?.editorialSourceNote ??
    selectedRegion.geographicSummary;

  return (
    <div className="thesis-pilot-page">
      {/* Brödsmulor och adminbanderoll */}
      <nav className="breadcrumbs" aria-label="Sökväg">
        <Link href="/">Start</Link>
        <span>›</span>
        <Link href="/sprakliv">Språkliv</Link>
        <span>›</span>
        <span>Från person till person</span>
      </nav>

      {isAdmin && (
        <div className="thesis-admin-notice" role="status">
          <div>
            <strong>Redaktionsläge aktivt:</strong>{" "}
            {isPreviewingDraft
              ? "Du förhandsgranskar ett opublicerat utkast."
              : hasDraftChanges
                ? "Det finns opublicerade utkaständringar i administrationen."
                : "Visar publicerad utgåva."}{" "}
            <span>Dataversion: {config.dataVersionLabel}</span>
          </div>
          <div className="thesis-admin-notice-links">
            {hasDraftChanges && !isPreviewingDraft && (
              <Link href="/sprakliv/person-och-numerus?forhandsgranska=1">
                Förhandsgranska utkast →
              </Link>
            )}
            {isPreviewingDraft && (
              <Link href="/sprakliv/person-och-numerus">
                Visa publicerad vy →
              </Link>
            )}
            <Link href="/admin/avhandling">
              Öppna /admin/avhandling ↗
            </Link>
          </div>
        </div>
      )}

      {/* Huvudrubrik och korta läsvägen (A02.1 & A03.1) */}
      <header className="thesis-hero">
        <div className="thesis-meta-strip">
          <span>{config.eyebrow}</span>
          <span>
            Källa: {edition.sourceDocument.author} ({edition.sourceDocument.year})
          </span>
          <span>Utgåva: {config.dataVersionLabel}</span>
        </div>

        <h1>{config.title}</h1>
        <p className="thesis-subtitle">{config.subtitle}</p>
        <p className="thesis-intro">{config.intro}</p>

        <div className="thesis-orientation-grid">
          <div className="thesis-reading-path-box">
            <span className="eyebrow">Kort läsväg</span>
            <p>{config.shortReadingPath}</p>
          </div>
          <div className="thesis-orientation-box">
            <span className="eyebrow">{config.orientationBoxTitle}</span>
            <p>{config.orientationBoxBody}</p>
          </div>
        </div>

        {/* Snabbnavigering mellan etappernas huvudsektioner */}
        <nav
          className="thesis-section-jumpnav"
          aria-label="Hoppa till avsnitt i webbversionen"
        >
          <a href="#sektion-karta10">
            1. Sydvästsvensk karta & paradigm (Karta 10, Tablå 28–29)
          </a>
          <a href="#sektion-figur6">
            2. Förändringsmodell (Figur 6)
          </a>
          <a href="#sektion-nordisk-atlas">
            3. Nordisk atlas & särsystem (Karta 3–7, 14–16, Tablå 23–26, 42–43)
          </a>
          <a href="#sektion-fallstudier">
            4. Fallstudier: Mark & Kind + Östra Göinge (62 informanter)
          </a>
          <a href="#sektion-kallkritik">
            5. Källkritik, ordlista & kontrollregister
          </a>
        </nav>
      </header>

      {/* Delnings- och återställningsverktygsfält (A02.4) */}
      <div
        className="thesis-state-toolbar"
        role="region"
        aria-label="Aktuellt urval och delbar länk"
      >
        <div className="thesis-state-summary">
          <span>
            <strong>Område:</strong> {selectedRegion.name}
            {selectedSubArea ? ` (${selectedSubArea.name})` : ""}
          </span>
          <span>
            <strong>Tempus:</strong> {urlState.tense}
          </span>
          <span>
            <strong>Typverb:</strong> {urlState.verbLemma}
          </span>
          <span>
            <strong>Figur 6:</strong> Steg {urlState.stepOrder}
          </span>
        </div>
        <div className="thesis-state-actions">
          <button type="button" onClick={handleCopyShareUrl}>
            Kopiera delbar länk
          </button>
          <button type="button" onClick={handleReset}>
            Återställ urval
          </button>
          {copyMessage && <span role="status">{copyMessage}</span>}
        </div>
      </div>

      {/* Sektion 1: Karta 10 + Tablå 28/29 sida vid sida (A02.2, A03.1, A03.2) */}
      <section
        id="sektion-karta10"
        className="thesis-karta-paradigm-section"
        aria-labelledby="karta10-section-heading"
      >
        <div className="thesis-section-intro">
          <h2 id="karta10-section-heading">{config.mapSectionTitle}</h2>
          <p>{config.mapSectionIntro}</p>
        </div>

        <div className="thesis-workbench-grid">
          <Karta10SvgMap
            regions={edition.regions}
            paradigms={edition.paradigms}
            selectedRegionId={selectedRegion.id}
            selectedSubAreaId={selectedSubArea?.id ?? null}
            regionLabels={regionLabels}
            onSelectRegion={handleSelectRegion}
            onSelectSubArea={handleSelectSubArea}
          />

          <Tabla28And29Panel
            paradigms={edition.paradigms}
            selectedParadigm={selectedParadigm}
            selectedRegion={selectedRegion}
            selectedSubArea={selectedSubArea}
            tense={urlState.tense}
            selectedVerbLemma={urlState.verbLemma}
            tabla29Verbs={edition.referenceExampleTabla29.verbs}
            onSelectParadigmRegion={handleSelectParadigm}
            onChangeTense={(nextTense: GrammaticalTense) =>
              updateState({ tense: nextTense })
            }
            onChangeVerbLemma={(nextLemma: string) =>
              updateState({ verbLemma: nextLemma })
            }
          />
        </div>
      </section>

      {/* Sektion 2: Figur 6 – Stegvis förändringsmodell (A04.1–A04.4) */}
      <div id="sektion-figur6">
        <Figur6ChangeModel
          sectionTitle={config.changeModelSectionTitle}
          sectionIntro={config.changeModelSectionIntro}
          modelNote={edition.changeModelFigur6.isModelNotIndividualFilmNote}
          steps={edition.changeModelFigur6.steps}
          paradigms={edition.paradigms}
          activeStepOrder={urlState.stepOrder}
          viewMode={urlState.viewMode}
          tense={urlState.tense}
          onSelectStep={(stepOrder: number) => updateState({ stepOrder })}
          onToggleViewMode={(viewMode) => updateState({ viewMode })}
          onSelectParadigmFromModel={handleSelectParadigm}
        />
      </div>

      {/* Sektion 3: Etapp 5 – Nordisk och svensk atlas, regionala fördjupningar & plural imperativ (A05.1–A05.5) */}
      <div id="sektion-nordisk-atlas">
        <NordicAtlasSection atlas={NORDIC_ATLAS_DATA} />
      </div>

      {/* Sektion 4: Etapp 6 – Fallstudier i Mark & Kind (41 talare) och Östra Göinge (21 talare) (A06.1–A06.6) */}
      <div id="sektion-fallstudier">
        <CaseStudiesSection caseStudies={CASE_STUDIES_DATA} />
      </div>

      {/* Sektion 5: Källpanel, osäkerhetsruta, ordlista och granskningsregister (A03.3) */}
      <div id="sektion-kallkritik">
        <SourceAndGlossaryPanel
          sourceDocument={edition.sourceDocument}
          sourcePanelIntro={config.sourcePanelIntro}
          selectedRegion={selectedRegion}
          selectedSubArea={selectedSubArea}
          editorialSourceNote={activeEditorialSourceNote}
          glossary={edition.glossary}
          selectedGlossaryTermId={urlState.glossaryTermId}
          auditLog={edition.auditLog}
          onSelectGlossaryTerm={(glossaryTermId) =>
            updateState({ glossaryTermId })
          }
        />
      </div>
    </div>
  );
}

