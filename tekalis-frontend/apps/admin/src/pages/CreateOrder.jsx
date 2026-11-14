import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBox,
  FaPlus,
  FaSave,
  FaSearch,
  FaTimes,
  FaTrash,
  FaUser
} from "react-icons/fa";
import api from "@shared/api/api";
import { useToast } from "@shared/context/ToastContext";

const PAYMENT_METHODS = [
  { value: "cash", label: "Paiement à la livraison" },
  { value: "wave", label: "Wave" },
  { value: "om", label: "Orange Money" },
  { value: "card", label: "Carte bancaire" },
  { value: "online", label: "Paiement en ligne" },
  { value: "free", label: "Gratuit" }
];

const STATUSES = [
  { value: "pending", label: "En attente" },
  { value: "processing", label: "En traitement" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" }
];

const getImage = (product) => {
  const image = product?.images?.[0];
  return typeof image === "string" ? image : image?.url || "";
};

const CreateOrder = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [customerMode, setCustomerMode] = useState("guest");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState([]);

  const [catalog, setCatalog] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [items, setItems] = useState([]);

  const [form, setForm] = useState({
    deliveryName: "",
    deliveryPhone: "",
    deliveryEmail: "",
    deliveryAddress: "",
    deliveryCity: "Dakar",
    deliveryRegion: "Dakar",
    paymentMethod: "cash",
    status: "pending",
    isPaid: false,
    promoCode: ""
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, productsRes] = await Promise.all([
          api.get("/admin/users", { params: { limit: 100 } }),
          api.get("/admin/products", { params: { limit: 200 } })
        ]);

        setUsers(
          Array.isArray(usersRes.data)
            ? usersRes.data
            : usersRes.data.users || []
        );
        setCatalog(
          Array.isArray(productsRes.data)
            ? productsRes.data
            : productsRes.data.data || productsRes.data.products || []
        );
      } catch (error) {
        console.error("Erreur chargement données:", error);
        toast.error("Erreur lors du chargement des clients et produits");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const selectUser = (user) => {
    setSelectedUserId(user._id);
    setForm((prev) => ({
      ...prev,
      deliveryName: user.name || prev.deliveryName,
      deliveryPhone: user.phone || prev.deliveryPhone,
      deliveryEmail: user.email || prev.deliveryEmail
    }));
  };

  const switchMode = (mode) => {
    setCustomerMode(mode);
    if (mode === "guest") {
      setSelectedUserId("");
    }
  };

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return users.slice(0, 8);
    return users
      .filter(
        (user) =>
          user.name?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term)
      )
      .slice(0, 8);
  }, [users, userSearch]);

  const filteredCatalog = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    const source = term
      ? catalog.filter(
          (product) =>
            product.name?.toLowerCase().includes(term) ||
            product.brand?.toLowerCase().includes(term)
        )
      : catalog;
    return source.slice(0, 12);
  }, [catalog, productSearch]);

  const addProduct = (product) => {
    if (product.stock <= 0) {
      toast.error("Ce produit est en rupture de stock");
      return;
    }
    setItems((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error(`Stock maximum atteint pour "${product.name}"`);
          return prev;
        }
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.product._id !== productId) return item;
        const next = Math.min(
          Math.max(1, Number(quantity) || 1),
          item.product.stock || 1
        );
        return { ...item, quantity: next };
      })
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product.price || 0) * item.quantity,
    0
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (customerMode === "user" && !selectedUserId) {
      toast.error("Sélectionnez un client ou passez en commande invité");
      return;
    }
    if (!form.deliveryName.trim() || !form.deliveryPhone.trim() || !form.deliveryAddress.trim()) {
      toast.error("Le nom, le téléphone et l'adresse de livraison sont requis");
      return;
    }
    if (items.length === 0) {
      toast.error("Ajoutez au moins un produit");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: customerMode === "user" ? selectedUserId : null,
        deliveryName: form.deliveryName.trim(),
        deliveryPhone: form.deliveryPhone.trim(),
        deliveryEmail: form.deliveryEmail.trim() || undefined,
        deliveryAddress: form.deliveryAddress.trim(),
        deliveryCity: form.deliveryCity.trim() || "Dakar",
        deliveryRegion: form.deliveryRegion.trim() || "Dakar",
        paymentMethod: form.paymentMethod,
        status: form.status,
        isPaid: form.isPaid,
        promoCode: form.promoCode.trim() || undefined,
        products: items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity
        }))
      };

      const { data } = await api.post("/admin/orders", payload);
      toast.success("Commande créée avec succès");
      navigate(`/orders/${data.order?._id}`);
    } catch (error) {
      console.error("Erreur création commande:", error);
      const message =
        error.response?.data?.errors?.join(", ") ||
        error.response?.data?.message ||
        "Erreur lors de la création de la commande";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <Link
            to="/orders"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-flex items-center gap-2"
          >
            <FaArrowLeft /> Retour aux commandes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nouvelle commande manuelle
          </h1>
          <p className="text-gray-600">
            Créez une commande au nom d'un client existant ou d'un client sans compte.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser /> Client
              </h2>

              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => switchMode("guest")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    customerMode === "guest"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Client invité
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("user")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    customerMode === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Client existant
                </button>
              </div>

              {customerMode === "user" && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rechercher un client
                  </label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Nom ou email..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mt-2 border rounded-lg divide-y max-h-56 overflow-y-auto">
                    {filteredUsers.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-gray-500">
                        Aucun client trouvé
                      </p>
                    ) : (
                      filteredUsers.map((user) => (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => selectUser(user)}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                            selectedUserId === user._id ? "bg-blue-50" : ""
                          }`}
                        >
                          <p className="text-sm font-semibold text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </button>
                      ))
                    )}
                  </div>

                  {selectedUserId && (
                    <p className="mt-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
                      Client sélectionné :{" "}
                      <strong>{form.deliveryName || "—"}</strong>
                      {form.deliveryEmail ? ` (${form.deliveryEmail})` : ""}
                    </p>
                  )}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={form.deliveryName}
                    onChange={(e) => updateForm("deliveryName", e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={form.deliveryPhone}
                    onChange={(e) => updateForm("deliveryPhone", e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.deliveryEmail}
                    onChange={(e) => updateForm("deliveryEmail", e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse de livraison *
                  </label>
                  <input
                    type="text"
                    value={form.deliveryAddress}
                    onChange={(e) => updateForm("deliveryAddress", e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={form.deliveryCity}
                    onChange={(e) => updateForm("deliveryCity", e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Région
                  </label>
                  <input
                    type="text"
                    value={form.deliveryRegion}
                    onChange={(e) => updateForm("deliveryRegion", e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaBox /> Produits
              </h2>

              <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Rechercher un produit par nom ou marque..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto mb-6">
                {filteredCatalog.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-500">
                    Aucun produit trouvé
                  </p>
                ) : (
                  filteredCatalog.map((product) => {
                    const image = getImage(product);
                    const disabled = product.stock <= 0;
                    return (
                      <div
                        key={product._id}
                        className="flex items-center gap-3 px-4 py-2"
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                            <FaBox />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(product.price || 0).toLocaleString()} FCFA · Stock:{" "}
                            {product.stock}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addProduct(product)}
                          disabled={disabled}
                          className="text-blue-600 hover:text-blue-700 p-2 disabled:text-gray-300 disabled:cursor-not-allowed"
                          title="Ajouter"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <h3 className="font-semibold text-gray-900 mb-3">
                Articles de la commande ({items.length})
              </h3>

              {items.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aucun article ajouté pour le moment.
                </p>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product._id}
                      className="flex items-center gap-3 pb-3 border-b last:border-b-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(item.product.price || 0).toLocaleString()} FCFA / unité
                        </p>
                      </div>
                      <input
                        type="number"
                        min="1"
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.product._id, e.target.value)
                        }
                        className="w-20 px-2 py-1 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="w-28 text-right text-sm font-bold text-gray-900">
                        {(
                          (item.product.price || 0) * item.quantity
                        ).toLocaleString()}{" "}
                        FCFA
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.product._id)}
                        className="text-red-600 hover:text-red-700 p-2"
                        title="Retirer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Paiement & statut
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mode de paiement
                  </label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => updateForm("paymentMethod", e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Statut de la commande
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => updateForm("status", e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isPaid}
                    onChange={(e) => updateForm("isPaid", e.target.checked)}
                    className="rounded"
                  />
                  Commande déjà payée
                </label>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Code promo
                  </label>
                  <input
                    type="text"
                    value={form.promoCode}
                    onChange={(e) => updateForm("promoCode", e.target.value)}
                    placeholder="Optionnel"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Récapitulatif</h2>

              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{subtotal.toLocaleString()} FCFA</span>
                </div>
                <p className="text-xs text-gray-500">
                  Les frais de livraison et le total final sont calculés
                  automatiquement par le serveur.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <FaSave />
                )}
                {submitting ? "Création..." : "Créer la commande"}
              </button>

              <Link
                to="/orders"
                className="mt-3 w-full bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-semibold border flex items-center justify-center gap-2"
              >
                <FaTimes /> Annuler
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;
