import { Router } from 'express';
import { createPaciente, getPacienteById, getPacientes, deletePaciente, updatePaciente, updateContactoDireccion } from './paciente.controller';
import { CrearPacienteSchema, ActualizarPacienteSchema, ActualizarContactoDireccionSchema } from './dtos/paciente.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';


const router = Router();

router.get('/', getPacientes);
router.get('/:id', getPacienteById);
router.post('/', validarSchema(CrearPacienteSchema), createPaciente);
router.put('/eliminar', deletePaciente);
router.put('/:id', validarSchema(ActualizarPacienteSchema), updatePaciente);
router.patch('/:id/contacto-direccion', validarSchema(ActualizarContactoDireccionSchema), updateContactoDireccion);

export default router;