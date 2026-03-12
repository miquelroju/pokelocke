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
  cobre: {
    bg: "bg-amber-950",
    border: "border-amber-700",
    text: "text-amber-300",
    badge: "bg-amber-700",
  },
  plata: {
    bg: "bg-gray-800",
    border: "border-gray-500",
    text: "text-gray-200",
    badge: "bg-gray-500",
  },
  oro: {
    bg: "bg-yellow-950",
    border: "border-yellow-500",
    text: "text-yellow-300",
    badge: "bg-yellow-500",
  },
  diamante: {
    bg: "bg-blue-950",
    border: "border-blue-500",
    text: "text-blue-300",
    badge: "bg-blue-500",
  },
  platino: {
    bg: "bg-purple-950",
    border: "border-purple-500",
    text: "text-purple-300",
    badge: "bg-purple-500",
  },
};

const CATEGORY_EMOJIS: Record<string, string> = {
  cobre: "🟤",
  plata: "⚪",
  oro: "🟡",
  diamante: "💎",
  platino: "🔮",
};

function pickRandom(category: string): string {
  const list = TICKETS[category];
  return list[Math.floor(Math.random() * list.length)];
}

interface TicketSlotProps {
  category: string;
  onResult: (effect: string) => void;
}

const ITEM_HEIGHT = 72;
const VISIBLE_ITEMS = 5;

export default function TicketSlot({ category, onResult }: TicketSlotProps) {
  const normalizedCategory = category?.toLowerCase() ?? "cobre";
  const [items, setItems] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [finalEffect, setFinalEffect] = useState<string | null>(null);
  const translateY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const style = CATEGORY_STYLES[normalizedCategory] ?? CATEGORY_STYLES["cobre"];
  const emoji = CATEGORY_EMOJIS[normalizedCategory] ?? "🎟️";

  // Construir lista larga con el ganador en el centro al final
  function buildList(winner: string): string[] {
    const pool = TICKETS[normalizedCategory] ?? [];
    const list: string[] = [];
    // Rellenar con 40 ítems random
    for (let i = 0; i < 40; i++) {
      list.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    // El ganador va justo en la posición central visible al parar
    list.push(winner);
    // Añadir items después para que no quede cortado
    for (let i = 0; i < Math.floor(VISIBLE_ITEMS / 2); i++) {
      list.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return list;
  }

  function handleSpin() {
    if (spinning || finalEffect) return;
    setSpinning(true);

    const winner = pickRandom(normalizedCategory);
    const list = buildList(winner);
    setItems(list);

    // El ganador está en el índice 40
    // Queremos que quede centrado: el centro visual es VISIBLE_ITEMS/2 * ITEM_HEIGHT desde el top
    const winnerIndex = 40;
    const centerOffset = Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT;
    const targetTranslate = -(winnerIndex * ITEM_HEIGHT - centerOffset);

    // Empezamos desde arriba
    translateY.current = 0;
    if (containerRef.current) {
      containerRef.current.style.transform = "translateY(0px)";
    }

    const duration = 4000;
    const startTime = performance.now();
    const startY = 0;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing que arranca rápido y frena al final
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = startY + targetTranslate * ease;

      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(${current}px)`;
      }
      translateY.current = current;

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

  const displayItems =
    items.length > 0
      ? items
      : (() => {
          const pool = TICKETS[normalizedCategory] ?? [];
          const needed = VISIBLE_ITEMS;
          const result: string[] = [];
          for (let i = 0; i < needed; i++) {
            result.push(pool[i % pool.length]);
          }
          return result;
        })();

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Badge categoría */}
      <div
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${style.badge} text-white text-sm font-bold uppercase tracking-widest`}
      >
        <span>{emoji}</span>
        <span>Ticket {normalizedCategory}</span>
      </div>

      {/* Ventana del slot */}
      <div className="relative w-full max-w-xs">
        {/* Marco exterior con glow */}
        <div
          className={`relative rounded-2xl border-2 ${style.border} overflow-hidden shadow-lg`}
          style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
        >
          {/* Gradientes de profundidad */}
          <div
            className="absolute inset-x-0 top-0 h-16 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(5,5,15,0.95), transparent)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-16 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(5,5,15,0.95), transparent)",
            }}
          />

          {/* Resaltado central */}
          <div
            className={`absolute inset-x-0 z-10 pointer-events-none border-y-2 ${style.border} bg-white/5`}
            style={{
              top: Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT,
              height: ITEM_HEIGHT,
            }}
          />

          {/* Items */}
          <div
            ref={containerRef}
            className="absolute inset-x-0 top-0 will-change-transform"
          >
            {displayItems.map((t, i) => (
              <div
                key={i}
                className={`flex items-center justify-center text-center px-5 font-semibold text-sm ${style.text}`}
                style={{ height: ITEM_HEIGHT }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Flechas laterales del slot */}
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 text-xl ${style.text}`}
        >
          ▶
        </div>
        <div
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 text-xl ${style.text}`}
        >
          ◀
        </div>
      </div>

      {/* Resultado final */}
      {finalEffect && (
        <div
          className={`w-full max-w-xs rounded-xl border-2 ${style.border} ${style.bg} px-5 py-4 text-center`}
        >
          <p className="text-xs text-gray-400 mb-1">¡Has ganado!</p>
          <p className={`font-bold text-base ${style.text}`}>{finalEffect}</p>
        </div>
      )}

      {/* Botón */}
      {!finalEffect && (
        <button
          onClick={handleSpin}
          disabled={spinning}
          className={`px-10 py-3 font-bold rounded-full text-white text-sm transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 ${style.badge}`}
        >
          {spinning ? "🎰 Girando..." : "🎰 ¡Revelar ticket!"}
        </button>
      )}
    </div>
  );
}
