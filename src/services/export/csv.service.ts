import { stringify } from "csv-stringify/sync";

export function generateIncomeCsv(records: any[]): string {
  return stringify(
    records.map((r) => ({
      Date: new Date(r.transactionDate).toISOString().slice(0, 10),
      Category: r.category.name,
      Client: r.clientName ?? "",
      "Payment Method": r.paymentMethod,
      Amount: Number(r.amount).toFixed(2),
    })),
    { header: true }
  );
}

export function generateExpenseCsv(records: any[]): string {
  return stringify(
    records.map((r) => ({
      Date: new Date(r.expenseDate).toISOString().slice(0, 10),
      Category: r.category.name,
      Vendor: r.vendorName ?? "",
      "Payment Method": r.paymentMethod,
      Amount: Number(r.amount).toFixed(2),
    })),
    { header: true }
  );
}