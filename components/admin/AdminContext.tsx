"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

type AdminContextValue = {
  isAdmin: boolean;
  editing: boolean;
  setEditing: (value: boolean) => void;
  status: SaveStatus;
  setStatus: (value: SaveStatus) => void;
  errorMessage: string | null;
  setErrorMessage: (value: string | null) => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export default function AdminProvider({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const value = useMemo(
    () => ({
      isAdmin,
      editing: isAdmin && editing,
      setEditing,
      status,
      setStatus,
      errorMessage,
      setErrorMessage,
    }),
    [isAdmin, editing, status, errorMessage],
  );
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used inside AdminProvider");
  return context;
}
