"use client";

import type {
  ChangeModelStep,
  GrammaticalTense,
  ParadigmDefinition,
  ParadigmId,
} from "@/lib/thesis/types";

export default function Figur6ChangeModel({
  sectionTitle,
  sectionIntro,
  modelNote,
  steps,
  paradigms,
  activeStepOrder,
  viewMode,
  tense,
  onSelectStep,
  onToggleViewMode,
  onSelectParadigmFromModel,
}: {
  sectionTitle: string;
  sectionIntro: string;
  modelNote: string;
  steps: ChangeModelStep[];
  paradigms: ParadigmDefinition[];
  activeStepOrder: number;
  viewMode: "interaktiv" | "statisk-jamforelse";
  tense: GrammaticalTense;
  onSelectStep: (stepOrder: number) => void;
  onToggleViewMode: (mode: "interaktiv" | "statisk-jamforelse") => void;
  onSelectParadigmFromModel: (paradigmId: ParadigmId) => void;
}) {
  const activeStep =
    steps.find((s) => s.stepOrder === activeStepOrder) ?? steps[0];
  const colorByParadigm = new Map(
    paradigms.map((p) => [p.id, p.webDisplayColorHex])
  );

  return (
    <section
      className="thesis-figur6-section"
      aria-labelledby="figur6-heading"
    >
      <div className="thesis-figur6-header">
        <div>
          <span className="eyebrow">
            Figur 6 · Tryckt s. 160 (PDF-s. 160) · Kapitel 7.3
          </span>
          <h2 id="figur6-heading">{sectionTitle}</h2>
          <p className="thesis-figur6-intro">{sectionIntro}</p>
        </div>

        <div
          className="thesis-viewmode-toggle"
          role="group"
          aria-label="Välj visningsläge för Figur 6"
        >
          <button
            type="button"
            className={viewMode === "interaktiv" ? "active" : ""}
            aria-pressed={viewMode === "interaktiv"}
            onClick={() => onToggleViewMode("interaktiv")}
          >
            Stegvis vy (1–4)
          </button>
          <button
            type="button"
            className={viewMode === "statisk-jamforelse" ? "active" : ""}
            aria-pressed={viewMode === "statisk-jamforelse"}
            onClick={() => onToggleViewMode("statisk-jamforelse")}
          >
            Visa alla steg samtidigt (statisk vy)
          </button>
        </div>
      </div>

      {/* Källkritisk modellnotis (K15) */}
      <div className="thesis-model-warning" role="note">
        <strong>Språkvetenskaplig modell (K15):</strong> {modelNote}
      </div>

      {/* Grenschema över Figur 6 (um -> e / skånsk -> a) */}
      <div
        className="thesis-figur6-diagram"
        role="group"
        aria-label="Schematisk översikt av de två utvecklingsvägarna i Figur 6 (s. 160)"
      >
        {steps.map((step) => {
          const isCurrent =
            viewMode === "statisk-jamforelse" ||
            step.stepOrder === activeStep.stepOrder;
          const color =
            colorByParadigm.get(step.toParadigmId) ?? "#2B6CB0";
          const endings =
            tense === "presens"
              ? step.presentEndingsSnapshot
              : step.pastEndingsSnapshot;

          return (
            <div
              key={step.id}
              className={`thesis-figur6-node ${isCurrent ? "active" : "dimmed"}`}
              data-branch={step.branch}
              style={{
                borderColor: isCurrent ? color : undefined,
                boxShadow:
                  step.stepOrder === activeStep.stepOrder
                    ? `6px 6px 0 ${color}`
                    : undefined,
              }}
            >
              <div className="thesis-figur6-node-top">
                <span className="eyebrow">Steg {step.stepOrder} av {steps.length}</span>
                <span
                  className="thesis-color-dot"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
              </div>
              <h3>{step.title}</h3>

              <div className="thesis-figur6-mini-table">
                <div>
                  <span>1p (vi)</span>
                  <strong
                    className={
                      step.changedPerson === 1 ||
                      step.changedPerson === "1_och_2"
                        ? "changed-cell"
                        : ""
                    }
                  >
                    {endings.p1}
                  </strong>
                </div>
                <div>
                  <span>2p (I)</span>
                  <strong
                    className={
                      step.changedPerson === 2 ||
                      step.changedPerson === "1_och_2"
                        ? "changed-cell"
                        : ""
                    }
                  >
                    {endings.p2}
                  </strong>
                </div>
                <div>
                  <span>3p (di)</span>
                  <strong>{endings.p3}</strong>
                </div>
              </div>

              {step.sourcePersonForAnalogy && (
                <p className="thesis-analogy-arrow">
                  Analogisk källa: <strong>{step.sourcePersonForAnalogy} person plural</strong>{" "}
                  → ersätter{" "}
                  <strong>
                    {step.changedPerson === "1_och_2"
                      ? "1 & 2 person"
                      : `${step.changedPerson} person`}
                  </strong>
                </p>
              )}

              <div className="thesis-figur6-node-actions">
                <button
                  type="button"
                  onClick={() => onSelectStep(step.stepOrder)}
                  aria-pressed={step.stepOrder === activeStep.stepOrder}
                >
                  {step.stepOrder === activeStep.stepOrder
                    ? "Aktivt steg"
                    : `Välj steg ${step.stepOrder}`}
                </button>
                <button
                  type="button"
                  className="secondary-link-btn"
                  onClick={() => onSelectParadigmFromModel(step.toParadigmId)}
                >
                  Visa på Karta 10 ↑
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stegkontroller och fördjupningsruta för aktivt steg */}
      {viewMode === "interaktiv" ? (
        <div className="thesis-step-detail-card" aria-live="polite">
          <div className="thesis-step-controls">
            <button
              type="button"
              disabled={activeStep.stepOrder <= 1}
              onClick={() => onSelectStep(Math.max(1, activeStep.stepOrder - 1))}
            >
              ← Föregående steg
            </button>
            <div className="thesis-step-dots" role="group" aria-label="Hoppa direkt till steg">
              {steps.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={s.stepOrder === activeStep.stepOrder ? "active" : ""}
                  aria-pressed={s.stepOrder === activeStep.stepOrder}
                  onClick={() => onSelectStep(s.stepOrder)}
                >
                  Steg {s.stepOrder}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={activeStep.stepOrder >= steps.length}
              onClick={() =>
                onSelectStep(Math.min(steps.length, activeStep.stepOrder + 1))
              }
            >
              Nästa steg →
            </button>
            <button
              type="button"
              className="reset-step-btn"
              onClick={() => onSelectStep(1)}
            >
              Återställ till steg 1
            </button>
          </div>

          <div className="thesis-step-explanation">
            <span className="eyebrow">
              Förklaring av steg {activeStep.stepOrder} · Tryckt s.{" "}
              {activeStep.source.printedPage} (PDF-s. {activeStep.source.pdfPage})
            </span>
            <h3>{activeStep.title}</h3>
            <p>{activeStep.explanation}</p>
            <p className="thesis-step-uncertainty">
              <strong>Källkritisk kommentar:</strong> {activeStep.uncertaintyNote}
            </p>
          </div>
        </div>
      ) : (
        <div className="thesis-static-comparison-table">
          <h3>Statisk helhetsjämförelse av alla fyra steg i Figur 6 (s. 160–161)</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Steg &amp; gren</th>
                  <th scope="col">1p / 2p / 3p (presens)</th>
                  <th scope="col">1p / 2p / 3p (preteritum)</th>
                  <th scope="col">Analogisk mekanism</th>
                  <th scope="col">Källkritisk kommentar &amp; sida</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((s) => (
                  <tr key={s.id}>
                    <th scope="row">
                      <strong>
                        {s.stepOrder}. {s.title}
                      </strong>
                    </th>
                    <td>
                      <code>
                        {s.presentEndingsSnapshot.p1} /{" "}
                        {s.presentEndingsSnapshot.p2} /{" "}
                        {s.presentEndingsSnapshot.p3}
                      </code>
                    </td>
                    <td>
                      <code>
                        {s.pastEndingsSnapshot.p1} /{" "}
                        {s.pastEndingsSnapshot.p2} /{" "}
                        {s.pastEndingsSnapshot.p3}
                      </code>
                    </td>
                    <td>{s.explanation}</td>
                    <td>
                      {s.uncertaintyNote} (s. {s.source.printedPage}
                      {s.source.footnotes?.length
                        ? `, not ${s.source.footnotes.join(", ")}`
                        : ""}
                      )
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
