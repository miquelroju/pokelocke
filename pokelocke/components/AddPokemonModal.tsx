"use client";

import { useState } from "react";
import { addPokemon } from "@/app/dashboard/game/[id]/actions";

const NATURES = [
  "Hardy",
  "Lonely",
  "Brave",
  "Adamant",
  "Naughty",
  "Bold",
  "Docile",
  "Relaxed",
  "Impish",
  "Lax",
  "Timid",
  "Hasty",
  "Serious",
  "Jolly",
  "Naive",
  "Modest",
  "Mild",
  "Quiet",
  "Bashful",
  "Rash",
  "Calm",
  "Gentle",
  "Sassy",
  "Careful",
  "Quirky",
];

type PokeData = {
  sprite: string;
  types: string[];
  abilities: string[];
};

export default function AddPokemonModal({ gameId }: { gameId: string }) {
  const [open, setOpen] = useState(false);
  const [speciesInput, setSpeciesInput] = useState("");
  const [pokeData, setPokeData] = useState<PokeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  async function fetchPokemon(name: string) {
    if (!name || name.length < 3) return;
    setLoading(true);
    setNotFound(false);
    setPokeData(null);
    try {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase().trim()}`,
      );
      if (!res.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setPokeData({
        sprite: data.sprites.front_default,
        types: data.types.map((t: { type: { name: string } }) => t.type.name),
        abilities: data.abilities.map(
          (a: { ability: { name: string } }) => a.ability.name,
        ),
      });
    } catch {
      setNotFound(true);
    }
    setLoading(false);
  }

  function handleClose() {
    setOpen(false);
    setSpeciesInput("");
    setPokeData(null);
    setNotFound(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
      >
        + Añadir Pokémon
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 text-white">
              Añadir Pokémon
            </h3>
            <form
              action={async (formData) => {
                formData.append("game_id", gameId);
                formData.append("sprite_url", pokeData?.sprite ?? "");
                formData.append("type1", pokeData?.types[0] ?? "");
                formData.append("type2", pokeData?.types[1] ?? "");
                await addPokemon(formData);
                handleClose();
              }}
              className="flex flex-col gap-4"
            >
              {/* Especie */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-sm">
                  Especie (nombre en inglés o número)
                </label>
                <div className="flex gap-2">
                  <input
                    name="species_name"
                    type="text"
                    placeholder="ej: bulbasaur, 1"
                    value={speciesInput}
                    onChange={(e) => setSpeciesInput(e.target.value)}
                    required
                    className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => fetchPokemon(speciesInput)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition text-sm"
                  >
                    {loading ? "..." : "Buscar"}
                  </button>
                </div>
                {notFound && (
                  <p className="text-red-400 text-xs">Pokémon no encontrado</p>
                )}
              </div>

              {/* Preview PokéAPI */}
              {pokeData && (
                <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
                  <img
                    src={pokeData.sprite}
                    alt={speciesInput}
                    className="w-20 h-20"
                  />

                  <div>
                    <p className="text-white font-semibold capitalize">
                      {speciesInput}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Tipos: {pokeData.types.join(", ")}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Habilidades disponibles: {pokeData.abilities.join(", ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Apodo */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-sm">Apodo</label>
                <input
                  name="nickname"
                  type="text"
                  placeholder="ej: Onii-chan"
                  required
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                />
              </div>

              {/* Nivel y Ruta */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 text-sm">Nivel</label>
                  <input
                    name="level"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="5"
                    className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 text-sm">
                    Ruta de captura
                  </label>
                  <input
                    name="route_caught"
                    type="text"
                    placeholder="ej: Ruta 1"
                    className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                  />
                </div>
              </div>

              {/* Habilidad */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-sm">Habilidad</label>
                {pokeData ? (
                  <select
                    name="ability"
                    className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {pokeData.abilities.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="ability"
                    type="text"
                    placeholder="Busca la especie primero"
                    disabled
                    className="bg-gray-800 border border-gray-700 text-gray-600 rounded-lg px-4 py-2"
                  />
                )}
              </div>

              {/* Naturaleza */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-sm">Naturaleza</label>
                <select
                  name="nature"
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {NATURES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Objeto */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-sm">Objeto equipado</label>
                <input
                  name="held_item"
                  type="text"
                  placeholder="ej: Leftovers"
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                />
              </div>

              {/* Movimientos */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-sm">Movimientos</label>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <input
                      key={i}
                      name={`move${i}`}
                      type="text"
                      placeholder={`Movimiento ${i}`}
                      className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                    />
                  ))}
                </div>
              </div>

              {/* Shiny */}
              <div className="flex items-center gap-3">
                <input
                  name="is_shiny"
                  type="checkbox"
                  id="is_shiny"
                  className="w-4 h-4 accent-yellow-400"
                />
                <label htmlFor="is_shiny" className="text-gray-300 text-sm">
                  ✨ Es shiny ✨
                </label>
              </div>

              {/* Ubicación en equipo/PC */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-sm">Ubicación</label>
                <select
                  name="status"
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="team">Equipo</option>
                  <option value="pc">PC</option>
                </select>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!pokeData}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Añadir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
