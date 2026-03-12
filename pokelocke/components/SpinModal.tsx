"use client";

import { useState } from "react";
import SpinWheel from "./SpinWheel";
import TicketSlot from "./TicketSlot";
import { saveTicket } from "@/app/dashboard/rounds/actions";

const PHASE_LABELS: Record<string, string> = {
  antes_gym4: "Fase 1 - Antes del 4º gimnasio",
  antes_liga: "Fase 2 - Antes de la Liga",
  final: "Fase 3 - Final del juego",
};

type Step = "wheel" | "slot" | "done";

interface SpinModalProps {
  ticketId: string;
  phase: string;
  onClose: () => void;
}

export default function SpinModal({
  ticketId,
  phase,
  onClose,
}: SpinModalProps) {
  const [step, setStep] = useState<Step>("wheel");
  const [category, setCategory] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleWheelResult(cat: string) {
    setCategory(cat);
    // Pequeña pausa dramática antes de mostrar el slot
    setTimeout(() => setStep("slot"), 1200);
  }

  async function hadnleSlotResult(effect: string) {
    setSaving(true);
    await saveTicket(ticketId, category!, effect);
    setSaving(false);
    setStep("done");
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 flex flex-col gap-6 items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">🎰 Tirar ruleta</h2>
          {step === "done" && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 -mt-4">
          {PHASE_LABELS[phase] ?? phase}
        </p>

        {/* Paso 1: Ruleta */}
        {step === "wheel" && (
          <div className="flex flex-col items-center gap-2 w-full">
            <p className="text-sm text-gray-400 text-center mb-2">
              Gira la ruleta para descubrir la categoría de tu ticket
            </p>
            <SpinWheel
              phase={phase as "antes_gym4" | "antes_liga" | "final"}
              onResult={handleWheelResult}
            />
          </div>
        )}

        {/* Transición */}
        {step === "slot" && !category && (
          <div className="text-white text-sm animate-pulse">
            Preparando tu ticket...
          </div>
        )}

        {/* Paso 2: Slot de ticket */}
        {step === "slot" && category && (
          <div className="flex flex-col items-center gap-2 w-full">
            <p className="text-sm text-gray-400 text-center mb-2">
              ¡Categoría obtenida! Ahora descubre tu premio
            </p>
            <TicketSlot category={category} onResult={hadnleSlotResult} />
            {saving && (
              <p className="text-xs text-gray-500 animate-pulse">
                Guardando ticket...
              </p>
            )}
          </div>
        )}

        {/* Paso 3: Resultado final */}
        {step === "done" && category && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="text-5xl animate-bounce">🎉</div>
            <p className="text-white font-bold text-center text-lg">
              ¡Ticket guardado en tu inventario!
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
