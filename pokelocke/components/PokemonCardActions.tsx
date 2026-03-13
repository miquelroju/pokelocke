"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  deletePokemon,
  updatePokemon,
  evolvePokemon,
} from "@/app/dashboard/game/[id]/actions";

interface Pokemon {
  id: string;
  species_name: string;
  nickname: string | null;
  level: number;
  sprite_url: string;
  type1: string;
  type2: string | null;
  ability: string;
  nature: string;
  held_item: string | null;
  move1: string | null;
  move2: string | null;
  move3: string | null;
  move4: string | null;
  is_shiny: boolean;
  status: string | null;
  route_caught: string | null;
}

interface EvolutionOption {
  species_name: string;
  sprite_url: string;
  type1: string;
  type2: string | null;
  ability: string;
}

interface EvolutionNode {
  species: { name: string };
  evolves_to: EvolutionNode[];
}

export default function PokemonCardActions({ pokemon }: { pokemon: Pokemon }) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showEvolve, setShowEvolve] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evolutions, setEvolutions] = useState<EvolutionOption[]>([]);
  const [loadingEvolutions, setLoadingEvolutions] = useState(false);

  // Cargar evoluciones desde PokeAPI
  async function loadEvolutions() {
    setLoadingEvolutions(true);
    try {
      const speciesRes = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${pokemon.species_name.toLowerCase()}`,
      );
      const speciesData = await speciesRes.json();
      const chainRes = await fetch(speciesData.evolution_chain.url);
      const chainData = await chainRes.json();

      // Recorrer la cadena de evolución para encontrar las evoluciones del pokemon actual
      const options: EvolutionOption[] = [];

      function findEvolutions(node: EvolutionNode, found: boolean) {
        if (found) {
          // Este nodo es una evolución directa
          const evoName = node.species.name;
          options.push({
            species_name: evoName,
            sprite_url: "",
            type1: "",
            type2: null,
            ability: "",
          });
        }
        const isCurrentPokemon =
          node.species.name === pokemon.species_name.toLowerCase();
        for (const next of node.evolves_to) {
          findEvolutions(next, isCurrentPokemon || (found && false));
        }
      }

      findEvolutions(chainData.chain, false);

      // Para cada evolución, obtener sus datos reales
      const enriched = await Promise.all(
        options.map(async (evo) => {
          const pokeRes = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${evo.species_name}`,
          );
          const pokeData = await pokeRes.json();
          return {
            species_name:
              evo.species_name.charAt(0).toUpperCase() +
              evo.species_name.slice(1),
            sprite_url: pokeData.sprites.front_default,
            type1: pokeData.types[0].type.name,
            type2: pokeData.types[1]?.type.name ?? null,
            ability: pokeData.abilities[0].ability.name,
          };
        }),
      );

      setEvolutions(enriched);
    } catch {
      setError("No se pudieron cargar las evoluciones");
    }
    setLoadingEvolutions(false);
  }

  async function handleDelete() {
    setLoading(true);
    const result = await deletePokemon(pokemon.id);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setShowDelete(false);
    router.refresh();
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const updates = {
      nickname: (fd.get("nickname") as string) || null,
      level: parseInt(fd.get("level") as string),
      ability: fd.get("ability") as string,
      nature: fd.get("nature") as string,
      held_item: (fd.get("held_item") as string) || null,
      move1: (fd.get("move1") as string) || null,
      move2: (fd.get("move2") as string) || null,
      move3: (fd.get("move3") as string) || null,
      move4: (fd.get("move4") as string) || null,
      status: (fd.get("status") as string) || null,
      route_caught: (fd.get("route_caught") as string) || null,
      is_shiny: fd.get("is_shiny") === "on",
    };
    const result = await updatePokemon(pokemon.id, updates);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setShowEdit(false);
    router.refresh();
  }

  async function handleEvolve(evo: EvolutionOption) {
    setLoading(true);
    const result = await evolvePokemon(pokemon.id, evo);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setShowEvolve(false);
    router.refresh();
  }

  const inputClass =
    "bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 w-full";
  const labelClass = "text-xs text-gray-400";

  return (
    <>
      {/* Botones de acción */}
      <div className="flex gap-1 mt-2 justify-end">
        <button
          onClick={() => {
            setShowEvolve(true);
            loadEvolutions();
          }}
          className="text-xs px-2 py-1 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 transition"
          title="Evolucionar"
        >
          ⬆️ Evolucionar
        </button>
        <button
          onClick={() => setShowEdit(true)}
          className="text-xs px-2 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 transition"
          title="Editar"
        >
          ✏️ Editar
        </button>
        <button
          onClick={() => setShowDelete(true)}
          className="text-xs px-2 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 transition"
          title="Eliminar"
        >
          🗑️ Eliminar
        </button>
      </div>

      {/* Modal Eliminar */}
      {showDelete && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDelete(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white font-bold text-lg">
              🗑️ Eliminar Pokémon
            </h2>
            <p className="text-gray-400 text-sm">
              ¿Seguro que quieres eliminar a{" "}
              <span className="text-white font-semibold">
                {pokemon.nickname || pokemon.species_name}
              </span>
              ? Esta acción no se puede deshacer.
            </p>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition"
              >
                {loading ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEdit && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowEdit(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full flex flex-col gap-4 my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white font-bold text-lg">
              ✏️ Editar {pokemon.nickname || pokemon.species_name}
            </h2>

            <form onSubmit={handleEdit} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Apodo</label>
                  <input
                    name="nickname"
                    defaultValue={pokemon.nickname ?? ""}
                    placeholder={pokemon.species_name}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Nivel</label>
                  <input
                    name="level"
                    type="number"
                    min={1}
                    max={100}
                    defaultValue={pokemon.level}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Habilidad</label>
                  <input
                    name="ability"
                    defaultValue={pokemon.ability}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Naturaleza</label>
                  <input
                    name="nature"
                    defaultValue={pokemon.nature}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Objeto</label>
                  <input
                    name="held_item"
                    defaultValue={pokemon.held_item ?? ""}
                    placeholder="Ninguno"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Ruta de captura</label>
                  <input
                    name="route_caught"
                    defaultValue={pokemon.route_caught ?? ""}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex flex-col gap-1">
                    <label className={labelClass}>Movimiento {n}</label>
                    <input
                      name={`move${n}`}
                      defaultValue={
                        (pokemon[`move${n}` as keyof Pokemon] as string) ?? ""
                      }
                      placeholder="—"
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1">
                <label className={labelClass}>Estado</label>
                <select
                  name="status"
                  defaultValue={pokemon.status ?? ""}
                  className={inputClass}
                >
                  <option value="">— Ninguno —</option>
                  <option value="burned">Quemado</option>
                  <option value="frozen">Congelado</option>
                  <option value="paralyzed">Paralizado</option>
                  <option value="poisoned">Envenenado</option>
                  <option value="asleep">Dormido</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_shiny"
                  defaultChecked={pokemon.is_shiny}
                  className="w-4 h-4 accent-purple-500"
                />
                ✨ Shiny
              </label>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Evolucionar */}
      {showEvolve && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEvolve(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white font-bold text-lg">
              ⬆️ Evolucionar {pokemon.nickname || pokemon.species_name}
            </h2>

            {loadingEvolutions && (
              <p className="text-gray-400 text-sm text-center py-4">
                Cargando evoluciones...
              </p>
            )}

            {!loadingEvolutions && evolutions.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                Este Pokémon no tiene más evoluciones.
              </p>
            )}

            {!loadingEvolutions && evolutions.length > 0 && (
              <div className="flex flex-col gap-3">
                {evolutions.map((evo) => (
                  <button
                    key={evo.species_name}
                    onClick={() => handleEvolve(evo)}
                    disabled={loading}
                    className="flex items-center gap-4 p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-yellow-500 rounded-xl transition"
                  >
                    <img
                      src={evo.sprite_url}
                      alt={evo.species_name}
                      className="w-16 h-16"
                    />
                    <div className="text-left">
                      <p className="text-white font-semibold">
                        {evo.species_name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {evo.type1}
                        {evo.type2 ? ` / ${evo.type2}` : ""}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Habilidad: {evo.ability}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={() => setShowEvolve(false)}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
