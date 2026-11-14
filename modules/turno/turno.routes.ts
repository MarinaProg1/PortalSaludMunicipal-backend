import {Router} from 'express';

import { getTurnos,getTurnosDisponibles, createTurno, updateTurno, deleteTurno, marcarAtendido, getTurnoById, getDisponibilidadMes,getTurnosPendientesHistoricos, cancelarTurno, getMisTurnos, getMiTurnoById  } from './turno.controller';

import { CreateTurnoSchema, UpdateTurnoSchema } from './dtos/turno.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { verificarTurnoValido } from '../../middlewares/verificarTurnoValido.middleware';
import { autenticar, permitirRoles, asignarPacienteAutenticado } from '../../middlewares/autenticar.middleware';

const router = Router();

const personalYLectura = ['ADMIN', 'RECEPCIONISTA', 'MEDICO'] as const;
const cualquierRol = ['ADMIN', 'RECEPCIONISTA', 'MEDICO', 'PACIENTE'] as const;

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

// Consulta de agenda y disponibilidad: cualquier usuario logueado.
router.get('/disponibles', autenticar, permitirRoles(...cualquierRol), getTurnosDisponibles);
router.get('/disponibilidad-mes', autenticar, permitirRoles(...cualquierRol), getDisponibilidadMes);

// Panel administrativo de pendientes historicos.
router.get('/pendientes-historicos', autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA'), getTurnosPendientesHistoricos);

router.get('/', autenticar, permitirRoles(...personalYLectura), getTurnos);
router.get('/:id', autenticar, permitirRoles(...personalYLectura), getTurnoById);
router.post('/', autenticar, permitirRoles(...personalYLectura), validarSchema(CreateTurnoSchema), verificarTurnoValido, createTurno);
router.put('/:id', autenticar, permitirRoles(...personalYLectura), validarSchema(UpdateTurnoSchema), updateTurno);
router.delete('/:id', autenticar, permitirRoles(...personalYLectura), deleteTurno);
router.patch('/:id/cancelar', autenticar, permitirRoles(...personalYLectura), cancelarTurno);
router.patch('/:id/atendido', autenticar, permitirRoles(...personalYLectura), marcarAtendido);

export default router;
