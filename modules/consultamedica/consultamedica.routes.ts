// ROUTES DE CONSULTA MÉDICA
// Hace: une URL + validador zod + controller.
// Se conecta con: ./consultamedica.controller, ./dtos/consultamedica.schema,
//                 ../../middlewares/validarDatos.middleware.
// Se monta en app.ts con: app.use('/api/v1/consultasmedicas', consultaMedicaRoutes)
import { Router } from 'express';
import { listar, obtenerUna, crear, actualizar, eliminar } from './consultamedica.controller';
import { crearConsultaMedicaSchema, actualizarConsultaMedicaSchema } from './dtos/consultamedica.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { autenticar, permitirRoles } from '../../middlewares/autenticar.middleware';

const router = Router();

const puedeLeer = [autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA', 'MEDICO')];
const puedeAdministrar = [autenticar, permitirRoles('ADMIN', 'MEDICO')];

router.get('/', ...puedeLeer, listar);
router.get('/:id', ...puedeLeer, obtenerUna);
router.post('/', ...puedeAdministrar, validarSchema(crearConsultaMedicaSchema), crear);
router.put('/:id', ...puedeAdministrar, validarSchema(actualizarConsultaMedicaSchema), actualizar);
router.delete('/:id', ...puedeAdministrar, eliminar);

export default router;