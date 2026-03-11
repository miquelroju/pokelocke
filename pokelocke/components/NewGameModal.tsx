"use client";

import { useState } from "react";
import { POKEMON_GAMES } from "@/lib/games";
import { addGame } from "@/app/dashboard/actions";

export default function NewGameModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition"
      >
        + Nuevo Juego
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-6 text-white">Nuevo juego</h3>
            <form
              action={async (formData) => {
                await addGame(formData);
                setOpen(false);
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-sm">Juego</label>
                <select
                  name="game_name"
                  required
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona un juego...</option>
                  {POKEMON_GAMES.map((g) => (
                    <option key={g.name} value={g.name}>
                      {g.name} (Gen {g.generation})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
