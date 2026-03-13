"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/trainer/[username]/actions";

interface Props {
  currentUsername: string;
  currentAvatarUrl?: string | null;
}

export default function EditProfileModal({
  currentUsername,
  currentAvatarUrl,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(
    currentAvatarUrl ?? null,
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    const newUsername = formData.get("username") as string;
    if (newUsername && newUsername !== currentUsername) {
      router.push(`/trainer/${newUsername}`);
    } else {
      router.refresh();
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white rounded-lg transition"
      >
        ✏️ Editar perfil
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white font-bold text-lg">✏️ Editar perfil</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Avatar */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Foto de perfil</label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold overflow-hidden cursor-pointer"
                    onClick={() => fileRef.current?.click()}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      currentUsername[0].toUpperCase()
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click}
                    className="text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    Cambiar foto
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    name="avatar"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* Username */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  name="username"
                  defaultValue={currentUsername}
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Contraseña */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">
                  Nueva contraseña{" "}
                  <span className="text-gray-600">(opcional)</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Dejar vacío para no cambiar"
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Confirmar contraseña */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Repetir nueva contraseña"
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Error */}
              {error && <p className="text-red-400 text-sm">{error}</p>}

              {/* Botones */}
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
