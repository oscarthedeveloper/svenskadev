"use client";

import Link from "next/link";
import { useState } from "react";
import { blocksForDocument, type ArchiveNode, type StudyDocument } from "@/lib/content";
import { useDocumentEditor } from "@/components/admin/useDocumentEditor";
import SourceEditor from "@/components/admin/SourceEditor";
import { isSafeSourceUrl } from "@/lib/editorial";
import { useAdmin } from "@/components/admin/AdminContext";
import EditableText from "@/components/admin/EditableText";
import StudyBlocks from "@/components/StudyBlocks";

function Tree({
  items,
  root,
  prefix,
  current,
}: {
  items: ArchiveNode[];
  root: string;
  prefix: string[];
  current: string;
}) {
  return (
    <ul>
      {items.map((item) => {
        const href = `/${root}/${[...prefix, item.slug].join("/")}`;
        return (
          <li key={href}>
            <Link className={href === current ? "current" : ""} href={href}>{item.title}</Link>
            {item.children && (
              <Tree items={item.children} root={root} prefix={[...prefix, item.slug]} current={current} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function DocumentPage({
  document: initialDocument,
  nodeId,
  initialRevision,
  initiallyPublished,
  initialChanges,
  root,
  tree,
  crumbs,
  currentPath,
}: {
  document: StudyDocument;
  nodeId?: string;
  initialRevision: number;
  initiallyPublished: boolean;
  initialChanges: boolean;
  root: "sprakrad" | "grammatik" | "ordval" | "sprakliv";
  tree: ArchiveNode[];
  crumbs: Array<{ label: string; href: string }>;
  currentPath: string[];
}) {
  const current = `/${root}/${currentPath.join("/")}`;
  const { isAdmin, editing: editMode } = useAdmin();
  const [preview, setPreview] = useState(false);
  const { draft, update, flush, published, hasChanges, busy, changePublication } = useDocumentEditor(initialDocument, nodeId, initialRevision, initiallyPublished, initialChanges);

  const editing = editMode && !preview && !busy && Boolean(nodeId);

  const blocks = blocksForDocument(draft);

  return (
    <div className="document-layout">
      <aside className="document-sidebar">
        <p className="eyebrow">Innehåll / {root}</p>
        <Tree items={tree} root={root} prefix={[]} current={current} />
      </aside>

      <article className="document-main">
        <nav className="breadcrumbs" aria-label="Sökväg">
          {crumbs.map((crumb, index) => (
            <span key={crumb.href}>
              <Link href={crumb.href}>{crumb.label}</Link>
              {index < crumbs.length - 1 && <i>›</i>}
            </span>
          ))}
        </nav>

        {isAdmin && !nodeId && (
          <p className="editor-warning">Importera grundinnehållet för svenska.dev till Supabase för att aktivera sparning.</p>
        )}

        {isAdmin && nodeId && <section className="publication-tools" aria-label="Publicering">
          <p><strong>{published ? hasChanges ? "Publicerad · ändringar i utkast" : "Publicerad" : "Privat utkast"}</strong><br />{preview ? "Förhandsgranskning av ditt utkast. Endast administratörer ser detta." : "Ändringar sparas i utkastet. Besökarna ser den publicerade versionen."}</p>
          <div><button type="button" disabled={busy} onClick={() => { void flush(); }}>Spara utkast</button><button type="button" disabled={busy} aria-pressed={preview} onClick={() => setPreview(!preview)}>{preview ? "Till redigeringen" : "Förhandsgranska"}</button><button type="button" disabled={busy || published && !hasChanges} onClick={() => { void changePublication(true); }}>{busy ? "Arbetar …" : published ? "Publicera ändringar" : "Publicera"}</button>{published && <button type="button" disabled={busy} onClick={() => { if (window.confirm("Avpublicera artikeln? Den försvinner för besökare men finns kvar som utkast.")) void changePublication(false); }}>Avpublicera</button>}</div>
        </section>}

        <header className="document-heading">
          <div className="document-meta">
            <span><EditableText value={draft.category} editing={editing} onChange={(value) => update({ ...draft, category: value })} /></span>
            <span><EditableText value={draft.period} editing={editing} onChange={(value) => update({ ...draft, period: value })} /></span>
            <span>{isAdmin && hasChanges ? "Arbetsutkast" : "Referensartikel"}</span>
          </div>
          <h1>
            <EditableText
              value={draft.title}
              editing={editing}
              onChange={(value) => {
                update({ ...draft, title: value });
              }}
            />
          </h1>
          <p className="document-subtitle">
            <EditableText value={draft.subtitle} editing={editing} multiline onChange={(value) => update({ ...draft, subtitle: value })} />
          </p>
          <p className="document-intro">
            <EditableText value={draft.intro} editing={editing} multiline onChange={(value) => update({ ...draft, intro: value })} />
          </p>
        </header>

        {draft.quote && (
          <figure className="document-quote">
            <blockquote>
              <EditableText value={draft.quote} editing={editing} multiline onChange={(value) => update({ ...draft, quote: value })} />
            </blockquote>
            <figcaption>
              <EditableText value={draft.quoteSource ?? ""} editing={editing} onChange={(value) => update({ ...draft, quoteSource: value })} />
            </figcaption>
          </figure>
        )}

        <StudyBlocks
          blocks={blocks}
          editing={editing}
          onChange={(nextBlocks) => update({ ...draft, blocks: nextBlocks })}
        />

        {editing ? <SourceEditor sources={draft.sources ?? []} onChange={(sources) => update({ ...draft, sources })} /> : draft.sources?.length ? <section className="article-sources" aria-label="Källor och vidare läsning"><h2>Källor och vidare läsning</h2><ul>{draft.sources.filter((source) => isSafeSourceUrl(source.url)).map((source) => <li key={source.url}><a href={source.url}>{source.title} ↗</a></li>)}</ul></section> : null}

        <div className="document-end">
          <span>Slut på studiesidan</span>
          <Link href={`/${root}`}>Tillbaka till arkivet →</Link>
        </div>
      </article>
    </div>
  );
}
