"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updatePokemonStatus,
  updatePokemonForm,
  updatePokemon,
  deletePokemon,
  evolvePokemon,
} from "@/app/dashboard/game/[id]/actions";

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

type Pokemon = {
  id: string;
  game_id: string;
  species_name: string;
  nickname: string;
  level: number;
  ability: string;
  nature: string;
  held_item: string;
  move1: string;
  move2: string;
  move3: string;
  move4: string;
  is_shiny: boolean;
  status: string;
  sprite_url: string;
  type1: string;
  type2: string;
  route_caught: string | null;
};

type Props = {
  pokemon: Pokemon;
  isOwner: boolean;
  isDead?: boolean;
};

export default function PokemonCard({ pokemon, isOwner, isDead }: Props) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showEvolve, setShowEvolve] = useState(false);
  const [confirmDead, setConfirmDead] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evolutions, setEvolutions] = useState<EvolutionOption[]>([]);
  const [loadingEvolutions, setLoadingEvolutions] = useState(false);

  async function loadEvolutions() {
    setLoadingEvolutions(true);
    setEvolutions([]);
    setError(null);
    try {
      const speciesRes = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${pokemon.species_name.toLowerCase()}`,
      );
      const speciesData = await speciesRes.json();
      const chainRes = await fetch(speciesData.evolution_chain.url);
      const chainData = await chainRes.json();

      const options: EvolutionOption[] = [];

      function findEvolutions(node: EvolutionNode, found: boolean) {
        if (found) {
          options.push({
            species_name: node.species.name,
            sprite_url: "",
            type1: "",
            type2: null,
            ability: "",
          });
        }
        const isCurrent =
          node.species.name === pokemon.species_name.toLowerCase();
        for (const next of node.evolves_to) {
          findEvolutions(next, isCurrent || found);
        }
      }

      findEvolutions(chainData.chain, false);

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
    "bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full";

  return (
    <>
      <div
        className={`bg-gray-900 border rounded-xl p-4 flex items-center gap-4 relative group ${
          isDead ? "border-red-900/50 opacity-60" : "border-gray-800"
        }`}
      >
        {pokemon.sprite_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pokemon.sprite_url}
            alt={pokemon.species_name}
            className={`w-16 h-16 ${isDead ? "grayscale" : ""}`}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`font-bold ${isDead ? "line-through" : ""}`}>
              {pokemon.nickname}
            </p>
            {pokemon.is_shiny && <span title="Shiny">✨</span>}
          </div>
          <p className="text-gray-400 text-sm capitalize">
            {pokemon.species_name}
          </p>
          <p className="text-gray-500 text-xs">
            Nv. {pokemon.level} · {pokemon.nature}
          </p>
          {pokemon.ability && (
            <p className="text-gray-500 text-xs">Hab: {pokemon.ability}</p>
          )}
          {pokemon.held_item && (
            <p className="text-gray-500 text-xs">Obj: {pokemon.held_item}</p>
          )}
          <div className="flex gap-1 mt-1 flex-wrap">
            {[pokemon.move1, pokemon.move2, pokemon.move3, pokemon.move4]
              .filter(Boolean)
              .map((move, i) => (
                <span
                  key={i}
                  className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full"
                >
                  {move}
                </span>
              ))}
          </div>
        </div>

        {/* Acciones (solo dueño y no muerto) */}
        {isOwner && !isDead && (
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={() => setShowEdit(true)}
              className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-2 py-1 rounded-lg transition"
            >
              ✏️ Editar
            </button>
            <button
              onClick={() => {
                setShowEvolve(true);
                loadEvolutions();
              }}
              className="text-xs bg-yellow-700 hover:bg-yellow-600 text-white px-2 py-1 rounded-lg transition"
            >
              ⬆️ Evolucionar
            </button>
            {pokemon.status === "team" && (
              <button
                onClick={() =>
                  updatePokemonStatus(
                    pokemon.id,
                    "pc",
                    pokemon.game_id,
                    pokemon.species_name,
                  )
                }
                className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-lg transition"
              >
                💾 Al PC
              </button>
            )}
            {pokemon.status === "pc" && (
              <button
                onClick={() =>
                  updatePokemonStatus(
                    pokemon.id,
                    "team",
                    pokemon.game_id,
                    pokemon.species_name,
                  )
                }
                className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-lg transition"
              >
                ⚔️ Al equipo
              </button>
            )}
            <button
              onClick={() => setShowDelete(true)}
              className="text-xs bg-orange-900 hover:bg-orange-700 text-white px-2 py-1 rounded-lg transition"
            >
              🗑️ Eliminar
            </button>
            <button
              onClick={() => setConfirmDead(true)}
              className="text-xs bg-red-900 hover:bg-red-700 text-white px-2 py-1 rounded-lg transition"
            >
              💀 Muerto
            </button>
          </div>
        )}
      </div>

      {/* Modal Editar */}
      {showEdit && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEdit(false)}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              {pokemon.sprite_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pokemon.sprite_url}
                  alt={pokemon.species_name}
                  className="w-16 h-16"
                />
              )}
              <div>
                <h3 className="text-xl font-bold text-white">
                  {pokemon.nickname}
                </h3>
                <p className="text-gray-400 capitalize">
                  {pokemon.species_name}
                </p>
              </div>
            </div>

            <form onSubmit={handleEdit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 text-sm">Apodo</label>
                  <input
                    name="nickname"
                    defaultValue={pokemon.nickname}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 text-sm">Nivel</label>
                  <input
                    name="level"
                    type="number"
                    min="1"
                    max="100"
                    defaultValue={pokemon.level}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 text-sm">Habilidad</label>
                  <input
                    name="ability"
                    defaultValue={pokemon.ability}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 text-sm">Naturaleza</label>
                  <select
                    name="nature"
                    defaultValue={pokemon.nature}
                    className={inputClass}
                  >
                    {NATURES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 text-sm">
                    Objeto equipado
                  </label>
                  <input
                    name="held_item"
                    defaultValue={pokemon.held_item}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 text-sm">
                    Ruta de captura
                  </label>
                  <input
                    name="route_caught"
                    defaultValue={pokemon.route_caught ?? ""}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-sm">Movimientos</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "move1", value: pokemon.move1 },
                    { name: "move2", value: pokemon.move2 },
                    { name: "move3", value: pokemon.move3 },
                    { name: "move4", value: pokemon.move4 },
                  ].map((move, i) => (
                    <input
                      key={i}
                      name={move.name}
                      defaultValue={move.value}
                      placeholder={`Movimiento ${i + 1}`}
                      className={inputClass}
                    />
                  ))}
                </div>
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

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={evo.sprite_url}
                      alt={evo.species_name}
                      className="w-16 h-16"
                    />
                    <div className="text-left">
                      <p className="text-white font-semibold">
                        {evo.species_name}
                      </p>
                      <p className="text-gray-400 text-xs capitalize">
                        {evo.type1}
                        {evo.type2 ? ` / ${evo.type2}` : ""}
                      </p>
                      <p className="text-gray-400 text-xs capitalize">
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

      {/* Modal confirmar muerte */}
      {confirmDead && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-red-900 rounded-xl p-8 w-full max-w-sm text-center">
            <p className="text-5xl mb-4">💀</p>
            <h3 className="text-xl font-bold text-white mb-2">
              ¿{pokemon.nickname} ha muerto?
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              Esta acción es permanente.{" "}
              <span className="capitalize">{pokemon.species_name}</span> quedará
              baneado y no podrá usarse en ningún juego.
            </p>
            <p className="text-red-400 text-xs mb-6">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDead(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await updatePokemonStatus(
                    pokemon.id,
                    "dead",
                    pokemon.game_id,
                    pokemon.species_name,
                  );
                  setConfirmDead(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                Confirmar muerte
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
