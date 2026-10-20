// CONTROLLER DE CONSULTA MÉDICA
// Hace: CRUD con populate (al listar traer los nombres de paciente/turno en vez de solo el id).
// Se conecta con: ./consultamedica.models, ../../utils/respuestaEstandar.
// IMPORTANTE: populate('paciente') y populate('turno') funcionan cuando tu compañera tenga
// los models 'Paciente' y 'Turno' registrados. El populate de 'medico' lo dejo COMENTADO
// porque el modelo Medico todavia no existe: si lo activas antes, el server tira error
// MissingSchemaError. Descomentalo cuando exista el modulo medico.
import type { Request, Response, NextFunction } from 'express';
import { ConsultaMedica } from './consultamedica.models';
import { respuestaEstandar } from '../../utils/respuestaEstandar';

// GET /api/v1/consultasmedicas -> lista todas (con paciente y turno poblados)
export const listar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const consultas = await ConsultaMedica.find()
            .populate('paciente')
            .populate('turno');
            // .populate('medico')   <- descomentar cuando exista el modelo Medico
        return respuestaEstandar(res, 200, true, 'consultas medicas listadas', consultas);
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/consultasmedicas/:id -> una por id
export const obtenerUna = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return respuestaEstandar(res, 400, false, 'id no valido');
        }
        const consulta = await ConsultaMedica.findById(id)
            .populate('paciente')
            .populate('turno');
            // .populate('medico')
        if (!consulta) {
            return respuestaEstandar(res, 404, false, 'consulta no encontrada');
        }
        return respuestaEstandar(res, 200, true, 'consulta encontrada', consulta);
    } catch (error) {
        next(error);
    }
};

// POST /api/v1/consultasmedicas -> crea una consulta nueva
export const crear = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const consulta = await ConsultaMedica.create(req.body);
        return respuestaEstandar(res, 201, true, 'consulta creada', consulta);
    } catch (error) {
        next(error);
    }
};

// PUT /api/v1/consultasmedicas/:id -> edita campos (ej: cargar diagnostico y tratamiento
// cuando el medico atiende, y pasar estado a ATENDIDA)
export const actualizar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return respuestaEstandar(res, 400, false, 'id no valido');
        }
        const consulta = await ConsultaMedica.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!consulta) {
            return respuestaEstandar(res, 404, false, 'consulta no encontrada');
        }
        return respuestaEstandar(res, 200, true, 'consulta actualizada', consulta);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/v1/consultasmedicas/:id -> baja logica igual que obra social
export const eliminar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return respuestaEstandar(res, 400, false, 'id no valido');
        }
        const consulta = await ConsultaMedica.findByIdAndUpdate(id, { activo: false }, { new: true });
        if (!consulta) {
            return respuestaEstandar(res, 404, false, 'consulta no encontrada');
        }
        return respuestaEstandar(res, 200, true, 'consulta dada de baja', consulta);
    } catch (error) {
        next(error);
    }
};