"use client";

import { useState } from "react";
import type { StudyBlockType } from "@/lib/content";

const BLOCK_TYPES: Array<{ type: StudyBlockType; label: string; description: string }> = [
  { type: "text", label: "Text", description: "Rubrik och brödtext" },
  { type: "columns", label: "Två spalter", description: "Parallella texter" },
  { type: "table", label: "Tabell", description: "Rader och kolumner" },
  { type: "example", label: "Exempel", description: "Form eller språkprov" },
  { type: "quote", label: "Citat", description: "Citat med källa" },
  { type: "note", label: "Notis", description: "Kommentar eller minnesruta" },
];

export default function BlockInsert({ onInsert, prominent = false }: {
  onInsert: (type: StudyBlockType) => void;
  prominent?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="block-insert"
      data-prominent={prominent ? "true" : undefined}
      data-open={open ? "true" : undefined}
    >
      <button
        className="block-insert-toggle"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span aria-hidden="true">＋</span> Lägg till avsnitt
      </button>
      {open && (
        <div className="block-insert-menu" role="group" aria-label="Välj avsnittstyp">
          {BLOCK_TYPES.map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => {
                onInsert(option.type);
                setOpen(false);
              }}
            >
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
