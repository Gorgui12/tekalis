// ===============================================
// utils/emailTemplates.js
// Templates HTML pour les emails Tekalis
// ===============================================

const siteName = process.env.SITE_NAME || "Tekalis";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

// ── Styles communs ────────────────────────────────────────────────────────────
const baseStyle = `
  font-family: Arial, sans-serif;
  color: #333;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const btnStyle = `
  display: inline-block;
  padding: 12px 24px;
  background-color: #1E40AF;
  color: #ffffff;
  text-decoration: none;
  border-radius: 6px;
  font-weight: bold;
  margin-top: 16px;
`;

const headerHtml = (title) => `
  <div style="background:#1E40AF;padding:20px;text-align:center;border-radius:8px 8px 0 0">
    <h1 style="color:#ffffff;margin:0;font-size:24px">${siteName}</h1>
    <p style="color:#93C5FD;margin:4px 0 0">${title}</p>
  </div>
`;

const footerHtml = () => `
  <div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb">
    <p style="color:#9CA3AF;font-size:12px">
      ${siteName} • Dakar, Sénégal<br>
      <a href="mailto:support@tekalis.com" style="color:#6B7280">support@tekalis.com</a>
    </p>
  </div>
`;

// ── Confirmation de commande ──────────────────────────────────────────────────
const orderConfirmation = (order, user) => {
  const productRows = (order.products || [])
    .map(item => {
      const name = item.product?.name || "Produit";
      const qty  = item.quantity || 1;
      const price = (item.price || 0).toLocaleString("fr-FR");
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb">${name}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center">${qty}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${price} FCFA</td>
      </tr>`;
    })
    .join("");

  return `
    <div style="${baseStyle}">
      ${headerHtml("Confirmation de commande")}
      <div style="padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        <p>Bonjour <strong>${user.name || "Client"}</strong>,</p>
        <p>Merci pour votre commande ! Voici le récapitulatif :</p>

        <div style="background:#f9fafb;padding:12px;border-radius:6px;margin-bottom:16px">
          <strong>Commande #${order.orderNumber || order._id}</strong><br>
          <small style="color:#6B7280">Passée le ${new Date(order.createdAt).toLocaleDateString("fr-FR")}</small>
        </div>

        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f3f4f6">
              <th style="padding:8px;text-align:left">Produit</th>
              <th style="padding:8px;text-align:center">Qté</th>
              <th style="padding:8px;text-align:right">Prix</th>
            </tr>
          </thead>
          <tbody>${productRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:8px;text-align:right"><strong>Total :</strong></td>
              <td style="padding:8px;text-align:right;color:#1E40AF;font-weight:bold">
                ${(order.totalPrice || 0).toLocaleString("fr-FR")} FCFA
              </td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top:20px">
          <strong>Livraison :</strong><br>
          ${order.deliveryName} — ${order.deliveryAddress}, ${order.deliveryCity || "Dakar"}
        </div>

        <div style="text-align:center;margin-top:24px">
          <a href="${frontendUrl}/orders/${order._id}" style="${btnStyle}">
            Suivre ma commande
          </a>
        </div>
      </div>
      ${footerHtml()}
    </div>
  `;
};

// ── Mise à jour statut commande ───────────────────────────────────────────────
const statusLabels = {
  pending:    "En attente",
  processing: "En traitement",
  shipped:    "Expédiée",
  delivered:  "Livrée",
  cancelled:  "Annulée"
};

const orderStatusUpdate = (order, user, newStatus) => `
  <div style="${baseStyle}">
    ${headerHtml("Mise à jour de commande")}
    <div style="padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
      <p>Bonjour <strong>${user.name || "Client"}</strong>,</p>
      <p>Le statut de votre commande <strong>#${order.orderNumber || order._id}</strong> a été mis à jour :</p>
      <div style="background:#EFF6FF;border-left:4px solid #1E40AF;padding:12px;border-radius:4px;margin:16px 0">
        <strong style="color:#1E40AF">${statusLabels[newStatus] || newStatus}</strong>
      </div>
      <div style="text-align:center;margin-top:24px">
        <a href="${frontendUrl}/orders/${order._id}" style="${btnStyle}">
          Voir ma commande
        </a>
      </div>
    </div>
    ${footerHtml()}
  </div>
`;

// ── Bienvenue ─────────────────────────────────────────────────────────────────
const welcome = (user) => `
  <div style="${baseStyle}">
    ${headerHtml("Bienvenue !")}
    <div style="padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
      <p>Bonjour <strong>${user.name || "nouveau membre"}</strong> 👋,</p>
      <p>Votre compte <strong>${siteName}</strong> a été créé avec succès.</p>
      <p>Vous pouvez dès maintenant :</p>
      <ul style="line-height:1.8">
        <li>Parcourir notre catalogue de produits tech</li>
        <li>Passer des commandes et suivre leur livraison</li>
        <li>Gérer vos garanties et demandes SAV</li>
      </ul>
      <div style="text-align:center;margin-top:24px">
        <a href="${frontendUrl}" style="${btnStyle}">
          Découvrir la boutique
        </a>
      </div>
    </div>
    ${footerHtml()}
  </div>
`;

// ── Reset password ────────────────────────────────────────────────────────────
const passwordReset = (user, resetUrl) => `
  <div style="${baseStyle}">
    ${headerHtml("Réinitialisation du mot de passe")}
    <div style="padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
      <p>Bonjour <strong>${user.name || "Client"}</strong>,</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous — il est valide pendant <strong>10 minutes</strong> :</p>
      <div style="text-align:center;margin:24px 0">
        <a href="${resetUrl}" style="${btnStyle}">
          Réinitialiser mon mot de passe
        </a>
      </div>
      <p style="color:#6B7280;font-size:13px">
        Si vous n'avez pas fait cette demande, ignorez cet email. Votre mot de passe ne sera pas modifié.
      </p>
      <p style="color:#6B7280;font-size:12px;word-break:break-all">
        Lien : ${resetUrl}
      </p>
    </div>
    ${footerHtml()}
  </div>
`;

// ── Demande d'avis ────────────────────────────────────────────────────────────
const reviewRequest = (user, order, product) => `
  <div style="${baseStyle}">
    ${headerHtml("Donnez votre avis")}
    <div style="padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
      <p>Bonjour <strong>${user.name || "Client"}</strong>,</p>
      <p>Votre commande <strong>#${order.orderNumber || order._id}</strong> a été livrée. Nous espérons que vous êtes satisfait(e) de votre achat !</p>
      <p>Partagez votre expérience avec <strong>${product?.name || "ce produit"}</strong> :</p>
      <div style="text-align:center;margin-top:24px">
        <a href="${frontendUrl}/products/${product?._id}#reviews" style="${btnStyle}">
          Laisser un avis ⭐
        </a>
      </div>
    </div>
    ${footerHtml()}
  </div>
`;

// ── Notification SAV ──────────────────────────────────────────────────────────
const rmaStatusLabels = {
  pending:    "En attente de traitement",
  approved:   "Approuvée",
  rejected:   "Refusée",
  in_transit: "En transit",
  received:   "Reçue par notre équipe",
  processing: "En cours de traitement",
  resolved:   "Résolue",
  cancelled:  "Annulée"
};

const rmaNotification = (user, rma, type = "created") => {
  const title = type === "created"
    ? "Demande SAV créée"
    : "Mise à jour demande SAV";

  const statusText = rmaStatusLabels[rma.status] || rma.status;

  return `
    <div style="${baseStyle}">
      ${headerHtml(title)}
      <div style="padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        <p>Bonjour <strong>${user.name || "Client"}</strong>,</p>
        ${type === "created"
          ? `<p>Votre demande SAV <strong>#${rma.rmaNumber}</strong> a été créée avec succès.</p>
             <p>Nous la traiterons dans les plus brefs délais.</p>`
          : `<p>Votre demande SAV <strong>#${rma.rmaNumber}</strong> a été mise à jour :</p>
             <div style="background:#EFF6FF;border-left:4px solid #1E40AF;padding:12px;border-radius:4px;margin:16px 0">
               <strong style="color:#1E40AF">${statusText}</strong>
             </div>`
        }
        <div style="text-align:center;margin-top:24px">
          <a href="${frontendUrl}/dashboard/sav/${rma._id}" style="${btnStyle}">
            Voir ma demande
          </a>
        </div>
      </div>
      ${footerHtml()}
    </div>
  `;
};

// ── Alerte expiration garantie ────────────────────────────────────────────────
const warrantyExpiring = (user, warranty, product) => {
  const daysLeft = Math.ceil((new Date(warranty.endDate) - new Date()) / (1000 * 60 * 60 * 24));

  return `
    <div style="${baseStyle}">
      ${headerHtml("Garantie bientôt expirée")}
      <div style="padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        <p>Bonjour <strong>${user.name || "Client"}</strong>,</p>
        <p>La garantie de votre <strong>${product?.name || "produit"}</strong> expire dans <strong>${daysLeft} jour(s)</strong>.</p>
        <div style="background:#FEF3C7;border-left:4px solid #D97706;padding:12px;border-radius:4px;margin:16px 0">
          ⚠️ Date d'expiration : <strong>${new Date(warranty.endDate).toLocaleDateString("fr-FR")}</strong>
        </div>
        <p>Pensez à renouveler votre garantie pour continuer à bénéficier de notre couverture.</p>
        <div style="text-align:center;margin-top:24px">
          <a href="${frontendUrl}/dashboard/warranties" style="${btnStyle}">
            Gérer mes garanties
          </a>
        </div>
      </div>
      ${footerHtml()}
    </div>
  `;
};

// ── Notification admin : nouvelle commande ────────────────────────────────────
const adminOrderNotification = (order, user) => {
  const productRows = (order.products || [])
    .map(item => {
      const name  = item.product?.name || item.product || "Produit";
      const qty   = item.quantity || 1;
      const price = (item.price || 0).toLocaleString("fr-FR");
      return `<tr>
        <td style="padding:6px;border-bottom:1px solid #e5e7eb">${name}</td>
        <td style="padding:6px;text-align:center;border-bottom:1px solid #e5e7eb">${qty}</td>
        <td style="padding:6px;text-align:right;border-bottom:1px solid #e5e7eb">${price} FCFA</td>
      </tr>`;
    })
    .join("");

  return `
    <div style="${baseStyle}">
      ${headerHtml("Nouvelle commande reçue")}
      <div style="padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        <h3 style="margin-top:0;color:#1E40AF">🛍️ Commande #${order.orderNumber || order._id}</h3>

        <div style="background:#f3f4f6;padding:12px;border-radius:6px;margin-bottom:16px">
          <p style="margin:4px 0"><b>Client :</b> ${user?.name || order.deliveryName}</p>
          <p style="margin:4px 0"><b>Email :</b> ${user?.email || "—"}</p>
          <p style="margin:4px 0"><b>Téléphone :</b> ${order.deliveryPhone}</p>
          <p style="margin:4px 0"><b>Adresse :</b> ${order.deliveryAddress}, ${order.deliveryCity || "Dakar"}</p>
        </div>

        <div style="background:#fef3c7;padding:12px;border-radius:6px;margin-bottom:16px">
          <p style="margin:4px 0"><b>Mode de paiement :</b> ${
            order.paymentMethod === "cash" ? "💵 À la livraison" : order.paymentMethod?.toUpperCase()
          }</p>
          <p style="margin:4px 0"><b>Total :</b> <strong style="color:#1E40AF;font-size:1.2em">${(order.totalPrice || 0).toLocaleString("fr-FR")} FCFA</strong></p>
        </div>

        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f3f4f6">
              <th style="padding:8px;text-align:left">Produit</th>
              <th style="padding:8px;text-align:center">Qté</th>
              <th style="padding:8px;text-align:right">Prix</th>
            </tr>
          </thead>
          <tbody>${productRows}</tbody>
        </table>

        <div style="text-align:center;margin-top:24px">
          <a href="${frontendUrl}/admin/orders/${order._id}" style="${btnStyle}">
            Voir la commande (Admin)
          </a>
        </div>
      </div>
      ${footerHtml()}
    </div>
  `;
};

module.exports = {
  orderConfirmation,
  orderStatusUpdate,
  welcome,
  passwordReset,
  reviewRequest,
  rmaNotification,
  warrantyExpiring,
  adminOrderNotification
};