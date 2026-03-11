import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth/actions";
import AddPokemonModal from "@/components/AddPokemonModal";
import GymToggle from "@/components/GymToggle";
import PokemonCard from "@/components/PokemonCard";

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .single();

  if (!game) redirect("/dashboard");

  const isOwner = game.user_id === user.id;

  const { data: gyms } = await supabase
    .from("gyms")
    .select("*")
    .eq("game_id", id)
    .order("gym_number", { ascending: true });

  const { data: pokemon } = await supabase
    .from("pokemon")
    .select("*")
    .eq("game_id", id)
    .order("caught_at", { ascending: true });

  const completedGyms = gyms?.filter((g) => g.completed).length ?? 0;
  const totalGyms = gyms?.length ?? 0;
  const progressPercent =
    totalGyms > 0 ? Math.round((completedGyms / totalGyms) * 100) : 0;

  const teamPokemon = pokemon?.filter((p) => p.status === "team") ?? [];
  const pcPokemon = pokemon?.filter((p) => p.status === "pc") ?? [];
  const deadPokemon = pokemon?.filter((p) => p.status === "dead") ?? [];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <a
            href="/dashboard"
            className="text-gray-400 hover:text-white transition"
          >
            ← Mis juegos
          </a>
          <h1 className="text-xl font-bold">{game.game_name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">
            {user.user_metadata.username}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10 flex flex-col gap-10">
        {/* Info general */}
        <div className="flex gap-6 items-center">
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 flex items-center gap-3">
            <span className="text-red-400 text-2xl">❤️</span>
            <div>
              <p className="text-xs text-gray-400">Vidas restantes</p>
              <p className="text-2xl font-bold">{game.lives_remaining}</p>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 flex items-center gap-3">
            <span className="text-yellow-400 text-2xl">🏅</span>
            <div>
              <p className="text-xs text-gray-400">Medallas</p>
              <p className="text-2xl font-bold">
                {completedGyms} / {totalGyms}
              </p>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 flex items-center gap-3">
            <span className="text-blue-400 text-2xl">⚡</span>
            <div>
              <p className="text-xs text-gray-400">Generación</p>
              <p className="text-2xl font-bold">{game.generation}</p>
            </div>
          </div>
        </div>

        {/* Barra de progreso gimnasios */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Progreso de gimnasios</h2>
            <span className="text-sm text-gray-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 mb-6">
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
                isOwner={isOwner}
              />
            ))}
          </div>
        </div>

        {/* Equipo */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              ⚔️ Equipo ({teamPokemon.length}/6)
            </h2>
            {isOwner && <AddPokemonModal gameId={game.id} />}
          </div>
          {teamPokemon.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {teamPokemon.map((p) => (
                <PokemonCard key={p.id} pokemon={p} isOwner={isOwner} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No tienes Pokémon en el equipo aún.
            </p>
          )}
        </div>

        {/* PC */}
        {pcPokemon.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4">
              💾 PC ({pcPokemon.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {pcPokemon.map((p) => (
                <PokemonCard key={p.id} pokemon={p} isOwner={isOwner} />
              ))}
            </div>
          </div>
        )}

        {/* Caídos */}
        {deadPokemon.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-red-400">
              💀 Caídos ({deadPokemon.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {deadPokemon.map((p) => (
                <PokemonCard key={p.id} pokemon={p} isOwner={isOwner} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
