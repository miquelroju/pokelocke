"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteGame } from "@/app/dashboard/game/[id]/actions";

export default function DeleteGameButton({ gameId }: { gameId: string }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    await deleteGame(gameId);
    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <>
      <button
        onClick={() => setConfirm(true)}
        className="px-4 py-3 bg-gray-800 hover:bg-red-900/50 border border-gray-700 hover:border-red-700 text-gray-400 hover:text-red-400 text-sm font-medium rounded-xl transition"
      >
        🗑️ Eliminar juego
      </button>

      {confirm && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setConfirm(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text.white font-bold text-lg">🗑️ Eliminar juego</h2>
            <p className="text-gray-400 text-sm">
              ¿Estás seguro? Se eliminarán todos los datos del juego cinluyendo
              Pokémon, gimnasios y progreso. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(false)}
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
    </>
  );
}
