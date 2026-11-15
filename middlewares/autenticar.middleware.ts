import type { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import Paciente from '../modules/paciente/paciente.models';
import Medico from '../modules/medico/medico.models';
import { Usuario } from '../modules/auth/usuario.models';
import { respuestaEstandar } from '../utils/respuestaEstandar';

export interface UsuarioToken {
  id: string;
  email: string;
  user: string;
  rol: string;
  tokenVersion?: number;
}

export type RequestAutenticado = Request & { usuario?: UsuarioToken };

// El JWT guarda el id del Usuario, pero los turnos/consultas apuntan a la ficha
// Medico. Este tipo expone el id de esa ficha ya resuelta.
export type RequestMedico = RequestAutenticado & { medicoId?: string };

const RUTA_CAMBIO_PASSWORD = '/auth/cambiar-password';
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

// Verifica el JWT, que el usuario siga activo y que su version de token coincida.
// Tambien bloquea todo mientras debeCambiarPassword siga en true.
export const autenticar = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return respuestaEstandar(res, 401, false, 'No autorizado');
  }

  const token = authHeader.slice(7);

  let payload: UsuarioToken;
  try {
    payload = jwt.verify(token, JWT_SECRET) as UsuarioToken;
  } catch {
    return respuestaEstandar(res, 401, false, 'Token invalido o expirado');
  }

  if (!payload.id || !OBJECT_ID.test(payload.id)) {
    return respuestaEstandar(res, 401, false, 'Token invalido');
  }

  try {
    const usuario = await Usuario.findById(payload.id).select(
      'activo rol tokenVersion debeCambiarPassword'
    );

    if (!usuario || !usuario.activo) {
      return respuestaEstandar(res, 401, false, 'Usuario deshabilitado o inexistente');
    }

    if ((usuario.tokenVersion ?? 0) !== (payload.tokenVersion ?? 0)) {
      return respuestaEstandar(res, 401, false, 'Sesion invalida, volve a iniciar sesion');
    }

    if (usuario.debeCambiarPassword && !req.originalUrl.includes(RUTA_CAMBIO_PASSWORD)) {
      return respuestaEstandar(res, 403, false, 'Debe cambiar la contraseña antes de continuar', {
        code: 'DEBE_CAMBIAR_PASSWORD',
      });
    }

    (req as RequestAutenticado).usuario = { ...payload, rol: usuario.rol };
    return next();
  } catch (error) {
    return next(error);
  }
};

// Permite el acceso solo a los roles indicados (recibe el usuario ya autenticado)
export const permitirRoles = (...roles: string[]) => {
  const permitidos = roles.map((rol) => rol.toUpperCase());

  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = (req as RequestAutenticado).usuario;

    if (!usuario) {
      return respuestaEstandar(res, 401, false, 'No autorizado');
    }

    if (!permitidos.includes((usuario.rol || '').toUpperCase())) {
      return respuestaEstandar(res, 403, false, 'No tiene permisos para realizar esta accion');
    }

    return next();
  };
};

// Resuelve la ficha de Medico a partir del email del usuario logueado.
// Solo interviene para el rol MEDICO; cualquier otro rol pasa sin cambios.
// Debe usarse despues de autenticar() y permitirRoles().
export const resolverMedicoAutenticado = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const usuario = (req as RequestAutenticado).usuario;

    if (!usuario) {
      return respuestaEstandar(res, 401, false, 'No autorizado');
    }

    if ((usuario.rol || '').toUpperCase() !== 'MEDICO') {
      return next();
    }

    if (!usuario.email) {
      return respuestaEstandar(res, 401, false, 'No autorizado');
    }

    const medico = await Medico.findOne({
      email: usuario.email.toLowerCase(),
      activo: true,
    }).select('_id');

    if (!medico) {
      return respuestaEstandar(
        res,
        404,
        false,
        'No se encontro la ficha de medico asociada a tu usuario'
      );
    }

    (req as RequestMedico).medicoId = String(medico._id);
    return next();
  } catch (error) {
    return next(error);
  }
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
    return next(error);
  }
};
