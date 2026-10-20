import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Usuario } from './usuario.models';
import { respuestaEstandar } from '../../utils/respuestaEstandar';

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

        return res.status(200).json({ ok: true, token });
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