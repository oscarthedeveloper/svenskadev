"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  publishThesisEdition,
  restoreThesisEdition,
  saveThesisDraft,
  unpublishThesisEdition,
} from "@/lib/actions";
import {
  DEFAULT_THESIS_EDITORIAL_CONFIG,
  validateThesisEditorialConfig,
  type ThesisEditorialConfig,
} from "@/lib/thesis/editorial-config";
import { THESIS_PILOT_EDITION } from "@/lib/thesis/pilot-data";
import { validateThesisPilotEdition } from "@/lib/thesis/validation";
import type { ThesisPilotEdition } from "@/lib/thesis/types";

export default function ThesisAdminEditor({
  slug,
  initialConfig,
  initialRevision,
  initiallyPublished,
  initialHasDraftChanges,
  needsMigration,
}: {
  slug: string;
  initialConfig: ThesisEditorialConfig;
  initialRevision: number;
  initiallyPublished: boolean;
  initialHasDraftChanges: boolean;
  needsMigration: boolean;
}) {
  const [config, setConfig] = useState<ThesisEditorialConfig>(initialConfig);
  const [revision, setRevision] = useState<number>(initialRevision);
  const [published, setPublished] = useState<boolean>(initiallyPublished);
  const [hasDraftChanges, setHasDraftChanges] = useState<boolean>(
    initialHasDraftChanges
  );
  const [dirty, setDirty] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>("");

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function updateConfig(next: ThesisEditorialConfig) {
    setConfig(next);
    setDirty(true);
    setMessage("");
    setIsError(false);
  }

  function updateRegionOverride(
    regionId: string,
    field: "customLabel" | "customColorHex" | "editorialSourceNote",
    value: string
  ) {
    const current = config.regionOverrides[regionId];
    if (!current) return;
    updateConfig({
      ...config,
      regionOverrides: {
        ...config.regionOverrides,
        [regionId]: {
          ...current,
          [field]: value,
        },
      },
    });
  }

  function handleValidateAndImportJson() {
    if (!importJsonText.trim()) {
      setIsError(true);
      setMessage("Klistra in en JSON-utgåva (ThesisPilotEdition) före validering.");
      return;
    }
    try {
      const parsed = JSON.parse(importJsonText) as ThesisPilotEdition;
      const check = validateThesisPilotEdition(parsed);
      if (!check.valid) {
        setIsError(true);
        setMessage(
          `Källkritisk validering avvisade JSON-datan (${check.errors.length} fel): ${check.errors.join(" | ")}`
        );
        return;
      }
      updateConfig({
        ...config,
        dataVersionLabel: `${parsed.editionId} (${parsed.version})`,
        customPilotEdition: parsed,
      });
      setIsError(false);
      setMessage(
        "JSON-utgåvan klarade alla källkritiska kontroller och har lagts in i utkastet. Klicka på ”Spara utkast” för att lagra."
      );
    } catch {
      setIsError(true);
      setMessage("Ogiltig JSON-syntax. Kontrollera parenteser och citattecken.");
    }
  }

  async function handleSaveDraft(e: React.FormEvent) {
    e.preventDefault();
    const validationErr = validateThesisEditorialConfig(config);
    if (validationErr) {
      setIsError(true);
      setMessage(validationErr);
      return;
    }
    setBusy(true);
    try {
      const res = await saveThesisDraft(slug, config, revision);
      if (res.ok && res.revision !== undefined) {
        setRevision(res.revision);
        setDirty(false);
        setHasDraftChanges(true);
        setIsError(false);
        setMessage(
          `Utkastet sparades (revision ${res.revision}). Du kan nu förhandsgranska eller publicera.`
        );
      } else {
        setIsError(true);
        setMessage(res.error ?? "Kunde inte spara utkastet.");
      }
    } catch {
      setIsError(true);
      setMessage("Anslutningen bröts. Försök spara igen.");
    } finally {
      setBusy(false);
    }
  }

  async function handlePublish() {
    if (dirty) {
      setIsError(true);
      setMessage("Spara dina osparade ändringar som utkast innan du publicerar.");
      return;
    }
    setBusy(true);
    try {
      const res = await publishThesisEdition(slug, revision);
      if (res.ok && res.revision !== undefined) {
        setRevision(res.revision);
        setPublished(true);
        setHasDraftChanges(false);
        setIsError(false);
        setMessage(
          `Utgåvan är nu publicerad (revision ${res.revision}) och synlig för alla besökare.`
        );
      } else {
        setIsError(true);
        setMessage(res.error ?? "Publiceringen misslyckades.");
      }
    } catch {
      setIsError(true);
      setMessage("Anslutningen bröts vid publicering.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUnpublish() {
    setBusy(true);
    try {
      const res = await unpublishThesisEdition(slug, revision);
      if (res.ok && res.revision !== undefined) {
        setRevision(res.revision);
        setPublished(false);
        setHasDraftChanges(true);
        setIsError(false);
        setMessage(
          `Anpassad utgåva avpublicerad (revision ${res.revision}). Utkastet finns kvar privat.`
        );
      } else {
        setIsError(true);
        setMessage(res.error ?? "Avpubliceringen misslyckades.");
      }
    } catch {
      setIsError(true);
      setMessage("Anslutningen bröts vid avpublicering.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRestorePublished() {
    setBusy(true);
    try {
      const res = await restoreThesisEdition(slug, revision);
      if (res.ok && res.revision !== undefined) {
        setRevision(res.revision);
        setDirty(false);
        setHasDraftChanges(false);
        setIsError(false);
        setMessage(
          `Utkastet har återställts till senast publicerade version (revision ${res.revision}). Ladda om sidan för att se de återställda fälten.`
        );
      } else {
        setIsError(true);
        setMessage(res.error ?? "Återställningen misslyckades.");
      }
    } catch {
      setIsError(true);
      setMessage("Anslutningen bröts vid återställning.");
    } finally {
      setBusy(false);
    }
  }

  function handleResetToCanonicalDefaults() {
    updateConfig(DEFAULT_THESIS_EDITORIAL_CONFIG);
    setMessage(
      "Formuläret har återställts till den verifierade basutgåvan (Pilot v1). Klicka på ”Spara utkast” för att spara."
    );
  }

  return (
    <div className="thesis-admin-editor">
      <div className="thesis-admin-status-bar">
        <div>
          <span className="eyebrow">Utgåvestatus · {slug}</span>
          <strong>
            {published ? "Publicerad" : "Avpublicerad"} · Revision {revision}
            {hasDraftChanges ? " (opublicerat utkast finns)" : ""}
            {dirty ? " · Osparade ändringar i formuläret" : ""}
          </strong>
        </div>
        <div className="thesis-admin-quicklinks">
          <Link href="/sprakliv/person-och-numerus">
            Öppna publik sida ↗
          </Link>
          <Link href="/sprakliv/person-och-numerus?forhandsgranska=1">
            Förhandsgranska utkast ↗
          </Link>
        </div>
      </div>

      {needsMigration && (
        <div className="editor-warning" role="alert">
          <p>
            <strong>Databasmigration återstår:</strong> Kör{" "}
            <code>supabase/migrations/20261019_thesis_pilot.sql</code> (eller{" "}
            <code>supabase/install-svenska.sql</code> vid nyinstallation) i
            Supabase SQL Editor för att aktivera databassparning av utkast och
            utgåvor i <code>svenska_thesis_drafts</code> och{" "}
            <code>svenska_thesis_editions</code>.
          </p>
        </div>
      )}

      {message && (
        <div
          className={`thesis-admin-feedback ${isError ? "error" : "ok"}`}
          role={isError ? "alert" : "status"}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSaveDraft} className="thesis-admin-form">
        <fieldset disabled={busy || needsMigration}>
          <h2>1. Sidtexter, läsväg och dataversion</h2>

          <div className="homepage-heading-fields">
            <label>
              Överrubrik (eyebrow)
              <input
                required
                maxLength={120}
                value={config.eyebrow}
                onChange={(e) =>
                  updateConfig({ ...config, eyebrow: e.target.value })
                }
              />
            </label>
            <label>
              Dataversion / utgåveetikett
              <input
                required
                maxLength={80}
                value={config.dataVersionLabel}
                onChange={(e) =>
                  updateConfig({ ...config, dataVersionLabel: e.target.value })
                }
              />
            </label>
          </div>

          <label>
            Huvudrubrik
            <input
              required
              maxLength={90}
              value={config.title}
              onChange={(e) =>
                updateConfig({ ...config, title: e.target.value })
              }
            />
          </label>

          <label>
            Underrubrik
            <textarea
              required
              maxLength={320}
              rows={2}
              value={config.subtitle}
              onChange={(e) =>
                updateConfig({ ...config, subtitle: e.target.value })
              }
            />
          </label>

          <label>
            Ingress (huvudberättelse)
            <textarea
              required
              maxLength={1200}
              rows={4}
              value={config.intro}
              onChange={(e) =>
                updateConfig({ ...config, intro: e.target.value })
              }
            />
          </label>

          <label>
            Kort läsväg (2-minutersguide)
            <textarea
              required
              maxLength={800}
              rows={3}
              value={config.shortReadingPath}
              onChange={(e) =>
                updateConfig({ ...config, shortReadingPath: e.target.value })
              }
            />
          </label>

          <div className="homepage-heading-fields">
            <label>
              Orienteringsruta – rubrik
              <input
                required
                maxLength={140}
                value={config.orientationBoxTitle}
                onChange={(e) =>
                  updateConfig({
                    ...config,
                    orientationBoxTitle: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Kartsektion – rubrik
              <input
                required
                maxLength={140}
                value={config.mapSectionTitle}
                onChange={(e) =>
                  updateConfig({ ...config, mapSectionTitle: e.target.value })
                }
              />
            </label>
          </div>

          <label>
            Orienteringsruta – innehåll (person / numerus / enhetsböjning)
            <textarea
              required
              maxLength={1200}
              rows={4}
              value={config.orientationBoxBody}
              onChange={(e) =>
                updateConfig({
                  ...config,
                  orientationBoxBody: e.target.value,
                })
              }
            />
          </label>

          <label>
            Kartsektion – introduktion (Karta 10 &amp; Tablå 28)
            <textarea
              required
              maxLength={800}
              rows={3}
              value={config.mapSectionIntro}
              onChange={(e) =>
                updateConfig({ ...config, mapSectionIntro: e.target.value })
              }
            />
          </label>

          <div className="homepage-heading-fields">
            <label>
              Figur 6-sektion – rubrik
              <input
                required
                maxLength={140}
                value={config.changeModelSectionTitle}
                onChange={(e) =>
                  updateConfig({
                    ...config,
                    changeModelSectionTitle: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Källpanel &amp; ordlista – introduktion
              <input
                required
                maxLength={600}
                value={config.sourcePanelIntro}
                onChange={(e) =>
                  updateConfig({ ...config, sourcePanelIntro: e.target.value })
                }
              />
            </label>
          </div>

          <label>
            Figur 6-sektion – introduktion
            <textarea
              required
              maxLength={800}
              rows={3}
              value={config.changeModelSectionIntro}
              onChange={(e) =>
                updateConfig({
                  ...config,
                  changeModelSectionIntro: e.target.value,
                })
              }
            />
          </label>

          <h2>2. Regionetiketter, färgkoder och källnoter (Karta 10)</h2>
          <p className="thesis-admin-hint">
            Färgerna kompletteras alltid automatiskt med mönster och textetiketter på kartan så att färg aldrig är enda informationsbärare.
          </p>

          <div className="thesis-admin-regions-grid">
            {THESIS_PILOT_EDITION.regions.map((baseRegion) => {
              const ov = config.regionOverrides[baseRegion.id];
              if (!ov) return null;
              return (
                <div key={baseRegion.id} className="thesis-admin-region-card">
                  <h3>
                    {baseRegion.name} (<code>{baseRegion.id}</code>)
                  </h3>
                  <label>
                    Regionetikett
                    <input
                      required
                      maxLength={120}
                      value={ov.customLabel}
                      onChange={(e) =>
                        updateRegionOverride(
                          baseRegion.id,
                          "customLabel",
                          e.target.value
                        )
                      }
                    />
                  </label>
                  <label>
                    Webbfärg (hexkod #RRGGBB)
                    <div className="thesis-color-input-row">
                      <input
                        type="color"
                        aria-label={`Färgväljare för ${baseRegion.name}`}
                        value={
                          /^#[0-9A-Fa-f]{6}$/.test(ov.customColorHex)
                            ? ov.customColorHex
                            : "#2B6CB0"
                        }
                        onChange={(e) =>
                          updateRegionOverride(
                            baseRegion.id,
                            "customColorHex",
                            e.target.value
                          )
                        }
                      />
                      <input
                        required
                        maxLength={7}
                        value={ov.customColorHex}
                        onChange={(e) =>
                          updateRegionOverride(
                            baseRegion.id,
                            "customColorHex",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </label>
                  <label>
                    Redaktionell källnot
                    <textarea
                      required
                      maxLength={500}
                      rows={3}
                      value={ov.editorialSourceNote}
                      onChange={(e) =>
                        updateRegionOverride(
                          baseRegion.id,
                          "editorialSourceNote",
                          e.target.value
                        )
                      }
                    />
                  </label>
                </div>
              );
            })}
          </div>

          <h2>3. Källkritiskt validerad dataimport (JSON)</h2>
          <p className="thesis-admin-hint">
            Här kan du klistra in en uppdaterad <code>ThesisPilotEdition</code>-JSON (motsvarande{" "}
            <code>docs/avhandling/pilot-data-v1.json</code>). Importen kontrolleras automatiskt mot{" "}
            <code>validateThesisPilotEdition</code> och avvisas om källhänvisningar saknas, om SHA-256/sidomfång inte stämmer eller om tidsroller har sammanblandats.
          </p>
          <label>
            JSON-data för validering och import (valfritt)
            <textarea
              rows={5}
              placeholder='Klistra in ThesisPilotEdition JSON här för att validera och ersätta källdatan …'
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
            />
          </label>
          <div className="thesis-admin-json-actions">
            <button type="button" onClick={handleValidateAndImportJson}>
              Validera &amp; läs in JSON i utkastet
            </button>
            <button
              type="button"
              onClick={() =>
                setImportJsonText(
                  JSON.stringify(
                    config.customPilotEdition ?? THESIS_PILOT_EDITION,
                    null,
                    2
                  )
                )
              }
            >
              Fyll i aktuell pilot-JSON i rutan
            </button>
          </div>

          {/* Publicerings- och utgåveknappar (A03.6 & A03.7) */}
          <div className="publication-tools thesis-publication-tools">
            <p>
              <strong>Redaktionsflöde:</strong> 1) Spara utkast → 2) Förhandsgranska via länken ovan → 3) Publicera när granskningen är klar.
            </p>
            <div>
              <button type="submit">
                {busy ? "Arbetar …" : "1. Spara utkast"}
              </button>
              <Link
                className="thesis-preview-btn"
                href="/sprakliv/person-och-numerus?forhandsgranska=1"
              >
                2. Förhandsgranska utkast ↗
              </Link>
              <button
                type="button"
                disabled={busy || dirty}
                onClick={handlePublish}
              >
                3. Publicera utgåva
              </button>
              <button
                type="button"
                disabled={busy || revision === 0}
                onClick={handleRestorePublished}
              >
                Återställ från publicerad
              </button>
              <button
                type="button"
                disabled={busy || !published || revision === 0}
                onClick={handleUnpublish}
              >
                Avpublicera anpassning
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleResetToCanonicalDefaults}
              >
                Återställ formulär till basdata
              </button>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
