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

//category piechart data

export async function getIncomeByCategory(from?: string, to?: string) {
  const where: any = { deletedAt: null };
  if (from || to) {
    where.transactionDate = {};
    if (from) where.transactionDate.gte = new Date(from);
    if (to) where.transactionDate.lte = new Date(to);
  }

  const grouped = await prisma.income.groupBy({
    by: ["incomeCategoryId"],
    where,
    _sum: { amount: true },
  });

  const categories = await prisma.incomeCategory.findMany({
    where: { id: { in: grouped.map((g) => g.incomeCategoryId) } },
  });

  const total = grouped.reduce((sum, g) => sum + Number(g._sum.amount ?? 0), 0);

  return grouped.map((g) => {
    const category = categories.find((c) => c.id === g.incomeCategoryId);
    const amount = Number(g._sum.amount ?? 0);
    return {
      categoryId: g.incomeCategoryId,
      categoryName: category?.name ?? "Unknown",
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
    };
  });
}

export async function getExpenseByCategory(from?: string, to?: string) {
  const where: any = { deletedAt: null };
  if (from || to) {
    where.expenseDate = {};
    if (from) where.expenseDate.gte = new Date(from);
    if (to) where.expenseDate.lte = new Date(to);
  }

  const grouped = await prisma.expense.groupBy({
    by: ["expenseCategoryId"],
    where,
    _sum: { amount: true },
  });

  const categories = await prisma.expenseCategory.findMany({
    where: { id: { in: grouped.map((g) => g.expenseCategoryId) } },
  });

  const total = grouped.reduce((sum, g) => sum + Number(g._sum.amount ?? 0), 0);

  return grouped.map((g) => {
    const category = categories.find((c) => c.id === g.expenseCategoryId);
    const amount = Number(g._sum.amount ?? 0);
    return {
      categoryId: g.expenseCategoryId,
      categoryName: category?.name ?? "Unknown",
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
    };
  });
}

//monthly cash flow by line chart

export async function getMonthlyCashFlow(year: number) {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

  const [incomeRecords, expenseRecords] = await Promise.all([
    prisma.income.findMany({
      where: { deletedAt: null, transactionDate: { gte: yearStart, lte: yearEnd } },
      select: { transactionDate: true, amount: true },
    }),
    prisma.expense.findMany({
      where: { deletedAt: null, expenseDate: { gte: yearStart, lte: yearEnd } },
      select: { expenseDate: true, amount: true },
    }),
  ]);

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    income: 0,
    expense: 0,
  }));

  for (const rec of incomeRecords) {
    months[rec.transactionDate.getMonth()].income += Number(rec.amount);
  }
  for (const rec of expenseRecords) {
    months[rec.expenseDate.getMonth()].expense += Number(rec.amount);
  }

  return months.map((m) => ({ ...m, profit: m.income - m.expense }));
}


//recent transaction widgets

export async function getRecentTransactions() {
  const [incomes, expenses] = await Promise.all([
    prisma.income.findMany({
      where: { deletedAt: null },
      include: { category: true },
      orderBy: { transactionDate: "desc" },
      take: 20,
    }),
    prisma.expense.findMany({
      where: { deletedAt: null },
      include: { category: true },
      orderBy: { expenseDate: "desc" },
      take: 20,
    }),
  ]);

  const combined = [
    ...incomes.map((i) => ({
      id: i.id,
      type: "income" as const,
      date: i.transactionDate,
      amount: Number(i.amount),
      category: i.category.name,
      counterparty: i.clientName,
    })),
    ...expenses.map((e) => ({
      id: e.id,
      type: "expense" as const,
      date: e.expenseDate,
      amount: Number(e.amount),
      category: e.category.name,
      counterparty: e.vendorName,
    })),
  ];

  return combined.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 20);
}