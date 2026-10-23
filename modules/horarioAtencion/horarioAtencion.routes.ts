import {Router} from 'express';
import { getHorarioAtencion, createHorarioAtencion, updateHorarioAtencion } from './horarioAtencion.controller';
import { HorarioAtencionSchema } from './dtos/horarioAtencion.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { verificarHorarioDisponible } from '../../middlewares/verificarHorarioDisponible';

const router = Router();

router.get('/', getHorarioAtencion);

router.post('/',  validarSchema(HorarioAtencionSchema), verificarHorarioDisponible, createHorarioAtencion);

router.put('/:id',validarSchema(HorarioAtencionSchema), verificarHorarioDisponible, updateHorarioAtencion);

export default router;