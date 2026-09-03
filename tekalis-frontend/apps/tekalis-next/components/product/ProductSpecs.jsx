"use client";

import { useState } from "react";
import { 
  FaClipboard, FaClipboardCheck, FaShare, FaPrint,
  FaMemory, FaMicrochip, FaHdd, FaDesktop, FaBatteryFull,
  FaWeight, FaRuler, FaPalette
} from "react-icons/fa";
import { useToast } from "@/components/shared/ToastProvider";

/**
 * ProductSpecs - Score 9/10
 * Tabs avec caractéristiques, description, avis
 */
const ProductSpecs = ({ product }) => {
  const [activeTab, setActiveTab] = useState("specs");
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  if (!product) return null;

  const tabs = [
    { id: "specs", label: "Caractéristiques", count: product.specs ? Object.keys(product.specs).length : 0 },
    { id: "description", label: "Description" },
    { id: "reviews", label: "Avis", count: product.rating?.count || 0 }
  ];

  const getSpecIcon = (key) => {
    const icons = {
      processor: <FaMicrochip />,
      ram: <FaMemory />,
      storage: <FaHdd />,
      storageType: <FaHdd />,
      display: <FaDesktop />,
      battery: <FaBatteryFull />,
      weight: <FaWeight />,
      dimensions: <FaRuler />,
      color: <FaPalette />
    };
    return icons[key] || null;
  };

  const getSpecLabel = (key) => {
    const labels = {
      processor: "Processeur",
      ram: "Mémoire RAM",
      storage: "Stockage",
      storageType: "Type de stockage",
      display: "Écran",
      battery: "Batterie",
      weight: "Poids",
      dimensions: "Dimensions",
      color: "Couleur",
      os: "Système d'exploitation",
      gpu: "Carte graphique",
      camera: "Caméra",
      connectivity: "Connectivité"
    };
    return labels[key] || key;
  };

  const copySpecs = () => {
    if (!product.specs) return;

    const specsText = Object.entries(product.specs)
      .map(([key, value]) => `${getSpecLabel(key)}: ${value}`)
      .join('\n');

    navigator.clipboard.writeText(specsText);
    setCopied(true);
    toast.success("Caractéristiques copiées !");
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Découvrez ${product.name}`,
          url: window.location.href
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error("Erreur lors du partage");
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié !");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-surface-200 dark:border-surface-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-fit px-6 py-4 font-semibold transition ${
              activeTab === tab.id
                ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-2 text-xs bg-surface-200 dark:bg-surface-700 px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Caractéristiques */}
        {activeTab === "specs" && (
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={copySpecs}
                className="flex items-center gap-2 px-4 py-2 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 rounded-xl transition text-sm font-medium"
              >
                {copied ? <FaClipboardCheck className="text-green-500" /> : <FaClipboard />}
                {copied ? "Copié !" : "Copier"}
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 rounded-xl transition text-sm font-medium"
              >
                <FaShare />
                Partager
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 rounded-xl transition text-sm font-medium"
              >
                <FaPrint />
                Imprimer
              </button>
            </div>

            {/* Specs Table */}
            {product.specs ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <tr key={key} className="hover:bg-surface-100 dark:hover:bg-surface-700/50 transition">
                        <td className="py-4 px-4 text-sm font-semibold text-surface-700 dark:text-surface-300 flex items-center gap-2">
                          <span className="text-brand-500 dark:text-brand-400">
                            {getSpecIcon(key)}
                          </span>
                          {getSpecLabel(key)}
                        </td>
                        <td className="py-4 px-4 text-sm text-surface-900 dark:text-white">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-surface-500 dark:text-surface-400 text-center py-8">
                Aucune caractéristique disponible
              </p>
            )}
          </div>
        )}

        {/* Description */}
        {activeTab === "description" && (
          <div className="prose dark:prose-invert max-w-none">
            {product.description ? (
              <p className="text-surface-700 dark:text-surface-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            ) : (
              <p className="text-surface-500 dark:text-surface-400 text-center py-8">
                Aucune description disponible
              </p>
            )}
          </div>
        )}

        {/* Avis */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            {product.rating?.count > 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl font-bold text-brand-600 dark:text-brand-400 mb-2">
                  {product.rating.average.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-2xl ${i < Math.floor(product.rating.average) ? 'text-yellow-400' : 'text-surface-300 dark:text-surface-600'}`}>
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-surface-600 dark:text-surface-400">
                  Basé sur {product.rating.count} avis
                </p>
              </div>
            ) : (
              <p className="text-surface-500 dark:text-surface-400 text-center py-8">
                Aucun avis pour le moment. Soyez le premier à donner votre avis !
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSpecs;
