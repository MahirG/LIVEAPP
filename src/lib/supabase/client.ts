"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

let browserClient: SupabaseClient<Database> | null | undefined;

export function createClient() {
  if (browserClient !== undefined) return browserClient;

  const config = getSupabasePublicConfig();
  browserClient = config
    ? createBrowserClient<Database>(config.url, config.publishableKey)
    : null;

  return browserClient;
}
