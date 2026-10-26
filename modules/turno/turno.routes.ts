import {Router} from 'express';
import { getTurnos, createTurno, deleteTurno, marcarAtendido } from './turno.controller';
import { CreateTurnoSchema } from './dtos/turno.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { verificarTurnoValido } from '../../middlewares/verificarTurnoValido.middleware';

const router = Router();

router.get('/', getTurnos);
router.post('/', validarSchema(CreateTurnoSchema), verificarTurnoValido, createTurno);
router.delete('/:id', deleteTurno);
router.patch('/:id/atendido', marcarAtendido);

export default router;