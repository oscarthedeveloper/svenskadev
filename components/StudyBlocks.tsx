"use client";

import EditableText from "@/components/admin/EditableText";
import BlockInsert from "@/components/admin/BlockInsert";
import type { StudyBlock, StudyBlockType } from "@/lib/content";

const LABELS: Record<StudyBlockType, string> = {
  text: "Textavsnitt",
  columns: "Två spalter",
  table: "Tabell",
  example: "Exempel",
  quote: "Citat",
  note: "Notis",
};

function blockId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `block-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createBlock(type: StudyBlockType): StudyBlock {
  const id = blockId();
  switch (type) {
    case "columns":
      return { id, type, title: "Nytt tvåspaltigt avsnitt", leftTitle: "Vänster spalt", leftBody: "", rightTitle: "Höger spalt", rightBody: "" };
    case "table":
      return { id, type, title: "Ny tabell", columns: ["Kolumn 1", "Kolumn 2"], rows: [["", ""], ["", ""]] };
    case "example":
      return { id, type, label: "Exempel", text: "", note: "" };
    case "quote":
      return { id, type, text: "", source: "" };
    case "note":
      return { id, type, label: "Notera", title: "Ny notis", body: "" };
    default:
      return { id, type: "text", title: "Nytt avsnitt", body: "" };
  }
}

function cloneBlock(block: StudyBlock): StudyBlock {
  return { ...structuredClone(block), id: blockId() };
}

function BlockContent({ block, editing, onChange, number }: {
  block: StudyBlock;
  editing: boolean;
  onChange: (block: StudyBlock) => void;
  number: number;
}) {
  const patch = (value: Partial<StudyBlock>) => onChange({ ...block, ...value } as StudyBlock);

  if (block.type === "text") {
    return (
      <section className="text-block">
        <span className="section-number">§ {String(number).padStart(2, "0")}</span>
        <div>
          <h2><EditableText value={block.title} editing={editing} onChange={(title) => patch({ title })} /></h2>
          <p><EditableText value={block.body} editing={editing} multiline onChange={(body) => patch({ body })} /></p>
        </div>
      </section>
    );
  }

  if (block.type === "columns") {
    return (
      <section className="columns-block">
        <div className="block-kicker">§ {String(number).padStart(2, "0")} · parallell läsning</div>
        <h2><EditableText value={block.title} editing={editing} onChange={(title) => patch({ title })} /></h2>
        <div className="two-column-grid">
          <div>
            <h3><EditableText value={block.leftTitle} editing={editing} onChange={(leftTitle) => patch({ leftTitle })} /></h3>
            <p><EditableText value={block.leftBody} editing={editing} multiline onChange={(leftBody) => patch({ leftBody })} /></p>
          </div>
          <div>
            <h3><EditableText value={block.rightTitle} editing={editing} onChange={(rightTitle) => patch({ rightTitle })} /></h3>
            <p><EditableText value={block.rightBody} editing={editing} multiline onChange={(rightBody) => patch({ rightBody })} /></p>
          </div>
        </div>
      </section>
    );
  }

  if (block.type === "table") {
    const updateCell = (rowIndex: number, cellIndex: number, value: string) => {
      patch({ rows: block.rows.map((row, ri) => ri === rowIndex ? row.map((cell, ci) => ci === cellIndex ? value : cell) : row) });
    };
    return (
      <section className="study-table block-table">
        <div className="block-kicker">§ {String(number).padStart(2, "0")} · tabell</div>
        <h2><EditableText value={block.title} editing={editing} onChange={(title) => patch({ title })} /></h2>
        <div className="table-scroll">
          <table>
            <thead><tr>{block.columns.map((column, index) => (
              <th key={index}><EditableText value={column} editing={editing} onChange={(value) => patch({ columns: block.columns.map((item, ci) => ci === index ? value : item) })} /></th>
            ))}</tr></thead>
            <tbody>{block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>{block.columns.map((_, cellIndex) => (
                <td key={cellIndex}><EditableText value={row[cellIndex] ?? ""} editing={editing} onChange={(value) => updateCell(rowIndex, cellIndex, value)} /></td>
              ))}</tr>
            ))}</tbody>
          </table>
        </div>
        {editing && (
          <div className="table-tools" aria-label="Tabellverktyg">
            <button type="button" onClick={() => patch({ rows: [...block.rows, block.columns.map(() => "")] })}>+ rad</button>
            <button type="button" disabled={block.rows.length <= 1} onClick={() => patch({ rows: block.rows.slice(0, -1) })}>− rad</button>
            <button type="button" onClick={() => patch({ columns: [...block.columns, `Kolumn ${block.columns.length + 1}`], rows: block.rows.map((row) => [...row, ""]) })}>+ kolumn</button>
            <button type="button" disabled={block.columns.length <= 1} onClick={() => patch({ columns: block.columns.slice(0, -1), rows: block.rows.map((row) => row.slice(0, -1)) })}>− kolumn</button>
          </div>
        )}
      </section>
    );
  }

  if (block.type === "example") {
    return (
      <section className="example standalone-example">
        <span className="example-label">§ {String(number).padStart(2, "0")} · <EditableText value={block.label} editing={editing} onChange={(label) => patch({ label })} /></span>
        <strong><EditableText value={block.text} editing={editing} multiline onChange={(text) => patch({ text })} /></strong>
        {(editing || block.note) && <small><EditableText value={block.note} editing={editing} multiline onChange={(note) => patch({ note })} placeholder="Kommentar till exemplet …" /></small>}
      </section>
    );
  }

  if (block.type === "quote") {
    return (
      <figure className="document-quote block-quote">
        <div className="block-kicker block-kicker-light">§ {String(number).padStart(2, "0")} · citat</div>
        <blockquote><EditableText value={block.text} editing={editing} multiline onChange={(text) => patch({ text })} placeholder="Skriv citatet …" /></blockquote>
        <figcaption><EditableText value={block.source} editing={editing} onChange={(source) => patch({ source })} placeholder="Källa …" /></figcaption>
      </figure>
    );
  }

  return (
    <aside className="study-note-block">
      <span className="note-label">§ {String(number).padStart(2, "0")} · <EditableText value={block.label} editing={editing} onChange={(label) => patch({ label })} /></span>
      <div>
        <h2><EditableText value={block.title} editing={editing} onChange={(title) => patch({ title })} /></h2>
        <p><EditableText value={block.body} editing={editing} multiline onChange={(body) => patch({ body })} /></p>
      </div>
    </aside>
  );
}

export default function StudyBlocks({ blocks, editing, onChange }: {
  blocks: StudyBlock[];
  editing: boolean;
  onChange: (blocks: StudyBlock[]) => void;
}) {
  const insert = (index: number, type: StudyBlockType) => onChange([
    ...blocks.slice(0, index),
    createBlock(type),
    ...blocks.slice(index),
  ]);

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="document-blocks">
      {editing && (
        <div className="block-editor-guide">
          <strong>Sidbyggare</strong>
          <span>Klicka direkt i texten för att skriva. Lägg till, flytta, duplicera eller ta bort block med verktygen runt varje avsnitt.</span>
        </div>
      )}
      {editing && <BlockInsert prominent={blocks.length === 0} onInsert={(type) => insert(0, type)} />}
      {blocks.map((block, index) => (
        <div className="study-block-shell" key={block.id} data-editing={editing ? "true" : undefined}>
          {editing && (
            <div className="block-toolbar">
              <span>{String(index + 1).padStart(2, "0")} · {LABELS[block.type]}</span>
              <div>
                <button type="button" title="Flytta upp" disabled={index === 0} onClick={() => move(index, -1)}>↑</button>
                <button type="button" title="Flytta ned" disabled={index === blocks.length - 1} onClick={() => move(index, 1)}>↓</button>
                <button type="button" title="Duplicera" onClick={() => onChange([...blocks.slice(0, index + 1), cloneBlock(block), ...blocks.slice(index + 1)])}>⧉</button>
                <button className="danger" type="button" title="Ta bort" onClick={() => onChange(blocks.filter((_, bi) => bi !== index))}>×</button>
              </div>
            </div>
          )}
          <BlockContent block={block} editing={editing} number={index + 1} onChange={(next) => onChange(blocks.map((item, bi) => bi === index ? next : item))} />
          {editing && <BlockInsert onInsert={(type) => insert(index + 1, type)} />}
        </div>
      ))}
    </div>
  );
}
