import type { StudyDocument } from "./content";

export function validateDocument(value: unknown): string | null {
  if (!value || typeof value !== "object") return "Dokumentet saknas.";
  const doc = value as StudyDocument;
  if (typeof doc.title !== "string" || !doc.title.trim()) return "Titeln får inte vara tom.";
  for (const key of ["subtitle", "period", "category", "intro"] as const) {
    if (typeof doc[key] !== "string") return `Fältet ${key} måste vara text.`;
  }
  if (!Array.isArray(doc.sections) || (doc.blocks !== undefined && !Array.isArray(doc.blocks))) return "Ogiltig artikelstruktur.";
  if (doc.sources !== undefined) {
    if (!Array.isArray(doc.sources)) return "Ogiltig källista.";
    for (const source of doc.sources) {
      if (!source || typeof source.title !== "string" || !source.title.trim() || !isSafeSourceUrl(source.url)) return "Varje källa behöver ett namn och en fullständig http- eller https-adress.";
    }
  }
  if (JSON.stringify(value).length > 500_000) return "Artikeln är för stor. Dela upp den i flera artiklar.";
  return null;
}
export function isSafeSourceUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}
