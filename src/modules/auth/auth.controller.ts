import { Request, Response, NextFunction } from "express";
import { loginSchema } from "./auth.validation";
import * as authService from "./auth.service";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password);

    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    });

    return res.status(200).json({
      success: true,
      data: { accessToken: result.accessToken, user: result.user },
    });
  } catch (err) {
    return next(err);
  }
  
}

export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    const result = await authService.refresh(refreshToken);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
}

export async function logoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await authService.logout(refreshToken);
    res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      });
    return res.status(200).json({ success: true, data: { message: "Logged out" } });
  } catch (err) {
    return next(err);
  }
}