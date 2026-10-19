"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { HAS_SUPABASE } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateDocument } from "@/lib/editorial";
import { getAdminSession } from "@/lib/session";
import {
  DOCUMENTS,
  TREES,
  type ArchiveNode,
  type StudyDocument,
  isPlaceholderDocument,
} from "@/lib/content";

export type ActionResult = { ok: boolean; error?: string; message?: string; revision?: number };

async function requireAdmin(): Promise<string | null> {
  if (!HAS_SUPABASE) return "Supabase är inte konfigurerat.";
  const { isAdmin } = await getAdminSession();
  return isAdmin ? null : "Du är inte inloggad som administratör.";
}

function refreshContent() {
  revalidatePath("/", "layout");
}

export async function saveDocument(nodeId: string, content: unknown, revision = 0): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  const invalid = validateDocument(content);
  if (invalid) return { ok: false, error: invalid };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("svenska_save_draft", { p_node_id: nodeId, p_content: content, p_revision: revision });
  if (error) return { ok: false, error: error.message };
  refreshContent();
  return { ok: true, revision: data as number };
}

export async function setDocumentPublication(nodeId: string, revision: number, publish: boolean): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc(publish ? "svenska_publish" : "svenska_unpublish", { p_node_id: nodeId, p_revision: revision });
  if (error) return { ok: false, error: error.message };
  refreshContent();
  return { ok: true, revision: data as number };
}

export async function renameNode(
  nodeId: string,
  title: string,
  note?: string,
): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  const cleanTitle = title.trim();
  if (!cleanTitle) return { ok: false, error: "Titeln får inte vara tom." };

  const supabase = await createSupabaseServerClient();
  const { data: node, error: readError } = await supabase.from("svenska_nodes").select("kind,content").eq("id", nodeId).single();
  if (readError) return { ok: false, error: readError.message };
  if (node.kind === "doc") {
    const { data: draft, error: draftError } = await supabase.from("svenska_drafts").select("content,revision").eq("node_id", nodeId).maybeSingle();
    if (draftError) return { ok: false, error: draftError.message };
    const content: StudyDocument = draft?.content ?? node.content ?? { title: cleanTitle, subtitle: "", intro: "", period: "", category: "", sections: [], blocks: [] };
    return saveDocument(nodeId, { ...content, title: cleanTitle, subtitle: note ?? content.subtitle }, draft?.revision ?? 0);
  }
  const { error } = await supabase
    .from("svenska_nodes")
    .update({ title: cleanTitle, note: note?.trim() || null })
    .eq("id", nodeId);

  if (error) return { ok: false, error: error.message };
  refreshContent();
  return { ok: true };
}

export async function createNode(input: {
  root: "sprakrad" | "grammatik" | "ordval" | "sprakliv";
  parentId: string | null;
  kind: "folder" | "doc";
  title: string;
}): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("svenska_nodes")
    .select("slug, position")
    .eq("root", input.root);
  query = input.parentId
    ? query.eq("parent_id", input.parentId)
    : query.is("parent_id", null);
  const { data: siblings, error: readError } = await query;
  if (readError) return { ok: false, error: readError.message };

  const base = slugify(input.title) || "ny-sida";
  const taken = new Set((siblings ?? []).map((item) => item.slug));
  let slug = base;
  let suffix = 2;
  while (taken.has(slug)) slug = `${base}-${suffix++}`;
  const position = (siblings ?? []).reduce(
    (max, item) => Math.max(max, item.position ?? 0),
    -1,
  ) + 1;

  const { error } = await supabase.from("svenska_nodes").insert({
    root: input.root,
    parent_id: input.parentId,
    slug,
    title: input.title.trim(),
    kind: input.kind,
    position,
    content: null,
    utkast: input.kind === "doc",
  });

  if (error) return { ok: false, error: error.message };
  refreshContent();
  return { ok: true };
}

export async function deleteNode(nodeId: string): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("svenska_nodes").delete().eq("id", nodeId);
  if (error) return { ok: false, error: error.message };
  refreshContent();
  return { ok: true };
}

export async function moveNode(
  nodeId: string,
  direction: -1 | 1,
): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("svenska_move_node", { p_node_id: nodeId, p_direction: direction });
  if (error) return { ok: false, error: error.message };
  refreshContent();
  return { ok: true };
}

export async function signOut(): Promise<void> {
  if (HAS_SUPABASE) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  refreshContent();
  redirect("/admin");
}

export async function importSwedishContent(): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  const supabase = await createSupabaseServerClient();

  let created = 0;
  let filled = 0;

  async function syncNodes(
    root: "sprakrad" | "grammatik" | "ordval" | "sprakliv",
    nodes: ArchiveNode[],
    parentId: string | null,
    path: string[],
  ) {
    for (const [position, node] of nodes.entries()) {
      const nodePath = [...path, node.slug];
      const content =
        node.kind === "doc"
          ? DOCUMENTS[`${root}/${nodePath.join("/")}`] ?? null
          : null;

      let existingQuery = supabase
        .from("svenska_nodes")
        .select("id, content")
        .eq("root", root)
        .eq("slug", node.slug);
      existingQuery = parentId
        ? existingQuery.eq("parent_id", parentId)
        : existingQuery.is("parent_id", null);
      const { data: existing, error: readError } = await existingQuery.maybeSingle();
      if (readError) throw readError;

      let id: string;
      if (existing) {
        id = existing.id;
        const { data: draft, error: draftError } = await supabase.from("svenska_drafts").select("node_id").eq("node_id", id).maybeSingle();
        if (draftError) throw draftError;
        const patch: Record<string, unknown> = {};
        if (
          !draft && node.kind === "doc" &&
          (!existing.content || isPlaceholderDocument(existing.content)) &&
          content
        ) {
          patch.content = content;
          patch.utkast = false;
          filled++;
        }
        if (Object.keys(patch).length) {
          const { error } = await supabase.from("svenska_nodes").update(patch).eq("id", id);
          if (error) throw error;
        }
      } else {
        const { data, error } = await supabase.from("svenska_nodes").insert({
          root,
          parent_id: parentId,
          slug: node.slug,
          title: node.title,
          kind: node.kind,
          note: node.note ?? null,
          position,
          content,
          utkast: node.kind === "doc" && !content,
        }).select("id").single();
        if (error) throw error;
        id = data.id;
        created++;
      }

      if (node.kind === "doc" && content) {
        const { error } = await supabase.from("svenska_drafts").upsert({ node_id: id, content, dirty: false }, { onConflict: "node_id", ignoreDuplicates: true });
        if (error) throw error;
      }

      if (node.children?.length) {
        await syncNodes(root, node.children, id, nodePath);
      }
    }
  }

  for (const [root, tree] of [
    ["sprakrad", TREES.sprakrad],
    ["grammatik", TREES.grammatik],
    ["ordval", TREES.ordval],
    ["sprakliv", TREES.sprakliv],
  ] as const) {
    try {
      await syncNodes(root, tree, null, []);
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Synkroniseringen misslyckades.",
      };
    }
  }

  const { error: settingsError } = await supabase.from("svenska_settings").update({ initialized: true }).eq("id", true);
  if (settingsError) return { ok: false, error: settingsError.message };
  refreshContent();
  return {
    ok: true,
    message:
      created || filled
        ? `${created} nya noder skapades och ${filled} tomma dokument fylldes. Befintliga texter bevarades.`
        : "Innehållet är redan synkroniserat. Befintliga texter lämnades orörda.",
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function saveHomepage(content: unknown, revision: number): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return {ok:false,error:denied};
  const { validateHomepage } = await import("@/lib/homepage-model");
  const invalid = validateHomepage(content);
  if (invalid) return {ok:false,error:invalid};
  const { getPublishedArticles } = await import("@/lib/homepage");
  const page = content as import("@/lib/homepage-model").HomepageContent;
  const available = new Set((await getPublishedArticles()).map(article=>article.id));
  if (page.featuredIds.some(id=>!available.has(id))) return {ok:false,error:"En vald artikel är inte längre publicerad. Ladda om sidan och välj igen."};
  const supabase = await createSupabaseServerClient();
  const {data,error} = await supabase.from("svenska_settings").update({homepage:page,homepage_revision:revision+1}).eq("id",true).eq("homepage_revision",revision).select("homepage_revision").maybeSingle();
  if (error) return {ok:false,error:error.message};
  if (!data) return {ok:false,error:"Startsidan har ändrats i en annan flik. Kopiera din text och ladda om sidan."};
  refreshContent();
  return {ok:true,revision:data.homepage_revision};
}
