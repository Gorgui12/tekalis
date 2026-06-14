"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Quelque chose s&apos;est mal passe
        </h2>
        <p className="text-gray-600 mb-6">{error?.message || "Erreur inattendue"}</p>
        <button
          onClick={() => reset()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Reessayer
        </button>
      </div>
    </div>
  );
}