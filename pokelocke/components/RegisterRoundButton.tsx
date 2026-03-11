"use client";

import { useState } from "react";
import RegisterRoundModal from "./RegisterRoundModal";

export default function RegisterRoundButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded-lg text-sm transition"
      >
        ⚔️ Registrar Jornada
      </button>
      {open && (
        <RegisterRoundModal userId={userId} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
