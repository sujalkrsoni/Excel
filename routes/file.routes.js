import { Router } from "express";
import { processFile } from "../controllers/file.controller.js";

const router = Router();

router.post("/process", processFile);

export default router;
