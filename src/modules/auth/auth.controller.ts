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
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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