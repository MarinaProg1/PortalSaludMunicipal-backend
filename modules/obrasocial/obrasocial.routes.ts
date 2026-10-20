// ROUTES DE OBRA SOCIAL
// Hace: une cada URL HTTP con su controller y le pega el validador de zod.
// Se conecta con: ./obrasocial.controller (funciones),
//                 ./dtos/obrasocial.schema.ts (validar POST y PUT),
//                 ../../middlewares/validarDatos.middleware (validarSchema).
// Y este router se monta en app.ts con: app.use('/api/v1/obrasociales', obraSocialRoutes)
import { Router } from 'express';
import { listar, obtenerUno, crear, actualizar, eliminar } from './obrasocial.controller';
import { crearObraSocialSchema, actualizarObraSocialSchema } from './dtos/obrasocial.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';

const router = Router();

router.get('/', listar);
router.get('/:id', obtenerUno);
router.post('/', validarSchema(crearObraSocialSchema), crear);
router.put('/:id', validarSchema(actualizarObraSocialSchema), actualizar);
router.delete('/:id', eliminar);

export default router;