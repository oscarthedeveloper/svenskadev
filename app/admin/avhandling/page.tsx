import Link from "next/link";
import StudyFrame from "@/components/StudyFrame";
import LoginForm from "@/components/admin/LoginForm";
import ThesisAdminEditor from "@/components/admin/ThesisAdminEditor";
import { getAdminSession } from "@/lib/session";
import { HAS_SUPABASE } from "@/lib/supabase/config";
import { getDatabaseSetup } from "@/lib/supabase/setup";
import { getThesisPilotState, THESIS_PILOT_SLUG } from "@/lib/thesis/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Administration · Från person till person",
  description:
    "Redaktionell hantering av avhandlingspiloten Från person till person.",
  robots: { index: false, follow: false },
};

export default async function ThesisAdminPage() {
  const [{ isAdmin, username }, setup, state] = await Promise.all([
    getAdminSession(),
    getDatabaseSetup(),
    getThesisPilotState({ preferDraftForAdmin: true }),
  ]);

  return (
    <StudyFrame title="Administration · Avhandling">
      <div className="admin-stage thesis-admin-stage">
        <section
          className="admin-card thesis-admin-card"
          aria-labelledby="thesis-admin-title"
        >
          <div className="admin-card-heading">
            <span className="eyebrow">
              Redigeringsläge · Avhandlingsutgåva (Pilot v1)
            </span>
            <span className={`admin-status ${isAdmin ? "connected" : ""}`}>
              {!HAS_SUPABASE
                ? "Ej konfigurerat"
                : setup.status === "needs-migration" || state.needsMigration
                  ? "Migration återstår"
                  : isAdmin
                    ? "Anslutet"
                    : "Utloggad"}
            </span>
          </div>

          <h1 id="thesis-admin-title">Från person till person</h1>
          <p>
            Hantera sidtexter, regionetiketter, webbfärger, källnoter och
            validerad JSON-import för{" "}
            <Link href="/sprakliv/person-och-numerus">
              /sprakliv/person-och-numerus ↗
            </Link>
            . Alla ändringar sparas först i det privata utkastet{" "}
            <code>svenska_thesis_drafts</code> innan du publicerar till{" "}
            <code>svenska_thesis_editions</code>.
          </p>

          {!HAS_SUPABASE ? (
            <div className="admin-message">
              <p>
                Supabase är inte konfigurerat i den här miljön. Den publika
                sidan{" "}
                <Link href="/sprakliv/person-och-numerus">
                  /sprakliv/person-och-numerus
                </Link>{" "}
                visar den källkritiskt verifierade basutgåvan från{" "}
                <code>lib/thesis/pilot-data.ts</code>.
              </p>
            </div>
          ) : isAdmin ? (
            <div className="admin-message">
              <p>
                Inloggad som <strong>{username}</strong>.
              </p>
              <ThesisAdminEditor
                slug={THESIS_PILOT_SLUG}
                initialConfig={state.config}
                initialRevision={state.revision}
                initiallyPublished={state.published}
                initialHasDraftChanges={state.hasDraftChanges}
                needsMigration={state.needsMigration}
              />
            </div>
          ) : (
            <LoginForm />
          )}

          <div className="admin-actions">
            <Link href="/admin">← Tillbaka till huvudadministrationen</Link>
            <Link href="/sprakliv/person-och-numerus">
              Till publika avhandlingssidan →
            </Link>
          </div>
        </section>
      </div>
    </StudyFrame>
  );
}
