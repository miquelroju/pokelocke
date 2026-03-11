"use client";

import { useState } from "react";
import {
  updatePokemonStatus,
  updatePokemon,
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
};

type Props = {
  pokemon: Pokemon;
  isOwner: boolean;
  isDead?: boolean;
};

export default function PokemonCard({ pokemon, isOwner, isDead }: Props) {
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDead, setConfirmDead] = useState(false);

  return (
    <>
      <div
        className={`bg-gray-900 border rounded-xl p-4 flex items-center gap-4 relative group ${
          isDead ? "border-red-900/50 opacity-60" : "border-gray-800"
        }`}
      >
        {pokemon.sprite_url && (
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
              onClick={() => setConfirmDead(true)}
              className="text-xs bg-red-900 hover:bg-red-700 text-white px-2 py-1 rounded-lg transition"
            >
              💀 Muerto
            </button>
          </div>
        )}
      </div>

      {/* Modal editar */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-4 mb-6">
              {pokemon.sprite_url && (
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

            <form
              action={async (formData) => {
                await updatePokemon(formData);
                setShowEdit(false);
              }}
              className="flex flex-col gap-4"
            >
              <input type="hidden" name="pokemon_id" value={pokemon.id} />
              <input type="hidden" name="game_id" value={pokemon.game_id} />

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-sm">Apodo</label>
                <input
                  name="nickname"
                  defaultValue={pokemon.nickname}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 text-sm">Nivel</label>
                  <input
                    name="level"
                    type="number"
                    min="1"
                    max="100"
                    defaultValue={pokemon.level}
                    className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 text-sm">Habilidad</label>
                  <input
                    name="ability"
                    defaultValue={pokemon.ability}
                    className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-sm">Naturaleza</label>
                <select
                  name="nature"
                  defaultValue={pokemon.nature}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {NATURES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-sm">Objeto equipado</label>
                <input
                  name="held_item"
                  defaultValue={pokemon.held_item}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                      className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                    />
                  ))}
                </div>
              </div>

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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Guardar
                </button>
              </div>
            </form>
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
