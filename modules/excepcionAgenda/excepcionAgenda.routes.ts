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

// Las excepciones modifican la agenda de un medico: solo personal autorizado.
const personalAgenda = ['ADMIN', 'RECEPCIONISTA', 'MEDICO'] as const;

router.post('/', autenticar, permitirRoles(...personalAgenda), validarSchema(excepcionAgendaZodSchema), crearExcepcionAgenda);
router.get('/', autenticar, permitirRoles(...personalAgenda), getExcepcionesAgenda);
router.get('/reprogramar', getTurnosAReprogramar);
router.patch('/:id/desactivar', autenticar, permitirRoles(...personalAgenda), desactivarExcepcionAgenda);

export default router;
