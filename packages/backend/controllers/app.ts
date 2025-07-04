import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { verifyToken } from "../middlewares/authMiddleware";
import router from "../routes";
import { Request, Response, NextFunction } from "express";

dotenv.config();
const app = express();
const PORT = 5000;

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
