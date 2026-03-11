"use client";

import { toggleGym } from "@/app/dashboard/game/[id]/actions";

type Props = {
  gymId: string;
  gymName: string;
  completed: boolean;
  gameId: string;
  isOwner: boolean;
};

export default function GymToggle({
  gymId,
  gymName,
  completed,
  gameId,
  isOwner,
}: Props) {
  return (
    <button
      disabled={!isOwner}
      onClick={async () => {
        await toggleGym(gymId, completed, gameId);
      }}
      className={`rounded-lg px-3 py-2 text-sm border text-left transition w-full ${
        completed
          ? "bg-green-900/40 border-green-700 text-green-400 hover:bg-green-900/60"
          : isOwner
            ? "bg-gray-800 border-gray-700 text-gray-400 hover:border-blue-500 hover:text-white"
            : "bg-gray-800 border-gray-700 text-gray-400 cursor-default"
      }`}
    >
      <span className="mr-1">{completed ? "✅" : "🔒"}</span>
      {gymName}
    </button>
  );
}
