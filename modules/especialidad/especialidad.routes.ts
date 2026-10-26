import { Router } from 'express';
import { createEspecialidad, getEspecialidades, getEspecialidadById, updateEspecialidad, deleteEspecialidad } from './especialidad.controller';
import { crearEspecialidadSchema, actualizarEspecialidadSchema } from './dtos/especialidad.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';

const router = Router();

router.get('/', getEspecialidades);
router.get('/:id', getEspecialidadById);
router.post('/', validarSchema(crearEspecialidadSchema), createEspecialidad);
router.put('/:id', validarSchema(actualizarEspecialidadSchema), updateEspecialidad);
router.delete('/:id', deleteEspecialidad);

export default router;