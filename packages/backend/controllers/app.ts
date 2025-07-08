import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { verifyToken } from "../middlewares/authMiddleware";
import router from "../routes";
import { Request, Response, NextFunction } from "express";

dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path === "/login") return next();
  verifyToken(req, res, next);
});

app.use(router);

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
