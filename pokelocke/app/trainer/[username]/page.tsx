import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import GymToggle from "@/components/GymToggle";
import PokemonCard from "@/components/PokemonCard";

const POSITION_STYLES = [
  { medal: "🥇", text: "text-yellow-400" },
  { medal: "🥈", text: "text-gray-300" },
  { medal: "🥉", text: "text-amber-600" },
];

export default async function TrainerPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  // Buscar el perfil por username
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  // Obtener sus juegos
  const { data: games } = await supabase
    .from("games")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  // Estadísticas globales del jugador
  const { data: combatResults } = await supabase
    .from("combat_results")
    .select("position, tickets_earned, round_id, phase")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const wins = combatResults?.filter((r) => r.position === 1).length ?? 0;
  const podiums = combatResults?.filter((r) => r.position <= 3).length ?? 0;
  const totalTickets =
    combatResults?.reduce((acc, r) => acc + r.tickets_earned, 0) ?? 0;

  // Ultimas 5 jornadas del jugador
  const lastResults = combatResults?.slice(0, 5) ?? [];
  const roundIds = lastResults.map((r) => r.round_id);

  const { data: rounds } = await supabase
    .from("rounds")
    .select("id, created_at")
    .in("id", roundIds.length > 0 ? roundIds : ["none"]);

  const roundMap: Record<string, string> = {};
  rounds?.forEach((r) => {
    roundMap[r.id] = r.created_at;
  });

  const PHASE_LABELS: Record<string, string> = {
    antes_gym4: "Fase 1 - Antes del 4º gimnasio",
    antes_liga: "Fase 2 - Antes de la Liga",
    final: "Fase 3 - Final del juego",
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🎮 Pokelocke</h1>
        <a
          href="/dashboard"
          className="text-gray-400 hover:text-white text-sm transition"
        >
          Mi dashboard →
        </a>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10 flex flex-col gap-10">
        {/* Cabecera del perfil */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold">
            {username[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-3xl font-bold">{username}</h2>
            <p className="text-gray-400 mt-1">
              {games?.length ?? 0} juegos · Entrenador Pokémon
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 text-center">
            <p className="text-3xl font-extrabold text-yellow-400">{wins}</p>
            <p className="text-xs text-gray-400 mt-1">Victorias</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 text-center">
            <p className="text-3xl font-extrabold text-purple-400">{podiums}</p>
            <p className="text-xs text-gray-400 mt-1">Podios</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 text-center">
            <p className="text-3xl font-extrabold text-blue-400">
              {totalTickets}
            </p>
            <p className="text-xs text-gray-400 mt-1">Tickets ganados</p>
          </div>
        </div>

        {/* Historial reciente de jornadas */}
        {lastResults.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-4">⚔️ Últimas jornadas</h3>
            <div className="flex flex-col gap-2">
              {lastResults.map((r) => {
                const style = POSITION_STYLES[r.position - 1];
                const date = roundMap[r.round_id]
                  ? new Date(roundMap[r.round_id]).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—";
                return (
                  <div
                    key={r.round_id}
                    className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 flex items-center gap-4"
                  >
                    <span className="text-xl">
                      {style?.medal ?? `#${r.position}`}
                    </span>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${style?.text ?? "text-gray-400"}`}
                      >
                        {r.position <= 3
                          ? `${r.position}º puesto`
                          : `#${r.position}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {PHASE_LABELS[r.phase] ?? r.phase} · {date}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      +{r.tickets_earned} tickets
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Juegos */}
        {games && games.length > 0 ? (
          games.map(async (game) => {
            const { data: gyms } = await supabase
              .from("gyms")
              .select("*")
              .eq("game_id", game.id)
              .order("gym_number", { ascending: true });

            const { data: pokemon } = await supabase
              .from("pokemon")
              .select("*")
              .eq("game_id", game.id)
              .order("caught_at", { ascending: true });

            const completedGyms = gyms?.filter((g) => g.completed).length ?? 0;
            const totalGyms = gyms?.length ?? 0;
            const progressPercent =
              totalGyms > 0 ? Math.round((completedGyms / totalGyms) * 100) : 0;

            const teamPokemon =
              pokemon?.filter((p) => p.status === "team") ?? [];
            const pcPokemon = pokemon?.filter((p) => p.status === "pc") ?? [];
            const deadPokemon =
              pokemon?.filter((p) => p.status === "dead") ?? [];

            return (
              <div key={game.id} className="flex flex-col gap-6">
                {/* Cabecera del juego */}
                <div className="flex items-center gap-4 flex-wrap">
                  <a
                    href={`/dashboard/game/${game.id}`}
                    className="text-2xl font-bold hover:text-blue-400 transition"
                  >
                    {game.game_name} →
                  </a>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      game.status === "active"
                        ? "bg-green-900 text-green-400"
                        : game.status === "completed"
                          ? "bg-blue-900 text-blue-400"
                          : "bg-red-900 text-red-400"
                    }`}
                  >
                    {game.status === "active"
                      ? "Activo"
                      : game.status === "completed"
                        ? "Completado"
                        : "Fallido"}
                  </span>
                  <span className="text-gray-400 text-sm">
                    ❤️ {game.lives_remaining} vidas
                  </span>
                </div>

                {/* Progreso gimnasios */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold">Progreso de gimnasios</h4>
                    <span className="text-sm text-gray-400">
                      {completedGyms}/{totalGyms} · {progressPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {gyms?.map((gym) => (
                      <GymToggle
                        key={gym.id}
                        gymId={gym.id}
                        gymName={gym.gym_name}
                        completed={gym.completed}
                        gameId={game.id}
                        isOwner={false}
                      />
                    ))}
                  </div>
                </div>

                {/* Equipo */}
                {teamPokemon.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-3">
                      ⚔️ Equipo ({teamPokemon.length}/6)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {teamPokemon.map((p) => (
                        <PokemonCard key={p.id} pokemon={p} isOwner={false} />
                      ))}
                    </div>
                  </div>
                )}

                {/* PC */}
                {pcPokemon.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-3">
                      💾 PC ({pcPokemon.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {pcPokemon.map((p) => (
                        <PokemonCard key={p.id} pokemon={p} isOwner={false} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Caídos */}
                {deadPokemon.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-3 text-red-400">
                      💀 Caídos ({deadPokemon.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {deadPokemon.map((p) => (
                        <PokemonCard
                          key={p.id}
                          pokemon={p}
                          isOwner={false}
                          isDead
                        />
                      ))}
                    </div>
                  </div>
                )}

                <hr className="border-gray-800" />
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">🎮</p>
            <p className="text-lg">Este entrenador aún no tiene juegos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
