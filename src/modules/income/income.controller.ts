import { Request, Response, NextFunction } from "express";
import { createIncomeSchema, listIncomeQuerySchema } from "./income.validation";
import * as incomeService from "./income.service";
import { sendSuccess } from "../../utils/response";

export async function createIncomeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createIncomeSchema.parse(req.body);
    const income = await incomeService.createIncome(input, req.user!.sub, req.ip);
    return sendSuccess(res, income, 201);
  } catch (err) {
    return next(err);
  }
}

export async function listIncomeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listIncomeQuerySchema.parse(req.query);
    const { records, meta } = await incomeService.listIncome(query);
    return sendSuccess(res, records, 200, meta);
  } catch (err) {
    return next(err);
  }
}

export async function getIncomeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const income = await incomeService.getIncomeById(req.params.id);
    return sendSuccess(res, income);
  } catch (err) {
    return next(err);
  }
}