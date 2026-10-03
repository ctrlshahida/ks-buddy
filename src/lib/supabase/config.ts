/** False until NEXT_PUBLIC_SUPABASE_URL and ..._PUBLISHABLE_KEY are set; the app then runs in local preview mode. */
export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
)
