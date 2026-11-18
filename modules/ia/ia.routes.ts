import { Router } from "express";
import { sugerirAsistencia } from "./ia.controller";
import { autenticar, permitirRoles, resolverMedicoAutenticado } from '../../middlewares/autenticar.middleware';

const router = Router();

router.post("/sugerir", autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA', 'MEDICO'), resolverMedicoAutenticado, sugerirAsistencia);

export default router;