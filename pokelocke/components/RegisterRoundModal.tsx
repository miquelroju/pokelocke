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
  { value: "antes_gym4", label: "Fase 1 - Antes del 4º gimnasio" },
  { value: "antes_liga", label: "Fase 2 - Antes de la Liga" },
  { value: "final", label: "Fase 3 - Final del juego" },
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

  async function handleSearch() {
    const res = await fetch(`/api/players/search?q=${query}`);
    const data = await res.json();
    setResults(data);
  }

  function handleSelect(p: Player) {
    setSelected(p);
    setResults([]);
    onSelect(p);
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-400">{label}</span>
      {selected ? (
        <div className="flex items-center gap-2 bg-gray-700 rounded px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
            {selected.username[0].toUpperCase()}
          </div>
          <span className="text-sm text-white">{selected.username}</span>
          <button
            onClick={() => setSelected(null)}
            className="ml-auto text-gray-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Buscar jugador..."
            className="bg-gray-700 text-white text-sm rounded px-3 py-2 flex-1 outline-none border border-gray-600 focus:border-purple-500"
          />
          <button
            onClick={handleSearch}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 rounded"
          >
            Buscar
          </button>
        </div>
      )}
      {results.length > 0 && (
        <div className="bg-gray-800 border border-gray-600 rounded mt-1">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                {p.username[0].toUpperCase()}
              </div>
              {p.username}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RegisterRoundModal({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState("");
  const [battles, setBattles] = useState<Battle[]>([
    {
      player1: null,
      player2: null,
      player1_pokemon_alive: 0,
      player2_pokemon_alive: 0,
      winner_id: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addBattle() {
    setBattles([
      ...battles,
      {
        player1: null,
        player2: null,
        player1_pokemon_alive: 0,
        player2_pokemon_alive: 0,
        winner_id: "",
      },
    ]);
  }

  function updateBattle(
    index: number,
    field: string,
    value: string | number | Player | null,
  ) {
    const updated = [...battles];
    updated[index] = { ...updated[index], [field]: value };
    if (
      field === "player1_pokemon_alive" ||
      field === "player2_pokemon_alive"
    ) {
      const p1 =
        field === "player1_pokemon_alive"
          ? (value as number)
          : updated[index].player1_pokemon_alive;
      const p2 =
        field === "player2_pokemon_alive"
          ? (value as number)
          : updated[index].player2_pokemon_alive;

      if (p1 > p2 && updated[index].player1?.id)
        updated[index].winner_id = updated[index].player1!.id;
      else if (p2 > p1 && updated[index].player2?.id)
        updated[index].winner_id = updated[index].player2!.id;
    }
    setBattles(updated);
  }

  async function handleSubmit() {
    if (!phase) return setError("Selecciona una fase");
    if (battles.some((b) => !b.player1 || !b.player2))
      return setError("Todos los combates deben tener 2 jugadores");
    if (battles.some((b) => !b.winner_id))
      return setError("Todos los combates deben tener un ganador");

    setLoading(true);
    const result = await registerRound(
      phase,
      battles.map((b) => ({
        player1_id: b.player1!.id,
        player2_id: b.player2!.id,
        player1_pokemon_alive: b.player1_pokemon_alive,
        player2_pokemon_alive: b.player2_pokemon_alive,
        winner_id: b.winner_id,
      })),
      userId,
    );

    setLoading(false);
    if (result?.error) return setError(result.error);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">⚔️ Registrar Jornada</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Selector de fase */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400">
            ¿En qué fase del juego estáis?
          </label>
          <div className="grid grid-cols-1 gap-2">
            {PHASES.map((p) => (
              <button
                key={p.value}
                onClick={() => setPhase(p.value)}
                className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                  phase === p.value
                    ? "border-purple-500 bg-purple-500/20 text-white"
                    : "border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Combates */}
        <div className="flex flex-col gap-4">
          <span className="text-sm text-gray-400 font-medium">Combates</span>
          {battles.map((battle, i) => (
            <div
              key={i}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col gap-3"
            >
              <span className="text-xs text-gray-500 font-semibold uppercase">
                Combate {i + 1}
              </span>
              <div className="grid grid-cols-2 gap-3">
                <PlayerSearch
                  label="Jugador 1"
                  onSelect={(p) => updateBattle(i, "player1", p)}
                />
                <PlayerSearch
                  label="Jugador 2"
                  onSelect={(p) => updateBattle(i, "player2", p)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400">
                    Pokémon vivos J1
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={6}
                    value={battle.player1_pokemon_alive}
                    onChange={(e) =>
                      updateBattle(
                        i,
                        "player1_pokemon_alive",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="bg-gray-700 text-white rounded px-3 py-2 text-sm outline-none border border-gray-600 focus:border-purple-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400">
                    Pokémon vivos J2
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={6}
                    value={battle.player2_pokemon_alive}
                    onChange={(e) =>
                      updateBattle(
                        i,
                        "player2_pokemon_alive",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="bg-gray-700 text-white rounded px-3 py-2 text-sm outline-none border border-gray-600 focus:border-purple-500"
                  />
                </div>
              </div>
              {battle.player1_pokemon_alive === battle.player2_pokemon_alive &&
                battle.player1 &&
                battle.player2 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400">
                      Empate - ¿Quién gana?
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          updateBattle(i, "winner_id", battle.player1!.id)
                        }
                        className={`flex-1 py-2 rounded text-sm transition-colors ${battle.winner_id === battle.player1!.id ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                      >
                        {battle.player1.username}
                      </button>
                      <button
                        onClick={() =>
                          updateBattle(i, "winner_id", battle.player2!.id)
                        }
                        className={`flex-1 py-2 rounded text-sm transition-colors ${battle.winner_id === battle.player2!.id ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                      >
                        {battle.player2.username}
                      </button>
                    </div>
                  </div>
                )}
              {battle.winner_id && (
                <div className="text-xs text-green-400">
                  ✅ Ganador:{" "}
                  {battle.winner_id === battle.player1?.id
                    ? battle.player1?.username
                    : battle.player2?.username}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addBattle}
          className="w-full py-3 border border-dashed border-green-600 text-green-400 rounded-lg text-sm hover:bg-green-600/10 transition-colors"
        >
          + Añadir combate
        </button>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
        >
          {loading
            ? "Calculando..."
            : "⚔️ Calcular resultados y repartir tickets"}
        </button>
      </div>
    </div>
  );
}
