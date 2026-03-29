import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";

type RawTransaction = {
  id: string;
  type: string;
  amount: number;
  description: string;
  notes: string | null;
  date: string;
  created_at: string;
  payment_method: string | null;
  payment_reference: string | null;
  categories: { name: string; color: string } | null;
};

type Props = {
  range: { from: string; to: string };
  rawTransactions: RawTransaction[];
};

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function ExportButton({ range, rawTransactions }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const wb = new ExcelJS.Workbook();
      wb.creator = "ExpenseTracker";
      wb.created = new Date();

      const ws = wb.addWorksheet("Transactions");

      const totalRows = rawTransactions.length;
      const periodLabel = `${format(new Date(range.from), "dd MMM yyyy")} – ${format(new Date(range.to), "dd MMM yyyy")}`;

      // Banner rows span 9 columns (A–I)
      ws.mergeCells("A1:I1");
      const titleCell = ws.getCell("A1");
      titleCell.value = "Transaction Report";
      titleCell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E293B" },
      };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      ws.getRow(1).height = 30;

      ws.mergeCells("A2:I2");
      const periodCell = ws.getCell("A2");
      periodCell.value = `Period: ${periodLabel}   |   ${totalRows} transaction${totalRows !== 1 ? "s" : ""}`;
      periodCell.font = { size: 10, color: { argb: "FF64748B" } };
      periodCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF8FAFC" },
      };
      periodCell.alignment = { horizontal: "center", vertical: "middle" };
      ws.getRow(2).height = 20;

      // 9 columns — no Type column
      const headers = [
        "Transaction Date",
        "Name",
        "Category",
        "Payment",
        "Account Details",
        "Income (₹)",
        "Expense (₹)",
        "Balance (₹)",
        "Notes",
      ];

      const headerRow = ws.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF334155" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          bottom: { style: "thin", color: { argb: "FF475569" } },
        };
      });
      headerRow.height = 22;

      ws.columns = [
        { width: 18 }, // Transaction Date
        { width: 28 }, // Name
        { width: 18 }, // Category
        { width: 12 }, // Payment
        { width: 22 }, // Account Details
        { width: 16 }, // Income
        { width: 16 }, // Expense
        { width: 16 }, // Balance
        { width: 28 }, // Notes
      ];

      let totalIncome = 0;
      let totalExpense = 0;
      let runningBalance = 0;

      for (const tx of rawTransactions) {
        const isIncome = tx.type === "income";
        if (isIncome) {
          totalIncome += tx.amount;
          runningBalance += tx.amount;
        } else {
          totalExpense += tx.amount;
          runningBalance -= tx.amount;
        }

        const cat = tx.categories as { name: string; color: string } | null;

        const row = ws.addRow([
          format(new Date(tx.date), "dd MMM yyyy"),
          tx.description,
          cat?.name ?? "—",
          tx.payment_method === "account" ? "Account" : "Cash",
          tx.payment_reference ?? "—",
          isIncome ? formatINR(tx.amount) : "",
          !isIncome ? formatINR(tx.amount) : "",
          formatINR(runningBalance),
          tx.notes ?? "—",
        ]);

        if (isIncome) {
          row.getCell(6).font = {
            color: { argb: "FF16A34A" },
            bold: true,
            size: 10,
          };
          row.getCell(6).alignment = { horizontal: "right" };
        } else {
          row.getCell(7).font = {
            color: { argb: "FFDC2626" },
            bold: true,
            size: 10,
          };
          row.getCell(7).alignment = { horizontal: "right" };
        }

        // Balance column: green if positive, red if negative
        row.getCell(8).font = {
          color: { argb: runningBalance >= 0 ? "FF16A34A" : "FFDC2626" },
          bold: true,
          size: 10,
        };
        row.getCell(8).alignment = { horizontal: "right" };

        if (row.number % 2 === 0) {
          row.eachCell({ includeEmpty: true }, (cell, colNum) => {
            if (colNum !== 6 && colNum !== 7 && colNum !== 8) {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF8FAFC" },
              };
            }
          });
        }

        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.font = cell.font ?? {};
          cell.font.size = cell.font.size ?? 10;
          cell.alignment = cell.alignment ?? { vertical: "middle" };
        });
      }

      // Totals footer — label col 6, income col 7, expense col 8
      const net = totalIncome - totalExpense;

      const totalsRow = ws.addRow([
        "",
        "",
        "",
        "",
        "",
        "Totals",
        formatINR(totalIncome),
        formatINR(totalExpense),
        "",
      ]);
      totalsRow.getCell(6).font = { bold: true, size: 10 };
      totalsRow.getCell(7).font = {
        bold: true,
        color: { argb: "FF16A34A" },
        size: 10,
      };
      totalsRow.getCell(7).alignment = { horizontal: "right" };
      totalsRow.getCell(8).font = {
        bold: true,
        color: { argb: "FFDC2626" },
        size: 10,
      };
      totalsRow.getCell(8).alignment = { horizontal: "right" };
      totalsRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
        if (colNum >= 6)
          cell.border = { top: { style: "thin", color: { argb: "FFE2E8F0" } } };
      });

      const netRow = ws.addRow([
        "",
        "",
        "",
        "",
        "",
        "Net Balance",
        `${net >= 0 ? "+" : ""}${formatINR(net)}`,
        "",
        "",
      ]);
      netRow.getCell(6).font = { bold: true, size: 10 };
      netRow.getCell(7).font = {
        bold: true,
        color: { argb: net >= 0 ? "FF16A34A" : "FFDC2626" },
        size: 10,
      };
      netRow.getCell(7).alignment = { horizontal: "right" };

      const buf = await wb.xlsx.writeBuffer();
      const fileName = `transactions_${range.from}_to_${range.to}.xlsx`;
      saveAs(
        new Blob([buf], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        fileName
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full sm:w-auto"
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Export Excel
    </Button>
  );
}
