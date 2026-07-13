import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { writeAuditLog } from "../../services/audit.service";
import { parsePagination, buildMeta } from "../../utils/pagination";

interface CreateIncomeInput {
  transactionDate: string;
  amount: number;
  incomeCategoryId: string;
  incomeSource?: string;
  clientName?: string;
  paymentMethod: string;
  referenceNumber?: string;
  invoiceNumber?: string;
  description?: string;
}

interface ListIncomeQuery {
  page?: string;
  limit?: string;
  from?: string;
  to?: string;
  category_id?: string;
  payment_method?: string;
  amount_min?: number;
  amount_max?: number;
  client_name?: string;
  search?: string;
}

async function assertCategoryExists(categoryId: string) {
  const category = await prisma.incomeCategory.findFirst({
    where: { id: categoryId, deletedAt: null },
  });
  if (!category) {
    throw new AppError(422, "INVALID_CATEGORY", "income_category_id does not reference a valid category");
  }
}

export async function createIncome(input: CreateIncomeInput, userId: string, ip?: string) {
  await assertCategoryExists(input.incomeCategoryId);

  const income = await prisma.income.create({
    data: {
      transactionDate: new Date(input.transactionDate),
      amount: input.amount,
      incomeCategoryId: input.incomeCategoryId,
      incomeSource: input.incomeSource,
      clientName: input.clientName,
      paymentMethod: input.paymentMethod,
      referenceNumber: input.referenceNumber,
      invoiceNumber: input.invoiceNumber,
      description: input.description,
      createdBy: userId,
    },
    include: { category: true },
  });

  await writeAuditLog({
    userId,
    action: "INCOME_CREATED",
    entityType: "income",
    entityId: income.id,
    newValues: income,
    ipAddress: ip,
  });

  return income;
}

export async function listIncome(query: ListIncomeQuery) {
  const { page, limit } = parsePagination(query);

  const where: Prisma.IncomeWhereInput = { deletedAt: null };

  if (query.from || query.to) {
    where.transactionDate = {};
    if (query.from) where.transactionDate.gte = new Date(query.from);
    if (query.to) where.transactionDate.lte = new Date(query.to);
  }
  if (query.category_id) where.incomeCategoryId = query.category_id;
  if (query.payment_method) where.paymentMethod = query.payment_method;
  if (query.amount_min !== undefined || query.amount_max !== undefined) {
    where.amount = {};
    if (query.amount_min !== undefined) where.amount.gte = query.amount_min;
    if (query.amount_max !== undefined) where.amount.lte = query.amount_max;
  }
  if (query.client_name) where.clientName = { contains: query.client_name, mode: "insensitive" };
  if (query.search) {
    where.OR = [
      { description: { contains: query.search, mode: "insensitive" } },
      { clientName: { contains: query.search, mode: "insensitive" } },
      { referenceNumber: { contains: query.search, mode: "insensitive" } },
      { invoiceNumber: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [records, total] = await Promise.all([
    prisma.income.findMany({
      where,
      include: { category: true },
      orderBy: { transactionDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.income.count({ where }),
  ]);

  return { records, meta: buildMeta(page, limit, total) };
}

export async function getIncomeById(id: string) {
  const income = await prisma.income.findFirst({
    where: { id, deletedAt: null },
    include: { category: true },
  });
  if (!income) throw new AppError(404, "NOT_FOUND", "Income record not found");
  return income;
}


interface UpdateIncomeInput {
  transactionDate?: string;
  amount?: number;
  incomeCategoryId?: string;
  incomeSource?: string;
  clientName?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  invoiceNumber?: string;
  description?: string;
}

export async function updateIncome(id: string, input: UpdateIncomeInput, userId: string, ip?: string) {
  const existing = await getIncomeById(id);

  if (input.incomeCategoryId) await assertCategoryExists(input.incomeCategoryId);

  const updated = await prisma.income.update({
    where: { id },
    data: {
      ...(input.transactionDate && { transactionDate: new Date(input.transactionDate) }),
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.incomeCategoryId && { incomeCategoryId: input.incomeCategoryId }),
      ...(input.incomeSource !== undefined && { incomeSource: input.incomeSource }),
      ...(input.clientName !== undefined && { clientName: input.clientName }),
      ...(input.paymentMethod && { paymentMethod: input.paymentMethod }),
      ...(input.referenceNumber !== undefined && { referenceNumber: input.referenceNumber }),
      ...(input.invoiceNumber !== undefined && { invoiceNumber: input.invoiceNumber }),
      ...(input.description !== undefined && { description: input.description }),
      updatedBy: userId,
    },
    include: { category: true },
  });

  await writeAuditLog({
    userId,
    action: "INCOME_UPDATED",
    entityType: "income",
    entityId: id,
    oldValues: existing,
    newValues: updated,
    ipAddress: ip,
  });

  return updated;
}

export async function deleteIncome(id: string, userId: string, ip?: string) {
  const existing = await getIncomeById(id);

  await prisma.income.update({
    where: { id },
    data: { deletedAt: new Date(), updatedBy: userId },
  });

  await writeAuditLog({
    userId,
    action: "INCOME_DELETED",
    entityType: "income",
    entityId: id,
    oldValues: existing,
    ipAddress: ip,
  });
}