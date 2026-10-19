"use client";

import Link from "next/link";
import { useAdmin } from "./AdminContext";

export default function AdminBar({ username }: { username: string | null }) {
  const { isAdmin, editing, setEditing, status, errorMessage } = useAdmin();
  if (!isAdmin) return null;

  const statusLabel =
    status === "saving" ? "Sparar …" :
    status === "saved" ? "Sparat" :
    status === "error" ? errorMessage ?? "Fel vid sparning" :
    "Artiklar sparas som utkast";

  return (
    <aside className="admin-bar" aria-label="Administrationsverktyg">
      <div>
        <span className="admin-bar-user">{username ?? "administratör"}</span>
        <span className={`admin-save-status status-${status}`}>{statusLabel}</span>
      </div>
      <div>
        <Link href="/admin">Administration</Link>
        <button
          type="button"
          aria-pressed={editing}
          onClick={() => setEditing(!editing)}
        >
          {editing ? "Avsluta redigering" : "Redigera sidan"}
        </button>
      </div>
    </aside>
  );
}
