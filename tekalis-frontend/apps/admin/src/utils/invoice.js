import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const PRIMARY = [30, 64, 175]; // blue-800
const DARK = [31, 41, 55]; // gray-800
const MUTED = [107, 114, 128]; // gray-500
const LIGHT = [243, 244, 246]; // gray-100

// Les polices standard de jsPDF ne gèrent pas les espaces fines insécables
// (U+202F) produites par toLocaleString("fr-FR") — elles s'affichent "/".
// On les remplace par une espace normale.
const money = (value) =>
  `${Number(value || 0)
    .toLocaleString("fr-FR")
    .replace(/\s/g, " ")} FCFA`;

const formatDate = (date, withTime = false) => {
  if (!date) return "—";
  const options = { day: "2-digit", month: "long", year: "numeric" };
  if (withTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }
  return new Date(date).toLocaleDateString("fr-FR", options);
};

const getItemName = (item) => item?.product?.name || item?.name || "Produit";
const getUnitPrice = (item) => Number(item?.price ?? item?.product?.price ?? 0);

const PAYMENT_METHOD_LABELS = {
  cash: "Paiement à la livraison",
  online: "Paiement en ligne",
  wave: "Wave",
  om: "Orange Money",
  free: "Free Money",
  card: "Carte bancaire"
};

const PAYMENT_STATUS_LABELS = {
  pending: "En attente",
  awaiting: "En attente",
  paid: "Payé",
  failed: "Échoué",
  refunded: "Remboursé"
};

const buildInvoiceData = (order, settings) => {
  const items = order?.products || [];
  const lines = items.map((item) => {
    const quantity = Number(item.quantity || 1);
    const unitPrice = getUnitPrice(item);
    return {
      name: getItemName(item),
      quantity,
      unitPrice,
      total: unitPrice * quantity
    };
  });

  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
  const shipping = Number(order?.shippingCost || 0);
  const total = Number(order?.totalPrice || subtotal + shipping);

  const tax = settings?.tax || {};
  const taxEnabled = Boolean(tax.enabled) && Number(tax.rate) > 0;
  const taxRate = Number(tax.rate || 0);
  const taxAmount = taxEnabled ? Math.round(subtotal * (taxRate / 100)) : 0;

  return {
    settings: settings || {},
    lines,
    subtotal,
    shipping,
    total,
    taxEnabled,
    taxRate,
    taxAmount,
    taxIncluded: tax.included !== false,
    invoiceNumber: order?.orderNumber || "—",
    customer: {
      name:
        order?.customerInfo?.name ||
        order?.user?.name ||
        order?.deliveryName ||
        "Client",
      email: order?.customerInfo?.email || order?.user?.email || "",
      phone: order?.customerInfo?.phone || order?.deliveryPhone || ""
    },
    delivery: {
      address: order?.deliveryAddress || "",
      city: order?.deliveryCity || "",
      region: order?.deliveryRegion || ""
    }
  };
};

export const generateInvoicePdf = (order, settings = {}) => {
  const data = buildInvoiceData(order, settings);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const rightEdge = pageWidth - margin;

  // ── En-tête entreprise ────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...PRIMARY);
  doc.text(data.settings.siteName || "Tekalis", margin, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  let infoY = 28;
  const companyInfo = [
    data.settings.contactAddress,
    data.settings.contactPhone,
    data.settings.contactEmail
  ].filter(Boolean);
  companyInfo.forEach((line) => {
    doc.text(String(line), margin, infoY);
    infoY += 4.5;
  });

  // ── Bloc facture (droite) ─────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...DARK);
  doc.text("FACTURE", rightEdge, 22, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`N° ${data.invoiceNumber}`, rightEdge, 29, { align: "right" });
  doc.text(
    `Date : ${formatDate(order?.createdAt, true)}`,
    rightEdge,
    33.5,
    { align: "right" }
  );

  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.6);
  doc.line(margin, 42, rightEdge, 42);

  // ── Client & livraison ────────────────────────────────────────────────
  const blockY = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY);
  doc.text("Facturé à", margin, blockY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...DARK);
  let customerY = blockY + 5.5;
  doc.text(data.customer.name, margin, customerY);
  customerY += 4.5;
  if (data.customer.email) {
    doc.setTextColor(...MUTED);
    doc.text(data.customer.email, margin, customerY);
    customerY += 4.5;
  }
  if (data.customer.phone) {
    doc.setTextColor(...MUTED);
    doc.text(data.customer.phone, margin, customerY);
    customerY += 4.5;
  }

  const deliveryX = pageWidth / 2 + 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY);
  doc.text("Livraison", deliveryX, blockY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  let deliveryY = blockY + 5.5;
  const deliveryLines = [
    data.customer.name,
    data.delivery.address,
    [data.delivery.city, data.delivery.region]
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .join(", ")
  ].filter(Boolean);
  deliveryLines.forEach((line) => {
    doc.text(String(line), deliveryX, deliveryY);
    deliveryY += 4.5;
  });

  // ── Tableau des produits ──────────────────────────────────────────────
  const tableStart = Math.max(customerY, deliveryY) + 6;

  autoTable(doc, {
    startY: tableStart,
    head: [["Produit", "Quantité", "Prix unitaire", "Total"]],
    body: data.lines.map((line) => [
      line.name,
      String(line.quantity),
      money(line.unitPrice),
      money(line.total)
    ]),
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      textColor: DARK,
      lineColor: [229, 231, 235],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: PRIMARY,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left"
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "center", cellWidth: 25 },
      2: { halign: "right", cellWidth: 38 },
      3: { halign: "right", cellWidth: 38 }
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: margin, right: margin }
  });

  // ── Totaux ────────────────────────────────────────────────────────────
  let totalsY = doc.lastAutoTable.finalY + 8;
  const totalsLabelX = rightEdge - 55;
  const totalsValueX = rightEdge;

  const addTotalRow = (label, value, options = {}) => {
    const { bold = false, color = DARK } = options;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 11 : 9.5);
    doc.setTextColor(...color);
    doc.text(label, totalsLabelX, totalsY);
    doc.text(value, totalsValueX, totalsY, { align: "right" });
    totalsY += bold ? 7 : 5.5;
  };

  addTotalRow("Sous-total", money(data.subtotal));
  addTotalRow("Livraison", data.shipping > 0 ? money(data.shipping) : "Offerte");

  if (data.taxEnabled) {
    const taxLabel = `TVA (${data.taxRate}%)${
      data.taxIncluded ? " incluse" : ""
    }`;
    addTotalRow(taxLabel, money(data.taxAmount), { color: MUTED });
  }

  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(totalsLabelX, totalsY - 3, rightEdge, totalsY - 3);
  totalsY += 1;
  addTotalRow("Total", money(data.total), { bold: true, color: PRIMARY });

  // ── Détails du paiement ───────────────────────────────────────────────
  const paymentY = Math.max(totalsY + 4, doc.lastAutoTable.finalY + 30);
  doc.setFillColor(...LIGHT);
  doc.roundedRect(margin, paymentY, rightEdge - margin, 22, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY);
  doc.text("Paiement", margin + 5, paymentY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(
    `Méthode : ${
      PAYMENT_METHOD_LABELS[order?.paymentMethod] || order?.paymentMethod || "—"
    }`,
    margin + 5,
    paymentY + 13
  );
  doc.text(
    `Statut : ${
      PAYMENT_STATUS_LABELS[order?.paymentStatus] ||
      order?.paymentStatus ||
      "—"
    }`,
    margin + 5,
    paymentY + 18
  );

  const reference = order?.transactionId || order?.mobileMoneyReference;
  if (reference) {
    doc.text(`Référence : ${reference}`, rightEdge - 5, paymentY + 13, {
      align: "right"
    });
  }
  if (order?.paidAt) {
    doc.text(
      `Payé le : ${formatDate(order.paidAt)}`,
      rightEdge - 5,
      paymentY + 18,
      { align: "right" }
    );
  }

  // ── Pied de page ──────────────────────────────────────────────────────
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 18, rightEdge, pageHeight - 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    "Merci de votre confiance. Cette facture tient lieu de justificatif d'achat.",
    margin,
    pageHeight - 12
  );
  doc.text(
    data.settings.siteName || "Tekalis",
    rightEdge,
    pageHeight - 12,
    { align: "right" }
  );

  const filename = `facture-${data.invoiceNumber || "commande"}.pdf`;
  doc.save(filename);
};

export default generateInvoicePdf;
