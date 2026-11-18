import { Router } from 'express';
import {
  obtenerPerfil,
  actualizarPerfil
} from '../auth/usuario.controller';
import { autenticar } from '../../middlewares/autenticar.middleware'; 

const router = Router();

// Todas las rutas de perfil requieren que el usuario esté autenticado
router.get('/perfil', autenticar, obtenerPerfil);
router.put('/perfil', autenticar, actualizarPerfil);

export default router;