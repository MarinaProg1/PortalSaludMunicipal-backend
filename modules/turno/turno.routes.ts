import {Router} from 'express';
import { getTurnos,getTurnosDisponibles, createTurno, updateTurno, deleteTurno, marcarAtendido, getTurnoById, getDisponibilidadMes,getTurnosPendientesHistoricos, cancelarTurno } from './turno.controller';
import { CreateTurnoSchema, UpdateTurnoSchema } from './dtos/turno.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { verificarTurnoValido } from '../../middlewares/verificarTurnoValido.middleware';

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

export default router;