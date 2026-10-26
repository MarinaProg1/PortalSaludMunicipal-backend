import { Router } from 'express';
import { createMedico, getMedico, deleteMedico } from './medico.controller';
import { MedicoSchema } from './dtos/medico.schema.ts';
import { validarSchema } from '../../middlewares/validarDatos.middleware';

const router = Router();

router.get('/', getMedico);
router.post('/', validarSchema(MedicoSchema), createMedico);
router.put('/eliminar', deleteMedico);

export default router;