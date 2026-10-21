"use client";

import type {
  GrammaticalTense,
  ParadigmDefinition,
  ReferenceVerbParadigmTabla29,
  RegionSubArea,
  ThesisRegion,
} from "@/lib/thesis/types";

export default function Tabla28And29Panel({
  paradigms,
  selectedParadigm,
  selectedRegion,
  selectedSubArea,
  tense,
  selectedVerbLemma,
  tabla29Verbs,
  onSelectParadigmRegion,
  onChangeTense,
  onChangeVerbLemma,
}: {
  paradigms: ParadigmDefinition[];
  selectedParadigm: ParadigmDefinition;
  selectedRegion: ThesisRegion;
  selectedSubArea: RegionSubArea | null;
  tense: GrammaticalTense;
  selectedVerbLemma: string;
  tabla29Verbs: ReferenceVerbParadigmTabla29[];
  onSelectParadigmRegion: (paradigmId: ParadigmDefinition["id"]) => void;
  onChangeTense: (tense: GrammaticalTense) => void;
  onChangeVerbLemma: (lemma: string) => void;
}) {
  const activeVerb =
    tabla29Verbs.find((v) => v.lemma === selectedVerbLemma) ?? tabla29Verbs[3];

  const resolveDisplayedEnding = (
    rawEnding: string,
    nDropInNorth: string | null
  ): string => {
    if (selectedSubArea?.nDropRealization === "-e" && nDropInNorth) {
      return nDropInNorth;
    }
    if (selectedSubArea?.nDropRealization === "-en" && rawEnding === "-e(n)") {
      return "-en";
    }
    return rawEnding;
  };

  return (
    <div className="thesis-paradigm-panel">
      {/* Aktivt områdeskort */}
      <div
        className="thesis-active-region-banner"
        style={{ borderLeftColor: selectedParadigm.webDisplayColorHex }}
      >
        <div className="thesis-banner-top">
          <span className="eyebrow">
            Valt paradigm · {selectedParadigm.agreementType === "personkongruens" ? "Personkongruens i plural" : "Ren numeruskongruens i plural"}
          </span>
          <span className="thesis-syncretism-badge">
            {selectedParadigm.syncretismPattern} · {selectedParadigm.distinctPersonsInPlural}{" "}
            {selectedParadigm.distinctPersonsInPlural === 1
              ? "pluralform"
              : "skilda pluralformer"}
          </span>
        </div>
        <h3>
          {selectedParadigm.name} ({selectedRegion.name})
        </h3>
        <p className="thesis-banner-summary">{selectedParadigm.summary}</p>
        <p className="thesis-banner-syncretism">
          <strong>Synkretism:</strong> {selectedParadigm.syncretismDescription}
        </p>
        {selectedSubArea && (
          <div className="thesis-subarea-Highlight">
            <strong>Valt delområde: {selectedSubArea.name}</strong>
            <p>{selectedSubArea.description}</p>
          </div>
        )}
      </div>

      {/* Tablå 28 med tempusväxlare */}
      <div className="thesis-tabla28-box">
        <div className="thesis-tabla28-header">
          <div>
            <span className="eyebrow">Tablå 28 · Tryckt s. 147 (PDF-s. 147)</span>
            <h4>De sydvästsvenska paradigmens pluraländelser i indikativ</h4>
          </div>
          <div
            className="thesis-tense-toggle"
            role="group"
            aria-label="Välj tempus för att tolka snedstrecket (-a / -e) i Tablå 28"
          >
            <button
              type="button"
              className={tense === "presens" ? "active" : ""}
              aria-pressed={tense === "presens"}
              onClick={() => onChangeTense("presens")}
            >
              Presens (-a)
            </button>
            <button
              type="button"
              className={tense === "preteritum" ? "active" : ""}
              aria-pressed={tense === "preteritum"}
              onClick={() => onChangeTense("preteritum")}
            >
              Preteritum (-e)
            </button>
          </div>
        </div>

        <p className="thesis-slash-explanation">
          <strong>Så läses snedstrecket i Tablå 28:</strong>{" "}
          <code>-a / -e</code> betyder <strong>presens</strong> (<code>-a</code>)
          respektive <strong>preteritum</strong> (<code>-e</code>) — aldrig fri
          variation. Nedan visas både originalcellens beteckning och aktiv{" "}
          <strong>{tense}</strong>-ändelse.
        </p>

        <div className="table-scroll">
          <table className="thesis-tabla28-table">
            <thead>
              <tr>
                <th scope="col">Person</th>
                {paradigms.map((p) => {
                  const isCurrent = p.id === selectedParadigm.id;
                  return (
                    <th
                      key={p.id}
                      scope="col"
                      className={isCurrent ? "active-col" : ""}
                    >
                      <button
                        type="button"
                        className="thesis-col-select-btn"
                        aria-pressed={isCurrent}
                        onClick={() => onSelectParadigmRegion(p.id)}
                      >
                        <span
                          className="thesis-color-dot"
                          style={{ backgroundColor: p.webDisplayColorHex }}
                          aria-hidden="true"
                        />
                        <strong>{p.name}</strong>
                        <small>{p.syncretismPattern}</small>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2].map((rowIndex) => {
                const personNum = (rowIndex + 1) as 1 | 2 | 3;
                const personPronouns =
                  personNum === 1
                    ? "1p (vi)"
                    : personNum === 2
                      ? "2p (I / ni)"
                      : "3p (di / de)";
                return (
                  <tr key={personNum}>
                    <th scope="row" className="thesis-person-row-header">
                      <strong>{personPronouns}</strong>
                    </th>
                    {paradigms.map((p) => {
                      const cell = p.cells[rowIndex];
                      const isCurrent = p.id === selectedParadigm.id;
                      const activeTenseEnding =
                        tense === "presens"
                          ? cell.presentEnding
                          : cell.pastEnding;
                      const contextualEnding = isCurrent
                        ? resolveDisplayedEnding(
                            activeTenseEnding,
                            cell.nDropVariantInNorth
                          )
                        : activeTenseEnding;

                      return (
                        <td
                          key={cell.id}
                          data-syncretism={cell.syncretismGroup}
                          className={isCurrent ? "active-col" : ""}
                        >
                          <div className="thesis-cell-content">
                            <span className="thesis-cell-raw">
                              Tablå 28: <code>{cell.rawCellText}</code>
                            </span>
                            <strong className="thesis-cell-active-ending">
                              {tense === "presens" ? "Pres." : "Pret."}:{" "}
                              {contextualEnding}
                            </strong>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Allomorfi och vokalkrock för valt paradigm */}
        <div className="thesis-allomorph-notes">
          <h5>
            Allomorfi, n-bortfall och vokalkrock i {selectedParadigm.name} (s. 147, 152–155)
          </h5>
          <ul>
            {selectedParadigm.cells.map((cell) => (
              <li key={cell.id}>
                <strong>{cell.person} person plural ({cell.rawCellText}):</strong>{" "}
                {cell.allomorphs.map((a) => `${a.form} (${a.condition})`).join(" · ")}{" "}
                <em>{cell.hiatusRule}</em>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tablå 29 & böjda exempelverb */}
      <div className="thesis-tabla29-box">
        <div className="thesis-tabla29-header">
          <div>
            <span className="eyebrow">
              Böjda exempel (Tablå 28 s. 147 &amp; Tablå 29 s. 153)
            </span>
            <h4>Så ser verben ut i fullständiga meningar och paradigm</h4>
          </div>
          <label className="thesis-verb-select-label">
            <span>Typverb i Tablå 29 (s. 153):</span>
            <select
              value={activeVerb.lemma}
              onChange={(e) => onChangeVerbLemma(e.target.value)}
            >
              {tabla29Verbs.map((v) => (
                <option key={v.lemma} value={v.lemma}>
                  {v.lemma} — {v.gloss}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Böjda exempel för det valda paradigmet */}
        <div className="thesis-example-cards">
          {selectedParadigm.exampleForms.map((ex) => (
            <div key={ex.person} className="thesis-example-card">
              <span className="eyebrow">
                {ex.person} person plural ({ex.formType === "inflected_form" ? "direkt källform" : "pedagogiskt exempel efter Tablå 28/29"})
              </span>
              <strong>
                {tense === "presens"
                  ? `${ex.pronoun} ${ex.presentForm}`
                  : `${ex.pronoun} ${ex.pastForm}`}
              </strong>
              <span className="thesis-example-translation">
                Standardsvenska:{" "}
                {tense === "presens"
                  ? ex.translationPresent
                  : ex.translationPast}
              </span>
              <small>{ex.comment}</small>
            </div>
          ))}
        </div>

        {/* Fullständigt referensparadigm ur Tablå 29 (s. 153, södra um-området) */}
        <details className="thesis-tabla29-details" open>
          <summary>
            Visa hela Tablå 29-paradigmet (s. 153, södra um-området) för{" "}
            <em>{activeVerb.gloss}</em> — singular, plural och imperativ
          </summary>
          <div className="table-scroll">
            <table className="thesis-tabla29-table">
              <thead>
                <tr>
                  <th scope="col">Person &amp; numerus</th>
                  <th scope="col">Presens indikativ</th>
                  <th scope="col">Preteritum indikativ</th>
                  <th scope="col">Imperativ (s. 153)</th>
                </tr>
              </thead>
              <tbody>
                {(["1s", "2s", "3s", "1p", "2p", "3p"] as const).map((slot) => {
                  const isPlural = slot.endsWith("p");
                  const impCell =
                    slot === "2s"
                      ? activeVerb.imperativ["2s"]
                      : slot === "2p"
                        ? activeVerb.imperativ["2p"]
                        : "—";
                  return (
                    <tr key={slot} className={isPlural ? "plural-row" : ""}>
                      <th scope="row">{slot}</th>
                      <td>
                        <code>{activeVerb.presensIndikativ[slot]}</code>
                      </td>
                      <td>
                        <code>{activeVerb.preteritumIndikativ[slot]}</code>
                      </td>
                      <td>
                        <code>{impCell}</code>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="thesis-tabla29-footnote">
            Källa: <strong>Tablå 29</strong> (tryckt s. 153 / PDF-s. 153). Idealiserat mål i norra delen av mellersta Halland (södra um-området) med bevarat finalt <code>/n/</code> i <code>-en</code>. Parenteser kring <code>-(st)</code> anger att 2 person singular-böjning varierar.
          </p>
        </details>
      </div>
    </div>
  );
}
