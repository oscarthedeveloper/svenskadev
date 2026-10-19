import "server-only";

import { cache } from "react";
import {
  DOCUMENTS,
  TREES,
  type ArchiveNode,
  type StudyDocument,
} from "./content";
import { getAdminSession } from "./session";
import { getDatabaseSetup } from "./supabase/setup";
import { HAS_SUPABASE } from "./supabase/config";
import { createSupabaseServerClient } from "./supabase/server";

export type ArchiveRoot = "sprakrad" | "grammatik" | "ordval" | "sprakliv";

const LOCAL_TREES = TREES;

type NodeRow = {
  id: string;
  parent_id: string | null;
  slug: string;
  title: string;
  kind: "folder" | "doc";
  note: string | null;
  position: number;
  content?: StudyDocument | null;
  publication?: ArchiveNode["publication"];
};

function buildTree(rows: NodeRow[]): ArchiveNode[] {
  const nodes = new Map<string, ArchiveNode>();
  const children = new Map<string | null, ArchiveNode[]>();

  for (const row of rows) {
    nodes.set(row.id, {
      id: row.id,
      slug: row.slug,
      title: row.title,
      kind: row.kind,
      note: row.note ?? undefined,
      publication: row.publication,
    });
  }

  for (const row of rows) {
    const list = children.get(row.parent_id) ?? [];
    list.push(nodes.get(row.id)!);
    children.set(row.parent_id, list);
  }

  for (const row of rows) {
    const node = nodes.get(row.id)!;
    const ownChildren = children.get(row.id);
    if (ownChildren?.length) node.children = ownChildren;
  }

  return children.get(null) ?? [];
}

export const isArchiveInitialized = cache(async () => {
  const setup = await getDatabaseSetup();
  if (setup.status === "unavailable") throw new Error("Databasen kunde inte läsas. Kontrollera anslutningen och att båda migrationerna är körda.");
  return setup.initialized;
});

export const getRoot = cache(async (root: ArchiveRoot): Promise<ArchiveNode[]> => {
  if (!HAS_SUPABASE || !await isArchiveInitialized()) return LOCAL_TREES[root];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("svenska_nodes")
    .select("id, parent_id, slug, title, kind, note, position, content")
    .eq("root", root).order("position", { ascending: true }).order("id");
  if (error) throw new Error("Arkivet kunde inte läsas. Försök igen senare.");
  const rows = data as NodeRow[];
  const { isAdmin } = await getAdminSession();
  if (isAdmin && rows.length) {
    const { data: drafts, error: draftError } = await supabase.from("svenska_drafts").select("node_id,content,dirty").in("node_id", rows.map((row) => row.id));
    if (draftError) throw new Error("Utkastens rubriker kunde inte läsas.");
    const byId = new Map((drafts ?? []).map((draft) => [draft.node_id, draft]));
    for (const row of rows) {
      if (row.kind !== "doc") continue;
      const draft = byId.get(row.id);
      row.publication = !row.content ? "draft" : draft?.dirty ? "changes" : "published";
      if (draft) { row.title = draft.content.title; row.note = draft.content.subtitle; }
    }
  }
  return buildTree(rows);
});

export function findArchiveNode(tree: ArchiveNode[], path: string[]) {
  let level = tree;
  let current: ArchiveNode | null = null;
  for (const segment of path) {
    current = level.find((node) => node.slug === segment) ?? null;
    if (!current) return null;
    level = current.children ?? [];
  }
  return current;
}

export type DocumentState = { document: StudyDocument | null; revision: number; hasChanges: boolean; published: boolean };
export const getStudyDocument = cache(async (root: ArchiveRoot, path: string[]): Promise<DocumentState> => {
  if (!HAS_SUPABASE || !await isArchiveInitialized()) {
    return { document: DOCUMENTS[`${root}/${path.join("/")}`] ?? null, revision: 0, hasChanges: false, published: true };
  }
  const node = findArchiveNode(await getRoot(root), path);
  if (!node?.id) return { document: null, revision: 0, hasChanges: false, published: false };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("svenska_nodes").select("content").eq("id", node.id).single();
  if (error) throw new Error("Artikeln kunde inte läsas.");
  const { isAdmin } = await getAdminSession();
  if (isAdmin) {
    const { data: draft, error: draftError } = await supabase.from("svenska_drafts").select("content, revision, dirty").eq("node_id", node.id).maybeSingle();
    if (draftError) throw new Error("Utkastet kunde inte läsas.");
    if (draft) return { document: draft.content as StudyDocument, revision: draft.revision, hasChanges: draft.dirty, published: Boolean(data.content) };
  }
  return { document: data.content as StudyDocument | null, revision: 0, hasChanges: false, published: Boolean(data.content) };
});

export function getArchiveCrumbs(
  root: ArchiveRoot,
  rootTitle: string,
  tree: ArchiveNode[],
  path: string[],
) {
  const crumbs = [{ label: rootTitle, href: `/${root}` }];
  let level = tree;
  const parts: string[] = [];
  for (const segment of path) {
    const node = level.find((item) => item.slug === segment);
    if (!node) break;
    parts.push(segment);
    crumbs.push({ label: node.title, href: `/${root}/${parts.join("/")}` });
    level = node.children ?? [];
  }
  return crumbs;
}
