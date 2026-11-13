import {Router} from 'express';

import { getTurnos,getTurnosDisponibles, createTurno, updateTurno, deleteTurno, marcarAtendido, getTurnoById, getDisponibilidadMes,getTurnosPendientesHistoricos, cancelarTurno, getMisTurnos, getMiTurnoById  } from './turno.controller';

import { CreateTurnoSchema, UpdateTurnoSchema } from './dtos/turno.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { verificarTurnoValido } from '../../middlewares/verificarTurnoValido.middleware';
import { autenticar, permitirRoles, asignarPacienteAutenticado } from '../../middlewares/autenticar.middleware';

const router = Router();

router.get('/pendientes-historicos', getTurnosPendientesHistoricos);
router.get('/disponibles', getTurnosDisponibles);
router.get('/disponibilidad-mes', getDisponibilidadMes); 
router.get('/', getTurnos);
router.get('/:id', getTurnoById);
router.post('/', validarSchema(CreateTurnoSchema), verificarTurnoValido, createTurno);
router.put('/:id', validarSchema(UpdateTurnoSchema), updateTurno);
router.delete('/:id', deleteTurno);
router.patch('/:id/cancelar', cancelarTurno);
router.patch('/:id/atendido', marcarAtendido);

// Rutas propias del paciente logueado (deben ir antes de /:id)
router.get('/mis-turnos', autenticar, permitirRoles('PACIENTE'), getMisTurnos);
router.get('/mis-turnos/:id', autenticar, permitirRoles('PACIENTE'), getMiTurnoById);
router.post(
  '/mis-turnos',
  autenticar,
  permitirRoles('PACIENTE'),
  asignarPacienteAutenticado,
  validarSchema(CreateTurnoSchema),
  verificarTurnoValido,
  createTurno
);

router.get('/', autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA', 'MEDICO'), getTurnos);
router.get('/:id', autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA', 'MEDICO'), getTurnoById);
router.post('/', autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA', 'MEDICO'), validarSchema(CreateTurnoSchema), verificarTurnoValido, createTurno);
router.put('/:id', autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA', 'MEDICO'), validarSchema(UpdateTurnoSchema), updateTurno);
router.delete('/:id', autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA', 'MEDICO'), deleteTurno);
router.patch('/:id/atendido', autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA', 'MEDICO'), marcarAtendido);


export default router;