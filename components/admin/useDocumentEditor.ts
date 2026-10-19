"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { saveDocument, setDocumentPublication } from "@/lib/actions";
import type { StudyDocument } from "@/lib/content";
import { useAdmin } from "./AdminContext";

export function useDocumentEditor(document: StudyDocument, nodeId: string | undefined, initialRevision: number, initiallyPublished: boolean, initialChanges: boolean) {
  const { setStatus, setErrorMessage } = useAdmin();
  const [draft, setDraft] = useState(document);
  const [published, setPublished] = useState(initiallyPublished);
  const [hasChanges, setHasChanges] = useState(initialChanges);
  const [busy, setBusy] = useState(false);
  const current = useRef(document);
  const revision = useRef(initialRevision);
  const pending = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const publicationLock = useRef(false);
  const saving = useRef<Promise<boolean> | null>(null);

  const flush = useCallback((): Promise<boolean> => {
    if (timer.current) clearTimeout(timer.current);
    if (saving.current) return saving.current;
    const work = async () => {
      while (pending.current) {
        if (!nodeId) { setStatus("error"); setErrorMessage("Importera grundinnehållet innan du redigerar."); return false; }
        const snapshot = current.current;
        setStatus("saving");
        try {
          const result = await saveDocument(nodeId, snapshot, revision.current);
          if (!result.ok || result.revision === undefined) { setStatus("error"); setErrorMessage(result.error ?? "Kunde inte spara."); return false; }
          revision.current = result.revision;
          if (snapshot === current.current) pending.current = false;
        } catch { setStatus("error"); setErrorMessage("Anslutningen bröts. Ditt utkast finns kvar i denna flik. Försök spara igen."); return false; }
      }
      setStatus("saved"); setErrorMessage(null);
      return true;
    };
    saving.current = work().finally(() => { saving.current = null; });
    return saving.current;
  }, [nodeId, setStatus, setErrorMessage]);

  const update = useCallback((next: StudyDocument) => {
    if (publicationLock.current) return;
    current.current = next; setDraft(next); pending.current = true; setHasChanges(true); setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { void flush(); }, 800);
  }, [flush, setStatus]);

  const changePublication = useCallback(async (publish: boolean) => {
    if (!nodeId || publicationLock.current) return;
    publicationLock.current = true;
    setBusy(true);
    try {
      if (!await flush()) return;
      const result = await setDocumentPublication(nodeId, revision.current, publish);
      if (!result.ok || result.revision === undefined) { setStatus("error"); setErrorMessage(result.error ?? "Publiceringen misslyckades."); return; }
      revision.current = result.revision;
      setPublished(publish); setHasChanges(!publish); setStatus("saved"); setErrorMessage(null);
    } catch { setStatus("error"); setErrorMessage("Anslutningen bröts. Kontrollera status genom att ladda om sidan."); }
    finally { publicationLock.current = false; setBusy(false); }
  }, [flush, nodeId, setStatus, setErrorMessage]);

  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => { if (pending.current) { event.preventDefault(); event.returnValue = ""; } };
    const navigate = (event: MouseEvent) => {
      if (!pending.current || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element).closest?.("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download") || anchor.origin !== location.origin || anchor.href.includes("#")) return;
      event.preventDefault(); event.stopPropagation();
      void flush().then((ok) => { if (ok) location.assign(anchor.href); });
    };
    window.addEventListener("beforeunload", unload);
    window.document.addEventListener("click", navigate, true);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener("beforeunload", unload);
      window.document.removeEventListener("click", navigate, true);
    };
  }, [flush]);
  return { draft, update, flush, published, hasChanges, busy, changePublication };
}
