export type DatabaseSetup = {
  status: "unconfigured" | "needs-migration" | "ready" | "unavailable";
  initialized: boolean;
};

export function classifyDatabaseSetup(data: { initialized: boolean } | null, error: { code?: string; message?: string } | null): DatabaseSetup {
  if (error?.code === "PGRST205" && error.message?.includes("public.svenska_settings")) {
    return { status: "needs-migration", initialized: false };
  }
  if (error || !data || typeof data.initialized !== "boolean") return { status: "unavailable", initialized: false };
  return { status: "ready", initialized: data.initialized };
}
