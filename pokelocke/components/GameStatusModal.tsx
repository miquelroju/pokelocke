"use client";

import { useState } from "react";
import { updateGameStatus } from "@/app/dashboard/game/[id]/actions";

interface Props {
  gameId: string;
}

export default function GameStatusButtons({ gameId }: Props) {
  const [confirm, setConfirm] = useState<"completed" | "failed" | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!confirm) return;
    setLoading(true);
    await updateGameStatus(gameId, confirm);
    setLoading(false);
    setConfirm(null);
  }

  return (
    <>
      <button
        onClick={() => setConfirm("completed")}
        className="px-4 py-3 bg-blue-900 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition"
      >
        ✅ Marcar completado
      </button>
      <button
        onClick={() => setConfirm("failed")}
        className="px-4 py-3 bg-red-900 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition"
      >
        💀 Marcar como fallido
      </button>

      {/* Modal confirmación */}
      {confirm && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setConfirm(null)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white font-bold text-lg">
              {confirm === "completed"
                ? "✅ Marcar como completado"
                : "💀 Marcar como fallido"}
            </h2>
            <p className="text-gray-400 text-sm">
              {confirm === "completed"
                ? "¿Estás seguro? El juego quedará como completado y no podrás editar nada más."
                : "¿Estás seguro? El juego quedará como fallido y no podrás editar nada más."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`flex-1 py-2 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 ${
                  confirm === "completed"
                    ? "bg-blue-600 hover:bg-blue-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {loading ? "Guardando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
