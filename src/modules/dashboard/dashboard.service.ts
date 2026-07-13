import { prisma } from "../../config/database";
import { startOfToday, startOfWeek, startOfMonth, startOfYear, rangeFrom, DateRange } from "../../utils/dateHelpers";

async function sumIncome(range: DateRange): Promise<number> {
  const result = await prisma.income.aggregate({
    where: { deletedAt: null, transactionDate: { gte: range.gte, lte: range.lte } },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}

async function sumExpense(range: DateRange): Promise<number> {
  const result = await prisma.expense.aggregate({
    where: { deletedAt: null, expenseDate: { gte: range.gte, lte: range.lte } },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}

async function periodKpis(range: DateRange) {
  const [income, expense] = await Promise.all([sumIncome(range), sumExpense(range)]);
  return { income, expense, profit: income - expense };
}

export async function getKpis() {
  const [today, week, month, year] = await Promise.all([
    periodKpis(rangeFrom(startOfToday())),
    periodKpis(rangeFrom(startOfWeek())),
    periodKpis(rangeFrom(startOfMonth())),
    periodKpis(rangeFrom(startOfYear())),
  ]);

  return { today, week, month, year };
}

type Period = "daily" | "weekly" | "monthly" | "yearly";

function truncateLabel(date: Date, period: Period): string {
  if (period === "daily") return date.toISOString().slice(0, 10); // YYYY-MM-DD
  if (period === "weekly") {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  }
  if (period === "monthly") return date.toISOString().slice(0, 7); // YYYY-MM
  return date.getFullYear().toString(); // yearly
}

export async function getIncomeExpenseChart(period: Period) {
  // Look back a sensible window depending on granularity so the chart isn't overwhelmed
  const lookbackDays = { daily: 30, weekly: 90, monthly: 365, yearly: 365 * 5 }[period];
  const since = new Date();
  since.setDate(since.getDate() - lookbackDays);

  const [incomeRecords, expenseRecords] = await Promise.all([
    prisma.income.findMany({
      where: { deletedAt: null, transactionDate: { gte: since } },
      select: { transactionDate: true, amount: true },
    }),
    prisma.expense.findMany({
      where: { deletedAt: null, expenseDate: { gte: since } },
      select: { expenseDate: true, amount: true },
    }),
  ]);

  const buckets = new Map<string, { income: number; expense: number }>();

  for (const rec of incomeRecords) {
    const key = truncateLabel(rec.transactionDate, period);
    const bucket = buckets.get(key) ?? { income: 0, expense: 0 };
    bucket.income += Number(rec.amount);
    buckets.set(key, bucket);
  }
  for (const rec of expenseRecords) {
    const key = truncateLabel(rec.expenseDate, period);
    const bucket = buckets.get(key) ?? { income: 0, expense: 0 };
    bucket.expense += Number(rec.amount);
    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, values]) => ({
      label,
      income: values.income,
      expense: values.expense,
      profit: values.income - values.expense,
    }));
}