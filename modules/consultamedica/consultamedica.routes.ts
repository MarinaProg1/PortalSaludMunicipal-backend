// ROUTES DE CONSULTA MÉDICA
// Hace: une URL + validador zod + controller.
// Se conecta con: ./consultamedica.controller, ./dtos/consultamedica.schema,
//                 ../../middlewares/validarDatos.middleware.
// Se monta en app.ts con: app.use('/api/v1/consultasmedicas', consultaMedicaRoutes)
import { Router } from 'express';
import { listar, obtenerUna, crear, actualizar, eliminar } from './consultamedica.controller';
import { crearConsultaMedicaSchema, actualizarConsultaMedicaSchema } from './dtos/consultamedica.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';

const router = Router();

router.get('/', listar);
router.get('/:id', obtenerUna);
router.post('/', validarSchema(crearConsultaMedicaSchema), crear);
router.put('/:id', validarSchema(actualizarConsultaMedicaSchema), actualizar);
router.delete('/:id', eliminar);

export default router;