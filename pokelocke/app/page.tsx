import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

const PHASE_LABELS: Record<string, string> = {
  antes_gym4: "Fase 1 - Antes del 4º gimnasio",
  antes_liga: "Fase 2 - Antes de la Liga",
  final: "Fase 3 - Final del juego",
};

const POSITION_STYLES = [
  {
    medal: "🥇",
    text: "text-yellow-400",
    bg: "bg-yellow-950/40",
    border: "border-yellow-700",
  },
  {
    medal: "🥈",
    text: "text-gray-300",
    bg: "bg-gray-800/40",
    border: "border-gray-600",
  },
  {
    medal: "🥉",
    text: "text-amber-600",
    bg: "bg-amber-950/40",
    border: "border-amber-800",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ranking global: victorias totales por usuario
  const { data: combatResults } = await supabase
    .from("combat_results")
    .select("user_id, position, tickets_earned");

  // Obtener usernames
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username");

  const profileMap: Record<string, string> = {};
  profiles?.forEach((p) => {
    profileMap[p.id] = p.username;
  });

  // Calcular ranking
  const statsMap: Record<
    string,
    { wins: number; tickets: number; podiums: number }
  > = {};
  combatResults?.forEach((r) => {
    if (!statsMap[r.user_id])
      statsMap[r.user_id] = { wins: 0, tickets: 0, podiums: 0 };
    if (r.position === 1) statsMap[r.user_id].wins++;
    if (r.position <= 3) statsMap[r.user_id].podiums++;
    statsMap[r.user_id].tickets += r.tickets_earned;
  });

  const ranking = Object.entries(statsMap)
    .map(([userId, stats]) => ({
      userId,
      username: profileMap[userId] ?? "???",
      ...stats,
    }))
    .sort((a, b) => b.wins - a.wins || b.podiums - a.podiums)
    .slice(0, 10);

  // Últimas jornadas
  const { data: rounds } = await supabase
    .from("rounds")
    .select("id, phase, created_at, created_by")
    .order("created_at", { ascending: false })
    .limit(5);

  // Resultados de esas jornadas
  const roundIds = rounds?.map((r) => r.id) ?? [];
  const { data: recentResults } = await supabase
    .from("combat_results")
    .select("round_id, user_id, position, tickets_earned")
    .in("round_id", roundIds);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🎮 Pokelocke</h1>
        <div className="flex gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition"
            >
              Mi panel →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 rounded-lg transition"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center py-16 px-8 border-b border-gray-800">
        <h2 className="text-4xl font-extrabold mb-3">
          🏆 Randomlocke Competitivo
        </h2>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Sigue el progreso de todos los jugadores, consulta el ranking global y
          las últimas jornadas.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12 flex flex-col gap-14">
        {/* Ranking global */}
        <div>
          <h2 className="text-2xl font-bold mb-6">🏅 Ranking global</h2>
          {ranking.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Aún no hay jornadas registradas.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {ranking.map((player, i) => {
                const style = POSITION_STYLES[i] ?? {
                  medal: null,
                  text: "text-gray-400",
                  bg: "bg-gray-900/40",
                  border: "border-gray-800",
                };
                return (
                  <div
                    key={player.userId}
                    className={`flex items-center gap-4 rounded-xl border ${style.border} ${style.bg} px-5 py-4`}
                  >
                    <span className="text-2xl w-8 text-center">
                      {i < 3 ? (
                        POSITION_STYLES[i].medal
                      ) : (
                        <span className="text-sm text-gray-500 font-bold">
                          #{i + 1}
                        </span>
                      )}
                    </span>
                    <div className="flex-1">
                      <p className={`font-bold ${style.text}`}>
                        {player.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {player.podiums} podios · {player.tickets} tickets
                        ganados
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-extrabold text-white">
                        {player.wins}
                      </p>
                      <p className="text-xs text-gray-500">victorias</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Últimas jornadas */}
        <div>
          <h2 className="text-2xl font-bold mb-6">⚔️ Últimas jornadas</h2>
          {!rounds || rounds.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Aún no hay jornadas registradas.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {rounds.map((round) => {
                const results =
                  recentResults
                    ?.filter((r) => r.round_id === round.id)
                    .sort((a, b) => a.position - b.position) ?? [];

                return (
                  <div
                    key={round.id}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-5"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-white">
                          {PHASE_LABELS[round.phase] ?? round.phase}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(round.created_at).toLocaleDateString(
                            "es-ES",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded-full">
                        Registrada por {profileMap[round.created_by] ?? "???"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {results.map((r) => {
                        const pos = POSITION_STYLES[r.position - 1];
                        return (
                          <div
                            key={r.user_id}
                            className="flex items-center gap-3 text-sm"
                          >
                            <span>
                              {r.position <= 3
                                ? POSITION_STYLES[r.position - 1].medal
                                : `#${r.position}`}
                            </span>
                            <span
                              className={`font-medium ${pos?.text ?? "text-gray-400"}`}
                            >
                              {profileMap[r.user_id] ?? "???"}
                            </span>
                            <span className="text-gray-600 ml-auto">
                              +{r.tickets_earned} tickets
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
