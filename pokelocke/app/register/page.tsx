import { register } from "@/app/auth/actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-800">
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          🎮 Pokelocke
        </h1>
        <p className="text-center text-gray-400 text-sm mb-6">
          Crea tu cuenta de entrenador
        </p>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4 bg-red-950 border border-red-800 rounded-lg py-2 px-4">
            {error}
          </p>
        )}

        <form action={register} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">Email</label>
            <input
              name="email"
              type="email"
              placeholder="trainer@pokemon.com"
              required
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">Nombre de usuario</label>
            <input
              name="username"
              type="text"
              placeholder="ashketchum"
              required
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">Contraseña</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">
              Confirmar contraseña
            </label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white rounded-lg py-2 font-semibold hover:bg-green-700 transition mt-2"
          >
            Crear cuenta
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-gray-400">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}
