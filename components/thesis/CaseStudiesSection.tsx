"use client";

import { useState } from "react";
import type {
  CaseStudiesData,
  MarkKindInformant,
  NumberCodingUsage,
  OstraGoingeInformant,
  PersonUsageCell,
  PronounUsageCell,
} from "@/lib/thesis/types";

type CaseStudyAreaTab = "mark-kind" | "ostra-goinge" | "syntes";
type MatrixViewMode = "grammatical-person" | "pronoun-correlation";

function renderUsageCell(cell: PersonUsageCell) {
  if (cell.usage === "–") {
    return <span className="thesis-cell-missing">–</span>;
  }

  return (
    <span
      className={`thesis-pref-badge ${
        cell.underFiveTokens ? "thesis-pref-italic" : ""
      }`}
      data-pref={cell.usage}
      title={
        cell.underFiveTokens
          ? "Kursiv stil i källan: färre än 5 belägg hos informanten"
          : "Minst 5 belägg hos informanten"
      }
    >
      {cell.usage}
      {cell.underFiveTokens && <sup aria-hidden="true">&lt;5</sup>}
    </span>
  );
}

function renderPronounCell(cell: PronounUsageCell) {
  if (cell.allTokens === "–" && cell.minFiveTokens === "–") {
    return <span className="thesis-cell-missing">–</span>;
  }

  const isMinFiveDifferent = cell.allTokens !== cell.minFiveTokens;

  return (
    <span
      className="thesis-pref-badge"
      data-pref={cell.minFiveTokens !== "–" ? cell.minFiveTokens : cell.allTokens}
      title={`Alla belägg: ${cell.allTokens}, Minst 5 belägg: ${cell.minFiveTokens}`}
    >
      {cell.rawDisplay}
      {isMinFiveDifferent && <small style={{ marginLeft: 3 }}>*</small>}
    </span>
  );
}

export default function CaseStudiesSection({
  caseStudies,
}: {
  caseStudies: CaseStudiesData;
}) {
  const [areaTab, setAreaTab] = useState<CaseStudyAreaTab>("mark-kind");
  const [matrixMode, setMatrixMode] =
    useState<MatrixViewMode>("grammatical-person");
  const [mkHundredFilter, setMkHundredFilter] = useState<string>("all");
  const [mkCohortFilter, setMkCohortFilter] = useState<string>("all");
  const [ogCohortFilter, setOgCohortFilter] = useState<string>("all");
  const [ogSearch, setOgSearch] = useState<string>("");
  const [mkSearch, setMkSearch] = useState<string>("");

  const mk = caseStudies.markAndKind;
  const og = caseStudies.ostraGoinge;
  const hvm = caseStudies.horizontalAndVerticalModel;
  const ep = caseStudies.excerptionPrinciples;
  const syn = caseStudies.synthesis;

  const filteredMarkKind: MarkKindInformant[] = mk.informants.filter((inf) => {
    if (mkHundredFilter !== "all" && inf.hundred !== mkHundredFilter) {
      return false;
    }
    if (mkCohortFilter !== "all" && inf.cohort !== mkCohortFilter) {
      return false;
    }
    if (mkSearch.trim()) {
      const q = mkSearch.trim().toLowerCase();
      return (
        inf.id.toLowerCase().includes(q) ||
        inf.parish.toLowerCase().includes(q) ||
        String(inf.birthYear).includes(q)
      );
    }
    return true;
  });

  const filteredOstraGoinge: OstraGoingeInformant[] = og.informants.filter(
    (inf) => {
      if (ogCohortFilter !== "all" && inf.cohort !== ogCohortFilter) {
        return false;
      }
      if (ogSearch.trim()) {
        const q = ogSearch.trim().toLowerCase();
        return (
          inf.id.toLowerCase().includes(q) ||
          inf.parish.toLowerCase().includes(q) ||
          String(inf.birthYear).includes(q)
        );
      }
      return true;
    }
  );

  return (
    <section
      className="thesis-casestudies-section"
      aria-labelledby="case-studies-heading"
    >
      <div className="thesis-section-intro">
        <span className="eyebrow">
          Etapp 6 · Kapitel 6 (s. 167–238) · Empiriska fallstudier i inspelat
          tal
        </span>
        <h2 id="case-studies-heading">
          Avveckling i realtid: Mark & Kind ({mk.informants.length} talare) och
          Östra Göinge ({og.informants.length} talare)
        </h2>
        <p>
          I kapitel 6 undersöker Adam Horn af Åminne inspelningar och
          transkriptioner av spontant talspråk för sammanlagt 62 talare (41 i
          Mark och Kind, 21 i Östra Göinge) för att belysa den faktiska
          övergången mellan personböjning och enhetsböjning i relation till
          födelsekohorter, ålder, kön och pronomenval (<em>di</em> / <em>da</em>{" "}
          resp. <em>di</em> / <em>då</em> / <em>dåm</em>).
        </p>
      </div>

      {/* A06.1: Horisontell vs vertikal förändring (Figur 8 & 9) + Excerperingsprinciper */}
      <div className="thesis-workbench-grid">
        <div className="thesis-tabla28-box">
          <div className="thesis-tabla28-header">
            <div>
              <span className="eyebrow">
                Figur 8 (s. {hvm.sourceFigur8.printedPage}) & Figur 9 (s.{" "}
                {hvm.sourceFigur9.printedPage})
              </span>
              <h3>{hvm.title}</h3>
            </div>
            <span className="thesis-time-pill">Kap. 6.1–6.2</span>
          </div>

          <div className="thesis-horiz-vert-diagram">
            <div className="thesis-horiz-box">
              <span className="eyebrow">
                Prestigehierarki och paradigmstatus (Figur 8, s. 173)
              </span>
              <div className="thesis-horiz-flow">
                {hvm.prestigeHierarchyFigur8.map((p, idx) => (
                  <span key={p.level}>
                    {idx > 0 && " → "}
                    {p.label}
                  </span>
                ))}
              </div>
              <p>
                <strong>Horisontell förändring:</strong> Skifte mellan
                böjningsparadigm på samhällsnivå (t.ex. um-böjning → e-böjning/a-böjning).
              </p>
            </div>

            <div className="thesis-vert-box">
              <span className="eyebrow">
                Processjämförelse i realtid (Figur 9, s. 188)
              </span>
              <table className="thesis-tabla28-table">
                <thead>
                  <tr>
                    <th>Dimension</th>
                    <th>Horisontell förändring</th>
                    <th>Vertikal förändring</th>
                  </tr>
                </thead>
                <tbody>
                  {hvm.processComparisonFigur9.map((row) => (
                    <tr key={row.dimension}>
                      <th>{row.dimension}</th>
                      <td>{row.horizontalProcess}</td>
                      <td>{row.verticalProcess}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="thesis-tabla29-footnote">
            <strong>
              Modernisering och bilinnehav (Karta 17–18, s.{" "}
              {hvm.modernizationAndCarsKarta17And18.source.printedPage}):
            </strong>{" "}
            {hvm.modernizationAndCarsKarta17And18.summary} (
            {hvm.modernizationAndCarsKarta17And18.urbanizationStatsNote95})
          </p>
        </div>

        <div className="thesis-tabla28-box">
          <div className="thesis-tabla28-header">
            <div>
              <span className="eyebrow">Excerperingsprinciper (s. 183–186)</span>
              <h3>{ep.title}</h3>
            </div>
            <span className="thesis-syncretism-badge">
              Tröskel: &lt; 5 belägg = kursiv
            </span>
          </div>

          <p className="thesis-slash-explanation">
            <strong>Huvudprincip:</strong> {ep.leadPrinciple}
          </p>

          <ul className="thesis-excerption-list">
            {ep.excludedCategories.map((c) => (
              <li key={c.id}>
                <strong>{c.category}:</strong> {c.reason}{" "}
                {c.contrastExample && (
                  <div className="thesis-cell-raw">
                    Exempel: <em>{c.contrastExample.nonRelevant}</em> (
                    {c.contrastExample.nonRelevantGloss}) vs.{" "}
                    <em>{c.contrastExample.relevant}</em> (
                    {c.contrastExample.relevantGloss})
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="thesis-subarea-Highlight">
            <strong>Undantag i um-området vid enklis (s. 185):</strong>
            <p>{ep.umAreaException.explanation}</p>
            <ul>
              {ep.umAreaException.examplesFromAAH.map((ex, i) => (
                <li key={i}>
                  <em>”{ex.dialect}”</em> — {ex.translation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Flikval mellan Mark & Kind, Östra Göinge och Syntes */}
      <div className="thesis-casestudy-tabs-bar">
        <div
          className="thesis-viewmode-toggle"
          role="tablist"
          aria-label="Välj fallstudie eller syntes"
        >
          <button
            type="button"
            role="tab"
            aria-selected={areaTab === "mark-kind"}
            className={areaTab === "mark-kind" ? "active" : ""}
            onClick={() => setAreaTab("mark-kind")}
          >
            1. Mark & Kind (41 informanter · s. 176–210)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={areaTab === "ostra-goinge"}
            className={areaTab === "ostra-goinge" ? "active" : ""}
            onClick={() => setAreaTab("ostra-goinge")}
          >
            2. Östra Göinge (21 informanter · s. 211–231)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={areaTab === "syntes"}
            className={areaTab === "syntes" ? "active" : ""}
            onClick={() => setAreaTab("syntes")}
          >
            3. Syntes & Analogimodell (Tablå 39–41 · s. 232–238)
          </button>
        </div>
      </div>

      {/* Vy 1: Mark & Kind (41 informanter) */}
      {areaTab === "mark-kind" && (
        <div className="thesis-casestudy-panel">
          <div className="thesis-tabla28-box">
            <div className="thesis-tabla28-header">
              <div>
                <span className="eyebrow">
                  Kapitel 6.2 (s. {mk.sourceTabla30.printedPage}) · Karta 19–23
                </span>
                <h3>{mk.title}</h3>
              </div>
              <span className="thesis-time-pill">
                {mk.overview.informantsTotal} informanter (
                {mk.overview.birthYearRange})
              </span>
            </div>
            <p className="thesis-banner-summary">
              Intervjuade av {mk.overview.interviewer} kring åren{" "}
              {mk.overview.recordingYears.join(", ")}. Av informanterna är{" "}
              {mk.overview.menCount} män och {mk.overview.womenCount} kvinnor,
              varav {mk.overview.grownUpInMark} uppvuxna i Mark och{" "}
              {mk.overview.grownUpInKind} i Kind.
            </p>
            <p className="thesis-tabla29-footnote">
              <strong>Diakront skifte i um-områdets gräns (Karta 19–23):</strong>{" "}
              {mk.diachronicMapShiftKarta19To23.summary}
            </p>
          </div>

          {/* Kohorttabell Tablå 33 (s. 191) + Pronomenkorrelation Tabell 1–3 (s. 198–199) */}
          <div className="thesis-workbench-grid">
            <div className="thesis-tabla28-box">
              <span className="eyebrow">
                Tablå 33 (s. {mk.sourceTabla33.printedPage}) · Födelsekohorter i
                Mark och Kind
              </span>
              <h4>
                Fördelning över födelsekohorter ({mk.informants.length}{" "}
                informanter)
              </h4>
              <p className="thesis-slash-explanation">
                <strong>Viktig enhetsnot:</strong> Preferensordningen uttrycker
                antal <em>grammatiska personer</em> (1PL, 2PL, 3PL) – inte antal
                informanter.
              </p>
              <table className="thesis-tabla28-table">
                <thead>
                  <tr>
                    <th>Kohort</th>
                    <th>Födelseintervall</th>
                    <th>Spann</th>
                    <th>Antal informanter</th>
                    <th>Preferensordning (grammatiska personer)</th>
                  </tr>
                </thead>
                <tbody>
                  {mk.cohortsTabla33.map((row) => (
                    <tr key={row.cohort}>
                      <th>{row.cohort}</th>
                      <td>{row.birthYearRange}</td>
                      <td>{row.spanYears} år</td>
                      <td>
                        <strong>{row.informantCount}</strong>
                      </td>
                      <td>
                        <code>{row.preferenceOrder}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="thesis-tabla28-box">
              <span className="eyebrow">
                Tabell 1–3 (s. 198–199) · 3PL da, di och dum
              </span>
              <h4>Korrelation mellan 3PL-pronomen och verbböjning</h4>
              <p className="thesis-slash-explanation">
                Enhet: <strong>Antal informanter</strong> i Mark och Kind med
                respektive pronomen.
              </p>
              <table className="thesis-tabla28-table">
                <thead>
                  <tr>
                    <th>Tabell</th>
                    <th>Pronomen</th>
                    <th>Plural</th>
                    <th>Båda</th>
                    <th>Singular</th>
                    <th>Totalt</th>
                  </tr>
                </thead>
                <tbody>
                  {mk.pronounSummaryAllTokensTabell1.rows.map((r) => (
                    <tr key={`t1-${r.pronoun}`}>
                      <td>Tabell 1 (≥ 1 belägg)</td>
                      <th>
                        <em>{r.pronoun}</em>
                      </th>
                      <td>{r.pluralCount}</td>
                      <td>{r.bothCount}</td>
                      <td>{r.singularCount}</td>
                      <td>
                        <strong>{r.totalInformants}</strong>
                      </td>
                    </tr>
                  ))}
                  {mk.pronounSummaryMinFiveTabell2.rows.map((r) => (
                    <tr key={`t2-${r.pronoun}`} className="plural-row">
                      <td>Tabell 2 (≥ 5 belägg)</td>
                      <th>
                        <em>{r.pronoun}</em>
                      </th>
                      <td>{r.pluralCount}</td>
                      <td>{r.bothCount}</td>
                      <td>{r.singularCount}</td>
                      <td>
                        <strong>{r.totalInformants}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="thesis-tabla29-footnote">
                <strong>Källkritisk not (fotnot 112 s. 197–198):</strong>{" "}
                {mk.pronounSummaryMinFiveTabell2.footnote112Note}
              </p>
            </div>
          </div>

          {/* Filterbar informantmatris för Mark & Kind (Tablå 30, 32, 34) */}
          <div className="thesis-tabla28-box">
            <div className="thesis-tabla28-header">
              <div>
                <span className="eyebrow">
                  Tablå 30 (s. {mk.sourceTabla30.printedPage}), Tablå 32 (s.{" "}
                  {mk.sourceTabla32.printedPage}) & Tablå 34 (s.{" "}
                  {mk.sourceTabla34.printedPage})
                </span>
                <h4>
                  Visar {filteredMarkKind.length} av {mk.informants.length}{" "}
                  informanter i Mark och Kind
                </h4>
              </div>

              <div
                className="thesis-viewmode-toggle"
                role="group"
                aria-label="Välj matrisvy"
              >
                <button
                  type="button"
                  className={
                    matrixMode === "grammatical-person" ? "active" : ""
                  }
                  onClick={() => setMatrixMode("grammatical-person")}
                >
                  Tablå 32: 1PL / 2PL / 3PL
                </button>
                <button
                  type="button"
                  className={
                    matrixMode === "pronoun-correlation" ? "active" : ""
                  }
                  onClick={() => setMatrixMode("pronoun-correlation")}
                >
                  Tablå 34: 3PL da / di / dum
                </button>
              </div>
            </div>

            <div className="thesis-matrix-filters">
              <label className="thesis-verb-select-label">
                <span>Härad</span>
                <select
                  value={mkHundredFilter}
                  onChange={(e) => setMkHundredFilter(e.target.value)}
                >
                  <option value="all">Alla härader</option>
                  <option value="Mark">Marks härad</option>
                  <option value="Kind">Kinds härad</option>
                </select>
              </label>

              <label className="thesis-verb-select-label">
                <span>Födelsekohort</span>
                <select
                  value={mkCohortFilter}
                  onChange={(e) => setMkCohortFilter(e.target.value)}
                >
                  <option value="all">Alla kohorter</option>
                  <option value="Generation 1">Generation 1 (1851–1869)</option>
                  <option value="Generation 2">Generation 2 (1870–1884)</option>
                  <option value="Generation 3">Generation 3 (1885–1903)</option>
                </select>
              </label>

              <label className="thesis-verb-select-label">
                <span>Sök talare / socken</span>
                <input
                  type="search"
                  placeholder="t.ex. JA, Kalv, Öxabäck..."
                  value={mkSearch}
                  onChange={(e) => setMkSearch(e.target.value)}
                />
              </label>
            </div>

            <div className="thesis-tabla26-scroll">
              <table className="thesis-tabla28-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Född</th>
                    <th>Inspelad</th>
                    <th>Socken & härad</th>
                    <th>Kohort</th>
                    {matrixMode === "grammatical-person" ? (
                      <>
                        <th>1PL (Tablå 32)</th>
                        <th>2PL (Tablå 32)</th>
                        <th>3PL (Tablå 32)</th>
                      </>
                    ) : (
                      <>
                        <th>3PL da (Tablå 34)</th>
                        <th>3PL di (Tablå 34)</th>
                        <th>3PL dum (Tablå 34)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredMarkKind.map((inf) => (
                    <tr key={inf.id}>
                      <th>
                        <code>{inf.id}</code>
                      </th>
                      <td>{inf.birthYear}</td>
                      <td>{inf.recordedYear}</td>
                      <td>
                        <strong>{inf.parish}</strong> ({inf.parishCode}) —{" "}
                        {inf.hundred}s hd
                      </td>
                      <td>
                        <small>{inf.cohort}</small>
                      </td>
                      {matrixMode === "grammatical-person" ? (
                        <>
                          <td>{renderUsageCell(inf.tabla32Usage.p1)}</td>
                          <td>{renderUsageCell(inf.tabla32Usage.p2)}</td>
                          <td>{renderUsageCell(inf.tabla32Usage.p3)}</td>
                        </>
                      ) : (
                        <>
                          <td>{renderPronounCell(inf.tabla34Pronouns.da)}</td>
                          <td>{renderPronounCell(inf.tabla34Pronouns.di)}</td>
                          <td>{renderPronounCell(inf.tabla34Pronouns.dum)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Talarprofiler i Mark & Kind (A06.5) */}
          <div className="thesis-speaker-profiles-grid">
            {mk.speakerProfiles.map((sp) => (
              <article key={sp.informantId} className="thesis-speaker-card">
                <div className="thesis-banner-top">
                  <span className="eyebrow">
                    Talarprofil (A06.5) · {sp.parishAndHundred} (f.{" "}
                    {sp.birthYear})
                  </span>
                  <span className="thesis-page-badge">
                    s. {sp.source.printedPage}
                  </span>
                </div>
                <h4>
                  <code>{sp.informantId}</code> — {sp.title}
                </h4>
                <p>{sp.summary}</p>
                <div className="thesis-speaker-quotes">
                  {sp.examples.map((ex, i) => (
                    <blockquote key={i} className="thesis-dialect-quote">
                      <strong>”{ex.dialectText}”</strong>
                      <span>{ex.standardTranslation}</span>
                      <small>
                        ({ex.numberInThesis} — {ex.grammaticalFocus})
                      </small>
                    </blockquote>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Vy 2: Östra Göinge (21 informanter + K01) */}
      {areaTab === "ostra-goinge" && (
        <div className="thesis-casestudy-panel">
          {/* K01 Källkritisk kontrollruta (A06.2) */}
          <div className="thesis-fn81-callout" role="note">
            <div className="thesis-banner-top">
              <strong>
                Källkritisk kontrollpunkt {og.auditNoticeK01.issueId}:{" "}
                {og.auditNoticeK01.title}
              </strong>
              <span className="thesis-page-badge">
                s. {og.auditNoticeK01.source.printedPage}
              </span>
            </div>
            <p style={{ margin: ".45rem 0 0" }}>
              <strong>Sifferavvikelse:</strong> {og.auditNoticeK01.page212Quote}{" "}
              — {og.auditNoticeK01.page217AndTablesFact}.
            </p>
            <p style={{ margin: ".35rem 0 0" }}>
              <strong>Redaktionell hantering:</strong>{" "}
              {og.auditNoticeK01.editorialHandlingNote}
            </p>
          </div>

          <div className="thesis-tabla28-box">
            <div className="thesis-tabla28-header">
              <div>
                <span className="eyebrow">
                  Kapitel 6.3 (s. {og.sourceTabla35.printedPage}) · Karta 26–27
                </span>
                <h3>{og.title}</h3>
              </div>
              <span className="thesis-time-pill">
                {og.informants.length} informanter i Tablå 35–38 (
                {og.overview.birthYearRange})
              </span>
            </div>
            <p className="thesis-banner-summary">
              Intervjuer och inspelningar i Östra Göinge härad. Av informanterna
              är {og.overview.informantsUsingPluralAtLeastOnce} belagda med
              pluralform minst en gång, och{" "}
              {og.overview.informantsExclusivelyPlural} har uteslutande
              pluralform.
            </p>
          </div>

          {/* Kohorttabell Tablå 37 (s. 220) + Pronomenkorrelation Tabell 4–5 (s. 225–226) */}
          <div className="thesis-workbench-grid">
            <div className="thesis-tabla28-box">
              <span className="eyebrow">
                Tablå 37 (s. {og.sourceTabla37.printedPage}) · Födelsekohorter i
                Östra Göinge
              </span>
              <h4>
                Fördelning över födelsekohorter ({og.informants.length}{" "}
                informanter)
              </h4>
              <p className="thesis-slash-explanation">
                <strong>Viktig enhetsnot:</strong> Preferensordningen avser
                antal <em>grammatiska personer</em> (1PL, 2PL, 3PL).
              </p>
              <table className="thesis-tabla28-table">
                <thead>
                  <tr>
                    <th>Kohort</th>
                    <th>Födelseintervall</th>
                    <th>Spann</th>
                    <th>Antal informanter</th>
                    <th>Preferensordning (grammatiska personer)</th>
                  </tr>
                </thead>
                <tbody>
                  {og.cohortsTabla37.map((row) => (
                    <tr key={row.cohort}>
                      <th>{row.cohort}</th>
                      <td>{row.birthYearRange}</td>
                      <td>{row.spanYears} år</td>
                      <td>
                        <strong>{row.informantCount}</strong>
                      </td>
                      <td>
                        <code>{row.preferenceOrder}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="thesis-tabla28-box">
              <span className="eyebrow">
                Tabell 4–5 (s. 225–226) · 3PL då, di och dåm
              </span>
              <h4>Korrelation mellan 3PL-pronomen och verbböjning</h4>
              <table className="thesis-tabla28-table">
                <thead>
                  <tr>
                    <th>Tabell</th>
                    <th>Pronomen</th>
                    <th>Plural</th>
                    <th>Båda</th>
                    <th>Singular</th>
                    <th>Totalt</th>
                  </tr>
                </thead>
                <tbody>
                  {og.pronounSummaryAllTokensTabell4.rows.map((r) => (
                    <tr key={`t4-${r.pronoun}`}>
                      <td>Tabell 4 (≥ 1 belägg)</td>
                      <th>
                        <em>{r.pronoun}</em>
                      </th>
                      <td>{r.pluralCount}</td>
                      <td>{r.bothCount}</td>
                      <td>{r.singularCount}</td>
                      <td>
                        <strong>{r.totalInformants}</strong>
                      </td>
                    </tr>
                  ))}
                  {og.pronounSummaryMinFiveTabell5.rows.map((r) => (
                    <tr key={`t5-${r.pronoun}`} className="plural-row">
                      <td>Tabell 5 (≥ 5 belägg)</td>
                      <th>
                        <em>{r.pronoun}</em>
                      </th>
                      <td>{r.pluralCount}</td>
                      <td>{r.bothCount}</td>
                      <td>{r.singularCount}</td>
                      <td>
                        <strong>{r.totalInformants}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Filterbar informantmatris för Östra Göinge (Tablå 35, 36, 38) */}
          <div className="thesis-tabla28-box">
            <div className="thesis-tabla28-header">
              <div>
                <span className="eyebrow">
                  Tablå 35 (s. {og.sourceTabla35.printedPage}), Tablå 36 (s.{" "}
                  {og.sourceTabla36.printedPage}) & Tablå 38 (s.{" "}
                  {og.sourceTabla38.printedPage})
                </span>
                <h4>
                  Visar {filteredOstraGoinge.length} av {og.informants.length}{" "}
                  informanter i Östra Göinge
                </h4>
              </div>

              <div
                className="thesis-viewmode-toggle"
                role="group"
                aria-label="Välj matrisvy"
              >
                <button
                  type="button"
                  className={
                    matrixMode === "grammatical-person" ? "active" : ""
                  }
                  onClick={() => setMatrixMode("grammatical-person")}
                >
                  Tablå 36: 1PL / 2PL / 3PL
                </button>
                <button
                  type="button"
                  className={
                    matrixMode === "pronoun-correlation" ? "active" : ""
                  }
                  onClick={() => setMatrixMode("pronoun-correlation")}
                >
                  Tablå 38: 3PL då / di / dåm
                </button>
              </div>
            </div>

            <p className="thesis-slash-explanation">
              <strong>Teckenförklaring (Tablå 35, s. 213):</strong> Asterisk (
              <code>*</code>) vid födelseår = approximativt födelseår (
              <code>VS</code>, <code>NN 2</code>, <code>AP</code>). Frågetecken (
              <code>?</code>) = okänt inspelningsår (<code>NN 1</code>,{" "}
              <code>PT</code>, <code>JJ</code>, <code>AB</code>).
            </p>

            <div className="thesis-matrix-filters">
              <label className="thesis-verb-select-label">
                <span>Födelsekohort</span>
                <select
                  value={ogCohortFilter}
                  onChange={(e) => setOgCohortFilter(e.target.value)}
                >
                  <option value="all">Alla kohorter</option>
                  <option value="Generation 2">Generation 2 (1861–1879)</option>
                  <option value="Generation 3">Generation 3 (1880–1894)</option>
                  <option value="Generation 4">Generation 4 (1895–1908)</option>
                </select>
              </label>

              <label className="thesis-verb-select-label">
                <span>Sök talare / socken</span>
                <input
                  type="search"
                  placeholder="t.ex. OB 1, NBS, Glimåkra..."
                  value={ogSearch}
                  onChange={(e) => setOgSearch(e.target.value)}
                />
              </label>
            </div>

            <div className="thesis-tabla26-scroll">
              <table className="thesis-tabla28-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Född</th>
                    <th>Inspelad</th>
                    <th>Socken</th>
                    <th>Intervjuare / Transkriberare</th>
                    {matrixMode === "grammatical-person" ? (
                      <>
                        <th>1PL (Tablå 36)</th>
                        <th>2PL (Tablå 36)</th>
                        <th>3PL (Tablå 36)</th>
                      </>
                    ) : (
                      <>
                        <th>3PL då (Tablå 38)</th>
                        <th>3PL di (Tablå 38)</th>
                        <th>3PL dåm (Tablå 38)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredOstraGoinge.map((inf) => (
                    <tr key={inf.id}>
                      <th>
                        <code>{inf.id}</code>
                      </th>
                      <td>
                        {inf.birthYear}
                        {inf.isBirthYearApproximate ? "*" : ""}
                      </td>
                      <td>{inf.recordedYearRaw}</td>
                      <td>
                        <strong>{inf.parish}</strong> ({inf.parishCode})
                      </td>
                      <td>
                        <small>
                          {inf.interviewer} / {inf.transcriber}
                        </small>
                      </td>
                      {matrixMode === "grammatical-person" ? (
                        <>
                          <td>{renderUsageCell(inf.tabla36Usage.p1)}</td>
                          <td>{renderUsageCell(inf.tabla36Usage.p2)}</td>
                          <td>{renderUsageCell(inf.tabla36Usage.p3)}</td>
                        </>
                      ) : (
                        <>
                          <td>{renderPronounCell(inf.tabla38Pronouns.da_ost)}</td>
                          <td>{renderPronounCell(inf.tabla38Pronouns.di)}</td>
                          <td>{renderPronounCell(inf.tabla38Pronouns.dam)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Talarprofiler i Östra Göinge (A06.5) */}
          <div className="thesis-speaker-profiles-grid">
            {og.speakerProfiles.map((sp) => (
              <article key={sp.informantId} className="thesis-speaker-card">
                <div className="thesis-banner-top">
                  <span className="eyebrow">
                    Talarprofil (A06.5) · {sp.parishAndHundred} (f.{" "}
                    {sp.birthYear})
                  </span>
                  <span className="thesis-page-badge">
                    s. {sp.source.printedPage}
                  </span>
                </div>
                <h4>
                  <code>{sp.informantId}</code> — {sp.title}
                </h4>
                <p>{sp.summary}</p>
                <div className="thesis-speaker-quotes">
                  {sp.examples.map((ex, i) => (
                    <blockquote key={i} className="thesis-dialect-quote">
                      <strong>”{ex.dialectText}”</strong>
                      <span>{ex.standardTranslation}</span>
                      <small>
                        ({ex.numberInThesis} — {ex.grammaticalFocus})
                      </small>
                    </blockquote>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Vy 3: Syntes & Analogimodell Tablå 39–41 (A06.6) */}
      {areaTab === "syntes" && (
        <div className="thesis-casestudy-panel">
          <div className="thesis-workbench-grid">
            <div className="thesis-tabla28-box">
              <span className="eyebrow">
                Tablå 39 (s. {syn.sourceTabla39.printedPage}) · Syntes (A06.6)
              </span>
              <h3>{syn.title}</h3>
              <p className="thesis-slash-explanation">{syn.unitReminder}</p>

              <table className="thesis-tabla28-table">
                <thead>
                  <tr>
                    <th>Kohort</th>
                    <th>Födelseår</th>
                    <th>Mark och Kind</th>
                    <th>Östra Göinge</th>
                  </tr>
                </thead>
                <tbody>
                  {syn.combinedCohortsTabla39.map((row) => (
                    <tr key={row.cohort}>
                      <th>{row.cohort}</th>
                      <td>{row.birthYears}</td>
                      <td>
                        <code>{row.preferenceMarkAndKind}</code>
                      </td>
                      <td>
                        <code>{row.preferenceOstraGoinge}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="thesis-allomorph-notes">
                <h5>Slutsatser (s. 232–234)</h5>
                <p>{syn.oneGenerationLagConclusion}</p>
                <p>{syn.intensiveLanguageShiftWindow}</p>
              </div>
            </div>

            <div className="thesis-tabla28-box">
              <span className="eyebrow">
                Tablå 41 (s.{" "}
                {og.intraparadigmaticChangeModelTabla41.source.printedPage}) ·
                Analogimodell
              </span>
              <h3>{og.intraparadigmaticChangeModelTabla41.title}</h3>
              <p className="thesis-banner-summary">
                {og.intraparadigmaticChangeModelTabla41.explanation}
              </p>

              <table className="thesis-tabla28-table">
                <thead>
                  <tr>
                    <th>Steg & Paradigm</th>
                    <th>Pres. 1PL</th>
                    <th>Pres. 3PL</th>
                    <th>Pret. 1PL</th>
                    <th>Pret. 3PL</th>
                  </tr>
                </thead>
                <tbody>
                  {og.intraparadigmaticChangeModelTabla41.steps.map((st) => (
                    <tr key={st.step}>
                      <th>
                        <strong>{st.step}</strong>
                        <div className="thesis-cell-raw">{st.subtitle}</div>
                      </th>
                      <td>
                        <code>{st.presens1PL}</code>
                      </td>
                      <td>
                        <code>{st.presens3PL}</code>
                      </td>
                      <td>
                        <code>{st.preteritum1PL}</code>
                      </td>
                      <td>
                        <code>{st.preteritum3PL}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="thesis-subarea-Highlight" style={{ marginTop: "1rem" }}>
                <strong>
                  {syn.pronounContactTabla40.title} (s.{" "}
                  {syn.pronounContactTabla40.source.printedPage}):
                </strong>
                <p>{syn.pronounContactTabla40.explanationWhy1PLShiftsFirst}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
