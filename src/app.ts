import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import { authGuard } from "./middleware/authGuard";
import { prisma } from "./config/database";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use("/api/v1/auth", authRoutes);



app.get("/api/v1/auth/me", authGuard, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    include: { userRoles: { include: { role: true } } },
  });
  if (!user) {
    return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } });
  }
  return res.json({
    success: true,
    data: { id: user.id, fullName: user.fullName, email: user.email, roles: user.userRoles.map((ur) => ur.role.name) },
  });
});

app.get("/api/v1/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Route not found" } });
});

app.use(errorHandler);



export default app;