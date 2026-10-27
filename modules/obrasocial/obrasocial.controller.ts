// CONTROLLER DE OBRA SOCIAL
// Hace: lógica de los 5 endpoints del CRUD (listar, obtener, crear, editar, baja lógica).
// Se conecta con: ./obrasocial.models (lee/escribe MongoDB),
//  ../../utils/respuestaEstandar (respuestas con formato),
// req.body ya validado por dtos/obrasocial.schema.ts (en routes).
import type { Request, Response, NextFunction } from "express";
import { ObraSocial } from './obrasocial.models';
import { respuestaEstandar } from '../../utils/respuestaEstandar';

// GET /api/v1/obrasociales // GET /api/v1/obrasociale
export const listar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filtro = req.query.todas === 'true' ? {} : 
        { activo: true };
                const obras = await ObraSocial.find(filtro).sort({nombre: 1});
                return respuestaEstandar(res, 200, true, 'Listado de obras sociales', obras);
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/obrasociales/:id -> una por id. 400 si el id no es de 24 caracteres, 404 si no existe.
export const obtenerUno = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return respuestaEstandar(res, 400, false, 'id no valido');
        }
        const obra = await ObraSocial.findById(id);
        if (!obra) {
            return respuestaEstandar(res, 404, false, 'obra social no encontrada');
        }
        return respuestaEstandar(res, 200, true, 'obra social encontrada', obra);
    } catch (error) {
        next(error);
    }
};

// POST /api/v1/obrasociales -> alta. Chequea nombre duplicado antes (400)
// y si igualmente colisiona por carrera devuelve 409 (error 11000 de MongoDB).
export const crear = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { nombre, email, telefono } = req.body;

        const existente = await ObraSocial.findOne({ nombre });
        if (existente) {
            return respuestaEstandar(res, 400, false, 'esta obra social ya existe');
        }

        const obra = await ObraSocial.create({ nombre, email, telefono });
        return respuestaEstandar(res, 201, true, 'obra social creada', obra);
    } catch (error: any) {
        if (error?.code === 11000) {
            return respuestaEstandar(res, 409, false, 'esta obra social ya existe');
        }
        next(error);
    }
};

// PUT /api/v1/obrasociales/:id -> editar. Solo manda los campos a cambiar.
export const actualizar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return respuestaEstandar(res, 400, false, 'id no valido');
        }
        const obra = await ObraSocial.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!obra) {
            return respuestaEstandar(res, 404, false, 'obra social no encontrada');
        }
        return respuestaEstandar(res, 200, true, 'obra social actualizada', obra);
    } catch (error: any) {
        if (error?.code === 11000) {
            return respuestaEstandar(res, 409, false, 'ese nombre ya le pertenece a otra obra social');
        }
        next(error);
    }
};

// DELETE /api/v1/obrasociales/:id -> BAJA LOGICA: no borra, pone activo=false.
// Así los pacientes que ya la tienen referenciada no quedan con el id roto.
export const eliminar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return respuestaEstandar(res, 400, false, 'id no valido');
        }
        const obra = await ObraSocial.findByIdAndUpdate(id, { activo: false }, { new: true });
        if (!obra) {
            return respuestaEstandar(res, 404, false, 'obra social no encontrada');
        }
        return respuestaEstandar(res, 200, true, 'obra social dada de baja', obra);
    } catch (error) {
        next(error);
    }
};