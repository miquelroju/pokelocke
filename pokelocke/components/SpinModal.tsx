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

const CATEGORY_STYLES: Record<
  string,
  { text: string; bg: string; border: string }
> = {
  cobre: {
    text: "text-amber-300",
    bg: "bg-amber-950",
    border: "border-amber-600",
  },
  plata: {
    text: "text-gray-200",
    bg: "bg-gray-800",
    border: "border-gray-400",
  },
  oro: {
    text: "text-yellow-300",
    bg: "bg-yellow-950",
    border: "border-yellow-400",
  },
  diamante: {
    text: "text-blue-300",
    bg: "bg-blue-950",
    border: "border-blue-400",
  },
  platino: {
    text: "text-purple-300",
    bg: "bg-purple-950",
    border: "border-purple-400",
  },
};

type Step = "wheel" | "slot" | "confirm" | "done";

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
  const [effect, setEffect] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleWheelResult(cat: string) {
    setCategory(cat.toLowerCase());
    // Pequeña pausa dramática antes de mostrar el slot
    setTimeout(() => setStep("slot"), 1200);
  }

  function handleSlotResult(effect: string) {
    setEffect(effect);
    // Esperamos 1.5s para que el usuario vea el resultado antes de mostrar confirm
    setTimeout(() => setStep("confirm"), 1500);
  }

  async function handleConfirm() {
    setSaving(true);
    await saveTicket(ticketId, category!, effect!);
    setSaving(false);
    setStep("done");
  }

  const catStyle = category
    ? (CATEGORY_STYLES[category] ?? CATEGORY_STYLES.cobre)
    : null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6 flex flex-col gap-5 items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">🎰 Tirar ruleta</h2>
          {step === "done" && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 -mt-4 w-full">
          {PHASE_LABELS[phase] ?? phase}
        </p>

        {/* Paso 1: Ruleta */}
        {step === "wheel" && (
          <div className="flex flex-col items-center gap-3 w-full">
            <p className="text-sm text-gray-400 text-center">
              Gira la ruleta para descubrir la categoría de tu ticket
            </p>
            <SpinWheel
              phase={phase as "antes_gym4" | "antes_liga" | "final"}
              onResult={handleWheelResult}
            />
          </div>
        )}

        {/* Transición wheel → slot */}
        {step === "slot" && !category && (
          <div className="text-white text-sm animate-pulse py-10">
            Preparando tu ticket...
          </div>
        )}

        {/* Paso 2: Slot */}
        {step === "slot" && category && (
          <div className="flex flex-col items-center gap-3 w-full">
            <p className="text-sm text-gray-400 text-center">
              ¡Categoría{" "}
              <span className={`font-bold ${catStyle?.text}`}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
              ! Descubre tu premio
            </p>
            <TicketSlot category={category} onResult={handleSlotResult} />
          </div>
        )}

        {/* Paso 3: Confirmación con el premio */}
        {step === "confirm" && category && effect && catStyle && (
          <div className="flex flex-col items-center gap-5 w-full">
            <div className="text-5xl">🎉</div>
            <div
              className={`w-full rounded-xl border-2 ${catStyle.border} ${catStyle.bg} px-6 py-5 text-center flex flex-col gap-2`}
            >
              <p className="text-xs text-gray-400 uppercase tracking-widest">
                Tu premio
              </p>
              <p className={`font-bold text-xl ${catStyle.text}`}>{effect}</p>
              <p className={`text-xs mt-1 ${catStyle.text} opacity-60`}>
                Categoría {category}
              </p>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Una vez confirmado, el ticket se guardará en tu inventario
            </p>
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
            >
              {saving ? "Guardando..." : "✅ Confirmar y guardar ticket"}
            </button>
          </div>
        )}

        {/* Paso 4: Guardado */}
        {step === "done" && (
          <div className="flex flex-col items-center gap-4 w-full py-4">
            <div className="text-5xl animate-bounce">🎟️</div>
            <p className="text-white font-bold text-center text-lg">
              ¡Ticket guardado en tu inventario!
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
