import type { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import Paciente from '../modules/paciente/paciente.models';
import { respuestaEstandar } from '../utils/respuestaEstandar';

const JWT_SECRET = process.env.JWT_SECRET || 'claveSecretaDesarrollo';

export interface UsuarioToken {
  id: string;
  email: string;
  user: string;
  rol: string;
}

export type RequestAutenticado = Request & { usuario?: UsuarioToken };

// Verifica el JWT enviado en el header Authorization y deja los datos del usuario en req.usuario
export const autenticar = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return respuestaEstandar(res, 401, false, 'No autorizado');
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as UsuarioToken;
    (req as RequestAutenticado).usuario = payload;
    return next();
  } catch {
    return respuestaEstandar(res, 401, false, 'Token invalido o expirado');
  }
};

// Permite el acceso solo a los roles indicados (recibe el usuario ya autenticado)
export const permitirRoles = (...roles: string[]) => {
  const permitidos = roles.map((rol) => rol.toUpperCase());

  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = (req as RequestAutenticado).usuario;

    if (!usuario || !permitidos.includes((usuario.rol || '').toUpperCase())) {
      return respuestaEstandar(res, 403, false, 'No tiene permisos para realizar esta accion');
    }

    return next();
  };
};

// Busca la ficha del paciente asociada al usuario logueado y la asigna al body.
// Se usa para que un paciente solo pueda sacar turnos a su propio nombre.
export const asignarPacienteAutenticado = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usuario = (req as RequestAutenticado).usuario;

    if (!usuario?.email) {
      return respuestaEstandar(res, 401, false, 'No autorizado');
    }

    const paciente = await Paciente.findOne({ email: usuario.email.toLowerCase() });

    if (!paciente) {
      return respuestaEstandar(res, 404, false, 'No se encontro la ficha de paciente asociada a tu usuario');
    }

    req.body.paciente = String(paciente._id);

    // El paciente no puede definir estado, activo ni observaciones internas
    delete req.body.estado;
    delete req.body.activo;

    return next();
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error al identificar al paciente', error.message);
  }
};
