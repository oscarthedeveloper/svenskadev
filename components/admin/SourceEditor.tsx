"use client";
import { useState } from "react";
import type { StudyDocument } from "@/lib/content";
import { isSafeSourceUrl } from "@/lib/editorial";

type Source = NonNullable<StudyDocument["sources"]>[number];
export default function SourceEditor({ sources, onChange }: { sources: Source[]; onChange: (sources: Source[]) => void }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  return <section className="source-editor" aria-label="Redigera källor"><h2>Källor och vidare läsning</h2>
    <ul>{sources.map((source, i) => <li key={`${source.url}-${i}`}><a href={source.url}>{source.title}</a><button type="button" onClick={() => { setTitle(source.title); setUrl(source.url); setEditingIndex(i); }}>Ändra</button><button type="button" onClick={() => { onChange(sources.filter((_, index) => index !== i)); setEditingIndex(null); setTitle(""); setUrl(""); }}>Ta bort</button></li>)}</ul>
    <form onSubmit={(event) => { event.preventDefault(); if (!title.trim() || !isSafeSourceUrl(url.trim())) { setError("Ange källans namn och en fullständig http- eller https-adress."); return; } const source = { title: title.trim(), url: url.trim() }; onChange(editingIndex === null ? [...sources, source] : sources.map((item, i) => i === editingIndex ? source : item)); setEditingIndex(null); setTitle(""); setUrl(""); setError(null); }}>
      <label>Källans namn<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
      <label>Länk<input type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" required /></label>
      <button type="submit">{editingIndex === null ? "Lägg till källa" : "Spara källa"}</button>{editingIndex !== null && <button type="button" onClick={() => { setEditingIndex(null); setTitle(""); setUrl(""); setError(null); }}>Avbryt ändring</button>}
      {error && <p role="alert">{error}</p>}
    </form>
  </section>;
}
