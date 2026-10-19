import { notFound } from "next/navigation";
import type { Metadata } from "next";
import StudyFrame from "@/components/StudyFrame";
import ArchivePage from "@/components/ArchivePage";
import DocumentPage from "@/components/DocumentPage";
import EmptyDocumentEditor from "@/components/admin/EmptyDocumentEditor";
import { findArchiveNode, getArchiveCrumbs, getRoot, getStudyDocument } from "@/lib/archive";
import { SECTIONS } from "@/lib/sections";

type Props = { params: Promise<{ section: string; slug?: string[] }> };
export const dynamic = "force-dynamic";
async function resolve({ params }: Props) {
  const { section, slug: path = [] } = await params;
  const config = SECTIONS.find((item) => item.slug === section);
  if (!config) notFound();
  const root = config.slug;
  const tree = await getRoot(root);
  const node = path.length ? findArchiveNode(tree, path) : null;
  if (path.length && !node) notFound();
  const state = node?.kind === "doc" ? await getStudyDocument(root, path) : null;
  const document = state?.document;
  return { config, root, tree, node, document, state, path };
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const { config, node, document, state } = await resolve(props);
  return { title: document?.title ?? node?.title ?? config.title, description: document?.intro ?? node?.note ?? config.description, robots: (state?.hasChanges || (!state?.published && node?.kind === "doc")) ? { index: false, follow: false } : undefined };
}
export default async function SectionPage(props: Props) {
  const { config, root, tree, node, document, state, path } = await resolve(props);
  const crumbs = getArchiveCrumbs(root, config.title, tree, path);
  return <StudyFrame title={node?.title ?? config.title} active={`/${root}`}>
    {node?.kind === "doc" ? document
      ? <DocumentPage key={node.id ?? path.join("/")} document={document} initialRevision={state?.revision ?? 0} initiallyPublished={state?.published ?? false} initialChanges={state?.hasChanges ?? false} nodeId={node.id} root={root} tree={tree} crumbs={crumbs} currentPath={path} />
      : <EmptyDocumentEditor nodeId={node.id} title={node.title} note={node.note} backHref={`/${root}`} />
      : <ArchivePage root={root} parentId={node?.id ?? null} path={path} title={node?.title ?? config.title} description={node?.note ?? config.description} items={node ? node.children ?? [] : tree} crumbs={crumbs} />}
  </StudyFrame>;
}
