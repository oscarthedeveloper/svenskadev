import "server-only";
import { cache } from "react";
import { DOCUMENTS, TREES, type ArchiveNode } from "./content";
import { SECTIONS } from "./sections";
import { DEFAULT_HOMEPAGE_TEXT, validateHomepage, type HomepageContent, type FeaturedArticle } from "./homepage-model";
import { getDatabaseSetup } from "./supabase/setup";
import { createSupabaseServerClient } from "./supabase/server";

export const getPublishedArticles = cache(async (): Promise<FeaturedArticle[]> => {
  const setup = await getDatabaseSetup();
  if (setup.status === "unavailable") throw new Error("Startsidan kunde inte läsa arkivet.");
  const articles: FeaturedArticle[] = [];
  if (!setup.initialized) {
    function collect(nodes: ArchiveNode[], root: string, section: string, path: string[] = []) {
      for (const node of nodes) {
        const parts = [...path,node.slug];
        const key = `${root}/${parts.join("/")}`;
        if (node.kind === "doc" && DOCUMENTS[key]) articles.push({id:key,title:DOCUMENTS[key].title,href:`/${key}`,section});
        if (node.children) collect(node.children,root,section,parts);
      }
    }
    for (const section of SECTIONS) collect(TREES[section.slug],section.slug,section.title);
    return articles;
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("svenska_nodes").select("id,root,parent_id,slug,title,kind,content").order("position").order("id");
  if (error) throw new Error("Startsidan kunde inte läsa arkivet.");
  const byId = new Map((data ?? []).map(node => [node.id,node]));
  for (const node of data ?? []) {
    if (node.kind !== "doc" || !node.content) continue;
    const segments = [node.slug];
    let parentId = node.parent_id;
    const seen = new Set([node.id]);
    while (parentId) {
      const parent = byId.get(parentId);
      if (!parent || seen.has(parentId)) break;
      seen.add(parentId); segments.unshift(parent.slug); parentId = parent.parent_id;
    }
    if (parentId) continue;
    articles.push({id:node.id,title:node.title,href:`/${node.root}/${segments.join("/")}`,section:SECTIONS.find(section=>section.slug===node.root)?.title ?? node.root});
  }
  return articles;
});
export const getHomepage = cache(async () => {
  const articles = await getPublishedArticles();
  const ordered = SECTIONS.flatMap(section=>articles.filter(article=>article.section===section.title));
  const defaults: HomepageContent = {...DEFAULT_HOMEPAGE_TEXT,featuredIds:ordered.slice(0,4).map(article=>article.id)};
  const setup = await getDatabaseSetup();
  if (setup.status !== "ready") return {content:defaults,revision:0,articles,needsMigration:false};
  const supabase = await createSupabaseServerClient();
  const {data,error} = await supabase.from("svenska_settings").select("homepage,homepage_revision").eq("id",true).single();
  if (error?.code === "42703" || error?.code === "PGRST204") return {content:defaults,revision:0,articles,needsMigration:true};
  if (error) throw new Error("Startsidan kunde inte läsas.");
  const content = data.homepage && !validateHomepage(data.homepage) ? data.homepage as HomepageContent : defaults;
  return {content,revision:data.homepage_revision as number,articles,needsMigration:false};
});
