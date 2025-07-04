import { Router } from "express";
import noteRoutes from "../routes/noteRoutes";
import userRoutes from "../routes/userRoutes";

const router = Router();

router.use("/notes", noteRoutes);
router.use("/", userRoutes);

export default router;
