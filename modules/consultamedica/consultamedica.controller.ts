import type { Request, Response, NextFunction } from 'express';
import { ConsultaMedica } from './consultamedica.models';
import { respuestaEstandar } from '../../utils/respuestaEstandar';

// transaccion con historial medico- cuando se carga una consulta si se modifica historial.( implementar . hacer controller aparte que consuma eso)

// GET /api/v1/consultasmedicas -> lista todas (con paciente y turno poblados)
export const listar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const consultas = await ConsultaMedica.find()
            .populate('paciente', 'nombre apellido dni email')
            .populate('medico', 'nombre apellido numeroMatricula')
            .populate('turno');
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
            .populate('paciente', 'nombre apellido dni email')
            .populate('medico', 'nombre apellido numeroMatricula')
            .populate('turno');
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