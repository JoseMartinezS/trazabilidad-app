import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/routes";
import usersRoutes from "./modules/users/routes";
import stationsRoutes from "./modules/stations/routes";
import partsRoutes from "./modules/parts/routes";
import movementsRoutes from "./modules/movements/routes";
import qualityRoutes from "./modules/quality/routes";
import traceabilityRoutes from "./modules/traceability/routes";
import dashboardRoutes from "./modules/dashboard/routes";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "trazabilidad-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/stations", stationsRoutes);
app.use("/api/parts", partsRoutes);
app.use("/api/movements", movementsRoutes);
app.use("/api/quality", qualityRoutes);
app.use("/api/traceability", traceabilityRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${env.port}`);
});

export default app;