"use client";

import { useState } from "react";
import { registerRound } from "@/app/dashboard/rounds/actions";

interface Player {
  id: string;
  username: string;
}

interface Battle {
  player1: Player | null;
  player2: Player | null;
  player1_pokemon_alive: number;
  player2_pokemon_alive: number;
  winner_id: string;
}

const PHASES = [
  { value: "ANTES_4_GYM", label: "Fase 1 - Antes del 4º gimnasio" },
  { value: "ANTES_LIGA", label: "Fase 2 - Antes de la Liga" },
  { value: "FINAL_JUEGO", label: "Fase 3 - Final del juego" },
];

function PlayerSearch({
  onSelect,
  label,
}: {
  onSelect: (p: Player) => void;
  label: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Player | null>(null);
}
