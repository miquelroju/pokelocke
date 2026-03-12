"use client";

import { useState } from "react";
import SpinModal from "./SpinModal";
import { useRouter } from "next/navigation";
import { markTicketAsUsed } from "@/app/dashboard/rounds/actions";

interface Ticket {
  id: string;
  category: string;
  effect: string;
  used: boolean;
  pending_spin: boolean;
  phase?: string;
}

const CATEGORY_STYLES: Record<
  string,
  { border: string; text: string; badge: string; bg: string }
> = {
  COBRE: {
    border: "border-amber-700",
    text: "text-amber-300",
    badge: "bg-amber-700",
    bg: "bg-amber-950/40",
  },
  PLATA: {
    border: "border-gray-500",
    text: "text-gray-200",
    badge: "bg-gray-500",
    bg: "bg-gray-800/40",
  },
  ORO: {
    border: "border-yellow-500",
    text: "text-yellow-300",
    badge: "bg-yellow-500",
    bg: "bg-yellow-950/40",
  },
  DIAMANTE: {
    border: "border-blue-500",
    text: "text-blue-300",
    badge: "bg-blue-500",
    bg: "bg-blue-950/40",
  },
  PLATINO: {
    border: "border-purple-500",
    text: "text-purple-300",
    badge: "bg-purple-500",
    bg: "bg-purple-950/40",
  },
  PENDING: {
    border: "border-gray-600",
    text: "text-gray-400",
    badge: "bg-gray-600",
    bg: "bg-gray-900/40",
  },
};

export default function TicketsInventory({
  tickets,
  defaultPhase,
}: {
  tickets: Ticket[];
  defaultPhase: string;
}) {
  const [spinTicket, setSpinTicket] = useState<Ticket | null>(null);
  const [usingTicket, setUsingTicket] = useState<string | null>(null);
  const router = useRouter();

  const pending = tickets.filter((t) => t.pending_spin && !t.used);
  const ready = tickets.filter((t) => !t.pending_spin && !t.used);
  const used = tickets.filter((t) => t.used);

  async function handleUse(ticketId: string) {
    setUsingTicket(ticketId);
    await markTicketAsUsed(ticketId);
    setUsingTicket(null);
    router.refresh();
  }

  function TicketCard({ ticket }: { ticket: Ticket }) {
    const style = CATEGORY_STYLES[ticket.category] ?? CATEGORY_STYLES.PENDING;

    if (ticket.pending_spin) {
      return (
        <div
          className={`rounded-xl border-2 border-dashed border-gray-600 bg-gray-900/40 p-4 flex flex-col gap-3`}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎰</span>
            <div>
              <p className="text-white font-semibold text-sm">
                Ticket pendiente
              </p>
              <p className="text-gray-500 text-xs">
                Tira la ruleta para descubrir tu premio
              </p>
            </div>
          </div>
          <button
            onClick={() => setSpinTicket(ticket)}
            className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg text-sm transition-all transform hover:scale-105"
          >
            🎰 ¡Tirar ruleta!
          </button>
        </div>
      );
    }

    return (
      <div
        className={`rounded-xl border-2 ${style.border} ${style.bg} p-4 flex flex-col gap-3 ${ticket.used ? "opacity-40" : ""}`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${style.badge} text-white`}
          >
            {ticket.category}
          </span>
          {ticket.used && (
            <span className="text-xs text-gray-500 font-medium">Usado</span>
          )}
        </div>
        <p className={`font-semibold text-sm ${style.text}`}>{ticket.effect}</p>
        {!ticket.used && (
          <button
            onClick={() => handleUse(ticket.id)}
            disabled={usingTicket === ticket.id}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
          >
            {usingTicket === ticket.id ? "Usando..." : "✅ Utilizar ticket"}
          </button>
        )}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600">
        <p className="text-4xl mb-3">🎟️</p>
        <p className="text-sm">No tienes tickets todavía.</p>
        <p className="text-xs mt-1">Gana combates para conseguirlos.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {pending.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-yellow-400 mb-3">
            🎰 Pendientes de tirar ({pending.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pending.map((t) => (
              <TicketCard key={t.id} ticket={t} />
            ))}
          </div>
        </div>
      )}

      {ready.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-green-400 mb-3">
            🎟️ Disponibles ({ready.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ready.map((t) => (
              <TicketCard key={t.id} ticket={t} />
            ))}
          </div>
        </div>
      )}

      {used.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3">
            Usados ({used.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {used.map((t) => (
              <TicketCard key={t.id} ticket={t} />
            ))}
          </div>
        </div>
      )}

      {spinTicket && (
        <SpinModal
          ticketId={spinTicket.id}
          phase={spinTicket.phase ?? defaultPhase}
          onClose={() => {
            setSpinTicket(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
