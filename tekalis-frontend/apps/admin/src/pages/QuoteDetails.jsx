import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaDownload, FaEnvelope, FaFileAlt, FaPaperclip } from "react-icons/fa";
import api from "@shared/api/api";

const STATUS_OPTIONS = [
  { value: "pending", label: "En attente" },
  { value: "sent", label: "Envoyé" },
  { value: "accepted", label: "Accepté" },
  { value: "rejected", label: "Rejeté" },
  { value: "converted", label: "Converti" },
  { value: "cancelled", label: "Annulé" }
];

const STATUS_CONFIG = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "En attente" },
  sent: { bg: "bg-blue-100", text: "text-blue-700", label: "Envoyé" },
  accepted: { bg: "bg-green-100", text: "text-green-700", label: "Accepté" },
  rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejeté" },
  converted: { bg: "bg-purple-100", text: "text-purple-700", label: "Converti" },
  cancelled: { bg: "bg-gray-100", text: "text-gray-700", label: "Annulé" }
};

const formatAmount = (value) => `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString("fr-FR") : "—");

const formatSize = (size) => {
  const bytes = Number(size || 0);
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(bytes / 1024).toFixed(1)} Ko`;
};

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const SolarSummary = ({ summary }) => {
  if (summary == null) return <p className="text-sm text-gray-500">—</p>;
  if (typeof summary === "string") return <p className="text-sm text-gray-700 whitespace-pre-line">{summary}</p>;

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Object.entries(summary).map(([key, value]) => (
        <div key={key} className="bg-gray-50 rounded-lg p-3">
          <dt className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</dt>
          <dd className="text-sm font-semibold text-gray-900 mt-1">
            {value && typeof value === "object" ? JSON.stringify(value) : String(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
};

const QuoteDetails = () => {
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(`/quotes/admin/${id}`);
      if (!data?.quote) throw new Error("Devis introuvable");
      setQuote(data.quote);
    } catch (error) {
      console.error("Erreur chargement devis:", error);
      setQuote(null);
      setError("Impossible de charger ce devis.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const downloadPdf = async () => {
    setMessage(null);
    try {
      const { data } = await api.get(`/quotes/admin/${id}/pdf`, { responseType: "blob" });
      const blob = new Blob([data], { type: data.type || "application/pdf" });
      triggerDownload(blob, `devis-${quote.quoteNumber || id}.pdf`);
    } catch (error) {
      console.error("Erreur téléchargement PDF:", error);
      setMessage({ type: "error", text: "Impossible de télécharger le PDF." });
    }
  };

  const downloadAttachment = async (attachment, index) => {
    setMessage(null);
    try {
      const { data } = await api.get(`/quotes/admin/${id}/attachments/${index}`, { responseType: "blob" });
      const blob = new Blob([data], { type: data.type || attachment.mimeType || "application/octet-stream" });
      triggerDownload(blob, attachment.name || `piece-jointe-${index + 1}`);
    } catch (error) {
      console.error("Erreur téléchargement pièce jointe:", error);
      setMessage({ type: "error", text: "Impossible de télécharger la pièce jointe." });
    }
  };

  const updateStatus = async (event) => {
    const status = event.target.value;
    setMessage(null);

    try {
      await api.put(`/quotes/admin/${id}/status`, { status });
      await fetchQuote();
      setMessage({ type: "success", text: "Statut mis à jour avec succès." });
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
      setMessage({ type: "error", text: "Erreur lors de la mise à jour du statut." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link to="/quotes" className="text-blue-600 hover:text-blue-700 font-semibold mb-6 inline-block">
            ← Tous les devis
          </Link>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-red-600 font-semibold">{error || "Devis introuvable"}</p>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[quote.status] || STATUS_CONFIG.pending;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link to="/quotes" className="text-blue-600 hover:text-blue-700 font-semibold mb-6 inline-block">
          ← Tous les devis
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Devis {quote.quoteNumber || id}
            </h1>
            <p className="text-sm text-gray-600">
              Créé le {formatDate(quote.createdAt)}
              {quote.validUntil && ` · Valable jusqu'au ${formatDate(quote.validUntil)}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={quote.status || "pending"}
              onChange={updateStatus}
              className={`${statusConfig.bg} ${statusConfig.text} border-0 rounded-full px-4 py-2 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button
              onClick={downloadPdf}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              <FaDownload /> Télécharger le PDF
            </button>
            <a
              href={`mailto:${quote.email || ""}?subject=${encodeURIComponent(`Devis ${quote.quoteNumber || id}`)}`}
              className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              <FaEnvelope /> Écrire au client
            </a>
          </div>
        </div>

        {message && (
          <div
            className={`${message.type === "error" ? "bg-red-50 border-red-500 text-red-800" : "bg-green-50 border-green-500 text-green-800"} border-l-4 p-4 mb-6 rounded-lg text-sm font-semibold`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Statut</p>
            <span className={`${statusConfig.bg} ${statusConfig.text} px-3 py-1 rounded-full text-xs font-semibold`}>
              {statusConfig.label}
            </span>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Validité</p>
            <p className="text-sm font-semibold text-gray-900">{formatDate(quote.validUntil)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Total</p>
            <p className="text-xl font-bold text-gray-900">{formatAmount(quote.total)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <section className="bg-white rounded-lg shadow-md p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Client</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-500">Société</dt>
                <dd className="font-semibold text-gray-900">{quote.company || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Contact</dt>
                <dd className="font-semibold text-gray-900">{quote.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Email</dt>
                <dd className="font-semibold text-gray-900">{quote.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Téléphone</dt>
                <dd className="font-semibold text-gray-900">{quote.phone || "—"}</dd>
              </div>
            </dl>
          </section>

          <section className="bg-white rounded-lg shadow-md p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Message du client</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">{quote.message || "—"}</p>
          </section>
        </div>

        {quote.source === "solar" && (
          <section className="bg-white rounded-lg shadow-md p-5 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Résumé solaire</h2>
            <SolarSummary summary={quote.solarSummary} />
          </section>
        )}

        <section className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Désignation</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Quantité</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Prix unitaire</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {(quote.items || []).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-sm text-gray-500">
                      Aucune ligne sur ce devis
                    </td>
                  </tr>
                ) : (
                  quote.items.map((item, index) => (
                    <tr key={item.sku || `${item.name || item.product}-${index}`} className="border-b">
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900">{item.name || item.product || "—"}</p>
                        {item.sku && <p className="text-xs text-gray-500">Réf. {item.sku}</p>}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-700">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-700">{formatAmount(item.price)}</td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">
                        {formatAmount(item.lineTotal ?? Number(item.price || 0) * Number(item.quantity || 0))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t p-5 flex flex-col items-end gap-2 text-sm">
            <p className="text-gray-600">Sous-total : <span className="font-semibold text-gray-900">{formatAmount(quote.subtotal)}</span></p>
            <p className="text-gray-600">Livraison : <span className="font-semibold text-gray-900">{formatAmount(quote.shippingCost)}</span></p>
            <p className="text-lg font-bold text-gray-900">Total : {formatAmount(quote.total)}</p>
          </div>
        </section>

        {quote.attachments?.length > 0 && (
          <section className="bg-white rounded-lg shadow-md p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaPaperclip /> Pièces jointes
            </h2>
            <div className="space-y-3">
              {quote.attachments.map((attachment, index) => (
                <div
                  key={`${attachment.name || "attachment"}-${index}`}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border rounded-lg p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FaFileAlt className="text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {attachment.name || `Pièce jointe ${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatSize(attachment.size)} · {attachment.mimeType || "Fichier"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadAttachment(attachment, index)}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm flex-shrink-0"
                  >
                    <FaDownload /> Télécharger
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default QuoteDetails;
