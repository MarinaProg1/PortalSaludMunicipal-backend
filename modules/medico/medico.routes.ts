import { Router } from 'express';
import { createMedico, getMedico, getMedicoById, updateMedico, deleteMedico } from './medico.controller';
import { MedicoSchema, MedicoUpdateSchema } from './dtos/medico.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';

const router = Router();

router.get('/', getMedico);
router.get('/:id', getMedicoById);
router.post('/', validarSchema(MedicoSchema), createMedico);
router.put('/:id', validarSchema(MedicoUpdateSchema), updateMedico);
router.delete('/:id', deleteMedico); 

export default router;