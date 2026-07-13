import { Request, Response, NextFunction } from "express";
import * as dashboardService from "./dashboard.service";
import { sendSuccess } from "../../utils/response";

export async function getKpisHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const kpis = await dashboardService.getKpis();
    return sendSuccess(res, kpis);
  } catch (err) {
    return next(err);
  }
}

export async function getIncomeExpenseChartHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const period = (req.query.period as string) || "monthly";
    if (!["daily", "weekly", "monthly", "yearly"].includes(period)) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid period" } });
    }
    const data = await dashboardService.getIncomeExpenseChart(period as any);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
}


export async function getIncomeByCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const data = await dashboardService.getIncomeByCategory(from, to);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
}

export async function getExpenseByCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const data = await dashboardService.getExpenseByCategory(from, to);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
}