import {Router} from 'express';
import { getTurnos, createTurno, updateTurno, deleteTurno, marcarAtendido, getTurnoById, getMisTurnos } from './turno.controller';
import { CreateTurnoSchema, UpdateTurnoSchema } from './dtos/turno.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { verificarTurnoValido } from '../../middlewares/verificarTurnoValido.middleware';
import { autenticar, permitirRoles, asignarPacienteAutenticado } from '../../middlewares/autenticar.middleware';

const router = Router();

// Rutas propias del paciente logueado (deben ir antes de /:id)
router.get('/mis-turnos', autenticar, permitirRoles('PACIENTE'), getMisTurnos);
router.post(
  '/mis-turnos',
  autenticar,
  permitirRoles('PACIENTE'),
  asignarPacienteAutenticado,
  validarSchema(CreateTurnoSchema),
  verificarTurnoValido,
  createTurno
);

router.get('/', getTurnos);
router.get('/:id', getTurnoById);
router.post('/', validarSchema(CreateTurnoSchema), verificarTurnoValido, createTurno);
router.put('/:id', validarSchema(UpdateTurnoSchema), updateTurno);
router.delete('/:id', deleteTurno);
router.patch('/:id/atendido', marcarAtendido);

export default router;