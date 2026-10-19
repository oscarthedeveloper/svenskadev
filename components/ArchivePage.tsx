"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ArchiveNode } from "@/lib/content";
import {
  createNode,
  deleteNode,
  moveNode,
  renameNode,
  type ActionResult,
} from "@/lib/actions";
import { useAdmin } from "@/components/admin/AdminContext";
import EditableText from "@/components/admin/EditableText";

export default function ArchivePage({
  root,
  parentId,
  title,
  description,
  path,
  items,
  crumbs,
}: {
  root: "sprakrad" | "grammatik" | "ordval" | "sprakliv";
  parentId: string | null;
  title: string;
  description: string;
  path: string[];
  items: ArchiveNode[];
  crumbs: Array<{ label: string; href: string }>;
}) {
  const router = useRouter();
  const { editing, setStatus, setErrorMessage } = useAdmin();

  async function run(action: () => Promise<ActionResult>) {
    setStatus("saving");
    const result = await action();
    if (result.ok) {
      setStatus("saved");
      setErrorMessage(null);
      router.refresh();
    } else {
      setStatus("error");
      setErrorMessage(result.error ?? "Okänt fel");
    }
  }

  function add(kind: "folder" | "doc") {
    const fallback = kind === "folder" ? "Ny mapp" : "Nytt dokument";
    const nextTitle = window.prompt("Namn", fallback)?.trim();
    if (!nextTitle) return;
    void run(() => createNode({ root, parentId, kind, title: nextTitle }));
  }

  return (
    <div className="archive-page">
      <nav className="breadcrumbs" aria-label="Sökväg">
        <Link href="/">Start</Link><span>›</span>
        {crumbs.map((crumb, index) => (
          <span key={crumb.href}>
            <Link href={crumb.href}>{crumb.label}</Link>
            {index < crumbs.length - 1 && <i>›</i>}
          </span>
        ))}
      </nav>

      <header className="archive-heading">
        <div>
          <p className="eyebrow">Arkiv / {root}</p>
          <h1>{title}</h1>
        </div>
        <p>{description}</p>
      </header>

      <div className="archive-tools">
        <span>{String(items.length).padStart(2, "0")} poster</span>
        {editing ? (
          <div className="archive-create-tools">
            <button type="button" onClick={() => add("folder")}>+ Mapp</button>
            <button type="button" onClick={() => add("doc")}>+ Dokument</button>
          </div>
        ) : (
          <><span>Vy: register</span><span>Ordning: tematisk</span></>
        )}
      </div>

      {!items.length && <p className="empty-archive">Det här avsnittet väntar på sina första artiklar.</p>}
      <div className="folder-list">
        {items.map((item, index) => {
          const href = `/${root}/${[...path, item.slug].join("/")}`;
          return (
            <div className="folder-item" data-tone={index % 4} key={item.slug}>
              <span className="folder-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="folder-copy">
                <h2>
                  {editing && item.id ? (
                    <EditableText
                      value={item.title}
                      editing
                      onChange={(value) => void run(() => renameNode(item.id!, value, item.note))}
                    />
                  ) : (
                    <Link href={href}>{item.title}</Link>
                  )}
                </h2>
                <p>
                  <EditableText
                    value={item.note ?? ""}
                    editing={editing && Boolean(item.id)}
                    placeholder="Lägg till en kort beskrivning …"
                    onChange={(value) => item.id && void run(() => renameNode(item.id!, item.title, value))}
                  />
                </p>
              </div>
              <span className="folder-kind">
                {item.kind === "folder" ? `${item.children?.length ?? 0} avsnitt` : item.publication === "draft" ? "Privat utkast" : item.publication === "changes" ? "Ändringar i utkast" : "dokument"}
              </span>
              <Link className="folder-open" href={href} aria-label={`Öppna ${item.title}`}>↗</Link>
              {editing && item.id && (
                <div className="folder-admin-tools" aria-label={`Redigera ${item.title}`}>
                  <button type="button" title="Flytta upp" onClick={() => void run(() => moveNode(item.id!, -1))}>↑</button>
                  <button type="button" title="Flytta ned" onClick={() => void run(() => moveNode(item.id!, 1))}>↓</button>
                  <button
                    type="button"
                    title="Ta bort"
                    onClick={() => {
                      if (window.confirm(`Ta bort ”${item.title}”${item.kind === "folder" ? " och allt innehåll" : ""}?`)) {
                        void run(() => deleteNode(item.id!));
                      }
                    }}
                  >×</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="archive-note">Ett levande arkiv om svenskan. Börja med en fråga och följ språket vidare.</p>
    </div>
  );
}
