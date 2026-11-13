import { Router } from 'express';
import { 
  crearExcepcionAgenda, 
  getExcepcionesAgenda, 
  desactivarExcepcionAgenda 
} from './excepcionAgenda.controller';

const router = Router();

router.post('/', crearExcepcionAgenda);
router.get('/', getExcepcionesAgenda);
router.patch('/:id/desactivar', desactivarExcepcionAgenda);

export default router;