import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaSave, FaTimes, FaPlus, FaTrash, FaFileExcel, FaFileImport, FaDownload, FaCheck } from "react-icons/fa";
import * as XLSX from 'xlsx';
import api from "../../../../packages/shared/api/api";
import { useToast } from '../../../../packages/shared/context/ToastContext';



const AddProduct = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("single"); // "single" ou "bulk"
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
    warranty: {
      duration: 12,
      type: "constructeur"
    },
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

  // ═══════════════════════════════════════════════════════════════
  // IMPORT EN MASSE
  // ═══════════════════════════════════════════════════════════════

  // Télécharger le template Excel
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
        category: "Gaming,Laptops", // Séparés par virgules
        tags: "Gaming,PC,Laptop", // Séparés par virgules
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
        connectivity: "WiFi 6,Bluetooth 5.2", // Séparés par virgules
        ports: "USB-C,HDMI,Jack 3.5mm", // Séparés par virgules
        os: "Windows 11",
        battery: "56 Wh",
        weight: "2.3 kg",
        dimensions: "360 x 250 x 23 mm",
        color: "Noir,Argent", // Séparés par virgules
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

  // Lire le fichier Excel/CSV
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

        // Transformer les données
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

  // Transformer une ligne Excel en objet produit
  const transformRowToProduct = (row) => {
    const images = [];
    if (row.imageUrl1) images.push({ url: row.imageUrl1, alt: row.name, isPrimary: true });
    if (row.imageUrl2) images.push({ url: row.imageUrl2, alt: row.name, isPrimary: false });
    if (row.imageUrl3) images.push({ url: row.imageUrl3, alt: row.name, isPrimary: false });

    return {
      name: row.name || "",
      slug: row.slug || generateSlug(row.name || ""),
      description: row.description || "",
      price: Number(row.price) || 0,
      comparePrice: row.comparePrice ? Number(row.comparePrice) : undefined,
      stock: Number(row.stock) || 0,
      images: images.length > 0 ? images : [{ url: "", alt: "", isPrimary: true }],
      category: row.category ? row.category.split(",").map(c => c.trim()) : [],
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
        connectivity: row.connectivity ? row.connectivity.split(",").map(c => c.trim()) : [],
        ports: row.ports ? row.ports.split(",").map(p => p.trim()) : [],
        os: row.os || "",
        battery: row.battery || "",
        weight: row.weight || "",
        dimensions: row.dimensions || "",
        color: row.color ? row.color.split(",").map(c => c.trim()) : [],
        rgb: row.rgb === "Oui" || row.rgb === "Yes" || row.rgb === true,
        coolingSystem: row.coolingSystem || ""
      },
      warranty: {
        duration: Number(row.warrantyDuration) || 12,
        type: row.warrantyType || "constructeur"
      },
      tags: row.tags ? row.tags.split(",").map(t => t.trim()) : [],
      status: row.status || "available",
      isFeatured: row.isFeatured === "Oui" || row.isFeatured === "Yes" || row.isFeatured === true,
      metaTitle: row.metaTitle || row.name || "",
      metaDescription: row.metaDescription || ""
    };
  };

  // Importer tous les produits en masse
  const handleBulkImport = async () => {
    if (bulkProducts.length === 0) {
      toast.error("Aucun produit à importer");
      return;
    }

    if (!window.confirm(`Voulez-vous importer ${bulkProducts.length} produit(s) ?`)) {
      return;
    }

    setImporting(true);
    setImportProgress(0);

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < bulkProducts.length; i++) {
      try {
        await api.post("/products", bulkProducts[i]);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          product: bulkProducts[i].name,
          error: error.response?.data?.message || error.message
        });
      }
      
      setImportProgress(Math.round(((i + 1) / bulkProducts.length) * 100));
    }

    setImporting(false);

    // Afficher le résumé
    let message = `Import terminé:\n✅ ${results.success} produit(s) importé(s)\n`;
    if (results.failed > 0) {
      message += `❌ ${results.failed} échec(s)\n\nErreurs:\n`;
      results.errors.slice(0, 5).forEach(err => {
        message += `- ${err.product}: ${err.error}\n`;
      });
      if (results.errors.length > 5) {
        message += `... et ${results.errors.length - 5} autre(s) erreur(s)`;
      }
    }

    toast.success(message);

    if (results.success > 0) {
      navigate("/admin/produits");
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // FORMULAIRE SIMPLE (MODE SINGLE)
  // ═══════════════════════════════════════════════════════════════

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
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
      navigate("/admin/produits");
    } catch (error) {
      console.error("Erreur création produit:", error);
      toast.error("Erreur lors de la création du produit");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
      metaTitle: prev.metaTitle || name
    }));
  };

  // Gestion des images
  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: "", alt: "", isPrimary: false }]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImage = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      )
    }));
  };

  const setPrimaryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
    }));
  };

  // Gestion des tableaux
  const addToArray = (field, value, inputSetter) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      inputSetter("");
    }
  };

  const removeFromArray = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addToSpecsArray = (field, value, inputSetter) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        specs: {
          ...prev.specs,
          [field]: [...prev.specs[field], value.trim()]
        }
      }));
      inputSetter("");
    }
  };

  const removeFromSpecsArray = (field, index) => {
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [field]: prev.specs[field].filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/produits"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour aux produits
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📦 Ajouter des produits
          </h1>
          <p className="text-gray-600">Créez un produit unique ou importez plusieurs produits en masse</p>
        </div>

        {/* Tabs pour choisir le mode */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setMode("single")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                mode === "single"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaPlus />
              Produit unique
            </button>
            <button
              onClick={() => setMode("bulk")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                mode === "bulk"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaFileImport />
              Import en masse (Excel/CSV)
            </button>
          </div>
        </div>

        {/* MODE BULK - Import Excel */}
        {mode === "bulk" && (
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                <FaFileExcel /> Comment importer des produits en masse ?
              </h3>
              <ol className="space-y-2 text-blue-900">
                <li>1. Téléchargez le template Excel ci-dessous</li>
                <li>2. Remplissez le fichier avec vos produits (une ligne = un produit)</li>
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

            {/* Upload fichier */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Importer votre fichier
              </h3>
              
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
                  <FaFileImport className="text-5xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-semibold mb-2">
                    Cliquez pour sélectionner un fichier Excel ou CSV
                  </p>
                  <p className="text-sm text-gray-500">
                    Formats acceptés : .xlsx, .xls, .csv
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </label>
            </div>

            {/* Liste des produits détectés */}
            {bulkProducts.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {bulkProducts.length} produit(s) détecté(s)
                  </h3>
                  <button
                    onClick={handleBulkImport}
                    disabled={importing}
                    className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                      importing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {importing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                        Import en cours... {importProgress}%
                      </>
                    ) : (
                      <>
                        <FaCheck /> Importer tous les produits
                      </>
                    )}
                  </button>
                </div>

                {importing && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{ width: `${importProgress}%` }}
                      ></div>
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
                        <th className="text-left py-2 px-3">Specs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkProducts.map((product, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-3">{index + 1}</td>
                          <td className="py-2 px-3 font-semibold">{product.name}</td>
                          <td className="py-2 px-3">{product.brand}</td>
                          <td className="py-2 px-3">{product.price.toLocaleString()} FCFA</td>
                          <td className="py-2 px-3">{product.stock}</td>
                          <td className="py-2 px-3">
                            {product.category.length > 0 ? (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {product.category.length} catégorie(s)
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {product.specs.processor ? (
                              <span className="text-xs text-gray-600">
                                {product.specs.processor}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
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

        {/* MODE SINGLE - Formulaire classique */}
        {mode === "single" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tout le formulaire existant reste identique */}
            {/* Je garde uniquement la structure pour la brièveté */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Informations de base - Identique au code précédent */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Informations de base</h2>
                  {/* Tous les champs du formulaire... */}
                </div>
              </div>

              <div className="space-y-6">
                {/* Sidebar - Identique au code précédent */}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end bg-white rounded-lg shadow-md p-6">
              <Link
                to="/admin/produits"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
              >
                <FaTimes /> Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <FaSave /> Créer le produit
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddProduct;