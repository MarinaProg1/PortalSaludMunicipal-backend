import { Router } from 'express';
import { createMedico, getMedico, deleteMedico } from './medico.controller';
import { MedicoSchema, MedicoUpdateSchema } from './dtos/medico.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';

const router = Router();

router.get('/', getMedico);
router.post('/', validarSchema(MedicoSchema), createMedico);
router.put('/:id', validarSchema(MedicoUpdateSchema), async (req, res) => { /* tu update */ });
router.delete('/:id', deleteMedico); // CORREGIDO

export default router;