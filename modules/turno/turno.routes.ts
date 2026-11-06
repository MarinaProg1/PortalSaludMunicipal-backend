import {Router} from 'express';
import { getTurnos, createTurno, updateTurno, deleteTurno, marcarAtendido, getTurnoById } from './turno.controller';
import { CreateTurnoSchema, UpdateTurnoSchema } from './dtos/turno.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { verificarTurnoValido } from '../../middlewares/verificarTurnoValido.middleware';

const router = Router();

router.get('/', getTurnos);
router.get('/:id', getTurnoById);
router.post('/', validarSchema(CreateTurnoSchema), verificarTurnoValido, createTurno);
router.put('/:id', validarSchema(UpdateTurnoSchema), updateTurno);
router.delete('/:id', deleteTurno);
router.patch('/:id/atendido', marcarAtendido);

export default router;