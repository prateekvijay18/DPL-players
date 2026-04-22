import { createClient } from "@supabase/supabase-js";

/**
 * Browser-safe Supabase client. Uses the publishable key; respects RLS.
 * Primary use in this app: Storage uploads from the register/edit forms.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishable) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in env",
    );
  }
  return createClient(url, publishable, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
