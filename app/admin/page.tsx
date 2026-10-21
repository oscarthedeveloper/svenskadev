import Link from "next/link";
import HomepageEditor from "@/components/admin/HomepageEditor";
import { getHomepage } from "@/lib/homepage";
import StudyFrame from "@/components/StudyFrame";
import LoginForm from "@/components/admin/LoginForm";
import ImportContentButton from "@/components/admin/ImportContentButton";
import { signOut } from "@/lib/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDatabaseSetup } from "@/lib/supabase/setup";
import { SECTIONS } from "@/lib/sections";
import { getRoot } from "@/lib/archive";
import type { ArchiveNode } from "@/lib/content";
import { getAdminSession } from "@/lib/session";
import {
  HAS_SUPABASE,
  missingSupabaseVariables,
} from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Administration",
  description: "Administration av det svenska språkarkivet.",
  robots: { index: false, follow: false },
};

async function EditorialOverview() {
  const supabase = await createSupabaseServerClient();
  const { data: drafts, error } = await supabase.from("svenska_drafts").select("node_id,dirty,content");
  if (error) return <p role="alert">Redaktionen kunde inte läsas. Kontrollera att båda databas-migrationerna är körda.</p>;
  const draftsById = new Map((drafts ?? []).map((draft) => [draft.node_id, draft]));
  const articles: Array<{ href: string; title: string; status: string }> = [];
  function collect(nodes: ArchiveNode[], prefix: string) {
    for (const node of nodes) {
      const href = `${prefix}/${node.slug}`;
      if (node.kind === "doc" && node.id) {
        const draft = draftsById.get(node.id);
        articles.push({ href, title: draft?.content?.title ?? node.title, status: draft?.dirty ? "Utkast / opublicerade ändringar" : draft ? "Publicerad" : "Tom artikel" });
      }
      if (node.children) collect(node.children, href);
    }
  }
  try { for (const section of SECTIONS) collect(await getRoot(section.slug), `/${section.slug}`); }
  catch { return <p role="alert">Arkivet kunde inte läsas. Kontrollera Supabase-anslutningen och migrationerna.</p>; }
  return <section className="editorial-overview"><h2>Ditt språkarkiv</h2><p>{articles.length} artiklar · {articles.filter((article) => article.status.startsWith("Utkast")).length} med utkast</p>
    {!articles.length && <p>Synkronisera grundinnehållet för att börja skriva.</p>}
    <ul>{articles.map((article) => <li key={article.href}><Link href={article.href}>{article.title} ↗</Link><span>{article.status}</span></li>)}</ul>
  </section>;
}

async function HomepageSettings() {
  const page = await getHomepage();
  return <HomepageEditor initial={page.content} initialRevision={page.revision} articles={page.articles} needsMigration={page.needsMigration} />;
}

export default async function AdminPage() {
  const { isAdmin, username } = await getAdminSession();
  const setup = await getDatabaseSetup();

  return (
    <StudyFrame title="Administration">
      <div className="admin-stage">
        <section className="admin-card" aria-labelledby="admin-title">
          <div className="admin-card-heading">
            <span className="eyebrow">Redigeringsläge</span>
            <span className={`admin-status ${isAdmin ? "connected" : ""}`}>
              {!HAS_SUPABASE ? "Ej konfigurerat" : setup.status === "needs-migration" ? "Installation återstår" : setup.status === "unavailable" ? "Anslutningsfel" : isAdmin ? "Anslutet" : "Utloggad"}
            </span>
          </div>
          <h1 id="admin-title">Administration</h1>

          {!HAS_SUPABASE ? (
            <div className="admin-message">
              <p>Supabase är ännu inte anslutet. Följ installationsstegen i README för databas och administratörskonto.</p>
              <p>Lägg in följande variabler i <code>.env.local</code> och starta om sidan:</p>
              <ul>
                {missingSupabaseVariables().map((variable) => <li key={variable}><code>{variable}</code></li>)}
              </ul>
            </div>
          ) : setup.status === "needs-migration" ? (
            <div className="admin-message">
              <p>Projektanslutningen är konfigurerad. Svenska.dev:s egna databastabeller behöver nu installeras.</p>
              <ol><li>Öppna Supabase-projektets SQL Editor.</li><li>Kör <code>supabase/install-svenska.sql</code> en gång. Den skapar svenska.dev:s egna tabeller.</li><li>Lägg till ditt befintliga användarkontos UUID i <code>svenska_admins</code> enligt README.</li><li>Ladda om sidan och logga in.</li></ol>
              <p>Fornsvenska.se:s innehåll och behörigheter används inte som svenska.dev-innehåll.</p>
            </div>
          ) : setup.status === "unavailable" ? (
            <div className="admin-message" role="alert"><p>Databasanslutningen kunde inte verifieras. Kontrollera projektets URL, publika nyckel och att migrationerna är körda. Försök sedan ladda om sidan.</p></div>
          ) : isAdmin ? (
            <div className="admin-message">
              <p>
                Inloggad som <strong>{username}</strong>. Öppna ett arkiv eller
                dokument och välj <strong>Redigera sidan</strong> i listen längst ned.
                På en studiesida kan du därefter bygga fritt med text, två spalter,
                tabeller, exempel, citat och notiser.
              </p>
              <p>
                Synkroniseringen lägger till och publicerar mallens exempelartiklar. Redan redigerade texter skrivs inte över.
              </p>
              <p>Artiklar sparas som privata utkast. Förhandsgranska och välj <strong>Publicera</strong> när texten är klar. En publicerad artikel behåller sin tidigare version tills du publicerar ändringarna.</p>
              <ImportContentButton />
              <EditorialOverview />
              <HomepageSettings />
              <div className="admin-actions">
                <Link href="/admin/avhandling">Avhandlingsutgåva (/admin/avhandling) →</Link>
                <Link href="/admin/runor">Runologiskt arbetsflöde (/admin/runor) →</Link>
                <Link href="/grammatik">Till grammatiken →</Link>
                <Link href="/sprakliv">Till språklivet →</Link>
                <form action={signOut}><button type="submit">Logga ut</button></form>
              </div>
            </div>
          ) : username ? (
            <div className="admin-message"><p>Du är inloggad, men kontot saknar administratörsbehörighet för svenska.dev.</p><form action={signOut}><button type="submit">Logga ut och byt konto</button></form></div>
          ) : (
            <LoginForm />
          )}
        </section>
      </div>
    </StudyFrame>
  );
}
