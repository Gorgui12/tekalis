import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaSave, FaTimes, FaPlus, FaTrash,
  FaFileExcel, FaFileImport, FaDownload, FaCheck,
  FaStar
} from "react-icons/fa";
import * as XLSX from 'xlsx';
import api from "../../../../packages/shared/api/api";
import { useToast } from '../../../../packages/shared/context/ToastContext';

const AddProduct = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("single");
  const [bulkProducts, setBulkProducts] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    comparePrice: "",
    stock: "",
    images: [{ url: "", alt: "", isPrimary: true }],
    category: [],
    brand: "",
    specs: {
      processor: "",
      processorBrand: "",
      processorGeneration: "",
      ram: "",
      ramType: "",
      storage: "",
      storageType: "",
      screen: "",
      screenTech: "",
      refreshRate: "",
      graphics: "",
      graphicsMemory: "",
      connectivity: [],
      ports: [],
      os: "",
      battery: "",
      weight: "",
      dimensions: "",
      color: [],
      camera: "",
      frontCamera: "",
      batteryCapacity: "",
      rgb: false,
      coolingSystem: ""
    },
    warranty: { duration: 12, type: "constructeur" },
    tags: [],
    status: "available",
    isFeatured: false,
    metaTitle: "",
    metaDescription: ""
  });

  const [tagInput, setTagInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [connectivityInput, setConnectivityInput] = useState("");
  const [portInput, setPortInput] = useState("");
  const [colorInput, setColorInput] = useState("");

  // ══════════════════════════════════════════════════════════════
  // UTILITAIRES
  // ══════════════════════════════════════════════════════════════

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + Date.now(); // suffixe pour garantir l'unicité
  };

  // ══════════════════════════════════════════════════════════════
  // IMPORT EN MASSE
  // ══════════════════════════════════════════════════════════════

  const downloadTemplate = () => {
    const template = [
      {
        name: "HP Pavilion Gaming 15",
        slug: "hp-pavilion-gaming-15",
        description: "PC portable gaming puissant avec RTX 3060",
        price: 850000,
        comparePrice: 950000,
        stock: 10,
        brand: "HP",
        category: "Gaming,Laptops",
        tags: "Gaming,PC,Laptop",
        imageUrl1: "https://example.com/image1.jpg",
        imageUrl2: "https://example.com/image2.jpg",
        imageUrl3: "",
        processor: "Intel Core i7-12700H",
        processorBrand: "Intel",
        processorGeneration: "12ème Gen",
        ram: "16 GB",
        ramType: "DDR4",
        storage: "512 GB",
        storageType: "NVMe",
        screen: "15.6 pouces",
        screenTech: "IPS",
        refreshRate: "144Hz",
        graphics: "NVIDIA RTX 3060",
        graphicsMemory: "6 GB GDDR6",
        connectivity: "WiFi 6,Bluetooth 5.2",
        ports: "USB-C,HDMI,Jack 3.5mm",
        os: "Windows 11",
        battery: "56 Wh",
        weight: "2.3 kg",
        dimensions: "360 x 250 x 23 mm",
        color: "Noir,Argent",
        rgb: "Oui",
        coolingSystem: "Dual Fan",
        warrantyDuration: 12,
        warrantyType: "constructeur",
        status: "available",
        isFeatured: "Non",
        metaTitle: "HP Pavilion Gaming 15 - PC Portable Gaming",
        metaDescription: "Découvrez le HP Pavilion Gaming 15 avec RTX 3060"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produits");
    XLSX.writeFile(wb, "template_produits_tekalis.xlsx");
  };

  const transformRowToProduct = (row) => {
    const images = [];
    if (row.imageUrl1?.trim()) images.push({ url: row.imageUrl1.trim(), alt: row.name || "", isPrimary: true });
    if (row.imageUrl2?.trim()) images.push({ url: row.imageUrl2.trim(), alt: row.name || "", isPrimary: false });
    if (row.imageUrl3?.trim()) images.push({ url: row.imageUrl3.trim(), alt: row.name || "", isPrimary: false });

    return {
      name: row.name || "",
      // slug unique : timestamp suffix évite les doublons
      slug: row.slug
        ? `${row.slug}-${Date.now()}`
        : generateSlug(row.name || "produit"),
      description: row.description || "",
      price: Number(row.price) || 0,
      comparePrice: row.comparePrice ? Number(row.comparePrice) : undefined,
      stock: Number(row.stock) || 0,
      // ✅ Ne jamais envoyer d'image avec url vide
      images,
      // ✅ Envoyer les noms de catégories en strings — le backend les résout en ObjectId
      category: row.category
        ? row.category.split(",").map(c => c.trim()).filter(Boolean)
        : [],
      brand: row.brand || "",
      specs: {
        processor: row.processor || "",
        processorBrand: row.processorBrand || "",
        processorGeneration: row.processorGeneration || "",
        ram: row.ram || "",
        ramType: row.ramType || "",
        storage: row.storage || "",
        storageType: row.storageType || "",
        screen: row.screen || "",
        screenTech: row.screenTech || "",
        refreshRate: row.refreshRate || "",
        graphics: row.graphics || "",
        graphicsMemory: row.graphicsMemory || "",
        connectivity: row.connectivity
          ? row.connectivity.split(",").map(c => c.trim()).filter(Boolean)
          : [],
        ports: row.ports
          ? row.ports.split(",").map(p => p.trim()).filter(Boolean)
          : [],
        os: row.os || "",
        battery: row.battery || "",
        weight: row.weight || "",
        dimensions: row.dimensions || "",
        color: row.color
          ? row.color.split(",").map(c => c.trim()).filter(Boolean)
          : [],
        rgb: row.rgb === "Oui" || row.rgb === "Yes" || row.rgb === true,
        coolingSystem: row.coolingSystem || ""
      },
      warranty: {
        duration: Number(row.warrantyDuration) || 12,
        type: row.warrantyType || "constructeur"
      },
      tags: row.tags
        ? row.tags.split(",").map(t => t.trim()).filter(Boolean)
        : [],
      status: row.status || "available",
      isFeatured: row.isFeatured === "Oui" || row.isFeatured === "Yes" || row.isFeatured === true,
      metaTitle: row.metaTitle || row.name || "",
      metaDescription: row.metaDescription || ""
    };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const products = jsonData.map(row => transformRowToProduct(row));
        setBulkProducts(products);
        toast.success(`${products.length} produit(s) chargé(s) depuis le fichier`);
      } catch (error) {
        console.error("Erreur lecture fichier:", error);
        toast.error("Erreur lors de la lecture du fichier");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ✅ Un seul appel API /products/bulk au lieu de N appels en boucle
  const handleBulkImport = async () => {
    if (bulkProducts.length === 0) {
      toast.error("Aucun produit à importer");
      return;
    }
    if (!window.confirm(`Voulez-vous importer ${bulkProducts.length} produit(s) ?`)) return;

    setImporting(true);
    setImportProgress(10);

    try {
      const response = await api.post("/products/bulk", { products: bulkProducts });
      setImportProgress(100);

      const { summary, results } = response.data;

      if (summary.imported > 0) {
        toast.success(`✅ ${summary.imported} produit(s) importé(s) avec succès !`);
      }
      if (summary.failed > 0) {
        const errDetails = results.failed.slice(0, 3).map(e => `${e.name}: ${e.error}`).join("\n");
        toast.error(`❌ ${summary.failed} échec(s) :\n${errDetails}`);
      }

      if (summary.imported > 0) {
        setTimeout(() => navigate("/products"), 1500);
      }
    } catch (error) {
      console.error("Erreur bulk import:", error);
      toast.error(error.response?.data?.message || "Erreur lors de l'import");
    } finally {
      setImporting(false);
      setImportProgress(0);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // FORMULAIRE SIMPLE
  // ══════════════════════════════════════════════════════════════

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filtrer les images vides
      const images = formData.images.filter(img => img.url.trim() !== "");

      const payload = {
        ...formData,
        images,
        price: Number(formData.price),
        comparePrice: formData.comparePrice ? Number(formData.comparePrice) : undefined,
        stock: Number(formData.stock),
        warranty: {
          duration: Number(formData.warranty.duration),
          type: formData.warranty.type
        }
      };

      await api.post("/products", payload);
      toast.success("Produit créé avec succès !");
      navigate("/products");
    } catch (error) {
      console.error("Erreur création produit:", error);
      const msg = error.response?.data?.message || "Erreur lors de la création du produit";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (name) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      metaTitle: prev.metaTitle || name
    }));
  };

  // Gestion images
  const addImage = () => setFormData(prev => ({
    ...prev,
    images: [...prev.images, { url: "", alt: "", isPrimary: false }]
  }));

  const removeImage = (index) => setFormData(prev => ({
    ...prev,
    images: prev.images.filter((_, i) => i !== index)
  }));

  const updateImage = (index, field, value) => setFormData(prev => ({
    ...prev,
    images: prev.images.map((img, i) => i === index ? { ...img, [field]: value } : img)
  }));

  const setPrimaryImage = (index) => setFormData(prev => ({
    ...prev,
    images: prev.images.map((img, i) => ({ ...img, isPrimary: i === index }))
  }));

  // Gestion tableaux
  const addToArray = (field, value, inputSetter) => {
    if (!value.trim()) return;
    setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
    inputSetter("");
  };

  const removeFromArray = (field, index) => setFormData(prev => ({
    ...prev,
    [field]: prev[field].filter((_, i) => i !== index)
  }));

  const addToSpecsArray = (field, value, inputSetter) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      specs: { ...prev.specs, [field]: [...prev.specs[field], value.trim()] }
    }));
    inputSetter("");
  };

  const removeFromSpecsArray = (field, index) => setFormData(prev => ({
    ...prev,
    specs: { ...prev.specs, [field]: prev.specs[field].filter((_, i) => i !== index) }
  }));

  const handleSpecChange = (field, value) => setFormData(prev => ({
    ...prev,
    specs: { ...prev.specs, [field]: value }
  }));

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <Link to="/products" className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block">
            ← Retour aux produits
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 Ajouter des produits</h1>
          <p className="text-gray-600">Créez un produit unique ou importez plusieurs produits en masse</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setMode("single")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                mode === "single" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaPlus /> Produit unique
            </button>
            <button
              onClick={() => setMode("bulk")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                mode === "bulk" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaFileImport /> Import en masse (Excel/CSV)
            </button>
          </div>
        </div>

        {/* ── MODE BULK ─────────────────────────────────────────── */}
        {mode === "bulk" && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                <FaFileExcel /> Comment importer des produits en masse ?
              </h3>
              <ol className="space-y-2 text-blue-900 list-none">
                <li>1. Téléchargez le template Excel ci-dessous</li>
                <li>2. Remplissez-le (une ligne = un produit)</li>
                <li>3. Importez le fichier rempli</li>
                <li>4. Vérifiez les produits détectés</li>
                <li>5. Cliquez sur "Importer tous les produits"</li>
              </ol>
              <button
                onClick={downloadTemplate}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
              >
                <FaDownload /> Télécharger le template Excel
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Importer votre fichier</h3>
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
                  <FaFileImport className="text-5xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-semibold mb-2">Cliquez pour sélectionner un fichier Excel ou CSV</p>
                  <p className="text-sm text-gray-500">Formats acceptés : .xlsx, .xls, .csv</p>
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
                </div>
              </label>
            </div>

            {bulkProducts.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{bulkProducts.length} produit(s) détecté(s)</h3>
                  <button
                    onClick={handleBulkImport}
                    disabled={importing}
                    className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${importing ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {importing ? (
                      <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" /> Import en cours... {importProgress}%</>
                    ) : (
                      <><FaCheck /> Importer tous les produits</>
                    )}
                  </button>
                </div>

                {importing && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${importProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-3">#</th>
                        <th className="text-left py-2 px-3">Nom</th>
                        <th className="text-left py-2 px-3">Marque</th>
                        <th className="text-left py-2 px-3">Prix</th>
                        <th className="text-left py-2 px-3">Stock</th>
                        <th className="text-left py-2 px-3">Catégories</th>
                        <th className="text-left py-2 px-3">Images</th>
                        <th className="text-left py-2 px-3">Specs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkProducts.map((product, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-3 text-gray-500">{index + 1}</td>
                          <td className="py-2 px-3 font-semibold">{product.name}</td>
                          <td className="py-2 px-3">{product.brand}</td>
                          <td className="py-2 px-3">{product.price.toLocaleString()} FCFA</td>
                          <td className="py-2 px-3">{product.stock}</td>
                          <td className="py-2 px-3">
                            {product.category.length > 0
                              ? <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{product.category.join(", ")}</span>
                              : <span className="text-gray-400">-</span>}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`text-xs px-2 py-1 rounded ${product.images.length > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                              {product.images.length} image(s)
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            {product.specs.processor
                              ? <span className="text-xs text-gray-600">{product.specs.processor}</span>
                              : <span className="text-gray-400">-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MODE SINGLE ───────────────────────────────────────── */}
        {mode === "single" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">

              {/* ── Colonne principale ── */}
              <div className="lg:col-span-2 space-y-6">

                {/* Informations de base */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Informations de base</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => handleNameChange(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: MacBook Pro 14 pouces M3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="macbook-pro-14-m3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea
                        value={formData.description}
                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        required
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="Description détaillée du produit..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marque *</label>
                        <input
                          type="text"
                          value={formData.brand}
                          onChange={e => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          placeholder="Apple, HP, Samsung..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                        <select
                          value={formData.status}
                          onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="available">Disponible</option>
                          <option value="preorder">Pré-commande</option>
                          <option value="outofstock">Rupture de stock</option>
                          <option value="discontinued">Discontinué</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prix & Stock */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Prix & Stock</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA) *</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        required min="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="850000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix barré (FCFA)</label>
                      <input
                        type="number"
                        value={formData.comparePrice}
                        onChange={e => setFormData(prev => ({ ...prev, comparePrice: e.target.value }))}
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="950000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                        required min="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="10"
                      />
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Images</h2>
                    <button type="button" onClick={addImage} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
                      <FaPlus size={12} /> Ajouter une image
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.images.map((img, index) => (
                      <div key={index} className={`border rounded-lg p-3 ${img.isPrimary ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {img.isPrimary
                            ? <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-medium flex items-center gap-1"><FaStar size={10} /> Principale</span>
                            : <button type="button" onClick={() => setPrimaryImage(index)} className="text-xs text-blue-600 hover:text-blue-700 underline">Définir principale</button>
                          }
                          {formData.images.length > 1 && (
                            <button type="button" onClick={() => removeImage(index)} className="ml-auto text-red-500 hover:text-red-700">
                              <FaTrash size={14} />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="url"
                            value={img.url}
                            onChange={e => updateImage(index, "url", e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="https://..."
                          />
                          <input
                            type="text"
                            value={img.alt}
                            onChange={e => updateImage(index, "alt", e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="Texte alternatif"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spécifications */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Spécifications techniques</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Processeur", field: "processor", placeholder: "Intel Core i7-12700H" },
                      { label: "Marque processeur", field: "processorBrand", placeholder: "Intel / AMD / Apple" },
                      { label: "Génération", field: "processorGeneration", placeholder: "12ème Gen" },
                      { label: "RAM", field: "ram", placeholder: "16 GB" },
                      { label: "Type RAM", field: "ramType", placeholder: "DDR4 / DDR5" },
                      { label: "Stockage", field: "storage", placeholder: "512 GB" },
                      { label: "Type stockage", field: "storageType", placeholder: "SSD / NVMe / HDD" },
                      { label: "Écran", field: "screen", placeholder: "15.6 pouces FHD" },
                      { label: "Technologie écran", field: "screenTech", placeholder: "IPS / OLED / LCD" },
                      { label: "Taux de rafraîchissement", field: "refreshRate", placeholder: "144Hz" },
                      { label: "Carte graphique", field: "graphics", placeholder: "NVIDIA RTX 3060" },
                      { label: "Mémoire GPU", field: "graphicsMemory", placeholder: "6 GB GDDR6" },
                      { label: "Système d'exploitation", field: "os", placeholder: "Windows 11" },
                      { label: "Batterie", field: "battery", placeholder: "56 Wh / 10h" },
                      { label: "Poids", field: "weight", placeholder: "2.3 kg" },
                      { label: "Dimensions", field: "dimensions", placeholder: "360 x 250 x 23 mm" },
                      { label: "Caméra", field: "camera", placeholder: "48 MP" },
                      { label: "Caméra frontale", field: "frontCamera", placeholder: "12 MP" },
                      { label: "Capacité batterie", field: "batteryCapacity", placeholder: "5000 mAh" },
                      { label: "Refroidissement", field: "coolingSystem", placeholder: "Dual Fan" },
                    ].map(({ label, field, placeholder }) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        <input
                          type="text"
                          value={formData.specs[field]}
                          onChange={e => handleSpecChange(field, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                          placeholder={placeholder}
                        />
                      </div>
                    ))}

                    {/* RGB checkbox */}
                    <div className="flex items-center gap-2 col-span-2">
                      <input
                        type="checkbox"
                        id="rgb"
                        checked={formData.specs.rgb}
                        onChange={e => handleSpecChange("rgb", e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="rgb" className="text-sm font-medium text-gray-700">RGB</label>
                    </div>
                  </div>

                  {/* Connectivité */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Connectivité</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={connectivityInput}
                        onChange={e => setConnectivityInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addToSpecsArray("connectivity", connectivityInput, setConnectivityInput))}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="WiFi 6, Bluetooth 5.2..."
                      />
                      <button type="button" onClick={() => addToSpecsArray("connectivity", connectivityInput, setConnectivityInput)} className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-200">
                        <FaPlus size={12} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.specs.connectivity.map((c, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                          {c} <button type="button" onClick={() => removeFromSpecsArray("connectivity", i)} className="text-red-400 hover:text-red-600"><FaTimes size={10} /></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Ports */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ports</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={portInput}
                        onChange={e => setPortInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addToSpecsArray("ports", portInput, setPortInput))}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="USB-C, HDMI, Jack..."
                      />
                      <button type="button" onClick={() => addToSpecsArray("ports", portInput, setPortInput)} className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-200">
                        <FaPlus size={12} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.specs.ports.map((p, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                          {p} <button type="button" onClick={() => removeFromSpecsArray("ports", i)} className="text-red-400 hover:text-red-600"><FaTimes size={10} /></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Couleurs */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Couleurs</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={colorInput}
                        onChange={e => setColorInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addToSpecsArray("color", colorInput, setColorInput))}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="Noir, Argent..."
                      />
                      <button type="button" onClick={() => addToSpecsArray("color", colorInput, setColorInput)} className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-200">
                        <FaPlus size={12} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.specs.color.map((c, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                          {c} <button type="button" onClick={() => removeFromSpecsArray("color", i)} className="text-red-400 hover:text-red-600"><FaTimes size={10} /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SEO */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">SEO</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                      <input
                        type="text"
                        value={formData.metaTitle}
                        onChange={e => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="Titre SEO optimisé"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                      <textarea
                        value={formData.metaDescription}
                        onChange={e => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="Description courte pour les moteurs de recherche..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Sidebar ── */}
              <div className="space-y-6">

                {/* Catégories */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Catégories</h2>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={categoryInput}
                      onChange={e => setCategoryInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addToArray("category", categoryInput, setCategoryInput))}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Gaming, Laptops..."
                    />
                    <button type="button" onClick={() => addToArray("category", categoryInput, setCategoryInput)} className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200">
                      <FaPlus size={12} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.category.map((cat, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm flex items-center gap-1">
                        {cat} <button type="button" onClick={() => removeFromArray("category", i)} className="text-blue-400 hover:text-red-600"><FaTimes size={10} /></button>
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Les catégories sont créées automatiquement si elles n'existent pas encore.</p>
                </div>

                {/* Tags */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Tags</h2>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addToArray("tags", tagInput, setTagInput))}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="gaming, laptop..."
                    />
                    <button type="button" onClick={() => addToArray("tags", tagInput, setTagInput)} className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200">
                      <FaPlus size={12} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, i) => (
                      <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm flex items-center gap-1">
                        #{tag} <button type="button" onClick={() => removeFromArray("tags", i)} className="text-gray-400 hover:text-red-600"><FaTimes size={10} /></button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Garantie */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Garantie</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Durée (mois)</label>
                      <input
                        type="number"
                        value={formData.warranty.duration}
                        onChange={e => setFormData(prev => ({ ...prev, warranty: { ...prev.warranty, duration: e.target.value } }))}
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={formData.warranty.type}
                        onChange={e => setFormData(prev => ({ ...prev, warranty: { ...prev.warranty, type: e.target.value } }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="constructeur">Constructeur</option>
                        <option value="vendeur">Vendeur</option>
                        <option value="etendue">Étendue</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Options</h2>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={e => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Produit mis en avant ⭐</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end bg-white rounded-lg shadow-md p-6">
              <Link
                to="/products"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
              >
                <FaTimes /> Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading
                  ? <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" /> Enregistrement...</>
                  : <><FaSave /> Créer le produit</>
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddProduct;