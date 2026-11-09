import { Router } from 'express';
import { createPaciente, getPacienteById, getPacientes, getMiPerfil, deletePaciente, updatePaciente, updateContactoDireccion, getTurnosPaciente } from './paciente.controller';
import { CrearPacienteSchema, ActualizarPacienteSchema, ActualizarContactoDireccionSchema } from './dtos/paciente.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { autenticar, permitirRoles } from '../../middlewares/autenticar.middleware';


const router = Router();

// El personal de salud puede leer la ficha; solo ADMIN y RECEPCIONISTA pueden modificarla.
const puedeLeer = [autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA', 'MEDICO')];
const puedeAdministrar = [autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA')];

router.get('/me', autenticar, permitirRoles('PACIENTE'), getMiPerfil);
router.get('/', ...puedeLeer, getPacientes);
router.get('/:id/turnos', ...puedeLeer, getTurnosPaciente);
router.get('/:id', ...puedeLeer, getPacienteById);
router.post('/', ...puedeAdministrar, validarSchema(CrearPacienteSchema), createPaciente);
router.delete('/:id', ...puedeAdministrar, deletePaciente);
router.put('/:id', ...puedeAdministrar, validarSchema(ActualizarPacienteSchema), updatePaciente);
router.patch('/:id/contacto-direccion', ...puedeAdministrar, validarSchema(ActualizarContactoDireccionSchema), updateContactoDireccion);

export default router;