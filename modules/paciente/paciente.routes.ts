import { Router } from 'express';
import { createPaciente, getPacientes, deletePaciente } from './paciente.controller';
import { CrearPacienteSchema } from './dtos/paciente.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';

const router = Router();

router.get('/', getPacientes);
router.post('/', validarSchema(CrearPacienteSchema), createPaciente);
router.put('/eliminar', deletePaciente);

export default router;