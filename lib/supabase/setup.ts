import "server-only";
import { cache } from "react";
import { HAS_SUPABASE } from "./config";
import { createSupabaseServerClient } from "./server";
import { classifyDatabaseSetup, type DatabaseSetup } from "./setup-state";

export const getDatabaseSetup = cache(async (): Promise<DatabaseSetup> => {
  if (!HAS_SUPABASE) return { status: "unconfigured", initialized: false };
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("svenska_settings").select("initialized").eq("id", true).single();
    return classifyDatabaseSetup(data, error);
  } catch { return { status: "unavailable", initialized: false }; }
});
