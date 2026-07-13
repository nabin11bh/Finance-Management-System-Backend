import { Request, Response, NextFunction } from "express";
import { createIncomeSchema, updateIncomeSchema, listIncomeQuerySchema, idParamSchema } from "./income.validation";
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
    return res.status(200).json({ success: true, data: { records, meta } });
  } catch (err) {
    return next(err);
  }
  
}

export async function getIncomeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const income = await incomeService.getIncomeById(id);
    return sendSuccess(res, income);
  } catch (err) {
    return next(err);
  }
}

export async function updateIncomeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = updateIncomeSchema.parse(req.body);
    const income = await incomeService.updateIncome(id, input, req.user!.sub, req.ip);
    return sendSuccess(res, income);
  } catch (err) {
    return next(err);
  }
}

export async function deleteIncomeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParamSchema.parse(req.params);
    await incomeService.deleteIncome(id, req.user!.sub, req.ip);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}