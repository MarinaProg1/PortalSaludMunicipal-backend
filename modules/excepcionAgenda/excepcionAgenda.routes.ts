import { Router } from 'express';
import { 
  crearExcepcionAgenda, 
  getExcepcionesAgenda, 
  desactivarExcepcionAgenda 
} from './excepcionAgenda.controller';
import { autenticar, permitirRoles } from '../../middlewares/autenticar.middleware';

const router = Router();

// Las excepciones modifican la agenda de un medico: solo personal autorizado.
const personalAgenda = ['ADMIN', 'RECEPCIONISTA', 'MEDICO'] as const;

router.post('/', autenticar, permitirRoles(...personalAgenda), crearExcepcionAgenda);
router.get('/', autenticar, permitirRoles(...personalAgenda), getExcepcionesAgenda);
router.patch('/:id/desactivar', autenticar, permitirRoles(...personalAgenda), desactivarExcepcionAgenda);

export default router;
