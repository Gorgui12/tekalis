// ===============================================
// utils/emailTemplates.js
// Templates HTML pour les emails Tekalis
// Rendus inline (compatible Gmail/Outlook), échappement HTML
// systématique des champs utilisateurs/commandes (anti-XSS email).
// ===============================================

const siteName = process.env.SITE_NAME || "Tekalis";
const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
// L'admin est une application Vite séparée, servie depuis son propre host.
// Replier sur frontendUrl n'est correct que si l'admin est montée sous le
// même domaine — d'où la variable dédiée.
const adminUrl = (process.env.ADMIN_URL || frontendUrl).replace(/\/+$/, "");
const contactEmail = process.env.CONTACT_EMAIL || "contact@tekalis.com";
// Doit rester aligné avec le site (tel:+221786346946 dans layout.jsx,
// Footer, pages légales, llms.txt). Un numéro différent dans les emails
// envoie le client vers un service qui ne répond pas.
//
// La valeur vient de STORE_PHONE, donc de PayDunya (qui exige des chiffres
// seuls), mais elle est affichée à un humain : d'où la mise en forme. Sans
// elle, un client reconnaîtrait "221786346946" sur le site et "+221 78 634 69
// 46" dans ses emails, ce qui donne l'impression d'une arnaque.
const displayPhone = (raw) => {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  // Format sénégalais attendu : 221 + 9 chiffres, soit 12 au total.
  // Tout autre format est renvoyé tel quel plutôt que deviné.
  if (digits.length !== 12 || !digits.startsWith("221")) {
    return raw ? String(raw).trim() : "";
  }
  const local = digits.slice(3);
  return `+221 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`;
};

const storePhone = displayPhone(process.env.STORE_PHONE || "221786346946");
const storeAddress = process.env.STORE_ADDRESS || "Dakar, Sénégal";
const NEWSLETTER_CONFIRM_TTL_HOURS = 24;

// ── Routes du site ────────────────────────────────────────────────────────────
// Centralisées : les templates pointaient vers /orders/{id} et /dashboard/sav/{id},
// routes qui n'ont jamais existé. Les boutons « Suivre ma commande » et « Voir ma
// demande » menaient donc à des 404. Les vraies pages sont sous /dashboard.
const routes = {
  orderDetail: (id) => `${frontendUrl}/dashboard/orders/${id}`,
  rmaList: `${frontendUrl}/dashboard/rma`,
  warranties: `${frontendUrl}/dashboard/warranties`,
  adminOrderDetail: (id) => `${adminUrl}/orders/${id}`,
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatFCFA = (n) => (Number(n) || 0).toLocaleString("fr-FR");

const esc = (v) =>
  String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const paymentLabel = (method) => {
  const labels = {
    cash: "💵 Paiement à la livraison",
    online: "🌐 Paiement en ligne",
    wave: "🌊 Wave",
    om: "📱 Orange Money",
    free: "📱 Free Money",
    card: "💳 Carte bancaire",
  };
  return labels[method] || (method ? String(method).toUpperCase() : "À déterminer");
};

// ── Styles communs ────────────────────────────────────────────────────────────
const baseStyle = `
  font-family: Arial, Helvetica, sans-serif;
  color: #1f2937;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  padding: 0;
`;

const btnStyle = `
  display: inline-block;
  padding: 12px 26px;
  background-color: #1E40AF;
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  margin-top: 16px;
`;

const headerHtml = (title) => `
  <div style="background:#1E40AF;background:linear-gradient(135deg,#1E40AF,#1D4ED8);padding:28px 24px;text-align:center;border-radius:12px 12px 0 0">
    <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:0.5px">${esc(siteName)}</h1>
    <p style="color:#BFDBFE;margin:6px 0 0;font-size:14px">${esc(title)}</p>
  </div>
`;

const footerHtml = () => `
  <div style="background:#0F172A;border-radius:0 0 12px 12px;padding:22px 24px;text-align:center">
    <p style="color:#94A3B8;margin:0 0 6px;font-size:13px">
      ${esc(siteName)} • ${esc(storeAddress)}
    </p>
    <p style="color:#94A3B8;margin:0 0 6px;font-size:13px">
      <a href="mailto:${esc(contactEmail)}" style="color:#BFDBFE;text-decoration:none">${esc(contactEmail)}</a>
      ${storePhone ? ` &nbsp;•&nbsp; ${esc(storePhone)}` : ""}
    </p>
    <p style="color:#64748B;margin:12px 0 0;font-size:11px;line-height:1.6">
      Cet email vous est envoyé automatiquement par ${esc(siteName)}.<br>
      ${esc(frontendUrl)}
    </p>
  </div>
`;

// Gabarit commun : document complet + titre + corps.
//
// Le document est fermé (<!DOCTYPE>, <html>, <head>, <body>) et non un simple
// fragment <div> : Outlook et plusieurs passerelles d'entreprise ignorent ou
// massacrent un corps HTML sans balise racine, ce qui donne des emails dont le
// style se perd chez le destinataire. Tout le style est en ligne, ce qui
// reste le seul rendu fiable là-bas.
const layout = (title, contentHtml) => `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(title)} — ${esc(siteName)}</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9">
  <div style="background:#F1F5F9;padding:24px 12px">
    <div style="${baseStyle}">
      ${headerHtml(title)}
      <div style="padding:26px 24px;background:#ffffff;border:1px solid #E2E8F0;border-top:none;border-bottom:none">
        ${contentHtml}
      </div>
      ${footerHtml()}
    </div>
  </div>
</body>
</html>`;

// Bouton CTA
const button = (href, label) => `
  <div style="text-align:center;margin:24px 0 8px">
    <a href="${esc(href)}" style="${btnStyle}">${esc(label)}</a>
  </div>
`;

// Table de produits
const productTable = (products) => {
  const rows = (products || [])
    .map(item => {
      const name = item.product?.name || item.product || "Produit";
      const qty = item.quantity || 1;
      const price = formatFCFA(item.price || 0);
      const lineTotal = formatFCFA((item.price || 0) * qty);
      return `<tr>
        <td style="padding:10px 8px;border-bottom:1px solid #E2E8F0">${esc(name)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #E2E8F0;text-align:center;white-space:nowrap">${qty}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #E2E8F0;text-align:right;white-space:nowrap">${price} FCFA</td>
        <td style="padding:10px 8px;border-bottom:1px solid #E2E8F0;text-align:right;white-space:nowrap"><strong>${lineTotal} FCFA</strong></td>
      </tr>`;
    })
    .join("");
  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead>
        <tr style="background:#F8FAFC">
          <th style="padding:8px;text-align:left;color:#475569">Produit</th>
          <th style="padding:8px;text-align:center;color:#475569">Qté</th>
          <th style="padding:8px;text-align:right;color:#475569">Prix unitaire</th>
          <th style="padding:8px;text-align:right;color:#475569">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
};

// Totaux (sous-total, livraison, total)
const totalsBlock = (order) => {
  const products = order.products || [];
  const subtotal = products.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = order.shippingCost || 0;
  const total = order.totalPrice || subtotal + shipping;
  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:10px">
      <tr>
        <td style="padding:6px 8px;color:#475569">Sous-total</td>
        <td style="padding:6px 8px;text-align:right">${formatFCFA(subtotal)} FCFA</td>
      </tr>
      <tr>
        <td style="padding:6px 8px;color:#475569">Livraison</td>
        <td style="padding:6px 8px;text-align:right">${shipping > 0 ? `${formatFCFA(shipping)} FCFA` : "<em>Offerte</em>"}</td>
      </tr>
      <tr style="background:#F8FAFC">
        <td style="padding:10px 8px;font-weight:bold;color:#1E40AF">Total</td>
        <td style="padding:10px 8px;text-align:right;font-weight:bold;color:#1E40AF;font-size:16px">${formatFCFA(total)} FCFA</td>
      </tr>
    </table>`;
};

const infoBlock = (lines) => `
  <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:12px 16px;margin:16px 0;font-size:14px;line-height:1.7">
    ${lines.join("<br>")}
  </div>
`;

// ── Confirmation de commande ──────────────────────────────────────────────────
const orderConfirmation = (order, user) => {
  const orderId = order.orderNumber || order._id;
  return layout(
    "Confirmation de commande",
    `
      <p style="margin:0 0 10px;font-size:15px">Bonjour <strong>${esc(user && user.name || "Client")}</strong>,</p>
      <p style="margin:0 0 16px;font-size:15px">Merci pour votre confiance ! Votre commande a bien été enregistrée et est en préparation.</p>

      ${infoBlock([
        `<strong>Commande</strong> : #${esc(orderId)}`,
        `<strong>Passée le</strong> : ${new Date(order.createdAt || Date.now()).toLocaleDateString("fr-FR")}`,
        `<strong>Paiement</strong> : ${paymentLabel(order.paymentMethod)}`,
      ])}

      ${productTable(order.products)}
      ${totalsBlock(order)}

      <div style="margin-top:20px;font-size:14px;line-height:1.7">
        <strong style="color:#1E40AF">Livraison</strong><br>
        ${esc(order.deliveryName)} — ${esc(order.deliveryPhone || "")}<br>
        ${esc(order.deliveryAddress)}${order.deliveryCity ? `, ${esc(order.deliveryCity)}` : ""}
      </div>

      <p style="font-size:13px;color:#64748B;margin-top:20px">
        🛡️ Tous vos produits sont couverts par la garantie ${esc(siteName)}.
      </p>

      ${button(routes.orderDetail(order._id), "Suivre ma commande")}
    `
  );
};

// ── Mise à jour statut commande ───────────────────────────────────────────────
const statusLabels = {
  pending: "En attente",
  processing: "En traitement",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const orderStatusUpdate = (order, user, newStatus) => {
  const orderId = order.orderNumber || order._id;
  return layout(
    "Mise à jour de commande",
    `
      <p style="margin:0 0 10px;font-size:15px">Bonjour <strong>${esc(user && user.name || "Client")}</strong>,</p>
      <p style="margin:0 0 16px;font-size:15px">Le statut de votre commande <strong>#${esc(orderId)}</strong> a changé :</p>

      <div style="background:#EFF6FF;border-left:4px solid #1E40AF;padding:14px 16px;border-radius:6px;margin:16px 0;font-size:15px">
        <strong style="color:#1E40AF">${esc(statusLabels[newStatus] || newStatus)}</strong>
      </div>

      <p style="font-size:14px;color:#475569;margin:0 0 4px"><strong>Suivi</strong> : #${esc(orderId)}</p>
      <p style="font-size:14px;color:#475569;margin:0 0 4px"><strong>Livrée à</strong> : ${esc(order.deliveryName)} — ${esc(order.deliveryPhone || "")}</p>
      <p style="font-size:14px;color:#475569;margin:0 0 4px"><strong>Paiement</strong> : ${paymentLabel(order.paymentMethod)}</p>
      <p style="font-size:14px;color:#475569;margin:0"><strong>Total</strong> : ${formatFCFA(order.totalPrice)} FCFA</p>

      ${button(routes.orderDetail(order._id), "Voir ma commande")}

      <p style="font-size:13px;color:#64748B;margin-top:18px">
        Une question sur votre livraison ? Écrivez-nous : <a href="mailto:${esc(contactEmail)}" style="color:#1E40AF">${esc(contactEmail)}</a>
      </p>
    `
  );
};

// ── Bienvenue ─────────────────────────────────────────────────────────────────
const welcome = (user) => layout(
  "Bienvenue !",
  `
    <p style="margin:0 0 10px;font-size:15px">Bonjour <strong>${esc(user.name || "nouveau membre")}</strong> 👋,</p>
    <p style="margin:0 0 14px;font-size:15px">Votre compte <strong>${esc(siteName)}</strong> a été créé avec succès. Vous pouvez dès maintenant :</p>
    <ul style="font-size:14px;line-height:2;color:#475569;padding-left:20px;margin:0 0 16px">
      <li>🛍️ Parcourir notre catalogue de produits tech</li>
      <li>🚚 Passer des commandes et suivre leur livraison</li>
      <li>🛡️ Gérer vos garanties et demandes SAV</li>
      <li>⭐ Gagner des points de fidélité sur chaque achat</li>
    </ul>
    ${button(frontendUrl, "Découvrir la boutique")}
  `
);

// ── Reset password ────────────────────────────────────────────────────────────
// ttlMinutes vient de EmailService : la durée affichée ici et celle appliquée
// à resetPasswordExpires ne peuvent plus diverger.
const passwordReset = (user, resetUrl, ttlMinutes = 10) => layout(
  "Réinitialisation du mot de passe",
  `
    <p style="margin:0 0 10px;font-size:15px">Bonjour <strong>${esc(user.name || "Client")}</strong>,</p>
    <p style="margin:0 0 16px;font-size:15px">Vous avez demandé la réinitialisation de votre mot de passe. Utilisez le lien ci-dessous — il expire dans <strong>${esc(ttlMinutes)} minutes</strong> :</p>
    ${button(resetUrl, "Réinitialiser mon mot de passe")}
    <p style="font-size:13px;color:#64748B;word-break:break-all">
      Lien direct : <a href="${esc(resetUrl)}" style="color:#1E40AF">${esc(resetUrl)}</a>
    </p>
    <p style="font-size:13px;color:#64748B;margin-top:14px">
      Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email — votre mot de passe reste inchangé.
    </p>
  `
);

// ── Demande d'avis ────────────────────────────────────────────────────────────
const reviewRequest = (user, order, product) => {
  const orderId = order.orderNumber || order._id;
  return layout(
    "Donnez votre avis",
    `
      <p style="margin:0 0 10px;font-size:15px">Bonjour <strong>${esc(user.name || "Client")}</strong>,</p>
      <p style="margin:0 0 12px;font-size:15px">
        Votre commande <strong>#${esc(orderId)}</strong> a été livrée. Nous espérons que vous êtes satisfait(e) !
      </p>
      <p style="margin:0 0 16px;font-size:14px;color:#475569">
        Partagez votre expérience avec <strong>${esc(product && product.name || "votre produit")}</strong> — cela aide toute la communauté.
      </p>
      ${button(`${frontendUrl}/products/${product && product._id || ""}#reviews`, "Laisser un avis ⭐")}
    `
  );
};

// ── Notification SAV ──────────────────────────────────────────────────────────
const rmaStatusLabels = {
  pending: "En attente de traitement",
  approved: "Approuvée",
  rejected: "Refusée",
  in_transit: "En transit",
  received: "Reçue par notre équipe",
  processing: "En cours de traitement",
  resolved: "Résolue",
  cancelled: "Annulée",
};

const rmaNotification = (user, rma, type = "created") => {
  const title = type === "created" ? "Demande SAV créée" : "Mise à jour demande SAV";
  const statusText = rmaStatusLabels[rma.status] || rma.status;

  return layout(
    title,
    `
      <p style="margin:0 0 10px;font-size:15px">Bonjour <strong>${esc(user.name || "Client")}</strong>,</p>
      ${type === "created"
        ? `<p style="margin:0 0 12px;font-size:15px">Votre demande SAV <strong>#${esc(rma.rmaNumber)}</strong> a été créée avec succès. Nous la traiterons dans les plus brefs délais.</p>`
        : `<p style="margin:0 0 12px;font-size:15px">Votre demande SAV <strong>#${esc(rma.rmaNumber)}</strong> a été mise à jour :</p>
           <div style="background:#EFF6FF;border-left:4px solid #1E40AF;padding:14px 16px;border-radius:6px;margin:16px 0;font-size:15px">
             <strong style="color:#1E40AF">${esc(statusText)}</strong>
           </div>`
      }
      ${button(routes.rmaList, "Voir ma demande")}
    `
  );
};

// ── Newsletter : double opt-in ───────────────────────────────────────────────
// Le lien de confirmation ET le lien de désabonnement sont tous deux fournis
// par l'appelant : ils portent un jeton à usage unique qu'on ne peut pas
// deviner, ce qui évite d'exposer un endpoint de désabonnement par simple
// adresse email (RFC 8058 : le désabonnement doit se faire en un clic).
const newsletterConfirmation = (confirmUrl, unsubscribeUrl) => layout(
  "Confirmez votre inscription",
  `
    <p style="margin:0 0 16px;font-size:15px">Vous avez demandé à recevoir la newsletter de <strong>${esc(siteName)}</strong> : nouveautés, promotions et conseils tech.</p>
    <p style="margin:0 0 16px;font-size:15px">Confirmez votre adresse pour commencer à recevoir nos envois.</p>

    ${button(confirmUrl, "✅ Confirmer mon inscription")}

    <p style="font-size:13px;color:#64748B;margin-top:18px">
      Ce lien est valable ${esc(NEWSLETTER_CONFIRM_TTL_HOURS)} heures et ne peut servir qu'une fois.
    </p>
    <p style="font-size:13px;color:#64748B;margin:12px 0 0">
      Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : aucune inscription ne sera prise en compte.
    </p>
    <p style="font-size:13px;color:#64748B;margin:12px 0 0">
      Déjà abonné et wish annulé ? <a href="${esc(unsubscribeUrl)}" style="color:#1E40AF">Se désabonner</a>
    </p>
  `
);

// ── Alerte expiration garantie ────────────────────────────────────────────────
const warrantyExpiring = (user, warranty, product) => {
  const daysLeft = Math.ceil((new Date(warranty.endDate) - new Date()) / (1000 * 60 * 60 * 24));

  return layout(
    "Garantie bientôt expirée",
    `
      <p style="margin:0 0 10px;font-size:15px">Bonjour <strong>${esc(user.name || "Client")}</strong>,</p>
      <p style="margin:0 0 16px;font-size:15px">
        La garantie de votre <strong>${esc(product && product.name || "produit")}</strong> expire dans <strong>${daysLeft} jour(s)</strong>.
      </p>
      <div style="background:#FEF3C7;border-left:4px solid #D97706;padding:14px 16px;border-radius:6px;margin:16px 0;font-size:14px">
        ⚠️ Date d'expiration : <strong>${new Date(warranty.endDate).toLocaleDateString("fr-FR")}</strong>
      </div>
      <p style="font-size:14px;color:#475569;margin:0 0 16px">Pensez à prolonger votre garantie pour rester protégé.</p>
      ${button(routes.warranties, "Gérer mes garanties")}
    `
  );
};

// ── Notification admin : nouvelle commande ────────────────────────────────────
const adminOrderNotification = (order, user) => {
  const orderId = order.orderNumber || order._id;
  return layout(
    "Nouvelle commande reçue",
    `
      <h3 style="margin:0 0 14px;color:#1E40AF;font-size:18px">🛍️ Commande #${esc(orderId)}</h3>

      ${infoBlock([
        `<strong>Client</strong> : ${esc((user && user.name) || order.deliveryName)}`,
        `<strong>Email</strong> : ${esc((user && user.email) || "—")}`,
        `<strong>Téléphone</strong> : ${esc(order.deliveryPhone || "—")}`,
        `<strong>Adresse</strong> : ${esc(order.deliveryAddress || "")}${order.deliveryCity ? `, ${esc(order.deliveryCity)}` : ""}`,
        `<strong>Paiement</strong> : ${paymentLabel(order.paymentMethod)}`,
        `<strong>Total</strong> : <span style="color:#1E40AF;font-weight:bold">${formatFCFA(order.totalPrice)} FCFA</span>`,
      ])}

      ${productTable(order.products)}
      ${totalsBlock(order)}

      ${button(routes.adminOrderDetail(order._id), "Voir la commande (Admin)")}
    `
  );
};

// ── Vérification de l'adresse email ───────────────────────────────────────────
const emailVerification = (user, verifyUrl, ttlHours = 24) => layout(
  "Vérifiez votre adresse email",
  `
    <p style="margin:0 0 10px;font-size:15px">Bonjour <strong>${esc(user.name || "Client")}</strong>,</p>
    <p style="margin:0 0 16px;font-size:15px">Bienvenue chez <strong>${esc(siteName)}</strong>. Confirmez cette adresse email pour activer votre compte et commencer vos commandes.</p>

    ${button(verifyUrl, "✅ Vérifier mon adresse email")}

    <p style="font-size:13px;color:#64748B;word-break:break-all">
      Lien direct : <a href="${esc(verifyUrl)}" style="color:#1E40AF">${esc(verifyUrl)}</a>
    </p>
    <p style="font-size:13px;color:#64748B;margin-top:16px">
      Ce lien est valable ${esc(ttlHours)} heures. Sans confirmation, la connexion restera bloquée.
    </p>
    <p style="font-size:13px;color:#64748B;margin-top:12px">
      Vous n'avez pas demandé cette inscription ? Ignorez cet email : aucun compte ne sera activé.
    </p>
  `
);

// ── Partie texte (text/plain) ─────────────────────────────────────────────────
// Dérivée du HTML par le même chemin, donc les deux versions ne peuvent pas
// diverger. Indispensable : sans partie texte, Gmail classe les emails en
// spam et les clients texte seul (mutt, elm, console) affichent le HTML
// brut. Toutes les données injectées passent par esc(), donc aucune balise
// réelle n'arrive ici : le nettoyage par regex est sûr.
const htmlToText = (html) => {
  let s = String(html);

  // Passe 1 — lignes de tableau. Le HTML des templates met chaque <td> sur sa
  // propre ligne : sans ce traitement, le texte affiche chaque cellule à la
  // ligne et le tableau devient illisible. On aplatit chaque <tr> en UNE ligne
  // dont les cellules sont séparées par « | ».
  s = s.replace(/<tr[^>]*>[\s\S]*?<\/tr>/gi, (row) =>
    `${row
      .replace(/<\/t[dh]>/gi, "\t")
      .replace(/<[^>]+>/g, " ")
      .replace(/[\r\n]+/g, " ")
      .replace(/[ \t]*\|[ \t]*/g, " | ")
      .replace(/ {2,}/g, " ")
      .replace(/\s*\|\s*$/, "")
      .trim()}\n`
  );

  // Passe 2 — ancres. En texte, un bouton sans son URL est inutile : le
  // destinataire n'a pas de bouton à cliquer. On affiche donc « libellé (URL) ».
  // Exception : si le libellé est déjà l'adresse (bloc « Lien direct : » des
  // templates), on ne la répète pas ; et un mailto n'est affiché que par sa
  // cible, « contact@x » (mailto:contact@x) étant du bruit.
  s = s.replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (match, href, inner) => {
    const label = inner.replace(/<[^>]+>/g, "").trim();
    if (!label) return match;
    if (href.toLowerCase().startsWith("mailto:")) return href.slice(7);
    return label === href ? label : `${label} (${href})`;
  });

  // Passe 3 — flot de texte.
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|h4|li|table|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) =>
      line
        .replace(/^\s+/, "")
        .replace(/\s+$/, "")
        // Les espaces multiples restants viennent des entités &nbsp; et des
        // indentation du HTML : sans ce compactage, le texte est truffé de
        // trous. Les tabulations (séparateurs de cellules) ne sont pas
        // concernées et survivent.
        .replace(/ {2,}/g, " ")
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// ── Page d'atterrissage HTML autonome ────────────────────────────────────────
// Servie par l'API pour les actions à un clic (confirmation et
// désabonnement newsletter). Doit rester lisible sans feuille de style
// externe ni JavaScript.
const landingPage = (title, message, { linkText, linkUrl } = {}) => {
  const site = process.env.SITE_NAME || "Tekalis";
  const contact = process.env.CONTACT_EMAIL || "contact@tekalis.com";
  const cta = linkUrl
    ? `<p style="margin:24px 0 0">
         <a href="${esc(linkUrl)}"
            style="display:inline-block;padding:12px 26px;background:#1E40AF;color:#fff;
                   text-decoration:none;border-radius:8px;font-weight:bold">${esc(linkText || "Continuer")}</a>
       </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(title)} — ${esc(site)}</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
  <div style="max-width:520px;margin:0 auto;padding:48px 16px">
    <div style="background:#1E40AF;padding:24px;text-align:center;border-radius:12px 12px 0 0">
      <h1 style="color:#ffffff;margin:0;font-size:22px">${esc(site)}</h1>
    </div>
    <div style="background:#ffffff;padding:32px 28px;border:1px solid #E2E8F0;border-top:none;border-bottom:none;text-align:center">
      <h2 style="margin:0 0 14px;font-size:20px;color:#1E40AF">${esc(title)}</h2>
      <p style="margin:0;font-size:15px;line-height:1.7;color:#475569">${esc(message)}</p>
      ${cta}
    </div>
    <div style="background:#0F172A;padding:20px;text-align:center;border-radius:0 0 12px 12px">
      <p style="margin:0;font-size:12px;color:#94A3B8">
        <a href="mailto:${esc(contact)}" style="color:#BFDBFE">${esc(contact)}</a>
      </p>
    </div>
  </div>
</body>
</html>`;
};

module.exports = {
  // Exportées pour que les pages HTML servies par l'API échappent elles aussi
  // ce qu'elles injectent, et pour réutiliser le convertisseur texte.
  esc,
  htmlToText,
  landingPage,
  orderConfirmation,
  orderStatusUpdate,
  welcome,
  passwordReset,
  newsletterConfirmation,
  reviewRequest,
  rmaNotification,
  warrantyExpiring,
  adminOrderNotification,
  emailVerification,
  // Exportée pour que le contrôleur newsletter applique exactement la même
  // durée que celle annoncée dans l'email.
  NEWSLETTER_CONFIRM_TTL_HOURS,
};