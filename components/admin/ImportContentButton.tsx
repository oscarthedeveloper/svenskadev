"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importSwedishContent } from "@/lib/actions";

export default function ImportContentButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="import-content-control">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(async () => {
          setMessage(null);
          const result = await importSwedishContent();
          setMessage(result.ok ? result.message ?? "Importen är klar." : result.error ?? "Importen misslyckades.");
          if (result.ok) router.refresh();
        })}
      >
        {pending ? "Synkroniserar …" : "Synkronisera grundinnehåll"}
      </button>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
