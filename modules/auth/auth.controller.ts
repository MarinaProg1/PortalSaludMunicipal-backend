// CONTROLLER DE AUTH
// Hace: login (busca usuario activo, compara bcrypt, firma JWT 9h) y registro (hashea y crea).
// Se conecta con: ./usuario.models, ../../utils/respuestaEstandar, bcrypt, jsonwebtoken.
// Excepcion: el login NO usa respuestaEstandar, devuelve { ok, token } (lo espera el frontend).
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Usuario } from './usuario.models';
import { respuestaEstandar } from '../../utils/respuestaEstandar';
import { ICambiarPasswordDTO } from './dtos/auth.schemas';

const JWT_SECRET = process.env.JWT_SECRET || 'claveSecretaDesarrollo';

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ email, activo: true });
        if (!usuario) {
            return respuestaEstandar(res, 401, false, 'credencial invalida');
        }

        const passwordOk = await bcrypt.compare(password, usuario.password);
        if (!passwordOk) {
            return respuestaEstandar(res, 401, false, 'credencial invalida');
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, user: usuario.user, rol: usuario.rol },
            JWT_SECRET,
            { expiresIn: '9h' }
        );

        return res.status(200).json({ 
            ok: true, 
            token, 
            debeCambiarPassword: usuario.debeCambiarPassword 
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

        const hash = await bcrypt.hash(password, 10);
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
export const cambiarPasswordPrimerLogin = async (req: Request<{ id: string }, unknown, ICambiarPasswordDTO>, res: Response) => {
    try {

        const reqAuth = req as Request & { usuario?: { id: string } };
        const usuarioId = reqAuth.usuario?.id;
        const { passwordActual, nuevaPassword } = req.body;

        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            return respuestaEstandar(res, 404, false, 'Usuario no encontrado');
        }

        // Verificar que la contraseña actual sea correcta
        const passwordOk = await bcrypt.compare(passwordActual, usuario.password);
        if (!passwordOk) {
            return respuestaEstandar(res, 400, false, 'La contraseña actual es incorrecta');
        }

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

        // Actualizar la contraseña y cambiar la bandera a false
        usuario.password = hashedPassword;
        usuario.debeCambiarPassword = false;
        await usuario.save();

        return respuestaEstandar(res, 200, true, 'Contraseña actualizada exitosamente');
    } catch (error: any) {
        return respuestaEstandar(res, 500, false, 'Error al cambiar la contraseña', error.message);
    }
};