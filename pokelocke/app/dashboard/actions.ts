"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { POKEMON_GAMES } from "@/lib/games";

export async function addGame(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const game_name = formData.get("game_name") as string;
  const game = POKEMON_GAMES.find((g) => g.name === game_name);
  if (!game) return;

  const { data: newGame } = await supabase
    .from("games")
    .insert({
      user_id: user.id,
      game_name: game.name,
      generation: game.generation,
      lives_remaining: 20,
      status: "active",
    })
    .select()
    .single();

  if (newGame) {
    await supabase.from("gyms").insert(
      game.gyms.map((gym) => ({
        game_id: newGame.id,
        gym_number: gym.number,
        gym_name: gym.name,
        completed: false,
      })),
    );
  }

  revalidatePath("/dashboard");
}
