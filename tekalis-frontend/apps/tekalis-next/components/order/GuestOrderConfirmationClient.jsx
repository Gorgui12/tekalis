"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaTruck,
  FaMapMarkerAlt,
  FaPhone,
} from "react-icons/fa";
import api from "@/lib/api";

const formatFCFA = (value) =>
  `${(Number(value) || 0).toLocaleString("fr-FR")} FCFA`;

/**
 * Confirmation d'une commande passée sans compte.
 *
 * L'accès repose sur le jeton opaque `token` remis par l'API à la création :
 * sans lui, impossible de consulter la commande (l'ObjectId seul est devinable).
 */
export default function GuestOrderConfirmationClient({ orderId, token }) {
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId || !token) {
      setStatus("error");
      setError("Lien de commande incomplet.");
      return;
    }

    let active = true;

    (async () => {
      try {
        const { data } = await api.get(`/orders/guest/${orderId}`, {
          params: { token },
        });
        if (!active) return;
        setOrder(data?.order || data);
        setStatus("success");
      } catch (err) {
        if (!active) return;
        setStatus("error");
        setError(
          err.response?.data?.message ||
            "Impossible de retrouver cette commande."
        );
      }
    })();

    return () => {
      active = false;
    };
  }, [orderId, token]);

  if (status === "loading") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 mt-20">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-brand-500 mx-auto mb-4" />
          <p className="text-surface-600 dark:text-surface-400">
            Chargement de votre commande…
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 mt-20">
        <div className="max-w-md w-full bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="text-4xl text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
            Commande introuvable
          </h1>
          <p className="text-surface-600 dark:text-surface-400 mb-6">{error}</p>
          <Link
            href="/products"
            className="inline-block bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  const items = order?.products || [];
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
    0
  );

  return (
    <div className="container mx-auto px-4 py-8 mt-24 max-w-3xl">
      {/* En-tête de confirmation */}
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaCheckCircle className="text-5xl text-green-600" />
        </div>
        <h1 className="text-3xl font-bold font-display text-surface-900 dark:text-white mb-2">
          Merci pour votre commande !
        </h1>
        <p className="text-surface-600 dark:text-surface-400">
          Votre commande a bien été enregistrée. Nous vous contacterons au{" "}
          <span className="font-semibold">{order.deliveryPhone}</span> pour la
          livraison.
        </p>
        <p className="mt-4 inline-block bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 px-4 py-2 rounded-xl text-sm font-semibold">
          Commande n° {order.orderNumber || order._id}
        </p>
      </div>

      {/* Produits */}
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 mb-6">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">
          Produits commandés
        </h2>
        <div className="space-y-4">
          {items.map((item, index) => {
            const product = item.product || {};
            const images = Array.isArray(product.images) ? product.images : [];
            const imageUrl =
              images.find((img) => img?.isPrimary)?.url ||
              images[0]?.url ||
              "/images/no-image.webp";

            return (
              <div
                key={item._id || index}
                className="flex gap-4 pb-4 border-b border-surface-200 dark:border-surface-700 last:border-0 last:pb-0"
              >
                <img
                  src={imageUrl}
                  alt={product.name || "Produit"}
                  className="w-20 h-20 object-contain rounded border border-surface-200 dark:border-surface-700"
                  onError={(e) => {
                    e.target.src = "/images/no-image.webp";
                  }}
                />
                <div className="flex-1">
                  <p className="font-semibold text-surface-900 dark:text-white">
                    {product.name || "Produit"}
                  </p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    Quantité : {item.quantity}
                  </p>
                  <p className="font-bold text-brand-600 dark:text-brand-400 mt-1">
                    {formatFCFA(item.price)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700 space-y-2 text-sm">
          <div className="flex justify-between text-surface-600 dark:text-surface-400">
            <span>Sous-total</span>
            <span className="font-semibold">{formatFCFA(subtotal)}</span>
          </div>
          <div className="flex justify-between text-surface-600 dark:text-surface-400">
            <span>Frais de livraison</span>
            <span className="font-semibold">
              {order.shippingCost ? formatFCFA(order.shippingCost) : "Gratuit"}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold text-surface-900 dark:text-white pt-2 border-t border-surface-200 dark:border-surface-700">
            <span>Total</span>
            <span>{formatFCFA(order.totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Livraison */}
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 mb-6">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
          <FaTruck className="text-brand-500" />
          Livraison
        </h2>
        <div className="space-y-2 text-sm text-surface-700 dark:text-surface-300">
          <p className="flex items-start gap-2">
            <FaMapMarkerAlt className="text-brand-500 mt-1 flex-shrink-0" />
            <span>
              {order.deliveryName}
              <br />
              {order.deliveryAddress}
              {order.deliveryCity ? `, ${order.deliveryCity}` : ""}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <FaPhone className="text-brand-500 flex-shrink-0" />
            {order.deliveryPhone}
          </p>
          <p className="text-surface-600 dark:text-surface-400">
            Paiement à la livraison — préparez{" "}
            <span className="font-semibold">{formatFCFA(order.totalPrice)}</span>{" "}
            en espèces.
          </p>
        </div>
      </div>

      <p className="text-xs text-surface-500 dark:text-surface-400 mb-6">
        Conservez ce lien : il vous permet de revenir sur cette commande. Un
        email de confirmation vous a été envoyé si vous avez renseigné une
        adresse.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/products"
          className="flex-1 text-center bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          Continuer mes achats
        </Link>
        <Link
          href="/register"
          className="flex-1 text-center bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 px-6 py-3 rounded-xl font-semibold transition"
        >
          Créer un compte pour suivre mes commandes
        </Link>
      </div>
    </div>
  );
}
