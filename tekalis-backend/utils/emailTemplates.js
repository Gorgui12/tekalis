// ===============================================
// utils/emailTemplates.js
// Templates HTML pour les emails Tekalis
// Rendus inline (compatible Gmail/Outlook), échappement HTML
// systématique des champs utilisateurs/commandes (anti-XSS email).
// ===============================================

const siteName = process.env.SITE_NAME || "Tekalis";
const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
const contactEmail = process.env.CONTACT_EMAIL || "support@tekalis.com";
const storePhone = process.env.STORE_PHONE || "221 76 214 50 37";
const storeAddress = process.env.STORE_ADDRESS || "Dakar, Sénégal";

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

// Gabarit commun : titre + corps
const layout = (title, contentHtml) => `
  <div style="background:#F1F5F9;padding:24px 12px">
    <div style="${baseStyle}">
      ${headerHtml(title)}
      <div style="padding:26px 24px;background:#ffffff;border:1px solid #E2E8F0;border-top:none;border-bottom:none">
        ${contentHtml}
      </div>
      ${footerHtml()}
    </div>
  </div>
`;

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

      ${button(`${frontendUrl}/orders/${order._id}`, "Suivre ma commande")}
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

      ${button(`${frontendUrl}/orders/${order._id}`, "Voir ma commande")}

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
const passwordReset = (user, resetUrl) => layout(
  "Réinitialisation du mot de passe",
  `
    <p style="margin:0 0 10px;font-size:15px">Bonjour <strong>${esc(user.name || "Client")}</strong>,</p>
    <p style="margin:0 0 16px;font-size:15px">Vous avez demandé la réinitialisation de votre mot de passe. Utilisez le lien ci-dessous — il expire dans <strong>10 minutes</strong> :</p>
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
      ${button(`${frontendUrl}/dashboard/sav/${rma._id}`, "Voir ma demande")}
    `
  );
};

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
      ${button(`${frontendUrl}/dashboard/warranties`, "Gérer mes garanties")}
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

      ${button(`${frontendUrl}/admin/orders/${order._id}`, "Voir la commande (Admin)")}
    `
  );
};

module.exports = {
  orderConfirmation,
  orderStatusUpdate,
  welcome,
  passwordReset,
  reviewRequest,
  rmaNotification,
  warrantyExpiring,
  adminOrderNotification,
};