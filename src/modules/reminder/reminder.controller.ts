import { Request, Response, NextFunction } from "express";
import { createReminderSchema, updateReminderSchema, listReminderQuerySchema, idParamSchema } from "./reminder.validation";
import * as reminderService from "./reminder.service";
import { sendSuccess } from "../../utils/response";

export async function createReminderHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createReminderSchema.parse(req.body);
    const reminder = await reminderService.createReminder(input, req.user!.sub, req.ip);
    return sendSuccess(res, reminder, 201);
  } catch (err) {
    return next(err);
  }
}

export async function listReminderHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listReminderQuerySchema.parse(req.query);
    const { records, meta } = await reminderService.listReminders(query);
    return res.status(200).json({ success: true, data: { records, meta } });
  } catch (err) {
    return next(err);
  }
}

export async function getReminderHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const reminder = await reminderService.getReminderById(id);
    return sendSuccess(res, reminder);
  } catch (err) {
    return next(err);
  }
}

export async function updateReminderHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = updateReminderSchema.parse(req.body);
    const reminder = await reminderService.updateReminder(id, input, req.user!.sub, req.ip);
    return sendSuccess(res, reminder);
  } catch (err) {
    return next(err);
  }
}

export async function deleteReminderHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParamSchema.parse(req.params);
    await reminderService.deleteReminder(id, req.user!.sub, req.ip);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

export async function markCompleteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const reminder = await reminderService.markComplete(id, req.user!.sub, req.ip);
    return sendSuccess(res, reminder);
  } catch (err) {
    return next(err);
  }
}