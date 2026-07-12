import { prisma } from "../../config/database";

export async function getIncomeCategories() {
  return prisma.incomeCategory.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });
}

export async function getExpenseCategories() {
  return prisma.expenseCategory.findMany({
    where: { deletedAt: null },
    orderBy: [{ groupName: "asc" }, { name: "asc" }],
  });
}