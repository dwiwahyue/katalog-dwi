"use server";

import { redirect } from "next/navigation";
import { createSupabaseSessionClient } from "@/lib/supabase/session";

export async function loginAction(arg1, arg2) {
  const formData = arg2 instanceof FormData ? arg2 : arg1 instanceof FormData ? arg1 : null;

  if (!formData) {
    return { error: "Data formulir tidak valid." };
  }

  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let signInError = null;

  try {
    const supabase = await createSupabaseSessionClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      signInError = error;
    }
  } catch (error) {
    console.error("Kesalahan autentikasi Supabase:", error);
    return { error: "Terjadi kesalahan saat masuk. Silakan coba lagi." };
  }

  if (signInError) {
    return { error: "Email atau password salah. Silakan periksa kembali." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  try {
    const supabase = await createSupabaseSessionClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Gagal keluar dari sesi:", error);
  }

  redirect("/admin/login");
}

export const masukAction = loginAction;
export const keluarAction = logoutAction;

