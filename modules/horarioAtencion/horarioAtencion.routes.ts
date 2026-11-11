import { Router, type RequestHandler } from 'express';
import { getHorarioAtencion, createHorarioAtencion, updateHorarioAtencion, deleteHorarioAtencion } from './horarioAtencion.controller';
import { HorarioAtencionSchema } from './dtos/horarioAtencion.schema';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { verificarHorarioDisponible } from '../../middlewares/verificarHorarioDisponible';
import { autenticar, permitirRoles } from '../../middlewares/autenticar.middleware';

const router = Router();

// El paciente necesita ver agendas para sacar turno.
router.get('/', autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA', 'MEDICO', 'PACIENTE'), getHorarioAtencion);

router.post('/', autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA'), validarSchema(HorarioAtencionSchema), verificarHorarioDisponible, createHorarioAtencion as unknown as RequestHandler);

router.put('/:id', autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA'), validarSchema(HorarioAtencionSchema), verificarHorarioDisponible, updateHorarioAtencion as unknown as RequestHandler);

router.delete('/:id', autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA'), deleteHorarioAtencion);

export default router;