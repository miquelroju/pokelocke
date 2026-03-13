"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const username = formData.get("username") as string | null;
  const password = formData.get("password") as string | null;
  const confirmPassword = formData.get("confirmPassword") as string | null;
  const avatarFile = formData.get("avatar") as File | null;

  // Validar contraseña
  if (password) {
    if (password !== confirmPassword) {
      return { error: "Las contraseñas no coinciden" };
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };
  }

  // Subir avatar si hay archivo
  let avatar_url: string | null = null;
  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop();
    const path = `${user.id}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true });

    if (uploadError) return { error: uploadError.message };

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);
    avatar_url = urlData.publicUrl;
  }

  // Actualizar tabla profiles
  const updates: Record<string, string> = {};
  if (username) updates.username = username;
  if (avatar_url) updates.avatar_url = avatar_url;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    if (error) return { error: error.message };
  }

  revalidatePath(`/trainer/${username ?? ""}`);
  return { success: true, newUsername: username };
}
