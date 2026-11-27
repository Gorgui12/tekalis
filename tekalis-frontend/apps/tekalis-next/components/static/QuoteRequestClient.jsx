"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaMinus,
  FaPaperPlane,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import api from "@/lib/api";
import { useToast } from "@/components/shared/ToastProvider";
import Button from "@/components/shared/Button";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { SHIPPING } from "@/lib/utils/constants";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const FILE_ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.csv,.txt";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatPrice = (value) =>
  `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;

const emptyForm = {
  company: "",
  name: "",
  email: "",
  phone: "",
  message: "",
};

export default function QuoteRequestClient() {
  const toast = useToast();

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    let active = true;

    api
      .get("/products?limit=100&fields=_id,name,slug,price,brand,images")
      .then((res) => {
        if (!active) return;
        const products = Array.isArray(res.data?.products)
          ? res.data.products
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
        setCatalog(products);
        setCatalogError(products.length === 0);
      })
      .catch(() => {
        if (active) setCatalogError(true);
      })
      .finally(() => {
        if (active) setCatalogLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return catalog;
    return catalog.filter((product) =>
      `${product.name || ""} ${product.brand || ""}`.toLowerCase().includes(query)
    );
  }, [catalog, search]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.price || 0) * item.quantity,
        0
      ),
    [items]
  );
  const shipping =
    subtotal < SHIPPING.FREE_SHIPPING_THRESHOLD
      ? SHIPPING.STANDARD_SHIPPING_COST
      : 0;
  const total = subtotal + shipping;

  const inputClasses = (field) =>
    `w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition text-surface-900 dark:text-white dark:bg-surface-800 ${
      errors[field]
        ? "border-red-400 focus:ring-red-400 bg-red-50 dark:bg-red-900/20"
        : "border-surface-300 dark:border-surface-600 focus:ring-brand-500 bg-white dark:bg-surface-800"
    }`;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const addProduct = (product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    if (errors.items) {
      setErrors((prev) => ({ ...prev, items: undefined }));
    }
  };

  const changeQuantity = (id, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item._id !== id));
  };

  const handleFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (selected.length === 0) return;

    if (files.length + selected.length > MAX_FILES) {
      toast.error(`${MAX_FILES} fichiers maximum par demande.`);
      return;
    }

    const tooLarge = selected.find((file) => file.size > MAX_FILE_SIZE);
    if (tooLarge) {
      toast.error(`Le fichier ${tooLarge.name} dépasse 2 Mo.`);
      return;
    }

    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const validate = () => {
    const newErrors = {};
    const message = formData.message.trim();

    if (!formData.company.trim()) {
      newErrors.company = "Le nom de la société est requis";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Votre nom est requis";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Votre email est requis";
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    if (message.length > 2000) {
      newErrors.message = "Message trop long (2000 caractères maximum)";
    } else if (message && message.length < 20) {
      newErrors.message = "Message trop court (20 caractères minimum)";
    }
    if (items.length === 0 && message.length < 20) {
      newErrors.items =
        "Ajoutez au moins un produit ou décrivez votre besoin (20 caractères minimum)";
      if (!newErrors.message) {
        newErrors.message = "Message trop court (20 caractères minimum)";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("company", formData.company.trim());
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("email", formData.email.trim());
      formDataToSend.append("phone", formData.phone.trim());
      formDataToSend.append("message", formData.message.trim());
      formDataToSend.append("source", "web");
      formDataToSend.append(
        "items",
        JSON.stringify(
          items.map((item) => ({ product: item._id, quantity: item.quantity }))
        )
      );
      files.forEach((file) => formDataToSend.append("attachments", file));

      const res = await api.post("/quotes", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setConfirmation({
        quoteNumber: res.data?.quote?.quoteNumber,
        total,
      });
      toast.success("Votre demande de devis a bien été envoyée.");
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      let firstBackendError = null;
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        const first = backendErrors[0];
        firstBackendError =
          typeof first === "string"
            ? first
            : first?.msg || first?.message || null;
      }
      toast.error(
        firstBackendError ||
          err.response?.data?.message ||
          "Erreur lors de l'envoi de la demande de devis. Réessayez."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetRequest = () => {
    setConfirmation(null);
    setFormData(emptyForm);
    setErrors({});
    setItems([]);
    setFiles([]);
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 pt-28 pb-16">
      <div className="container mx-auto px-4">
        <Breadcrumb items={[{ name: "Devis", path: "/devis" }]} />

        <div className="text-center mb-12 mt-4">
          <h2 className="text-4xl md:text-5xl font-bold text-surface-900 dark:text-white mb-4 font-display">
            Demande de devis
          </h2>
          <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
            Un projet informatique ou solaire ? Sélectionnez vos produits, ajoutez
            vos pièces jointes et recevez une estimation personnalisée. Livraison
            partout au Sénégal depuis Dakar.
          </p>
        </div>

        {confirmation ? (
          <div
            className="max-w-2xl mx-auto bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center"
            role="status"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-green-600 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">
              Demande de devis envoyée !
            </h2>
            {confirmation.quoteNumber && (
              <p className="text-sm text-surface-600 dark:text-surface-400 mb-2">
                Référence : <strong>{confirmation.quoteNumber}</strong>
              </p>
            )}
            <p className="text-lg font-semibold text-brand-600 dark:text-brand-400 mb-4">
              Total estimé : {formatPrice(confirmation.total)}
            </p>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-8 max-w-md mx-auto">
              Votre devis PDF vous est envoyé par email. Notre équipe vous répond
              sous 24h ouvrées.
            </p>
            <Button onClick={resetRequest} variant="outline">
              Faire une autre demande
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start"
          >
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6">
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-5">
                  Votre société
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="quote-company"
                      className="block text-sm font-semibold text-surface-900 dark:text-white mb-1.5"
                    >
                      Société <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="quote-company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      placeholder="Nom de votre entreprise"
                      autoComplete="organization"
                      required
                      disabled={loading}
                      className={inputClasses("company")}
                      aria-invalid={!!errors.company}
                    />
                    {errors.company && (
                      <p
                        className="mt-1 text-sm text-red-600 flex items-center gap-1"
                        role="alert"
                      >
                        <FaExclamationCircle size={12} /> {errors.company}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="quote-name"
                      className="block text-sm font-semibold text-surface-900 dark:text-white mb-1.5"
                    >
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="quote-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Ousmane Diallo"
                      autoComplete="name"
                      required
                      disabled={loading}
                      className={inputClasses("name")}
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && (
                      <p
                        className="mt-1 text-sm text-red-600 flex items-center gap-1"
                        role="alert"
                      >
                        <FaExclamationCircle size={12} /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="quote-email"
                      className="block text-sm font-semibold text-surface-900 dark:text-white mb-1.5"
                    >
                      Email professionnel <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="quote-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="achat@entreprise.sn"
                      autoComplete="email"
                      required
                      disabled={loading}
                      className={inputClasses("email")}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                      <p
                        className="mt-1 text-sm text-red-600 flex items-center gap-1"
                        role="alert"
                      >
                        <FaExclamationCircle size={12} /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="quote-phone"
                      className="block text-sm font-semibold text-surface-900 dark:text-white mb-1.5"
                    >
                      Téléphone{" "}
                      <span className="text-surface-400 font-normal">
                        (optionnel)
                      </span>
                    </label>
                    <input
                      id="quote-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="77 123 45 67"
                      autoComplete="tel"
                      disabled={loading}
                      className={inputClasses("phone")}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="quote-message"
                    className="block text-sm font-semibold text-surface-900 dark:text-white mb-1.5"
                  >
                    Message{" "}
                    <span className="text-surface-400 font-normal">
                      (ou produits sélectionnés)
                    </span>
                  </label>
                  <textarea
                    id="quote-message"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder="Décrivez votre besoin, les quantités souhaitées ou vos contraintes..."
                    rows={5}
                    maxLength={2000}
                    disabled={loading}
                    className={inputClasses("message")}
                    aria-invalid={!!errors.message}
                  />
                  <div className="flex items-center justify-between mt-1 gap-3">
                    {errors.message ? (
                      <p
                        className="text-sm text-red-600 flex items-center gap-1"
                        role="alert"
                      >
                        <FaExclamationCircle size={12} /> {errors.message}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span
                      className={`text-xs shrink-0 ${
                        formData.message.length < 20
                          ? "text-surface-400"
                          : "text-green-600"
                      }`}
                    >
                      {formData.message.length} / 2000
                    </span>
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                    Produits souhaités
                  </h2>
                  {items.length > 0 && (
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                      {items.length} article{items.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="relative mb-3">
                  <label htmlFor="quote-product-search" className="sr-only">
                    Rechercher un produit ou une marque
                  </label>
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    id="quote-product-search"
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un produit ou une marque..."
                    disabled={loading}
                    className={`${inputClasses("items")} pl-10`}
                    aria-invalid={!!errors.items}
                  />
                </div>

                {catalogError && (
                  <p
                    className="mb-3 text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2"
                    role="status"
                  >
                    <FaExclamationCircle className="mt-0.5 shrink-0" />
                    Catalogue indisponible — décrivez votre besoin dans le message
                  </p>
                )}
                {catalogLoading && (
                  <p className="mb-3 text-sm text-surface-500 dark:text-surface-400">
                    Chargement du catalogue…
                  </p>
                )}
                {!catalogLoading &&
                  !catalogError &&
                  filteredProducts.length === 0 && (
                    <p className="mb-3 text-sm text-surface-500 dark:text-surface-400">
                      Aucun produit ne correspond à votre recherche.
                    </p>
                  )}

                <div className="max-h-72 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-700 rounded-xl border border-surface-200 dark:border-surface-700">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between gap-3 p-3 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">
                          {product.brand ? `${product.brand} · ` : ""}
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addProduct(product)}
                        disabled={loading}
                        aria-label={`Ajouter ${product.name}`}
                        className="w-8 h-8 shrink-0 rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 flex items-center justify-center transition"
                      >
                        <FaPlus size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {errors.items && (
                  <p
                    className="mt-2 text-sm text-red-600 flex items-center gap-1"
                    role="alert"
                  >
                    <FaExclamationCircle size={12} /> {errors.items}
                  </p>
                )}

                {items.length > 0 && (
                  <div className="mt-5 space-y-2">
                    <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
                      Votre sélection
                    </h3>
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-surface-50 dark:bg-surface-900/60 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-surface-500 dark:text-surface-400">
                            {formatPrice(item.price)} ·{" "}
                            {formatPrice(Number(item.price || 0) * item.quantity)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => changeQuantity(item._id, -1)}
                            disabled={item.quantity <= 1 || loading}
                            aria-label={`Diminuer la quantité de ${item.name}`}
                            className="w-7 h-7 rounded-lg border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-700 disabled:opacity-40 flex items-center justify-center transition"
                          >
                            <FaMinus size={11} />
                          </button>
                          <output className="w-6 text-center text-sm font-semibold text-surface-900 dark:text-white">
                            {item.quantity}
                          </output>
                          <button
                            type="button"
                            onClick={() => changeQuantity(item._id, 1)}
                            disabled={loading}
                            aria-label={`Augmenter la quantité de ${item.name}`}
                            className="w-7 h-7 rounded-lg border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-700 disabled:opacity-40 flex items-center justify-center transition"
                          >
                            <FaPlus size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item._id)}
                            disabled={loading}
                            aria-label={`Supprimer ${item.name}`}
                            className="w-7 h-7 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 flex items-center justify-center transition"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6">
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">
                  Pièces jointes
                </h2>
                <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
                  PDF, images, documents ou tableurs — {MAX_FILES} fichiers
                  maximum, 2 Mo par fichier.
                </p>
                <label
                  htmlFor="quote-attachments"
                  className="block text-sm font-semibold text-surface-900 dark:text-white mb-1.5"
                >
                  Ajouter des fichiers
                </label>
                <input
                  id="quote-attachments"
                  type="file"
                  multiple
                  accept={FILE_ACCEPT}
                  onChange={handleFiles}
                  disabled={loading}
                  className="w-full text-sm text-surface-600 dark:text-surface-400 file:mr-4 file:rounded-xl file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-600 disabled:opacity-50"
                />
                {files.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <li
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-xl bg-surface-50 dark:bg-surface-900/60 p-3"
                      >
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-surface-900 dark:text-white">
                          {file.name}
                        </span>
                        <span className="text-xs text-surface-500 dark:text-surface-400 shrink-0">
                          {(file.size / (1024 * 1024)).toFixed(2)} Mo
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          disabled={loading}
                          aria-label={`Retirer ${file.name}`}
                          className="w-7 h-7 shrink-0 rounded-lg text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-700 disabled:opacity-40 flex items-center justify-center transition"
                        >
                          <FaTimes size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <aside className="lg:col-span-1 lg:sticky lg:top-28 space-y-6">
              <section className="bg-brand-50 dark:bg-brand-900/20 rounded-2xl shadow-card border-2 border-brand-500/40 p-6">
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-5">
                  Estimation en temps réel
                </h2>
                <dl className="space-y-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <dt className="text-surface-600 dark:text-surface-400">
                      Sous-total
                    </dt>
                    <dd className="font-semibold text-surface-900 dark:text-white">
                      {formatPrice(subtotal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <dt className="text-surface-600 dark:text-surface-400">
                      Livraison
                    </dt>
                    <dd
                      className={`font-semibold ${
                        shipping === 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-surface-900 dark:text-white"
                      }`}
                    >
                      {shipping === 0 ? "Offerte" : formatPrice(shipping)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-brand-500/30 pt-3">
                    <dt className="font-bold text-surface-900 dark:text-white">
                      Total estimé
                    </dt>
                    <dd className="text-xl font-bold text-brand-600 dark:text-brand-400">
                      {formatPrice(total)}
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs text-surface-600 dark:text-surface-400">
                  Estimation indicative non contractuelle — prix confirmé par
                  notre équipe sous 24h ouvrées.
                </p>
                <p className="mt-1 text-xs text-surface-500 dark:text-surface-500">
                  Validité 30 jours.
                </p>
              </section>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={loading}
                icon={<FaPaperPlane />}
                size="lg"
              >
                Recevoir mon devis par email
              </Button>
              <p className="text-xs text-surface-500 dark:text-surface-400 text-center">
                Vos données servent uniquement à préparer votre devis. Réponse
                sous 24h ouvrées.
              </p>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}
