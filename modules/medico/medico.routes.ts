import { Router } from 'express';
import { createMedico, getMedico, updateMedico, deleteMedico } from './medico.controller';
import { MedicoSchema, MedicoUpdateSchema } from './dtos/medico.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';

const router = Router();

router.get('/', getMedico);
router.post('/', validarSchema(MedicoSchema), createMedico);
router.put('/:id', validarSchema(MedicoUpdateSchema), updateMedico);
router.delete('/:id', deleteMedico); 

export default router;