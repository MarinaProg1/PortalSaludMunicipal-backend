import { Router } from 'express';
import { 
  crearExcepcionAgenda, 
  getExcepcionesAgenda, 
  desactivarExcepcionAgenda,
  getTurnosAReprogramar 
} from './excepcionAgenda.controller';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import {excepcionAgendaZodSchema } from './dtos/excepcionAgenda.shema'
import { autenticar, permitirRoles } from '../../middlewares/autenticar.middleware';

const router = Router();

router.post(
  '/',
  autenticar,
  permitirRoles('ADMIN', 'RECEPCIONISTA', 'MEDICO'),
  validarSchema(excepcionAgendaZodSchema),
  crearExcepcionAgenda
);
router.get('/', getExcepcionesAgenda);
router.get('/reprogramar', getTurnosAReprogramar);
router.patch('/:id/desactivar', desactivarExcepcionAgenda);

export default router;