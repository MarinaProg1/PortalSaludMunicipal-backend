import { Router } from 'express';
import { createEspecialidad, getEspecialidades, getEspecialidadById, updateEspecialidad, deleteEspecialidad } from './especialidad.controller';
import { crearEspecialidadSchema, actualizarEspecialidadSchema } from './dtos/especialidad.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { autenticar, permitirRoles } from '../../middlewares/autenticar.middleware';

const router = Router();

const puedeLeer = [autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA', 'MEDICO', 'PACIENTE')];
const puedeAdministrar = [autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA')];

router.get('/', ...puedeLeer, getEspecialidades);
router.get('/:id', ...puedeLeer, getEspecialidadById);
router.post('/', ...puedeAdministrar, validarSchema(crearEspecialidadSchema), createEspecialidad);
router.put('/:id', ...puedeAdministrar, validarSchema(actualizarEspecialidadSchema), updateEspecialidad);
router.delete('/:id', ...puedeAdministrar, deleteEspecialidad);

export default router;