"use client";

import type { ParadigmDefinition, ThesisRegion } from "@/lib/thesis/types";
import {
  EXCEPTION_MARKERS_KARTA_10,
  KARTA_10_VIEWBOX,
  N_DROP_WAVE_BOUNDARY_PATH,
  PROVINCE_REFERENCES_KARTA_10,
  SOUTHWEST_SWEDEN_LAND_OUTLINE,
  SUBAREA_GEOMETRIES_KARTA_10,
  SW_SKANE_ENHETSBOJNING_PATH,
  VANERN_OUTLINE,
  VATTERN_OUTLINE,
} from "@/lib/thesis/map-geometry";

export default function Karta10SvgMap({
  regions,
  paradigms,
  selectedRegionId,
  selectedSubAreaId,
  regionLabels,
  onSelectRegion,
  onSelectSubArea,
}: {
  regions: ThesisRegion[];
  paradigms: ParadigmDefinition[];
  selectedRegionId: string;
  selectedSubAreaId: string | null;
  regionLabels: Record<string, string>;
  onSelectRegion: (regionId: string) => void;
  onSelectSubArea: (regionId: string, subAreaId: string | null) => void;
}) {
  const colorByParadigm = new Map(
    paradigms.map((p) => [p.id, p.webDisplayColorHex])
  );
  const subAreaById = new Map(
    regions.flatMap((r) => r.subAreas.map((s) => [s.id, { sub: s, region: r }]))
  );

  return (
    <div className="thesis-map-container">
      <div className="thesis-map-header">
        <div>
          <span className="eyebrow">Karta 10 · Tryckt s. 148 (PDF-s. 148)</span>
          <h3>Plural indikativ i Sydvästsverige</h3>
        </div>
        <span className="thesis-time-pill">
          Syntes ca 1850–1950 (tyngdpunkt ca 1900)
        </span>
      </div>

      {/* Tillgänglig regionknappsrad för både mobil och tangentbord (utan hoverkrav) */}
      <div
        className="thesis-region-selector"
        role="group"
        aria-label="Välj huvudområde på Karta 10"
      >
        {regions.map((region) => {
          const isSelected = region.id === selectedRegionId;
          const color = colorByParadigm.get(region.paradigmId) ?? "#2B6CB0";
          const paradigm = paradigms.find((p) => p.id === region.paradigmId);
          return (
            <button
              key={region.id}
              type="button"
              className={`thesis-region-btn ${isSelected ? "active" : ""}`}
              aria-pressed={isSelected}
              onClick={() => onSelectRegion(region.id)}
              style={{
                borderColor: isSelected ? color : undefined,
                boxShadow: isSelected ? `4px 4px 0 ${color}` : undefined,
              }}
            >
              <span className="thesis-region-swatch-row">
                <span
                  className="thesis-color-swatch"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <span className="thesis-pattern-tag">
                  {paradigm?.syncretismPattern}
                </span>
              </span>
              <strong>{region.name}</strong>
              <small>{paradigm?.shortLabel}</small>
            </button>
          );
        })}
      </div>

      <figure className="thesis-svg-figure" aria-label="Interaktiv vektoriserad synteskarta efter Karta 10 (s. 148)">
        <svg
          viewBox={KARTA_10_VIEWBOX}
          className="thesis-svg-canvas"
          role="img"
          aria-labelledby="karta10-svg-title karta10-svg-desc"
        >
          <title id="karta10-svg-title">
            Karta 10: Plural indikativ i Sydvästsverige (efter Horn af Åminne 2022, s. 148)
          </title>
          <desc id="karta10-svg-desc">
            Schematisk karta över de fyra sydvästsvenska pluralparadigmen i indikativ: um-området, e-området, det skånska området och a-området. Prickskraffering i norr visar n-bortfall i -e(n), och snedskraffering med streckad kant visar indirekt härledda ytterområden i norra Halland och Blekinge enligt fotnot 81.
          </desc>

          <defs>
            {/* Prickskraffering för n-bortfall i norr (-e utan finalt /n/) */}
            <pattern
              id="pattern-n-drop-dots"
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="3.5" cy="3.5" r="1.55" fill="#181815" fillOpacity="0.62" />
              <circle cx="9.5" cy="9.5" r="1.55" fill="#181815" fillOpacity="0.62" />
            </pattern>

            {/* Snedskraffering för fotnot 81:s indirekt härledda ytterområden */}
            <pattern
              id="pattern-inferred-fn81"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="10"
                stroke="#181815"
                strokeWidth="2.2"
                strokeOpacity="0.45"
              />
            </pattern>
          </defs>

          {/* Bakgrundshav / sjöar */}
          <rect x="0" y="0" width="640" height="760" fill="#e6eef4" />

          {/* Landkontur för Sydvästsverige */}
          <path
            d={SOUTHWEST_SWEDEN_LAND_OUTLINE}
            fill="#f5f2e8"
            stroke="#181815"
            strokeWidth="1.5"
          />

          {/* Vänern och Vättern */}
          <path d={VANERN_OUTLINE} fill="#cfe0ec" stroke="#181815" strokeWidth="1" />
          <text x="202" y="65" className="thesis-map-water-label">
            VÄNERN
          </text>
          <path d={VATTERN_OUTLINE} fill="#cfe0ec" stroke="#181815" strokeWidth="1" />
          <text x="352" y="145" className="thesis-map-water-label">
            VÄTTERN
          </text>

          {/* Sydvästskånskt område med enhetsböjning (ofärgat på Karta 10) */}
          <path
            d={SW_SKANE_ENHETSBOJNING_PATH}
            fill="#ebe6d8"
            stroke="#181815"
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />
          <text x="232" y="645" className="thesis-map-enhet-label">
            SV Skåne: enhetsböjning
          </text>
          <text x="232" y="660" className="thesis-map-enhet-sublabel">
            (ofärgat på Karta 10; jfr Karta 12 s. 151)
          </text>

          {/* De 9 delområdena */}
          {SUBAREA_GEOMETRIES_KARTA_10.map((geo) => {
            const baseColor = colorByParadigm.get(geo.paradigmId) ?? "#2B6CB0";
            const isRegionActive = geo.regionId === selectedRegionId;
            const isSubAreaActive = geo.subAreaId === selectedSubAreaId;
            const info = subAreaById.get(geo.subAreaId);

            return (
              <g
                key={geo.subAreaId}
                role="button"
                tabIndex={0}
                aria-label={`${info?.sub.name ?? geo.shortCode} (${info?.region.name ?? ""})`}
                aria-pressed={isSubAreaActive || (isRegionActive && !selectedSubAreaId)}
                className="thesis-map-subarea-group"
                onClick={() => onSelectSubArea(geo.regionId, geo.subAreaId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectSubArea(geo.regionId, geo.subAreaId);
                  }
                }}
              >
                <path
                  d={geo.svgPath}
                  fill={baseColor}
                  fillOpacity={
                    isSubAreaActive
                      ? 0.92
                      : isRegionActive
                        ? 0.78
                        : 0.44
                  }
                  stroke="#181815"
                  strokeWidth={isSubAreaActive ? 3.2 : isRegionActive ? 2.2 : 1.1}
                  strokeDasharray={geo.isInferredFn81 ? "6 4" : undefined}
                />

                {/* Prickskraffering för n-bortfall i norr */}
                {geo.hasNDropDots && (
                  <path
                    d={geo.svgPath}
                    fill="url(#pattern-n-drop-dots)"
                    pointerEvents="none"
                  />
                )}

                {/* Snedskraffering för indirekt härledda områden enligt fotnot 81 */}
                {geo.isInferredFn81 && (
                  <path
                    d={geo.svgPath}
                    fill="url(#pattern-inferred-fn81)"
                    pointerEvents="none"
                  />
                )}

                <g
                  transform={`translate(${geo.labelX}, ${geo.labelY})`}
                  pointerEvents="none"
                >
                  <rect
                    x="-42"
                    y="-11"
                    width="84"
                    height="20"
                    rx="2"
                    fill="#fbfaf4"
                    fillOpacity="0.9"
                    stroke="#181815"
                    strokeWidth={isSubAreaActive || isRegionActive ? "1.4" : "0.7"}
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    className="thesis-map-area-tag"
                  >
                    {geo.shortCode}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Vågformad gränslinje för n-bortfall i -e(n) */}
          <path
            d={N_DROP_WAVE_BOUNDARY_PATH}
            fill="none"
            stroke="#181815"
            strokeWidth="2.4"
            strokeDasharray="8 4"
            pointerEvents="none"
          />
          <text x="128" y="286" className="thesis-map-boundary-label">
            Norr: -e (utan /n/) · Söder: -en (med /n/)
          </text>

          {/* Landskapsgränser och förkortningar */}
          {PROVINCE_REFERENCES_KARTA_10.map((prov) => (
            <g key={prov.id} pointerEvents="none">
              <path
                d={prov.borderPath}
                fill="none"
                stroke="#181815"
                strokeWidth="0.85"
                strokeOpacity="0.45"
                strokeDasharray="3 3"
              />
              <text
                x={prov.labelX}
                y={prov.labelY}
                textAnchor="middle"
                className="thesis-map-province-label"
              >
                {prov.name.toUpperCase()} ({prov.abbr})
              </text>
            </g>
          ))}

          {/* Markörer för dokumenterade lokala undantag och avvikande typer */}
          {EXCEPTION_MARKERS_KARTA_10.map((marker) => {
            const isOwnerSelected = marker.regionId === selectedRegionId;
            return (
              <g
                key={marker.exceptionId}
                transform={`translate(${marker.x}, ${marker.y})`}
                className="thesis-map-exception-pin"
                role="button"
                tabIndex={0}
                aria-label={`Dokumenterat undantag: ${marker.label}`}
                onClick={() => onSelectRegion(marker.regionId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectRegion(marker.regionId);
                  }
                }}
              >
                <circle
                  cx="0"
                  cy="0"
                  r={isOwnerSelected ? "6.5" : "5"}
                  fill="#fbfaf4"
                  stroke="#181815"
                  strokeWidth="2"
                />
                <circle cx="0" cy="0" r="2.2" fill="#ef573f" />
                <title>{marker.label}</title>
              </g>
            );
          })}
        </svg>

        {/* Teckenförklaring direkt under kartan */}
        <figcaption className="thesis-map-legend">
          <div className="thesis-legend-row">
            <span>
              <strong>Prickskraffering i norr:</strong> ändelsen <code>-e(n)</code> saknar finalt <code>/n/</code> och realiseras som <code>-e</code> (s. 147–148).
            </span>
            <span>
              <strong>Streckad kant + snedskraffering (not 81):</strong> i norra Hallands <em>e-område</em> och Blekinges <em>a-område</em> är endast 3p belagd; 1p/2p har härletts ur grannområdena (s. 147 fotnot 81).
            </span>
          </div>
          <div className="thesis-legend-note">
            <span>
              Redaktionell vektorisering efter <strong>Karta 10</strong> (s. 148, jfr Horn af Åminne 2017:79 &amp; 2015). Etikett i vald utgåva:{" "}
              <em>{regionLabels[selectedRegionId]}</em>
            </span>
          </div>
        </figcaption>
      </figure>

      {/* Tillgänglig delområdeslista för valt huvudområde */}
      <div className="thesis-subarea-list" aria-label="Delområden i valt huvudområde">
        <div className="thesis-subarea-list-header">
          <span className="eyebrow">Delområden i valt område</span>
          <button
            type="button"
            className={`thesis-subarea-chip ${!selectedSubAreaId ? "active" : ""}`}
            aria-pressed={!selectedSubAreaId}
            onClick={() => onSelectSubArea(selectedRegionId, null)}
          >
            Visa hela huvudområdet
          </button>
        </div>
        <div className="thesis-subarea-chips">
          {(regions.find((r) => r.id === selectedRegionId)?.subAreas ?? []).map(
            (sub) => {
              const active = sub.id === selectedSubAreaId;
              return (
                <button
                  key={sub.id}
                  type="button"
                  className={`thesis-subarea-chip ${active ? "active" : ""}`}
                  aria-pressed={active}
                  onClick={() => onSelectSubArea(selectedRegionId, sub.id)}
                >
                  <strong>{sub.name}</strong>
                  <span>
                    {sub.evidenceStatus === "inferred_from_neighbor"
                      ? "Indirekt härlett (fotnot 81)"
                      : sub.nDropRealization === "-e"
                        ? "Prickskrafferat: -e (utan /n/)"
                        : sub.nDropRealization === "-en"
                          ? "Bevarat /n/: -en"
                          : "Syntes / belagt delområde"}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
