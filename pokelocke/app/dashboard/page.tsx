import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth/actions";
import NewGameModal from "@/components/NewGameModal";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: games } = await supabase
    .from("games")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🎮 Pokelocke</h1>
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

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Mis juegos</h2>
            <p className="text-gray-400 mt-1">
              Gestiona tus partidas del randomlocke
            </p>
          </div>
          <NewGameModal />
        </div>

        {games && games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
              <a
                key={game.id}
                href={`/dashboard/game/${game.id}`}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg group-hover:text-blue-400 transition">
                    {game.game_name}
                  </h3>
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
                </div>
                <p className="text-gray-400 text-sm">
                  Generación {game.generation}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-red-400">❤️</span>
                  <span className="text-sm">
                    {game.lives_remaining} vidas restantes
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">🎮</p>
            <p className="text-lg">Aún no tienes ningún juego.</p>
            <p className="text-sm mt-1">
              Crea tu primera partida para empezar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
