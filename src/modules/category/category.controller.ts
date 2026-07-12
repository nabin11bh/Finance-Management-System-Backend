import { Request, Response, NextFunction } from "express";
import * as categoryService from "./category.service";
import { sendSuccess } from "../../utils/response";

export async function listIncomeCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await categoryService.getIncomeCategories();
    return sendSuccess(res, categories);
  } catch (err) {
    return next(err);
  }
}

export async function listExpenseCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await categoryService.getExpenseCategories();
    return sendSuccess(res, categories);
  } catch (err) {
    return next(err);
  }
}