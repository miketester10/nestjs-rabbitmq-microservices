import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center px-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Pagina non trovata</h2>
        <p className="text-gray-600 mb-6">La pagina che stai cercando non esiste o è stata spostata.</p>
        <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200">
          Torna alla Home
        </Link>
      </div>
    </div>
  );
}
