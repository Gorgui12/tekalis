import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Page introuvable</h2>
        <p className="text-gray-600 mb-8">
          La page que vous recherchez n&apos;existe pas ou a ete deplacee.
        </p>
        <Link
          href="/"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Retour a l&apos;accueil
        </Link>
      </div>
    </div>
  );
}