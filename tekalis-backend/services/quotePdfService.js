const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 40;

const calculateQuoteTotals = (subtotal, settings) => {
  const amount = Math.round(Number(subtotal) || 0);
  const threshold = Number(settings && settings.shipping && settings.shipping.freeShippingThreshold) || 50000;
  const standardCost = Number(settings && settings.shipping && settings.shipping.standardCost) || 2500;
  const shippingCost = amount >= threshold ? 0 : standardCost;
  return {
    subtotal: amount,
    shippingCost,
    total: amount + shippingCost
  };
};

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("fr-FR");
};

const pdfText = (value) => String(value == null ? "" : value)
  .replace(/[\u2018\u2019]/g, "'")
  .replace(/[\u201C\u201D]/g, "\"")
  .replace(/Œ/g, "OE")
  .replace(/œ/g, "oe")
  .replace(/€/g, "EUR")
  .replace(/[\u00A0\u2000-\u200A\u202F]/g, " ")
  .replace(/[\u200B-\u200D\uFEFF]/g, "")
  .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, "?")
  .replace(/\s+/g, " ")
  .trim();

const formatAmount = (value) => pdfText(`${(Number(value) || 0).toLocaleString("fr-FR")} FCFA`);

const wrapText = (text, font, size, maxWidth) => {
  const words = pdfText(text).split(" ").filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    if (font.widthOfTextAtSize(word, size) > maxWidth) {
      if (current) {
        lines.push(current);
        current = "";
      }
      let chunk = "";
      for (const char of word) {
        if (chunk && font.widthOfTextAtSize(chunk + char, size) > maxWidth) {
          lines.push(chunk);
          chunk = char;
        } else {
          chunk += char;
        }
      }
      current = chunk;
      continue;
    }
    const candidate = current ? `${current} ${word}` : word;
    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
};

const quotePdfFilename = (quote) => {
  const reference = pdfText(quote && quote.quoteNumber || "brouillon")
    .replace(/[^A-Za-z0-9_-]/g, "-");
  return `devis-${reference}.pdf`;
};

const generateQuotePdf = async (quote) => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.12, 0.16, 0.23);
  const dark = rgb(0.12, 0.25, 0.64);
  const light = rgb(0.95, 0.96, 0.98);
  const muted = rgb(0.42, 0.47, 0.55);
  const divider = rgb(0.86, 0.88, 0.92);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - 124;

  const drawText = (text, options = {}) => {
    const {
      x = MARGIN,
      size = 10,
      font: textFont = font,
      color = ink
    } = options;
    page.drawText(pdfText(text), { x, y, size, font: textFont, color });
    y -= size + 6;
  };

  const drawPageHeader = (continued) => {
    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - 96,
      width: PAGE_WIDTH,
      height: 96,
      color: dark
    });
    page.drawText("TEKALIS", {
      x: MARGIN,
      y: PAGE_HEIGHT - 44,
      size: 22,
      font: boldFont,
      color: rgb(1, 1, 1)
    });
    page.drawText("DEVIS / ESTIMATION", {
      x: MARGIN,
      y: PAGE_HEIGHT - 68,
      size: 11,
      font,
      color: rgb(0.75, 0.86, 1)
    });
    page.drawText(pdfText(quote && quote.quoteNumber || ""), {
      x: PAGE_WIDTH - MARGIN - 150,
      y: PAGE_HEIGHT - 48,
      size: 11,
      font: boldFont,
      color: rgb(1, 1, 1)
    });
    y = PAGE_HEIGHT - 124;
    if (continued) drawText("Devis (suite)", { font: boldFont, size: 11 });
  };

  const drawTableHeader = () => {
    page.drawRectangle({
      x: MARGIN,
      y: y - 4,
      width: PAGE_WIDTH - 2 * MARGIN,
      height: 19,
      color: light
    });
    page.drawText("Désignation", { x: MARGIN + 8, y, size: 9, font: boldFont, color: ink });
    page.drawText("Quantité", { x: 310, y, size: 9, font: boldFont, color: ink });
    page.drawText("Prix unitaire", { x: 365, y, size: 9, font: boldFont, color: ink });
    page.drawText("Total", { x: 465, y, size: 9, font: boldFont, color: ink });
    y -= 25;
  };

  const newPage = () => {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawPageHeader(true);
    drawTableHeader();
  };

  const ensureSpace = (needed) => {
    if (y - needed < 90) newPage();
  };

  drawPageHeader(false);
  drawText(`Référence : ${quote && quote.quoteNumber || "-"}`, { font: boldFont, size: 11 });
  drawText(`Date d'émission : ${formatDate(quote && quote.createdAt || Date.now())}`);
  drawText(`Validité : ${formatDate(quote && quote.validUntil)}`);
  y -= 4;
  drawText("Coordonnées client", { font: boldFont, size: 11 });
  drawText(quote && quote.company || "");
  drawText(quote && quote.name || "");
  drawText(quote && quote.email || "");
  if (quote && quote.phone) drawText(quote.phone);
  y -= 4;
  drawTableHeader();

  const items = Array.isArray(quote && quote.items) ? quote.items : [];
  if (!items.length) {
    ensureSpace(20);
    drawText("Aucun article - demande détaillée par message.");
  }

  for (const item of items) {
    const lines = wrapText(item && item.name || "Produit", font, 9, 255);
    ensureSpace(lines.length * 12 + 14);
    const rowTop = y;
    lines.forEach((line, index) => {
      page.drawText(pdfText(line), {
        x: MARGIN + 8,
        y: rowTop - index * 12,
        size: 9,
        font,
        color: ink
      });
    });
    const baseline = rowTop - (lines.length - 1) * 12;
    const lineTotal = item && item.lineTotal != null
      ? item.lineTotal
      : Number(item && item.price || 0) * Number(item && item.quantity || 0);
    page.drawText(pdfText(item && item.quantity || 0), { x: 310, y: baseline, size: 9, font, color: ink });
    page.drawText(formatAmount(item && item.price), { x: 365, y: baseline, size: 9, font, color: ink });
    page.drawText(formatAmount(lineTotal), { x: 465, y: baseline, size: 9, font: boldFont, color: ink });
    y = baseline - 15;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.5,
      color: divider
    });
  }

  ensureSpace(90);
  y -= 8;
  const drawTotalRow = (label, value, strong) => {
    page.drawText(pdfText(label), {
      x: 340,
      y,
      size: strong ? 11 : 10,
      font: strong ? boldFont : font,
      color: ink
    });
    page.drawText(formatAmount(value), {
      x: 465,
      y,
      size: strong ? 11 : 10,
      font: strong ? boldFont : font,
      color: strong ? dark : ink
    });
    y -= 18;
  };
  drawTotalRow("Sous-total", quote && quote.subtotal, false);
  drawTotalRow("Frais de livraison", quote && quote.shippingCost, false);
  drawTotalRow("TOTAL", quote && quote.total, true);

  if (quote && quote.message) {
    y -= 8;
    ensureSpace(28);
    drawText("Message du client", { font: boldFont, size: 10 });
    for (const line of wrapText(quote.message, font, 9, PAGE_WIDTH - 2 * MARGIN - 16)) {
      ensureSpace(14);
      page.drawText(pdfText(line), { x: MARGIN + 4, y, size: 9, font, color: ink });
      y -= 12;
    }
  }

  for (const pdfPage of doc.getPages()) {
    pdfPage.drawLine({
      start: { x: MARGIN, y: 66 },
      end: { x: PAGE_WIDTH - MARGIN, y: 66 },
      thickness: 0.5,
      color: divider
    });
    pdfPage.drawText(pdfText("Estimation indicative non contractuelle. Prix susceptibles d'être ajustés après validation par notre équipe."), {
      x: MARGIN,
      y: 48,
      size: 8,
      font,
      color: muted
    });
    pdfPage.drawText("contact@tekalis.com  /  +221 78 634 69 46", {
      x: MARGIN,
      y: 30,
      size: 8,
      font,
      color: muted
    });
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
};

module.exports = {
  calculateQuoteTotals,
  generateQuotePdf,
  quotePdfFilename
};
