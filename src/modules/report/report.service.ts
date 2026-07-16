import { prisma } from "../../config/database";

interface ReportFilters {
  from?: string;
  to?: string;
  category_id?: string;
  payment_method?: string;
}

export async function getIncomeReport(filters: ReportFilters) {
  const where: any = { deletedAt: null };
  if (filters.from || filters.to) {
    where.transactionDate = {};
    if (filters.from) where.transactionDate.gte = new Date(filters.from);
    if (filters.to) where.transactionDate.lte = new Date(filters.to);
  }
  if (filters.category_id) where.incomeCategoryId = filters.category_id;
  if (filters.payment_method) where.paymentMethod = filters.payment_method;

  return prisma.income.findMany({
    where,
    include: { category: true },
    orderBy: { transactionDate: "asc" },
  });
}

export async function getExpenseReport(filters: ReportFilters) {
  const where: any = { deletedAt: null };
  if (filters.from || filters.to) {
    where.expenseDate = {};
    if (filters.from) where.expenseDate.gte = new Date(filters.from);
    if (filters.to) where.expenseDate.lte = new Date(filters.to);
  }
  if (filters.category_id) where.expenseCategoryId = filters.category_id;
  if (filters.payment_method) where.paymentMethod = filters.payment_method;

  return prisma.expense.findMany({
    where,
    include: { category: true },
    orderBy: { expenseDate: "asc" },
  });
}

export async function getProfitLossReport(filters: ReportFilters) {
  const [incomes, expenses] = await Promise.all([
    getIncomeReport(filters),
    getExpenseReport(filters),
  ]);

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return {
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
    incomeCount: incomes.length,
    expenseCount: expenses.length,
  };
}