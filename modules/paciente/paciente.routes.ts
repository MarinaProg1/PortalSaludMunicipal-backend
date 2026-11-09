import { Router } from 'express';
import { createPaciente, getPacienteById, getPacientes, getMiPerfil, deletePaciente, updatePaciente, updateContactoDireccion } from './paciente.controller';
import { CrearPacienteSchema, ActualizarPacienteSchema, ActualizarContactoDireccionSchema } from './dtos/paciente.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { autenticar, permitirRoles } from '../../middlewares/autenticar.middleware';


const router = Router();

router.get('/', getPacientes);
router.get('/me', autenticar, permitirRoles('PACIENTE'), getMiPerfil);
router.get('/:id', getPacienteById);
router.post('/', validarSchema(CrearPacienteSchema), createPaciente);
router.delete('/:id', deletePaciente);
router.put('/:id', validarSchema(ActualizarPacienteSchema), updatePaciente);
router.patch('/:id/contacto-direccion', validarSchema(ActualizarContactoDireccionSchema), updateContactoDireccion);

export default router;