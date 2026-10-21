"use client";

import { useState } from "react";
import type {
  GlossaryTerm,
  RegionSubArea,
  SourceDocument,
  ThesisAuditEntry,
  ThesisRegion,
} from "@/lib/thesis/types";

export default function SourceAndGlossaryPanel({
  sourceDocument,
  sourcePanelIntro,
  selectedRegion,
  selectedSubArea,
  editorialSourceNote,
  glossary,
  selectedGlossaryTermId,
  auditLog,
  onSelectGlossaryTerm,
}: {
  sourceDocument: SourceDocument;
  sourcePanelIntro: string;
  selectedRegion: ThesisRegion;
  selectedSubArea: RegionSubArea | null;
  editorialSourceNote: string;
  glossary: GlossaryTerm[];
  selectedGlossaryTermId: string | null;
  auditLog: ThesisAuditEntry[];
  onSelectGlossaryTerm: (termId: string | null) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const activeUncertainty = selectedSubArea
    ? selectedSubArea.uncertainty
    : selectedRegion.uncertainty;
  const activeSource = selectedSubArea
    ? selectedSubArea.source
    : selectedRegion.source;

  const filteredGlossary = glossary.filter((term) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      term.term.toLowerCase().includes(q) ||
      term.shortDefinition.toLowerCase().includes(q) ||
      term.thesisSpecificNuance.toLowerCase().includes(q)
    );
  });

  const termById = new Map(glossary.map((g) => [g.id, g]));

  return (
    <div className="thesis-source-glossary-wrapper">
      {/* Käll- och osäkerhetskort för aktivt område / delområde */}
      <section
        className="thesis-source-card"
        aria-labelledby="active-source-heading"
      >
        <div className="thesis-source-card-header">
          <div>
            <span className="eyebrow">
              Källhänvisning &amp; osäkerhetsredovisning
            </span>
            <h3 id="active-source-heading">
              {selectedSubArea ? selectedSubArea.name : selectedRegion.name}
            </h3>
          </div>
          <span className="thesis-page-badge">
            Tryckt s. {activeSource.printedPage}
            {activeSource.printedPageEnd
              ? `–${activeSource.printedPageEnd}`
              : ""}{" "}
            · PDF-s. {activeSource.pdfPage}
            {activeSource.pdfPageEnd ? `–${activeSource.pdfPageEnd}` : ""}
          </span>
        </div>

        <p className="thesis-editorial-note">{editorialSourceNote}</p>

        {activeSource.footnotes?.includes(81) && (
          <div className="thesis-fn81-callout" role="note">
            <strong>Fotnot 81 (tryckt s. 147 / PDF-s. 147):</strong>{" "}
            {activeSource.quoteOrReading ??
              "I några ytterområden är endast 3p belagd, inte 1p eller 2p. I dessa områden har gränserna dragits utifrån hur det ser ut i angränsande områden (e-området i norra Halland och a-området i Blekinge)."}
          </div>
        )}

        {/* Tredelad osäkerhetsruta enligt PLAN.md */}
        <div className="thesis-uncertainty-grid">
          <div>
            <span className="eyebrow">1. Detta visar källan</span>
            <p>{activeUncertainty.whatSourceShows}</p>
          </div>
          <div>
            <span className="eyebrow">2. Så har vi återgett det</span>
            <p>{activeUncertainty.howWeRepresentIt}</p>
          </div>
          <div>
            <span className="eyebrow">3. Detta är osäkert</span>
            <p>{activeUncertainty.whatIsUncertain}</p>
          </div>
        </div>

        {/* Tidsroll och varning mot feltolkning */}
        <div className="thesis-time-warning-box">
          <div>
            <span className="eyebrow">
              Tidsroll: {selectedRegion.timeSpecification.role} · Ingen årsvis interpolation
            </span>
            <strong>{selectedRegion.timeSpecification.label}</strong>
          </div>
          <p>{selectedRegion.timeSpecification.warningAgainstMisinterpretation}</p>
        </div>

        {/* Dokumenterade lokala undantag i regionen */}
        {selectedRegion.documentedExceptions.length > 0 && (
          <div className="thesis-exceptions-box">
            <h4>
              Dokumenterade lokala undantag och gränsfenomen i{" "}
              {selectedRegion.name}
            </h4>
            <ul>
              {selectedRegion.documentedExceptions.map((exc) => (
                <li key={exc.id}>
                  <strong>{exc.location}</strong> — <em>{exc.phenomenon}</em>:{" "}
                  {exc.explanation}{" "}
                  <span className="thesis-inline-source">
                    (Tryckt s. {exc.source.printedPage}
                    {exc.source.printedPageEnd
                      ? `–${exc.source.printedPageEnd}`
                      : ""}
                    , PDF-s. {exc.source.pdfPage})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Begreppsordlista (A01.4 & A03.3) */}
      <section
        className="thesis-glossary-section"
        aria-labelledby="thesis-glossary-heading"
      >
        <div className="thesis-glossary-header">
          <div>
            <span className="eyebrow">Kärnordlista · 13 granskade termer</span>
            <h2 id="thesis-glossary-heading">
              Språkvetenskapliga nyckelbegrepp i avhandlingen
            </h2>
            <p>{sourcePanelIntro}</p>
          </div>
          <label className="thesis-glossary-search">
            <span>Filtrera begrepp:</span>
            <input
              type="search"
              placeholder="Sök t.ex. synkretism, kongruens, allomorfi …"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>

        <div className="thesis-glossary-grid">
          {filteredGlossary.map((term) => {
            const isHighlighted = term.id === selectedGlossaryTermId;
            return (
              <article
                key={term.id}
                id={term.id}
                className={`thesis-glossary-card ${isHighlighted ? "highlighted" : ""}`}
              >
                <div className="thesis-glossary-card-top">
                  <h3>{term.term}</h3>
                  <span className="thesis-inline-source">
                    s. {term.source.printedPage}
                    {term.source.printedPageEnd
                      ? `–${term.source.printedPageEnd}`
                      : ""}
                  </span>
                </div>
                <p className="thesis-glossary-def">{term.shortDefinition}</p>
                <p className="thesis-glossary-nuance">
                  <strong>I avhandlingen:</strong> {term.thesisSpecificNuance}
                </p>
                <p className="thesis-glossary-example">
                  <strong>Exempel:</strong> <em>{term.example}</em>
                </p>
                {term.contrastTermIds.length > 0 && (
                  <div className="thesis-glossary-contrasts">
                    <span>Jämför med:</span>
                    {term.contrastTermIds.map((cid) => {
                      const related = termById.get(cid);
                      if (!related) return null;
                      return (
                        <button
                          key={cid}
                          type="button"
                          onClick={() => onSelectGlossaryTerm(cid)}
                        >
                          {related.term}
                        </button>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Bibliografi och källkritiskt granskningsregister */}
      <section
        className="thesis-bibliography-section"
        aria-labelledby="thesis-bib-heading"
      >
        <div className="thesis-bib-grid">
          <div>
            <span className="eyebrow">Primärkälla &amp; bibliografi</span>
            <h2 id="thesis-bib-heading">Om källutgåvan</h2>
            <p>
              <strong>{sourceDocument.author}</strong> ({sourceDocument.year}).{" "}
              <em>
                {sourceDocument.title}. {sourceDocument.subtitle}
              </em>
              . ({sourceDocument.series}.) Uppsala: {sourceDocument.publisher}.
            </p>
            <ul className="thesis-bib-meta">
              <li>
                <strong>ISBN:</strong> <code>{sourceDocument.isbn}</code> ·{" "}
                <strong>ISSN:</strong> <code>{sourceDocument.issn}</code>
              </li>
              <li>
                <strong>URN:</strong> <code>{sourceDocument.urn}</code> (
                <a
                  href={sourceDocument.urnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Öppna posten i DiVA ↗
                </a>
                )
              </li>
              <li>
                <strong>Sidomfång:</strong> {sourceDocument.printedPagesTotal}{" "}
                tryckta sidor ({sourceDocument.pdfPagesTotal} PDF-sidor) ·{" "}
                <strong>SHA-256:</strong>{" "}
                <code>{sourceDocument.pdfSha256.slice(0, 16)}…</code>
              </li>
            </ul>
          </div>

          <div>
            <span className="eyebrow">Källkritiska regler (K01–K15)</span>
            <h3>Aktivt granskningsregister i piloten</h3>
            <ul className="thesis-audit-list">
              {auditLog.map((entry) => (
                <li key={entry.id}>
                  <strong>
                    {entry.id} (s. {entry.sourcePages.join(", ")}):
                  </strong>{" "}
                  {entry.summary} <em>Hantering: {entry.handlingRule}</em>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
