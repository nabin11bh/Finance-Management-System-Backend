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