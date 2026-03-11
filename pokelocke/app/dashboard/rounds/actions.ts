"use server";

import { createClient } from "@/utils/supabase/server";

interface Battle {
  player1_id: string;
  player2_id: string;
  player1_pokemon_alive: number;
  player2_pokemon_alive: number;
  winner_id: string;
}

export async function registerRound(
  phase: string,
  battles: Battle[],
  created_by: string,
) {
  const supabase = await createClient();

  const { data: round, error: roundError } = await supabase
    .from("rounds")
    .insert({ phase, created_by })
    .select()
    .single();

  if (roundError) return { error: roundError.message };

  const battlesData = battles.map((b) => ({
    round_id: round.id,
    player1_id: b.player1_id,
    player2_id: b.player2_id,
    player1_pokemon_alive: b.player1_pokemon_alive,
    player2_pokemon_alive: b.player2_pokemon_alive,
    winner_id: b.winner_id,
  }));

  const { error: battlesError } = await supabase
    .from("battles")
    .insert(battlesData);
  if (battlesError) return { error: battlesError.message };

  const playerStats: Record<string, { wins: number; pokemonLost: number }> = {};

  battles.forEach((b) => {
    if (!playerStats[b.player1_id])
      playerStats[b.player1_id] = { wins: 0, pokemonLost: 0 };
    if (!playerStats[b.player2_id])
      playerStats[b.player2_id] = { wins: 0, pokemonLost: 0 };

    if (b.winner_id === b.player1_id) {
      playerStats[b.player1_id].wins++;
      playerStats[b.player2_id].pokemonLost += 6 - b.player2_pokemon_alive;
    } else {
      playerStats[b.player2_id].wins++;
      playerStats[b.player1_id].pokemonLost += 6 - b.player1_pokemon_alive;
    }
  });

  const ranking = Object.entries(playerStats)
    .sort(([, a], [, b]) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.pokemonLost - b.pokemonLost;
    })
    .slice(0, 3);

  const ticketsPerPosition = [3, 2, 1];

  for (const [index, [userId]] of ranking.entries()) {
    const ticketsEarned = ticketsPerPosition[index];

    await supabase.from("combat_results").insert({
      user_id: userId,
      poisition: index + 1,
      tickets_earned: ticketsEarned,
      phase,
      round_id: round.id,
    });

    for (let i = 0; i < ticketsEarned; i++) {
      await supabase.from("tickets").insert({
        user_id: userId,
        category: "PENDING",
        effect: "PENDING",
        used: false,
      });
    }
  }

  return { success: true, round_id: round.id, ranking };
}
