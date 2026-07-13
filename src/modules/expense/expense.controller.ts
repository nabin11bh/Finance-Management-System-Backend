import { Request, Response, NextFunction } from "express";
import {
  createExpenseSchema,
  updateExpenseSchema,
  listExpenseQuerySchema,
  idParamSchema,
} from "./expense.validation";
import * as expenseService from "./expense.service";
import { sendSuccess } from "../../utils/response";

export async function createExpenseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createExpenseSchema.parse(req.body);
    const expense = await expenseService.createExpense(input, req.user!.sub, req.ip);
    return sendSuccess(res, expense, 201);
  } catch (err) {
    return next(err);
  }
}

export async function listExpenseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listExpenseQuerySchema.parse(req.query);
    const { records, meta } = await expenseService.listExpense(query);
    return res.status(200).json({ success: true, data: { records, meta } });
  } catch (err) {
    return next(err);
  }
}

export async function getExpenseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const expense = await expenseService.getExpenseById(id);
    return sendSuccess(res, expense);
  } catch (err) {
    return next(err);
  }
}

export async function updateExpenseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = updateExpenseSchema.parse(req.body);
    const expense = await expenseService.updateExpense(id, input, req.user!.sub, req.ip);
    return sendSuccess(res, expense);
  } catch (err) {
    return next(err);
  }
}

export async function deleteExpenseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParamSchema.parse(req.params);
    await expenseService.deleteExpense(id, req.user!.sub, req.ip);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}