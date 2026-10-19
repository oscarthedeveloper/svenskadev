"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveDocument } from "@/lib/actions";
import type { StudyDocument } from "@/lib/content";
import { useAdmin } from "./AdminContext";

export default function EmptyDocumentEditor({
  nodeId,
  title,
  note,
  backHref,
}: {
  nodeId?: string;
  title: string;
  note?: string;
  backHref: string;
}) {
  const router = useRouter();
  const { editing, setStatus, setErrorMessage } = useAdmin();

  async function createContent() {
    if (!nodeId) return;
    const content: StudyDocument = {
      title,
      subtitle: note ?? "",
      period: "",
      category: "",
      intro: "",
      utkast: true,
      sections: [{ title: "Nytt avsnitt", body: "" }],
      blocks: [{
        id: `block-${Date.now()}`,
        type: "text",
        title: "Nytt avsnitt",
        body: "",
      }],
    };
    setStatus("saving");
    const result = await saveDocument(nodeId, content);
    if (result.ok) {
      setStatus("saved");
      setErrorMessage(null);
      router.refresh();
    } else {
      setStatus("error");
      setErrorMessage(result.error ?? "Okänt fel");
    }
  }

  return (
    <div className="empty-document">
      <p className="eyebrow">Studiesida under arbete</p>
      <h1>{title}</h1>
      <p>{note ? `${note}. ` : ""}{editing ? "Skapa ett första avsnitt och börja skriva direkt." : "Slå på redigeringsläget för att skapa innehållet."}</p>
      {editing && nodeId && <button type="button" onClick={createContent}>Skapa innehåll</button>}
      <Link href={backHref}>← Tillbaka till arkivet</Link>
    </div>
  );
}
