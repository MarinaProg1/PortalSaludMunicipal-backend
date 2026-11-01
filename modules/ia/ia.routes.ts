import { Router } from "express";
import { sugerirAsistencia } from "./ia.controller";

const router = Router();

router.post("/sugerir", sugerirAsistencia);

export default router;