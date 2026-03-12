"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  let email = formData.get("emailOrUsername") as string;
  const password = formData.get("password") as string;

  if (!email.includes("@")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("username", email)
      .single();

    if (!profile?.email) redirect("/login?error=Usuario no encontrado");
    email = profile.email;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) redirect("/login?error=Credenciales incorrectas");

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    redirect("/register?error=Las contraseñas no coinciden");
  }

  if (username.length < 3) {
    redirect(
      "/register?error=El nombre de usuario debe tener al menos 3 caracteres",
    );
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (existing)
    redirect("/register?error=Ese nombre de usuario ya está en uso");

  const { data: testData, error: testError } = await supabase.auth.getSession();
  console.log(
    "Supabase connection test:",
    testError ? testError.message : "OK",
  );

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  console.log("SignUp data:", JSON.stringify(data));
  console.log("SignUp error:", JSON.stringify(error));

  if (error) redirect(`/register?error=${error.message}`);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
