"use client";

import { useEffect, useRef, useState } from "react";

const TICKETS: Record<string, string[]> = {
  cobre: [
    "1 Recaptura / Pokémon",
    "1 Parche habilidad",
    "1 Traslado extra",
    "1 Objeto evolutivo random",
    "1 Menta naturaleza random",
    "1 MT normal random",
    "+252 EV",
  ],
  plata: [
    "2 Recapturas / Pokémon",
    "2 Parches habilidad",
    "2 Traslados extra",
    "2 Objetos evolutivos random",
    "2 Mentas naturaleza random",
    "2 MT Categoría random",
    "±510 EV",
  ],
  oro: [
    "3 Recapturas / Pokémon",
    "3 Traslados extra",
    "1 Objeto evolutivo a escoger",
    "1 Menta naturaleza a escoger",
    "1 MT chetada a escoger",
    "+10 IV en una stat",
    "1 Objeto competitivo",
  ],
  diamante: [
    "1 Robo random de PC y Equipo",
    "+3 vidas",
    "1 Recaptura / Pokémon random",
    "1 Master Ball",
    "1 Escudo protector de tickets",
    "+10 IV en todas las stats",
  ],
  platino: [
    "Baneo Pokémon",
    "Stop Ticket",
    "1 Shinify random",
    "1 Revivir Pokémon",
    "1 MT a elección permalocke",
  ],
};

const CATEGORY_STYLES: Record<
  string,
  { bg: string; border: string; text: string; badge: string }
> = {
  COBRE: {
    bg: "bg-amber-950",
    border: "border-amber-700",
    text: "text-amber-300",
    badge: "bg-amber-700",
  },
  PLATA: {
    bg: "bg-gray-800",
    border: "border-gray-500",
    text: "text-gray-200",
    badge: "bg-gray-500",
  },
  ORO: {
    bg: "bg-yellow-950",
    border: "border-yellow-500",
    text: "text-yellow-300",
    badge: "bg-yellow-500",
  },
  DIAMANTE: {
    bg: "bg-blue-950",
    border: "border-blue-500",
    text: "text-blue-300",
    badge: "bg-blue-500",
  },
  PLATINO: {
    bg: "bg-purple-950",
    border: "border-purple-500",
    text: "text-purple-300",
    badge: "bg-purple-500",
  },
};

function pickRandom(category: string): string {
  const list = TICKETS[category];
  return list[Math.floor(Math.random() * list.length)];
}

interface TicketSlotProps {
  category: string;
  onResult: (effect: string) => void;
}

export default function TicketSlot({ category, onResult }: TicketSlotProps) {
  const [items, setItems] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [finalEffect, setFinalEffect] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const ITEM_HEIGHT = 80;
  const VISIBLE = 3; // items visibles en la ventana

  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.COBRE;

  function buildList(winner: string): string[] {
    const pool = TICKETS[category];
    const list: string[] = [];
    // 30 items random + el ganador al final
    for (let i = 0; i < 30; i++) {
      list.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    list.push(winner);
    return list;
  }

  function handleSpin() {
    if (spinning || finalEffect) return;
    setSpinning(true);

    const winner = pickRandom(category);
    const list = buildList(winner);
    setItems(list);
    setOffset(0);

    const totalItems = list.length;
    // Queremos que el último item (ganador) quede centrado
    // El centro visible es el item en posición VISIBLE/2 (index 1 de 3)
    const targetOffset =
      (totalItems - Math.floor(VISIBLE / 2) - 1) * ITEM_HEIGHT;
    const duration = 3500;
    startTimeRef.current = performance.now();

    function animate(now: number) {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = targetOffset * ease;

      setOffset(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setFinalEffect(winner);
        onResult(winner);
      }
    }

    animRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest ${style.badge} text-white`}
      >
        Ticket {category}
      </div>

      {/* Ventana del slot */}
      <div
        className={`relative w-64 rounded-xl border-2 ${style.border} overflow-hidden`}
        style={{ height: ITEM_HEIGHT * VISIBLE }}
      >
        {/* Gradientes arriba y abajo para efecto de profundidad */}
        <div
          className="absolute inset-x-0 top-0 h-12 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.9), transparent",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-12 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(10,10,10,0.9), transparent)",
          }}
        />

        {/* Líneas de selección central */}
        <div
          className={`absolute inset-x-0 z-10 pointer-events-none border-y-2 ${style.border}`}
          style={{ top: ITEM_HEIGHT, height: ITEM_HEIGHT }}
        />

        {/* Items del slot */}
        <div
          className="absolute inset-x-0 top-0 flex flex-col transition-none"
          style={{ transform: `translate(-${offset}px)` }}
        >
          {items.length === 0
            ? TICKETS[category].concat(TICKETS[category]).map((t, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-center text-center px-4 cont-medium text-sm ${style.text}`}
                  style={{ height: ITEM_HEIGHT }}
                >
                  {t}
                </div>
              ))
            : items.map((t, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-center text-center px-4 font-medium text-sm ${style.text}`}
                  style={{ height: ITEM_HEIGHT }}
                >
                  {t}
                </div>
              ))}
        </div>
      </div>

      {finalEffect ? (
        <div
          className={`w-64 rounded-xl border-2 ${style.border} ${style.bg} px-4 py-3 text-center`}
        >
          <p className="text-xs text-gray-400 mb-1">Has ganado</p>
          <p className={`font-bold text-base ${style.text}`}>{finalEffect}</p>
        </div>
      ) : (
        <button
          onClick={handleSpin}
          disabled={spinning}
          className={`px-8 py-3 font-bold rounded-full text-sm transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${style.badge} text-white`}
        >
          {spinning ? "🎰 Girando..." : "🎰 ¡Revelar ticket!"}
        </button>
      )}
    </div>
  );
}
