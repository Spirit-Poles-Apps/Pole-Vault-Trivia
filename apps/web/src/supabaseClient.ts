import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Names of any build settings that were missing when this site was built.
 * main.tsx shows a setup screen instead of a blank page when this is non-empty.
 * Vite bakes these values in at build time, so after fixing them in
 * Cloudflare you must redeploy for the change to show up.
 */
export const missingConfig: string[] = [
  !url && "VITE_SUPABASE_URL",
  !anonKey && "VITE_SUPABASE_ANON_KEY",
].filter(Boolean) as string[];

export const supabase = createClient(
  url || "https://missing-config.invalid",
  anonKey || "missing-anon-key"
);
