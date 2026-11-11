import { Router } from "express";
import { sugerirAsistencia } from "./ia.controller";
import { autenticar, permitirRoles } from '../../middlewares/autenticar.middleware';

const router = Router();

router.post("/sugerir", autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA', 'MEDICO'), sugerirAsistencia);

export default router;