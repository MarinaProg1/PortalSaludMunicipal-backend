import { Router } from 'express';
import { createEspecialidad, getEspecialidad, deleteEspecialidad } from './especialidad.controller';
import { crearEspecialidadSchema } from './dtos/especialidad.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';

const router = Router();

router.get('/', getEspecialidad);
router.post('/', validarSchema(crearEspecialidadSchema), createEspecialidad);
router.put('/eliminar', deleteEspecialidad);

export default router;