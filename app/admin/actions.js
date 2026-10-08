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

export async function gantiPasswordAction(arg1, arg2) {
  const formData = arg2 instanceof FormData ? arg2 : arg1 instanceof FormData ? arg1 : null;

  if (!formData) {
    return { error: "Data formulir tidak valid." };
  }

  const passwordBaru = formData.get("password_baru")?.toString();
  const konfirmasiPassword = formData.get("konfirmasi_password")?.toString();

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak cocok dengan password baru." };
  }

  try {
    const supabase = await createSupabaseSessionClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Anda belum masuk atau sesi telah berakhir. Silakan masuk kembali." };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (updateError) {
      console.error("Gagal memperbarui password:", updateError);
      return { error: `Gagal mengganti password: ${updateError.message}` };
    }

    return { success: "Password berhasil diperbarui." };
  } catch (error) {
    console.error("Kesalahan saat mengganti password:", error);
    return { error: "Terjadi kesalahan pada server. Silakan coba lagi." };
  }
}

export const masukAction = loginAction;
export const keluarAction = logoutAction;
export const gantiPassword = gantiPasswordAction;
