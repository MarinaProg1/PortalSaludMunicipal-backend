import {Router} from 'express';

import { getTurnos,getTurnosDisponibles, createTurno, updateTurno, deleteTurno, marcarAtendido, getTurnoById, getDisponibilidadMes,getTurnosPendientesHistoricos, cancelarTurno, getMisTurnos, getMiTurnoById  } from './turno.controller';

import { CreateTurnoSchema, UpdateTurnoSchema } from './dtos/turno.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { verificarTurnoValido } from '../../middlewares/verificarTurnoValido.middleware';
import { autenticar, permitirRoles, asignarPacienteAutenticado, resolverMedicoAutenticado } from '../../middlewares/autenticar.middleware';

const router = Router();

const personalYLectura = ['ADMIN', 'RECEPCIONISTA', 'MEDICO'] as const;
const puedeAdministrarTurnos = ['ADMIN', 'RECEPCIONISTA'] as const;
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

// Lectura para el personal: el medico queda limitado a sus propios turnos por el resolver.
router.get('/', autenticar, permitirRoles(...personalYLectura), resolverMedicoAutenticado, getTurnos);
router.get('/:id', autenticar, permitirRoles(...personalYLectura), resolverMedicoAutenticado, getTurnoById);

// Crear, reprogramar, cancelar y eliminar: solo ADMIN y RECEPCIONISTA.
router.post('/', autenticar, permitirRoles(...puedeAdministrarTurnos), validarSchema(CreateTurnoSchema), verificarTurnoValido, createTurno);
router.put('/:id', autenticar, permitirRoles(...puedeAdministrarTurnos), validarSchema(UpdateTurnoSchema), updateTurno);
router.delete('/:id', autenticar, permitirRoles(...puedeAdministrarTurnos), deleteTurno);
router.patch('/:id/cancelar', autenticar, permitirRoles(...puedeAdministrarTurnos), cancelarTurno);

// El medico cierra la atencion de un turno propio.
router.patch('/:id/atendido', autenticar, permitirRoles(...personalYLectura), resolverMedicoAutenticado, marcarAtendido);

export default router;
