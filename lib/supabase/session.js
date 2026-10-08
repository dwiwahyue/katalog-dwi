import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getRequiredEnvironmentVariable(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Environment variable ${name} belum diatur.`);
  }

  return value;
}

export async function createSupabaseSessionClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getRequiredEnvironmentVariable("SUPABASE_URL"),
    getRequiredEnvironmentVariable("SUPABASE_PUBLISHABLE_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Dipanggil dari Server Component, abaikan jika tidak bisa mengubah cookie.
          }
        },
      },
    },
  );
}

export default createSupabaseSessionClient;

