"use client";

import { useState } from "react";
import type {
  NordicAtlasData,
  NordicTimeSliceId,
} from "@/lib/thesis/types";

type TimeViewMode = NordicTimeSliceId | "jamfor";
type RegionalDeepDiveTab = "dalmal" | "overkalix" | "estlandssvenska";

export default function NordicAtlasSection({
  atlas,
}: {
  atlas: NordicAtlasData;
}) {
  const [timeSlice, setTimeSlice] = useState<TimeViewMode>("jamfor");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [selectedKarta7Id, setSelectedKarta7Id] = useState<string>(
    atlas.karta7AndTabla26.karta7Regions[0]?.id ?? "k7-island-fararna"
  );
  const [deepDiveTab, setDeepDiveTab] =
    useState<RegionalDeepDiveTab>("dalmal");
  const [selectedDismantlingTypeId, setSelectedDismantlingTypeId] = useState<
    "typ-1" | "typ-2" | "typ-3" | "typ-4"
  >("typ-1");

  const k7 = atlas.karta7AndTabla26;
  const selectedKarta7Region =
    k7.karta7Regions.find((r) => r.id === selectedKarta7Id) ??
    k7.karta7Regions[0];

  const distinctGroups = Array.from(
    new Set(k7.tabla26Rows.map((r) => r.languageOrProvinceGroup))
  );

  const filteredTabla26Rows = k7.tabla26Rows.filter((row) =>
    groupFilter === "all" ? true : row.languageOrProvinceGroup === groupFilter
  );

  const selectedDismantlingType =
    atlas.dismantlingTypes.types.find(
      (t) => t.id === selectedDismantlingTypeId
    ) ?? atlas.dismantlingTypes.types[0];

  return (
    <section
      className="thesis-atlas-section"
      aria-labelledby="nordic-atlas-heading"
    >
      <div className="thesis-section-intro">
        <span className="eyebrow">
          Etapp 5 · Kapitel 4, 5.5–5.6 & 7.2 (s. 96–166, 241–248)
        </span>
        <h2 id="nordic-atlas-heading">{k7.title}</h2>
        <p>
          Utforska person- och numeruskongruensens utbredning i hela Norden vid
          de två diskreta tidssnitten <strong>ca 1850</strong> och{" "}
          <strong>ca 1900</strong> (Karta 7 s. 118 & Tablå 26 s. 120), tre
          regionala särsystem (dalmål, överkalixmål och estlandssvenska), plural
          imperativ i Sydvästsverige (Karta 15–16 s. 165–166) samt den
          hypotetiska rekonstruktionen av personkongruensens äldre utbredning
          (Karta 14 s. 161) och de fyra avvecklingstyperna (Tablå 42–43 & Figur
          10 s. 243–246).
        </p>
      </div>

      {/* Källkritisk varning för tidssnitt 1850 vs 1900 (A05.2) */}
      <div className="thesis-atlas-warning-grid">
        <div className="thesis-time-warning-box">
          <span className="eyebrow">
            Diskreta tidssnitt · Ojämn källtäckning ca 1850 (s. 117)
          </span>
          <p>{k7.unevenSourceCoverageWarning}</p>
        </div>
        <div className="thesis-time-warning-box">
          <span className="eyebrow">
            Historiska gränser (s. 117 fn 63) & imperativregel (s. 119–120)
          </span>
          <p>{k7.borderHistoricalNote}</p>
          <p className="thesis-atlas-note-secondary">
            <strong>Persistensregel för 2PL imperativ:</strong>{" "}
            {k7.imperativePersistenceRule}
          </p>
        </div>
      </div>

      {/* Del 1: Karta 7 & Tablå 26 (A05.1 & A05.2) */}
      <div className="thesis-atlas-workbench">
        {/* Vänster: Karta 7 översiktskarta + val av nordiskt område */}
        <div className="thesis-map-container">
          <div className="thesis-map-header">
            <div>
              <span className="eyebrow">
                Karta 7 (s. {k7.sourceKarta7.printedPage}) · Nordisk
                översiktskarta
              </span>
              <h3>Plural verbkongruens ca 1850 och ca 1900</h3>
            </div>
            <div
              className="thesis-tense-toggle"
              role="group"
              aria-label="Välj diskret tidssnitt för Karta 7"
            >
              {k7.discreteTimeSlices.map((slice) => (
                <button
                  key={slice.id}
                  type="button"
                  className={timeSlice === slice.id ? "active" : ""}
                  aria-pressed={timeSlice === slice.id}
                  onClick={() => setTimeSlice(slice.id)}
                >
                  {slice.label}
                </button>
              ))}
              <button
                type="button"
                className={timeSlice === "jamfor" ? "active" : ""}
                aria-pressed={timeSlice === "jamfor"}
                onClick={() => setTimeSlice("jamfor")}
              >
                Jämför 1850 → 1900
              </button>
            </div>
          </div>

          <figure
            className="thesis-svg-figure"
            aria-label="Schematisk nordisk karta enligt Karta 7 (s. 118)"
          >
            <svg
              viewBox="0 0 540 440"
              className="thesis-svg-canvas"
              role="img"
              aria-labelledby="karta7-svg-title"
            >
              <title id="karta7-svg-title">
                Karta 7 (s. 118): Utbredning av plural verbkongruens i indikativ
                och imperativ ca 1850 och ca 1900
              </title>
              <defs>
                <pattern
                  id="pattern-lost-1900"
                  width="8"
                  height="8"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect width="8" height="8" fill="#d97a4b" fillOpacity="0.32" />
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="8"
                    stroke="#8f3918"
                    strokeWidth="2.4"
                  />
                </pattern>
              </defs>

              <rect x="0" y="0" width="540" height="440" fill="#e5eef4" />

              {/* Schematisk nordisk kontur */}
              <path
                d="M 155,35 L 250,20 L 330,45 L 365,115 L 455,155 L 460,260 L 370,285 L 330,370 L 265,405 L 235,345 L 165,320 L 135,245 L 145,140 Z"
                fill="#f6f1e4"
                stroke="#8c8575"
                strokeWidth="1.2"
              />

              {/* Island & Färöarna infälld ruta */}
              <rect
                x="12"
                y="14"
                width="132"
                height="120"
                fill="#f6f1e4"
                stroke="#181815"
                strokeWidth="1"
              />
              <text x="20" y="30" className="thesis-map-province-label">
                ATLANTÖARNA
              </text>

              {k7.karta7Regions.map((reg) => {
                const isSelected = reg.id === selectedKarta7Region.id;
                const statusInSlice =
                  timeSlice === "ca_1850" ? reg.activeIn1850 : reg.activeIn1900;

                let fillColor = "#d9d4c5";
                if (timeSlice === "ca_1850" || timeSlice === "ca_1900") {
                  if (statusInSlice === "indikativ_och_imperativ") {
                    fillColor = "#24577a";
                  } else if (statusInSlice === "endast_imperativ") {
                    fillColor = "#2f855a";
                  }
                } else {
                  if (reg.activeIn1900 === "indikativ_och_imperativ") {
                    fillColor = "#24577a";
                  } else if (reg.activeIn1850 === "indikativ_och_imperativ") {
                    fillColor = "url(#pattern-lost-1900)";
                  } else if (reg.activeIn1900 === "endast_imperativ") {
                    fillColor = "#2f855a";
                  }
                }

                return (
                  <g
                    key={reg.id}
                    className="thesis-map-subarea-group"
                    role="button"
                    tabIndex={0}
                    aria-label={`${reg.name} (${reg.countryOrRealm})`}
                    onClick={() => setSelectedKarta7Id(reg.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedKarta7Id(reg.id);
                      }
                    }}
                  >
                    <ellipse
                      cx={reg.svgCoords.cx}
                      cy={reg.svgCoords.cy}
                      rx={reg.svgCoords.rx}
                      ry={reg.svgCoords.ry}
                      fill={fillColor}
                      stroke="#181815"
                      strokeWidth={isSelected ? "3" : "1.3"}
                      strokeDasharray={
                        reg.hasWaveHatchingPersonForms ? "none" : "4 2"
                      }
                    />
                    <text
                      x={reg.svgCoords.cx}
                      y={reg.svgCoords.cy + 3}
                      textAnchor="middle"
                      fontSize="8.5"
                      fontWeight="700"
                      fill={
                        fillColor === "#24577a" || fillColor === "#2f855a"
                          ? "#ffffff"
                          : "#181815"
                      }
                    >
                      {reg.name.length > 18
                        ? reg.name.slice(0, 16) + "…"
                        : reg.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            <figcaption className="thesis-map-legend">
              <div className="thesis-legend-row">
                <span>
                  <i
                    className="thesis-color-swatch"
                    style={{ background: "#24577a" }}
                  />{" "}
                  <strong>Mörkblått:</strong> Pluralböjning i både indikativ och
                  imperativ (heldragen kant = minst två personformer i plural)
                </span>
                <span>
                  <i
                    className="thesis-color-swatch"
                    style={{ background: "#2f855a" }}
                  />{" "}
                  <strong>Grönt:</strong> Pluralböjning endast bevarad i 2PL
                  imperativ
                </span>
                <span>
                  <i
                    className="thesis-color-swatch"
                    style={{ background: "#d97a4b" }}
                  />{" "}
                  <strong>Snedstreckat (1850 → 1900):</strong> Indikativ
                  pluralböjning belagd ca 1850 men försvunnen ca 1900
                </span>
              </div>
            </figcaption>
          </figure>

          {/* Valda Karta 7-områdets detaljkort */}
          <div className="thesis-karta7-detail-card">
            <div className="thesis-banner-top">
              <span className="eyebrow">
                Valt område i Karta 7 · {selectedKarta7Region.countryOrRealm}
              </span>
              <span className="thesis-syncretism-badge">
                1850: {selectedKarta7Region.activeIn1850} · 1900:{" "}
                {selectedKarta7Region.activeIn1900}
              </span>
            </div>
            <h4>{selectedKarta7Region.name}</h4>
            <p>{selectedKarta7Region.summary}</p>
            <p className="thesis-tabla29-footnote">
              <strong>Källförbehåll:</strong>{" "}
              {selectedKarta7Region.sourceCoverageCaveat} (s.{" "}
              {selectedKarta7Region.source.printedPage})
            </p>
            <div className="thesis-karta7-chips">
              {k7.karta7Regions.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`thesis-subarea-chip ${
                    r.id === selectedKarta7Region.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedKarta7Id(r.id)}
                >
                  {r.name}
                  <span>{r.countryOrRealm}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Höger: Tablå 26 (s. 120) fullständig tabell med 42 rader */}
        <div className="thesis-paradigm-panel">
          <div className="thesis-tabla28-header">
            <div>
              <span className="eyebrow">
                Tablå 26 (s. {k7.sourceTabla26.printedPage}) · Fullständigt
                register ({k7.tabla26Rows.length} rader)
              </span>
              <h4>Pluralkongruens i nordiska varieteter ca 1900 (och ca 1850)</h4>
            </div>
            <label className="thesis-verb-select-label">
              <span>Filtrera språkområde</span>
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
              >
                <option value="all">
                  Alla områden ({k7.tabla26Rows.length} rader)
                </option>
                {distinctGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="thesis-slash-explanation">
            <strong>Teckenförklaring (Tablå 26, s. 119–120):</strong>{" "}
            <code>+</code> = särskild pluralform (ca 1900) · <code>(+)</code> =
            särskild form endast hos de allra äldsta (ca 1850, utdöd ca 1900) ·{" "}
            <code>2PL</code> / <code>3PL</code> = form sammanfaller med 2PL resp.
            3PL · <code>SG</code> = sammanfall med singularform.
          </p>

          <div className="thesis-tabla26-scroll">
            <table className="thesis-tabla28-table">
              <thead>
                <tr>
                  <th>Grupp</th>
                  <th>Område / varietet (s. 120)</th>
                  <th>Pres. 1PL</th>
                  <th>Pres. 2PL</th>
                  <th>Pres. 3PL</th>
                  <th>Pret. 1PL</th>
                  <th>Pret. 2PL</th>
                  <th>Pret. 3PL</th>
                  <th>Imp. 2PL</th>
                </tr>
              </thead>
              <tbody>
                {filteredTabla26Rows.map((row) => (
                  <tr
                    key={row.id}
                    className={
                      row.hasTwoOrMorePersonFormsInIndicative
                        ? "thesis-row-highlighted"
                        : ""
                    }
                  >
                    <td>
                      <small>{row.languageOrProvinceGroup}</small>
                    </td>
                    <td>
                      <strong>{row.areaLabel}</strong>
                      {row.notes && (
                        <div className="thesis-cell-raw">{row.notes}</div>
                      )}
                    </td>
                    <td>
                      <code>{row.presInd.p1}</code>
                    </td>
                    <td>
                      <code>{row.presInd.p2}</code>
                    </td>
                    <td>
                      <code>{row.presInd.p3}</code>
                    </td>
                    <td>
                      <code>{row.pretInd.p1}</code>
                    </td>
                    <td>
                      <code>{row.pretInd.p2}</code>
                    </td>
                    <td>
                      <code>{row.pretInd.p3}</code>
                    </td>
                    <td>
                      <code>{row.imp2PL}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Del 2: Regionala fördjupningar utanför sydväst (A05.4: Dalmål, Överkalixmål, Estlandssvenska) */}
      <div className="thesis-atlas-subsection">
        <div className="thesis-figur6-header">
          <div>
            <span className="eyebrow">
              Regionala fördjupningar (A05.4 · kap. 4.1.2–4.1.5, s. 99–116)
            </span>
            <h3>
              Tre skilda system utanför det sydvästsvenska kärnområdet
            </h3>
            <p className="thesis-figur6-intro">
              Växla mellan <strong>dalmål och bergslagsmål</strong> (Karta 3–5 &
              Tablå 23), <strong>överkalixmål</strong> (Tablå 24) och{" "}
              <strong>estlandssvenska</strong> (Tablå 25 & Karta 6).
            </p>
          </div>

          <div
            className="thesis-viewmode-toggle"
            role="tablist"
            aria-label="Välj regional fördjupning"
          >
            <button
              type="button"
              role="tab"
              aria-selected={deepDiveTab === "dalmal"}
              className={deepDiveTab === "dalmal" ? "active" : ""}
              onClick={() => setDeepDiveTab("dalmal")}
            >
              1. Dalmål & Bergslagen
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={deepDiveTab === "overkalix"}
              className={deepDiveTab === "overkalix" ? "active" : ""}
              onClick={() => setDeepDiveTab("overkalix")}
            >
              2. Överkalixmål
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={deepDiveTab === "estlandssvenska"}
              className={deepDiveTab === "estlandssvenska" ? "active" : ""}
              onClick={() => setDeepDiveTab("estlandssvenska")}
            >
              3. Estlandssvenska
            </button>
          </div>
        </div>

        {deepDiveTab === "dalmal" && (
          <div className="thesis-deepdive-panel">
            <div className="thesis-workbench-grid">
              <div className="thesis-tabla28-box">
                <span className="eyebrow">
                  Tablå 23 (s.{" "}
                  {
                    atlas.regionalDeepDives.dalmal.tabla23Alvdalska.source
                      .printedPage
                  }
                  ) · Standardälvdalska
                </span>
                <h4>{atlas.regionalDeepDives.dalmal.tabla23Alvdalska.title}</h4>
                <p className="thesis-slash-explanation">
                  {atlas.regionalDeepDives.dalmal.summary}
                </p>
                <table className="thesis-tabla28-table">
                  <thead>
                    <tr>
                      <th>Form</th>
                      {atlas.regionalDeepDives.dalmal.tabla23Alvdalska.verbs.map(
                        (v) => (
                          <th key={v.lemma}>
                            <strong>{v.lemma}</strong>
                            <div className="thesis-cell-raw">{v.gloss}</div>
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(["1s", "2s", "3s", "1p", "2p", "3p"] as const).map(
                      (person) => (
                        <tr key={`alv-pres-${person}`}>
                          <th>Pres. {person}</th>
                          {atlas.regionalDeepDives.dalmal.tabla23Alvdalska.verbs.map(
                            (v) => (
                              <td key={v.lemma}>
                                <strong>{v.presensIndikativ[person]}</strong>
                              </td>
                            )
                          )}
                        </tr>
                      )
                    )}
                    {(["1p", "2p", "3p"] as const).map((person) => (
                      <tr key={`alv-pret-${person}`} className="plural-row">
                        <th>Pret. {person}</th>
                        {atlas.regionalDeepDives.dalmal.tabla23Alvdalska.verbs.map(
                          (v) => (
                            <td key={v.lemma}>
                              <strong>{v.preteritumIndikativ[person]}</strong>
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="thesis-tabla29-footnote">
                  {
                    atlas.regionalDeepDives.dalmal.tabla23Alvdalska
                      .weakPreteriteSyncretismNote
                  }
                </p>
              </div>

              <div className="thesis-tabla28-box">
                <span className="eyebrow">
                  Karta 5 (s.{" "}
                  {
                    atlas.regionalDeepDives.dalmal.karta5Bergslagsmal.source
                      .printedPage
                  }
                  ) · Bergslagsmål
                </span>
                <h4>
                  {atlas.regionalDeepDives.dalmal.karta5Bergslagsmal.title}
                </h4>
                <p className="thesis-banner-summary">
                  {atlas.regionalDeepDives.dalmal.karta5Bergslagsmal.summary}
                </p>
                <div className="thesis-subarea-Highlight">
                  <strong>
                    Socknar i Karta 5 (s. 106) med -a respektive -an:
                  </strong>
                  <ul>
                    {atlas.regionalDeepDives.dalmal.karta5Bergslagsmal.parishes.map(
                      (p) => (
                        <li key={p.name}>
                          <strong>{p.name}:</strong> <code>{p.ending}</code> (
                          {p.zone})
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="thesis-tabla28-box">
              <span className="eyebrow">
                Karta 3 (s.{" "}
                {atlas.regionalDeepDives.dalmal.sourceKarta3.printedPage}) &
                Karta 4 (s.{" "}
                {atlas.regionalDeepDives.dalmal.sourceKarta4.printedPage}) · 21
                dalmålssocknar
              </span>
              <h4>
                Socknar i Övre Dalarna: pluralkongruens, subjektsutelämning och
                ändelsebortfall
              </h4>
              <div className="thesis-dalmal-parish-grid">
                {atlas.regionalDeepDives.dalmal.karta3Parishes.map((parish) => (
                  <div key={parish.code} className="thesis-dalmal-parish-card">
                    <div className="thesis-banner-top">
                      <strong>
                        {parish.code}. {parish.name}
                      </strong>
                      <span className="thesis-syncretism-badge">
                        {parish.subgroup}
                      </span>
                    </div>
                    <small>{parish.note}</small>
                    <div className="thesis-cell-raw">
                      Pro-drop: {parish.proDrop12PL} · Bortfall:{" "}
                      {parish.endingOmissionInverted}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {deepDiveTab === "overkalix" && (
          <div className="thesis-deepdive-panel">
            <div className="thesis-tabla28-box">
              <div className="thesis-tabla28-header">
                <div>
                  <span className="eyebrow">
                    Tablå 24 (s.{" "}
                    {
                      atlas.regionalDeepDives.overkalixmal.tabla24Overkalix
                        .source.printedPage
                    }
                    ) · Pihl (1948)
                  </span>
                  <h4>{atlas.regionalDeepDives.overkalixmal.title}</h4>
                </div>
                <span className="thesis-time-pill">
                  Sex konjugationer i Tablå 24
                </span>
              </div>
              <p className="thesis-slash-explanation">
                {atlas.regionalDeepDives.overkalixmal.summary}
              </p>

              <div className="thesis-tabla26-scroll">
                <table className="thesis-tabla28-table">
                  <thead>
                    <tr>
                      <th>Tempus & person</th>
                      {atlas.regionalDeepDives.overkalixmal.tabla24Overkalix.verbs.map(
                        (v) => (
                          <th key={v.lemma}>
                            <strong>{v.lemma}</strong>
                            <div className="thesis-cell-raw">{v.gloss}</div>
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(["1s", "2s", "3s", "1p", "2p", "3p"] as const).map(
                      (person) => (
                        <tr key={`okx-pres-${person}`}>
                          <th>Pres. {person}</th>
                          {atlas.regionalDeepDives.overkalixmal.tabla24Overkalix.verbs.map(
                            (v) => (
                              <td key={v.lemma}>
                                <strong>{v.presensIndikativ[person]}</strong>
                              </td>
                            )
                          )}
                        </tr>
                      )
                    )}
                    {(["1s", "2s", "3s", "1p", "2p", "3p"] as const).map(
                      (person) => (
                        <tr key={`okx-pret-${person}`} className="plural-row">
                          <th>Pret. {person}</th>
                          {atlas.regionalDeepDives.overkalixmal.tabla24Overkalix.verbs.map(
                            (v) => (
                              <td key={v.lemma}>
                                <strong>{v.preteritumIndikativ[person]}</strong>
                              </td>
                            )
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="thesis-allomorph-notes">
                <h5>Morfologiska nyckelanmärkningar (s. 111–113)</h5>
                <ul>
                  <li>
                    {
                      atlas.regionalDeepDives.overkalixmal
                        .toneAccentAndApocopeNote
                    }
                  </li>
                  <li>
                    {
                      atlas.regionalDeepDives.overkalixmal
                        .supineStemImperativeNote
                    }
                  </li>
                  <li>
                    {
                      atlas.regionalDeepDives.overkalixmal
                        .pitemalInfinitiveSyncretismNote
                    }
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {deepDiveTab === "estlandssvenska" && (
          <div className="thesis-deepdive-panel">
            <div className="thesis-workbench-grid">
              <div className="thesis-tabla28-box">
                <span className="eyebrow">
                  Tablå 25 (s.{" "}
                  {
                    atlas.regionalDeepDives.estlandssvenska.tabla25Nuckomal
                      .source.printedPage
                  }
                  ) · Danell (1905–34)
                </span>
                <h4>
                  {
                    atlas.regionalDeepDives.estlandssvenska.tabla25Nuckomal
                      .title
                  }
                </h4>
                <p className="thesis-slash-explanation">
                  {atlas.regionalDeepDives.estlandssvenska.summary}
                </p>

                <table className="thesis-tabla28-table">
                  <thead>
                    <tr>
                      <th>Tempus & person</th>
                      {atlas.regionalDeepDives.estlandssvenska.tabla25Nuckomal.verbs.map(
                        (v) => (
                          <th key={v.lemma}>
                            <strong>{v.lemma}</strong>
                            <div className="thesis-cell-raw">{v.gloss}</div>
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(["1s", "2s", "3s", "1p", "2p", "3p"] as const).map(
                      (person) => (
                        <tr key={`nucko-pres-${person}`}>
                          <th>Pres. {person}</th>
                          {atlas.regionalDeepDives.estlandssvenska.tabla25Nuckomal.verbs.map(
                            (v) => (
                              <td key={v.lemma}>
                                <strong>{v.presensIndikativ[person]}</strong>
                              </td>
                            )
                          )}
                        </tr>
                      )
                    )}
                    {(["1s", "2s", "3s", "1p", "2p", "3p"] as const).map(
                      (person) => (
                        <tr key={`nucko-pret-${person}`}>
                          <th>Pret. {person}</th>
                          {atlas.regionalDeepDives.estlandssvenska.tabla25Nuckomal.verbs.map(
                            (v) => (
                              <td key={v.lemma}>
                                <strong>{v.preteritumIndikativ[person]}</strong>
                              </td>
                            )
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="thesis-tabla28-box">
                <span className="eyebrow">
                  Karta 6 (s.{" "}
                  {
                    atlas.regionalDeepDives.estlandssvenska.sourceKarta6
                      .printedPage
                  }
                  ) · Bosättningsområden
                </span>
                <h4>Svenska bosättningsområden i Estland och Gammalsvenskby</h4>
                <div className="thesis-dalmal-parish-grid">
                  {atlas.regionalDeepDives.estlandssvenska.areas.map((area) => (
                    <div key={area.id} className="thesis-dalmal-parish-card">
                      <strong>{area.name}</strong>
                      <p>
                        1800-tal: {area.status1800s} · Imperativ:{" "}
                        <code>{area.imperativeEnding}</code>
                      </p>
                      {area.omissionReasonIfNotOnKarta6 && (
                        <small className="thesis-inline-source">
                          {area.omissionReasonIfNotOnKarta6}
                        </small>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Del 3: Plural imperativ i sydväst – Karta 15 & Karta 16 (A05.3) */}
      <div className="thesis-atlas-subsection">
        <div className="thesis-figur6-header">
          <div>
            <span className="eyebrow">
              Plural imperativ i sydväst (A05.3 · Karta 15 s. 165, Karta 16 s.
              166 & kap. 7.2.1 s. 241–242)
            </span>
            <h3>{atlas.pluralImperativeSouthwest.title}</h3>
            <p className="thesis-figur6-intro">
              {atlas.pluralImperativeSouthwest.summary}
            </p>
          </div>
        </div>

        <div className="thesis-workbench-grid">
          <div className="thesis-tabla28-box">
            <span className="eyebrow">
              Karta 15 (s.{" "}
              {atlas.pluralImperativeSouthwest.sourceKarta15.printedPage}) ·
              Ändelsezoner i 2PL imperativ
            </span>
            <h4>Plural imperativ på -e(n), -a respektive -er</h4>
            <div className="thesis-example-cards">
              {atlas.pluralImperativeSouthwest.karta15Zones.map((zone) => (
                <div key={zone.id} className="thesis-example-card">
                  <span className="eyebrow">{zone.geographicScope}</span>
                  <strong>{zone.ending}</strong>
                  <span className="thesis-example-translation">
                    {zone.label}
                  </span>
                  <small>{zone.etymologyExplanation}</small>
                </div>
              ))}
            </div>
            <div className="thesis-fn81-callout">
              <strong>
                Varför -a i imperativ inte beror på ljudlagsenlig övergång -in
                &gt; -an &gt; -a (s. 241–242):
              </strong>{" "}
              {atlas.pluralImperativeSouthwest.soundChangeArgumentInToAnToA}
            </div>
          </div>

          <div className="thesis-tabla28-box">
            <span className="eyebrow">
              Karta 16 (s.{" "}
              {
                atlas.pluralImperativeSouthwest.karta16QuestionnaireBias.source
                  .printedPage
              }
              ) · Metodkritik vid frågelistor
            </span>
            <h4>
              {atlas.pluralImperativeSouthwest.karta16QuestionnaireBias.title}
            </h4>
            <p className="thesis-banner-summary">
              {
                atlas.pluralImperativeSouthwest.karta16QuestionnaireBias
                  .whyFalseNegativesOccur
              }
            </p>
            <div className="thesis-subarea-Highlight">
              <strong>
                Motexempel i spontant tal:{" "}
                {
                  atlas.pluralImperativeSouthwest.karta16QuestionnaireBias
                    .spontaneousCounterExample.parish
                }{" "}
                (
                {
                  atlas.pluralImperativeSouthwest.karta16QuestionnaireBias
                    .spontaneousCounterExample.hundred
                }
                ):
              </strong>
              <p>
                Belägg:{" "}
                <em>
                  ”
                  {
                    atlas.pluralImperativeSouthwest.karta16QuestionnaireBias
                      .spontaneousCounterExample.phrase
                  }
                  ”
                </em>{" "}
                —{" "}
                {
                  atlas.pluralImperativeSouthwest.karta16QuestionnaireBias
                    .spontaneousCounterExample.explanation
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Del 4: Hypotetisk rekonstruktion Karta 14 + Avvecklingstyper Tablå 42–43 & Figur 10 (A05.5) */}
      <div className="thesis-atlas-subsection">
        <div className="thesis-hypothetical-reconstruction-card">
          <div className="thesis-banner-top">
            <span className="eyebrow">
              A05.5 · Karta 14 (s.{" "}
              {atlas.hypotheticalReconstructionKarta14.source.printedPage}) ·
              Streckad rekonstruktionsgräns
            </span>
            <span className="thesis-reconstruction-badge">
              Hypotetisk rekonstruktion — ej direkt belagd gräns
            </span>
          </div>
          <h3>{atlas.hypotheticalReconstructionKarta14.title}</h3>
          <p className="thesis-banner-summary">
            {atlas.hypotheticalReconstructionKarta14.methodologicalWarningBanner}
          </p>
          <div className="thesis-dalmal-parish-grid">
            {atlas.hypotheticalReconstructionKarta14.innovationCenters.map(
              (ic) => (
                <div key={ic.id} className="thesis-dalmal-parish-card">
                  <strong>{ic.name}</strong>
                  <small>{ic.directionOfInfluence}</small>
                  <p>{ic.description}</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Avvecklingstyper Typ 1–Typ 4 (Tablå 42, Figur 10, Tablå 43, s. 243–246) */}
        <div className="thesis-tabla28-box" style={{ marginTop: "1.2rem" }}>
          <div className="thesis-tabla28-header">
            <div>
              <span className="eyebrow">
                Tablå 42 (s. {atlas.dismantlingTypes.sourceTabla42.printedPage}),
                Figur 10 (s. {atlas.dismantlingTypes.sourceFigur10.printedPage})
                & Tablå 43 (s.{" "}
                {atlas.dismantlingTypes.sourceTabla43.printedPage})
              </span>
              <h4>{atlas.dismantlingTypes.title}</h4>
            </div>
            <div
              className="thesis-tense-toggle"
              role="group"
              aria-label="Välj avvecklingstyp"
            >
              {atlas.dismantlingTypes.types.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={selectedDismantlingTypeId === t.id ? "active" : ""}
                  aria-pressed={selectedDismantlingTypeId === t.id}
                  onClick={() => setSelectedDismantlingTypeId(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <p className="thesis-slash-explanation">
            {atlas.dismantlingTypes.summary}
          </p>

          <div className="thesis-workbench-grid">
            <div>
              <table className="thesis-tabla28-table">
                <thead>
                  <tr>
                    <th>Avvecklingstyp</th>
                    <th>Steg 1 (1/2/3PL)</th>
                    <th>Steg 2 (1/2/3PL)</th>
                    <th>Steg 3 (1/2/3PL)</th>
                    <th>Steg 4 (1/2/3PL)</th>
                  </tr>
                </thead>
                <tbody>
                  {atlas.dismantlingTypes.types.map((t) => (
                    <tr
                      key={t.id}
                      className={
                        t.id === selectedDismantlingType.id
                          ? "thesis-row-highlighted"
                          : ""
                      }
                    >
                      <td>
                        <button
                          type="button"
                          className="thesis-col-select-btn"
                          onClick={() => setSelectedDismantlingTypeId(t.id)}
                        >
                          <strong>{t.label}</strong>
                          <small>{t.regionsAttested.join(", ")}</small>
                        </button>
                      </td>
                      <td>
                        <code>
                          {t.steps.step1.p1} · {t.steps.step1.p2} ·{" "}
                          {t.steps.step1.p3}
                        </code>
                      </td>
                      <td>
                        <code>
                          {t.steps.step2.p1} · {t.steps.step2.p2} ·{" "}
                          {t.steps.step2.p3}
                        </code>
                      </td>
                      <td>
                        <code>
                          {t.steps.step3.p1} · {t.steps.step3.p2} ·{" "}
                          {t.steps.step3.p3}
                        </code>
                      </td>
                      <td>
                        <code>
                          {t.steps.step4.p1} · {t.steps.step4.p2} ·{" "}
                          {t.steps.step4.p3}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="thesis-step-detail-card" style={{ marginTop: 0 }}>
              <span className="eyebrow">
                Vald avvecklingstyp · s.{" "}
                {selectedDismantlingType.source.printedPage}
              </span>
              <h3>{selectedDismantlingType.label}</h3>
              <p>
                <strong>Förekomst i Norden (Tablå 43, s. 246):</strong>{" "}
                {selectedDismantlingType.regionsAttested.join(", ")}
              </p>
              <p>{selectedDismantlingType.explanation}</p>
              {selectedDismantlingType.unattestedExplanation && (
                <p className="thesis-tabla29-footnote">
                  <strong>Obelagda steg (?):</strong>{" "}
                  {selectedDismantlingType.unattestedExplanation}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
