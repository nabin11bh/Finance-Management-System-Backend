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