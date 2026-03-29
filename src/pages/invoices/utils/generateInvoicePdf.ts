import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, parseISO } from "date-fns";
import type { InvoiceDetail } from "../hooks/useInvoices";

// jsPDF ships Helvetica with WinAnsi encoding — only Latin-1 glyphs are safe.
// ₹ (U+20B9) is not in that set and renders as "1". Use ASCII-safe symbols.
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "\u20AC", GBP: "\u00A3", JPY: "\u00A5",
  CAD: "CA$", AUD: "A$", CHF: "CHF", CNY: "\u00A5",
  INR: "Rs.", BDT: "Tk", SGD: "S$", MYR: "RM",
};

function formatCurrency(n: number, currencyCode: string): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] ?? currencyCode;
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
  return `${symbol} ${formatted}`;
}

const C = {
  black:   [15,  23,  42]  as [number, number, number],
  muted:   [100, 116, 139] as [number, number, number],
  border:  [226, 232, 240] as [number, number, number],
  green:   [22,  163, 74]  as [number, number, number],
  red:     [220, 38,  38]  as [number, number, number],
  white:   [255, 255, 255] as [number, number, number],
  badgeBg: [241, 245, 249] as [number, number, number],
};

export function generateInvoicePdf(
  invoice: InvoiceDetail,
  businessName?: string,
  currency = "INR",
) {
  const fmt = (n: number) => formatCurrency(n, currency);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const M = 18; // margin
  const RX = pageW - M; // right edge

  let y = 18;

  // ── INVOICE title ───────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...C.black);
  doc.text("INVOICE", M, y);

  // Status badge (top-right)
  const statusLabel = invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1);
  const badgePad = 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  const labelW = doc.getTextWidth(statusLabel) + badgePad * 2;
  const badgeX = RX - labelW;
  const badgeY = y - 5;
  doc.setFillColor(...C.badgeBg);
  doc.roundedRect(badgeX, badgeY, labelW, 6, 1.5, 1.5, "F");
  doc.setTextColor(...C.muted);
  doc.text(statusLabel, badgeX + badgePad, badgeY + 4.2);

  // Business name (above badge if present)
  if (businessName) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.black);
    doc.text(businessName, RX, badgeY - 2, { align: "right" });
  }

  // Invoice number
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text(invoice.invoice_number, M, y);

  // Separator
  y += 6;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(M, y, RX, y);

  // ── BILL TO / DETAILS ───────────────────────────────────────────────────────
  y += 7;
  const midX = M + (RX - M) / 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  doc.text("BILL TO", M, y);
  doc.text("DETAILS", midX, y);

  y += 5;
  doc.setFontSize(9);

  const client = invoice.clients;
  let leftY = y;

  if (client) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.black);
    doc.text(client.name, M, leftY);
    leftY += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.muted);
    if (client.company)  { doc.text(client.company, M, leftY); leftY += 4.5; }
    if (client.email)    { doc.text(client.email,   M, leftY); leftY += 4.5; }
    if (client.phone)    { doc.text(client.phone,   M, leftY); leftY += 4.5; }
    if (client.address)  {
      const lines = doc.splitTextToSize(client.address, midX - M - 6);
      doc.text(lines, M, leftY);
      leftY += lines.length * 4.5;
    }
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.muted);
    doc.text("No client", M, leftY);
    leftY += 5;
  }

  // Dates (right column)
  let rightY = y;
  const dateLabel = (label: string, value: string) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.muted);
    doc.text(label, midX, rightY);
    doc.setTextColor(...C.black);
    doc.text(value, RX, rightY, { align: "right" });
    rightY += 5.5;
  };
  dateLabel("Issue Date", format(parseISO(invoice.issue_date), "dd MMM yyyy"));
  dateLabel("Due Date",   format(parseISO(invoice.due_date),   "dd MMM yyyy"));

  // Separator
  y = Math.max(leftY, rightY) + 5;
  doc.setDrawColor(...C.border);
  doc.line(M, y, RX, y);
  y += 2;

  // ── Line items table ────────────────────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [["Description", "Qty", "Unit Price", "Amount"]],
    body: invoice.invoice_items.map((item) => [
      item.description,
      item.quantity.toString(),
      fmt(item.unit_price),
      fmt(item.amount),
    ]),
    headStyles: {
      fillColor: false as unknown as [number, number, number],
      textColor: C.muted,
      fontStyle: "normal",
      fontSize: 9,
      lineWidth: { bottom: 0.3 },
      lineColor: C.border,
      cellPadding: { top: 3, bottom: 4, left: 0, right: 0 },
    },
    bodyStyles: {
      fontSize: 9,
      textColor: C.black,
      lineWidth: { bottom: 0.2 },
      lineColor: C.border,
      cellPadding: { top: 3.5, bottom: 3.5, left: 0, right: 0 },
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "right", cellWidth: 20 },
      2: { halign: "right", cellWidth: 42 },
      3: { halign: "right", cellWidth: 42 },
    },
    // Ensure head cells in numeric columns are also right-aligned
    // (headStyles can override columnStyles halign in some autotable versions)
    didParseCell: (data: { section: string; column: { index: number }; cell: { styles: { halign: string } } }) => {
      if (data.section === "head" && data.column.index > 0) {
        data.cell.styles.halign = "right";
      }
    },
    theme: "plain",
  });

  // ── Totals ─────────────────────────────────────────────────────────────────
  const tableEndY = (doc as jsPDF & { lastAutoTable: { finalY: number } })
    .lastAutoTable.finalY;

  let ty = tableEndY + 6;
  const labelX = RX - 80;

  const totRow = (
    label: string,
    value: string,
    bold = false,
    color: [number, number, number] = C.black,
  ) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 10 : 9);
    doc.setTextColor(...C.muted);
    doc.text(label, labelX, ty);
    doc.setTextColor(...color);
    doc.text(value, RX, ty, { align: "right" });
    ty += bold ? 5.5 : 5;
  };

  totRow("Subtotal", fmt(invoice.subtotal));
  if (invoice.tax_rate > 0)
    totRow(`Tax (${invoice.tax_rate}%)`, fmt(invoice.tax_amount));
  if (invoice.discount_amount > 0)
    totRow("Discount", `-${fmt(invoice.discount_amount)}`, false, C.red);

  // line before Total
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(labelX, ty, RX, ty);
  ty += 4;

  totRow("Total", fmt(invoice.total), true, C.green);

  // ── Notes & Terms ──────────────────────────────────────────────────────────
  if (invoice.notes || invoice.terms) {
    ty += 4;
    doc.setDrawColor(...C.border);
    doc.line(M, ty, RX, ty);
    ty += 7;

    const colW = (RX - M) / 2 - 5;

    if (invoice.notes) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...C.black);
      doc.text("Notes", M, ty);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.muted);
      const lines = doc.splitTextToSize(invoice.notes, colW);
      doc.text(lines, M, ty + 5);
    }

    if (invoice.terms) {
      const tx = invoice.notes ? M + colW + 10 : M;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...C.black);
      doc.text("Terms & Conditions", tx, ty);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.muted);
      const lines = doc.splitTextToSize(invoice.terms, colW);
      doc.text(lines, tx, ty + 5);
    }
  }

  doc.save(`${invoice.invoice_number}.pdf`);
}
