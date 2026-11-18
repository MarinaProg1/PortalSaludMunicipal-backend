// CONTROLLER DE AUTH
// Hace: login (busca usuario activo, compara bcrypt, firma JWT 9h) y registro (hashea y crea).
// Cambio de contraseña: valida la actual, guarda la nueva, sube tokenVersion y devuelve un token nuevo.
// Se conecta con: ./usuario.models, ../../utils/respuestaEstandar, ../../config/env, bcrypt, jsonwebtoken.
// Excepcion: el login NO usa respuestaEstandar, devuelve { ok, token } (lo espera el frontend).
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Usuario } from './usuario.models';
import { respuestaEstandar } from '../../utils/respuestaEstandar';
import type { ICambiarPasswordDTO } from './dtos/auth.schemas';
import { JWT_SECRET } from '../../config/env';
import type { RequestAutenticado } from '../../middlewares/autenticar.middleware';

const BCRYPT_ROUNDS = 12;
// 9 horas = jornada laboral. Si hace falta revocar antes, se usa tokenVersion o activo:false.
const JWT_EXPIRES_IN = '9h';

const firmarToken = (usuario: any): string =>
    jwt.sign(
        {
            id: usuario.id,
            email: usuario.email,
            user: usuario.user,
            rol: usuario.rol,
            tokenVersion: usuario.tokenVersion ?? 0,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({
            email: String(email).toLowerCase().trim(),
            activo: true,
        });

        if (!usuario) {
            return respuestaEstandar(res, 401, false, 'Credenciales inválidas');
        }

        const passwordOk = await bcrypt.compare(password, usuario.password);
        if (!passwordOk) {
            return respuestaEstandar(res, 401, false, 'Credenciales inválidas');
        }

        const token = firmarToken(usuario);

        return res.status(200).json({
            ok: true,
            token,
            debeCambiarPassword: usuario.debeCambiarPassword ?? false,
        });
    } catch (error) {
        next(error);
    }
};

export const registro = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, user, password, rol } = req.body;

        const existente = await Usuario.findOne({ $or: [{ email }, { user }] });
        if (existente) {
            return respuestaEstandar(res, 400, false, 'email o usuario ya registrado');
        }

        const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const usuario = await Usuario.create({ email, user, password: hash, rol });

        return respuestaEstandar(res, 201, true, 'usuario registrado', {
            id: usuario.id,
            email: usuario.email,
            user: usuario.user,
        });
    } catch (error: any) {
        if (error?.code === 11000) {
            return respuestaEstandar(res, 409, false, 'email o usuario ya registrado');
        }
        next(error);
    }
};

export const cambiarPasswordPrimerLogin = async (
    req: Request<unknown, unknown, ICambiarPasswordDTO>,
    res: Response,
    next: NextFunction
) => {
    try {
        // El id sale SIEMPRE del token (autenticar), nunca del body.
        const usuarioId = (req as RequestAutenticado).usuario?.id;

        if (!usuarioId) {
            return respuestaEstandar(res, 401, false, 'No autorizado');
        }

        const { passwordActual, nuevaPassword } = req.body;

        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            return respuestaEstandar(res, 404, false, 'Usuario no encontrado');
        }

        const passwordOk = await bcrypt.compare(passwordActual, usuario.password);
        if (!passwordOk) {
            return respuestaEstandar(res, 400, false, 'La contraseña actual es incorrecta');
        }

        if (passwordActual === nuevaPassword) {
            return respuestaEstandar(res, 400, false, 'La nueva contraseña debe ser distinta a la actual');
        }

        usuario.password = await bcrypt.hash(nuevaPassword, BCRYPT_ROUNDS);
        usuario.debeCambiarPassword = false;
        usuario.tokenVersion = (usuario.tokenVersion ?? 0) + 1;
        await usuario.save();

        const token = firmarToken(usuario);

        return respuestaEstandar(res, 200, true, 'Contraseña actualizada exitosamente', { token });
    } catch (error) {
        next(error);
    }
};
