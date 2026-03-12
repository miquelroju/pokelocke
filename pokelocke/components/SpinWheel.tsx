"use client";

import { useEffect, useRef, useState } from "react";

const PHASES = {
  antes_gym4: [
    { category: "cobre", label: "Cobre", color: "#b45309", probability: 50 },
    { category: "plata", label: "Plata", color: "#6b7280", probability: 35 },
    { category: "oro", label: "Oro", color: "#d97706", probability: 13.9 },
    {
      category: "diamante",
      label: "Diamante",
      color: "#3b82f6",
      probability: 1,
    },
    {
      category: "platino",
      label: "Platino",
      color: "#8b5cf6",
      probability: 0.1,
    },
  ],
  antes_liga: [
    { category: "cobre", label: "Cobre", color: "#b45309", probability: 20 },
    { category: "plata", label: "Plata", color: "#6b7280", probability: 30 },
    { category: "oro", label: "Oro", color: "#d97706", probability: 30 },
    {
      category: "diamante",
      label: "Diamante",
      color: "#3b82f6",
      probability: 15,
    },
    { category: "platino", label: "Platino", color: "#8b5cf6", probability: 5 },
  ],
  final: [
    { category: "cobre", label: "Cobre", color: "#b45309", probability: 0 },
    { category: "plata", label: "Plata", color: "#6b7280", probability: 20 },
    { category: "oro", label: "Oro", color: "#d97706", probability: 35 },
    {
      category: "diamante",
      label: "Diamante",
      color: "#3b82f6",
      probability: 30,
    },
    {
      category: "platino",
      label: "Platino",
      color: "#8b5cf6",
      probability: 15,
    },
  ],
};

function spinRandom(phase: keyof typeof PHASES): string {
  const segments = PHASES[phase].filter((s) => s.probability > 0);
  const total = segments.reduce((sum, s) => sum + s.probability, 0);
  let rand = Math.random() * total;
  for (const seg of segments) {
    rand -= seg.probability;
    if (rand <= 0) return seg.category;
  }
  return segments[segments.length - 1].category;
}

interface SpinWheelProps {
  phase: "antes_gym4" | "antes_liga" | "final";
  onResult: (category: string) => void;
}

export default function SpinWheel({ phase, onResult }: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const animRef = useRef<number>(0);

  const segments = PHASES[phase].filter((s) => s.probability > 0);
  const total = segments.reduce((sum, s) => sum + s.probability, 0);

  function drawWheel(angle: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = cx - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let startAngle = angle;
    segments.forEach((seg) => {
      const sliceAngle = (seg.probability / total) * 2 * Math.PI;

      // Sector
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Texto
      const midAngle = startAngle + sliceAngle / 2;
      const textRadius = radius * 0.65;

      if (sliceAngle > 0.15) {
        // ← umbral: ~8.6 grados mínimo
        ctx.save();
        ctx.translate(
          cx + textRadius * Math.cos(midAngle),
          cy + textRadius * Math.sin(midAngle),
        );
        ctx.rotate(midAngle + Math.PI / 2);
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${sliceAngle > 0.4 ? 13 : 10}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(seg.label, 0, 0);
        ctx.restore();
      }

      startAngle += sliceAngle;
    });

    // Círculo central
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
    ctx.fillStyle = "#111827";
    ctx.fill();
    ctx.strokeStyle = "#6b7280";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  useEffect(() => {
    drawWheel(rotation);
  }, [rotation, phase]);

  function handleSpin() {
    if (spinning) return;
    setSpinning(true);

    const wonCategory = spinRandom(phase);

    // Calcular ángulo destino para que el puntero (arriba = -PI/2) apunte el sector ganador
    const wonIndex = segments.findIndex((s) => s.category === wonCategory);
    let targetStart = 0;
    for (let i = 0; i < wonIndex; i++) {
      targetStart += (segments[i].probability / total) * 2 * Math.PI;
    }
    const sliceAngle = (segments[wonIndex].probability / total) * 2 * Math.PI;
    const targetAngle = targetStart + sliceAngle / 2;

    // El puntero apunta a -PI/2, así que rotamos para que targetAngle quede en -PI/2
    const finalAngle = -Math.PI / 2 - targetAngle;
    const extraSpins = 8 * 2 * Math.PI; // 8 vueltas completas
    const totalRotation = finalAngle + extraSpins;

    const duration = 4000;
    const startTime = performance.now();
    const startRot = rotation;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: desacelera al final
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = startRot + totalRotation * ease;

      setRotation(current);
      drawWheel(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        onResult(wonCategory);
      }
    }

    animRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Puntero */}
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-2xl">
          ▼
        </div>
        <canvas
          ref={canvasRef}
          width={420}
          height={420}
          className="rounded-full shadow-2xl"
        />
      </div>

      <button
        onClick={handleSpin}
        disabled={spinning}
        className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-full text-sm transition-all transform hover:scale-105 active:scale-95 shadow-lg"
      >
        {spinning ? "🌀 Girando..." : "🎰 ¡Girar!"}
      </button>
    </div>
  );
}
