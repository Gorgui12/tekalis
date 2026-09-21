const Product = require("../models/Product");
const Order = require("../models/Order");
const Settings = require("../models/Settings");
const Category = require("../models/Category");
const { escapeRegex } = require("../utils/regexEscape");

// ===============================================
// services/whatsappAI.js — version Gemini (Google AI)
//
// Adapté de la version Claude pour utiliser l'API Gemini, compatible avec
// un abonnement Google AI Pro (clé API récupérée sur aistudio.google.com,
// connecté avec le même compte que l'abonnement — le quota journalier
// élevé de l'abonnement s'applique alors automatiquement).
//
// Même principe que la version Claude : le modèle ne répond JAMAIS sur un
// prix/stock/commande depuis sa mémoire générale, il doit systématiquement
// appeler un outil qui interroge la vraie base MongoDB.
// ===============================================

const MODEL = process.env.GEMINI_MODEL || "gemini-3-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// ── Définition des outils (format Gemini : functionDeclarations) ────────────
const TOOLS = [
  {
    functionDeclarations: [
      {
        name: "searchProducts",
        description:
          "Recherche des produits dans le catalogue Tekalis par mot-clé, catégorie et/ou fourchette de prix. À utiliser pour toute question sur la disponibilité, le prix, ou une recommandation produit.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Mots-clés de recherche (nom, marque, usage)" },
            category: { type: "string", description: "Slug de catégorie si connu (ex: smartphones, ordinateurs, climatisation)" },
            maxPrice: { type: "number", description: "Budget maximum en FCFA, si mentionné par le client" },
          },
        },
      },
      {
        name: "getProductBySlug",
        description: "Récupère le détail complet d'un produit précis à partir de son slug (obtenu via searchProducts).",
        parameters: {
          type: "object",
          properties: { slug: { type: "string" } },
          required: ["slug"],
        },
      },
      {
        name: "checkOrderStatus",
        description:
          "Vérifie le statut d'une commande à partir de son numéro. Si le client ne donne que son numéro de téléphone, cherche par téléphone de livraison.",
        parameters: {
          type: "object",
          properties: {
            orderNumber: { type: "string" },
            phone: { type: "string" },
          },
        },
      },
      {
        name: "getStoreInfo",
        description: "Renvoie les informations fixes de la boutique : adresse, moyens de paiement, délais de livraison, politique de garantie.",
        parameters: { type: "object", properties: {} },
      },
      {
        name: "escalateToHuman",
        description:
          "Transfère la conversation à un humain. À utiliser dès que : négociation de prix/remise, réclamation ou litige, problème sur un paiement déjà effectué, demande de dimensionnement complet d'une installation solaire, ou toute question où tu n'as pas une réponse fiable à 100% depuis les autres outils. Dans le doute, escalade plutôt que de deviner.",
        parameters: {
          type: "object",
          properties: {
            reason: { type: "string", description: "Résumé court de la raison de l'escalade, à destination de l'équipe humaine" },
          },
          required: ["reason"],
        },
      },
    ],
  },
];

const SYSTEM_PROMPT = `Tu es l'assistant WhatsApp de Tekalis, boutique d'électronique à Fann, Dakar, Sénégal.

TON : direct, honnête, sans jargon marketing. Tu parles comme un vendeur compétent, pas comme un
robot. Français clair, quelques emojis avec modération, jamais de blabla inutile — les gens
écrivent sur WhatsApp pour une réponse rapide.

RÈGLES ABSOLUES :
- Ne donne JAMAIS un prix, un stock ou un statut de commande sans avoir appelé l'outil
  correspondant. Ne réponds jamais "de mémoire".
- Ne négocie jamais un prix et ne promets jamais une remise, un remboursement, ou un délai que tu
  n'as pas vérifié via un outil.
- Si une question sort de ce que tu peux vérifier avec tes outils (réclamation, litige,
  négociation, paiement déjà effectué, dimensionnement complet d'une installation solaire),
  appelle escalateToHuman plutôt que d'improviser.
- Si le client pose la même question sans que tes réponses ne le satisfassent après 2 échanges,
  escalade — ne tourne pas en rond.
- Pour recommander un produit, pose d'abord une question de qualification simple (usage, budget)
  si elle manque, avant de balancer une liste de produits au hasard.
- Reste toujours honnête sur les limites d'un produit (ex: un rafraîchisseur d'air n'est pas un
  climatiseur) plutôt que de survendre pour conclure plus vite.

Quand tu escalades, dis au client en une phrase qu'un membre de l'équipe va prendre le relais,
sans le laisser sans réponse.`;

/**
 * Exécute un outil demandé par le modèle contre les vraies données Mongo.
 * Identique à la version Claude — la logique métier ne dépend pas du
 * fournisseur d'IA, seul le format d'échange autour change.
 */
async function executeTool(name, input) {
  switch (name) {
    case "searchProducts": {
      const filter = { status: "available" };
      if (input.query) {
        const safe = escapeRegex(input.query);
        filter.$or = [
          { name: { $regex: safe, $options: "i" } },
          { brand: { $regex: safe, $options: "i" } },
          { description: { $regex: safe, $options: "i" } },
        ];
      }
      if (input.category) {
        const cat = await Category.findOne({
          slug: String(input.category).toLowerCase().trim(),
          isActive: true,
        });
        if (!cat) {
          return { erreur: `Catégorie « ${input.category} » introuvable` };
        }
        const childIds = await Category.find({ parent: cat._id }).select("_id");
        filter.category = { $in: [cat._id, ...childIds.map((c) => c._id)] };
      }
      if (input.maxPrice) filter.price = { $lte: Number(input.maxPrice) };

      const products = await Product.find(filter)
        .limit(5)
        .select("name slug price stock brand rating")
        .lean();

      return products.map((p) => ({
        nom: p.name,
        slug: p.slug,
        prix_fcfa: p.price,
        stock: p.stock > 0 ? `${p.stock} en stock` : "rupture",
        marque: p.brand,
        note: p.rating?.average || null,
      }));
    }

    case "getProductBySlug": {
      const p = await Product.findOne({ slug: input.slug, status: "available" }).lean();
      if (!p) return { erreur: "Produit introuvable ou non disponible" };
      return {
        nom: p.name,
        prix_fcfa: p.price,
        prix_barre_fcfa: p.comparePrice || null,
        stock: p.stock > 0 ? `${p.stock} en stock` : "rupture",
        marque: p.brand,
        description: p.description,
        garantie_mois: p.warranty?.duration ?? 12,
        note: p.rating?.average || null,
        avis_count: p.rating?.count || 0,
      };
    }

    case "checkOrderStatus": {
      const filter = {};
      if (input.orderNumber) filter.orderNumber = input.orderNumber;
      else if (input.phone) filter.deliveryPhone = input.phone;
      else return { erreur: "Numéro de commande ou téléphone requis" };

      const order = await Order.findOne(filter).sort({ createdAt: -1 }).lean();
      if (!order) return { erreur: "Commande introuvable avec ces informations" };
      return {
        numero: order.orderNumber,
        statut: order.status,
        paye: order.isPaid,
        total_fcfa: order.totalPrice,
        ville_livraison: order.deliveryCity,
        region_livraison: order.deliveryRegion,
      };
    }

    case "getStoreInfo": {
      let settings = {};
      try {
        settings = (await Settings.findById("site_settings").lean()) || {};
      } catch {
        /* repli sur les valeurs fixes ci-dessous si Settings indisponible */
      }
      return {
        adresse: settings.contactAddress || "Fann, Rue 14, Dakar, Sénégal",
        telephone: settings.contactPhone || "+221 78 634 69 46",
        paiement: ["Wave", "Orange Money", "Free Money", "Carte bancaire", "Paiement à la livraison"],
        livraison_dakar: "24 à 48h",
        livraison_regions: "3 à 5 jours",
        garantie_standard_mois: 12,
        produits: "Neufs uniquement, sous emballage d'origine, jamais de reconditionné",
      };
    }

    case "escalateToHuman":
      return { transfere: true };

    default:
      return { erreur: `Outil inconnu: ${name}` };
  }
}

/**
 * Convertit l'historique interne { role, content } vers le format Gemini
 * { role: "user"|"model", parts: [{text}] }.
 */
function toGeminiHistory(history) {
  return history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

/**
 * Traite un message entrant et renvoie la réponse texte à envoyer au client,
 * ainsi qu'un indicateur d'escalade éventuelle. Même signature que la
 * version Claude — routes/whatsappRoutes.js n'a rien à changer.
 *
 * @param {Array<{role: string, content: string}>} history
 * @param {string} userMessage
 * @returns {Promise<{reply: string, escalate: boolean, escalationReason: string|null}>}
 */
async function handleWhatsAppMessage(history, userMessage) {
  const contents = [
    ...toGeminiHistory(history),
    { role: "user", parts: [{ text: userMessage }] },
  ];
  let escalate = false;
  let escalationReason = null;

  const url = `${API_URL}?key=${process.env.GEMINI_API_KEY}`;

  for (let turn = 0; turn < 5; turn++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        tools: TOOLS,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ Erreur API Gemini:", res.status, errText);
      return {
        reply: "Désolé, je rencontre un souci technique. Un membre de l'équipe va vous répondre sous peu 🙏",
        escalate: true,
        escalationReason: "Erreur technique API IA",
      };
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    const functionCalls = parts.filter((p) => p.functionCall);
    const textParts = parts.filter((p) => p.text);

    if (functionCalls.length === 0) {
      const reply = textParts.map((p) => p.text).join("\n").trim();
      return { reply, escalate, escalationReason };
    }

    // Le modèle a appelé un ou plusieurs outils : on ajoute son tour à
    // l'historique, on exécute les outils, puis on relance avec les résultats.
    contents.push({ role: "model", parts });

    const functionResponseParts = [];
    for (const call of functionCalls) {
      const { name, args } = call.functionCall;
      if (name === "escalateToHuman") {
        escalate = true;
        escalationReason = args?.reason || "Non précisé";
      }
      const result = await executeTool(name, args || {});
      functionResponseParts.push({
        functionResponse: { name, response: { result } },
      });
    }
    contents.push({ role: "user", parts: functionResponseParts });
  }

  return {
    reply: "Je vous mets en relation avec un membre de l'équipe pour finaliser ça 🙏",
    escalate: true,
    escalationReason: "Boucle d'outils non résolue après 5 tours",
  };
}

module.exports = { handleWhatsAppMessage };
