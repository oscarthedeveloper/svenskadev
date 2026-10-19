import "server-only";

import { cache } from "react";
import { HAS_SUPABASE } from "./supabase/config";
import { createSupabaseServerClient } from "./supabase/server";

export type AdminSession = {
  isAdmin: boolean;
  username: string | null;
};

export const getAdminSession = cache(async (): Promise<AdminSession> => {
  if (!HAS_SUPABASE) return { isAdmin: false, username: null };

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { isAdmin: false, username: null };

    const { data } = await supabase
      .from("svenska_admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    return {
      isAdmin: Boolean(data),
      username: user.email?.split("@")[0] ?? null,
    };
  } catch {
    return { isAdmin: false, username: null };
  }
});
