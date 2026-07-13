import { Request, Response, NextFunction } from "express";
import { createNoteSchema, updateNoteSchema, listNoteQuerySchema, idParamSchema } from "./note.validation";
import * as noteService from "./note.service";
import { sendSuccess } from "../../utils/response";
import { z } from "zod";

export async function createNoteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createNoteSchema.parse(req.body);
    const note = await noteService.createNote(input, req.user!.sub, req.ip);
    return sendSuccess(res, note, 201);
  } catch (err) {
    return next(err);
  }
}

export async function listNoteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listNoteQuerySchema.parse(req.query);
    const { records, meta } = await noteService.listNotes(query);
    return res.status(200).json({ success: true, data: { records, meta } });
  } catch (err) {
    return next(err);
  }
}

export async function getNoteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const note = await noteService.getNoteById(id);
    return sendSuccess(res, note);
  } catch (err) {
    return next(err);
  }
}

export async function updateNoteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = updateNoteSchema.parse(req.body);
    const note = await noteService.updateNote(id, input, req.user!.sub, req.ip);
    return sendSuccess(res, note);
  } catch (err) {
    return next(err);
  }
}

export async function deleteNoteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParamSchema.parse(req.params);
    await noteService.deleteNote(id, req.user!.sub, req.ip);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

const togglePinSchema = z.object({ isPinned: z.boolean() });
export async function togglePinHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const { isPinned } = togglePinSchema.parse(req.body);
    const note = await noteService.togglePin(id, isPinned, req.user!.sub);
    return sendSuccess(res, note);
  } catch (err) {
    return next(err);
  }
}

const toggleArchiveSchema = z.object({ isArchived: z.boolean() });
export async function toggleArchiveHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const { isArchived } = toggleArchiveSchema.parse(req.body);
    const note = await noteService.toggleArchive(id, isArchived, req.user!.sub);
    return sendSuccess(res, note);
  } catch (err) {
    return next(err);
  }
}