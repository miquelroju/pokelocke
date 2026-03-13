"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function addPokemon(formData: FormData) {
  const supabase = await createClient();

  const game_id = formData.get("game_id") as string;

  await supabase.from("pokemon").insert({
    game_id,
    species_name: formData.get("species_name") as string,
    nickname: formData.get("nickname") as string,
    level: parseInt(formData.get("level") as string) || null,
    ability: formData.get("ability") as string,
    nature: formData.get("nature") as string,
    held_item: (formData.get("held_item") as string) || null,
    move1: (formData.get("move1") as string) || null,
    move2: (formData.get("move2") as string) || null,
    move3: (formData.get("move3") as string) || null,
    move4: (formData.get("move4") as string) || null,
    is_shiny: formData.get("is_shiny") === "on",
    status: formData.get("status") as string,
    route_caught: (formData.get("route_caught") as string) || null,
    sprite_url: (formData.get("sprite_url") as string) || null,
    type1: (formData.get("type1") as string) || null,
    type2: (formData.get("type2") as string) || null,
  });

  revalidatePath(`/dashboard/game/${game_id}`);
}

export async function toggleGym(
  gymId: string,
  completed: boolean,
  gameId: string,
) {
  const supabase = await createClient();

  await supabase
    .from("gyms")
    .update({
      completed: !completed,
      completed_at: !completed ? new Date().toISOString() : null,
    })
    .eq("id", gymId);

  revalidatePath(`/dashboard/game/${gameId}`);
}

export async function updatePokemonStatus(
  pokemonId: string,
  newStatus: string,
  gameId: string,
  speciesName: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("pokemon")
    .update({ status: newStatus })
    .eq("id", pokemonId);

  if (newStatus === "dead") {
    await supabase
      .from("banned_species")
      .insert({ species_name: speciesName.toLowerCase(), banned_by: user.id });
  }

  revalidatePath(`/dashboard/game/${gameId}`);
}

export async function updatePokemonForm(formData: FormData) {
  const supabase = await createClient();

  const pokemonId = formData.get("pokemon_id") as string;
  const gameId = formData.get("game_id") as string;

  await supabase
    .from("pokemon")
    .update({
      nickname: formData.get("nickname") as string,
      level: parseInt(formData.get("level") as string) || null,
      ability: formData.get("ability") as string,
      nature: formData.get("nature") as string,
      held_item: (formData.get("held_item") as string) || null,
      move1: (formData.get("move1") as string) || null,
      move2: (formData.get("move2") as string) || null,
      move3: (formData.get("move3") as string) || null,
      move4: (formData.get("move4") as string) || null,
    })
    .eq("id", pokemonId);

  revalidatePath(`/dashboard/game/${gameId}`);
}

export async function updateGameStatus(gameId: string, status: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("games")
    .update({ status })
    .eq("id", gameId)
    .eq("user_id", user.id); // solo el dueño puede cambiar

  revalidatePath(`/dashboard/game/${gameId}`);
  revalidatePath("/dashboard");
}

export async function updateGameLives(gameId: string, delta: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: game } = await supabase
    .from("games")
    .select("lives_remaining")
    .eq("id", gameId)
    .single();

  if (!game) return;

  const newLives = Math.max(0, game.lives_remaining + delta);

  await supabase
    .from("games")
    .update({ lives_remaining: newLives })
    .eq("id", gameId)
    .eq("user_id", user.id);

  revalidatePath(`/dashboard/game/${gameId}`);
  revalidatePath("/dashboard");
}

export async function deleteGame(gameId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("games").delete().eq("id", gameId).eq("user_id", user.id); // Solo el dueño puede borrarlo

  revalidatePath("/dashboard");
}

export async function deletePokemon(pokemonId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("pokemon").delete().eq("id", pokemonId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePokemon(
  pokemonId: string,
  updates: Record<string, string | number | boolean | null>,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pokemon")
    .update(updates)
    .eq("id", pokemonId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function evolvePokemon(
  pokemonId: string,
  evolutionData: {
    species_name: string;
    sprite_url: string;
    type1: string;
    type2: string | null;
    ability: string;
  },
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pokemon")
    .update(evolutionData)
    .eq("id", pokemonId);
  if (error) return { error: error.message };
  return { success: true };
}
