import { Router } from 'express';
import { createMedico, getMedico, getMedicoById, updateMedico, deleteMedico } from './medico.controller';
import { MedicoSchema, MedicoUpdateSchema } from './dtos/medico.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { autenticar, permitirRoles } from '../../middlewares/autenticar.middleware';

const router = Router();

// Los 4 roles pueden consultar profesionales (el paciente lo necesita para sacar turno).
const puedeLeer = [autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA', 'MEDICO', 'PACIENTE')];
const puedeAdministrar = [autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA')];

router.get('/', ...puedeLeer, getMedico);
router.get('/:id', ...puedeLeer, getMedicoById);
router.post('/', ...puedeAdministrar, validarSchema(MedicoSchema), createMedico);
router.put('/:id', ...puedeAdministrar, validarSchema(MedicoUpdateSchema), updateMedico);
router.delete('/:id', ...puedeAdministrar, deleteMedico); 

export default router;