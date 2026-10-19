export type FeaturedArticle = { id: string; title: string; href: string; section: string };
export type HomepageContent = { eyebrow: string; headline: string; accent: string; intro: string; featuredIds: string[] };
export const DEFAULT_HOMEPAGE_TEXT = {
  eyebrow: "Ett rum för svenska språket", headline: "Ord för", accent: "din tanke.",
  intro: "De eller dem? Vore eller var? Här finns språkets små knutar, användbara ord och oväntade sidospår. För dig som vill skriva tydligare och förstå mer.",
};
export function validateHomepage(value: unknown): string | null {
  if (!value || typeof value !== "object") return "Startsidan saknas.";
  const page = value as HomepageContent;
  for (const [field, limit] of [["eyebrow",80],["headline",24],["accent",24],["intro",500]] as const) {
    if (typeof page[field] !== "string" || !page[field].trim() || page[field].length > limit) return `Fältet ${field} behöver innehålla 1–${limit} tecken.`;
  }
  if (!Array.isArray(page.featuredIds) || page.featuredIds.length < 1 || page.featuredIds.length > 4 || page.featuredIds.some(id => typeof id !== "string" || !id) || new Set(page.featuredIds).size !== page.featuredIds.length) return "Välj 1–4 olika publicerade artiklar.";
  return null;
}
export function selectFeaturedArticles(ids: string[], available: FeaturedArticle[]): FeaturedArticle[] {
  const byId = new Map(available.map(article => [article.id,article]));
  return [...new Set(ids)].flatMap(id => { const article = byId.get(id); return article ? [article] : []; }).slice(0,4);
}
