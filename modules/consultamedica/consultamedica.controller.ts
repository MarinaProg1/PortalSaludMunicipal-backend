import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { ConsultaMedica } from './consultamedica.models';
import { Turno } from '../turno/turno.models';
import { respuestaEstandar } from '../../utils/respuestaEstandar';
import { obtenerMedicoId, pacientePerteneceAlMedico } from '../../utils/medicoScope';

const esObjectId = (valor: string): boolean => /^[0-9a-fA-F]{24}$/.test(valor);

const idDe = (valor: any): string => {
    if (!valor) return '';
    if (typeof valor === 'string') return valor;
    return String(valor._id || valor.id || '');
};

// GET /api/v1/consultasmedicas -> lista consultas (con paciente, medico y turno poblados).
// Acepta ?paciente= y ?turno= para filtrar. El medico solo ve las propias.
export const listar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { paciente, turno } = req.query as { paciente?: string; turno?: string };
        const medicoId = obtenerMedicoId(req);
        const filtro: Record<string, any> = { activo: true };

        if (paciente) {
            if (!esObjectId(paciente)) {
                return respuestaEstandar(res, 400, false, 'El id del paciente no es valido');
            }
            filtro.paciente = new Types.ObjectId(paciente);
        }

        if (turno) {
            if (!esObjectId(turno)) {
                return respuestaEstandar(res, 400, false, 'El id del turno no es valido');
            }
            filtro.turno = new Types.ObjectId(turno);
        }

        if (medicoId) {
            filtro.medico = new Types.ObjectId(medicoId);
        }

        const consultas = await ConsultaMedica.find(filtro)
            .populate('paciente', 'nombre apellido dni email')
            .populate('medico', 'nombre apellido numeroMatricula')
            .populate('turno')
            .sort({ fecha: -1 });
        return respuestaEstandar(res, 200, true, 'consultas medicas listadas', consultas);
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/consultasmedicas/:id -> una por id
export const obtenerUna = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string' || !esObjectId(id)) {
            return respuestaEstandar(res, 400, false, 'id no valido');
        }

        const medicoId = obtenerMedicoId(req);
        const filtro: Record<string, any> = { _id: id };
        if (medicoId) filtro.medico = new Types.ObjectId(medicoId);

        const consulta = await ConsultaMedica.findOne(filtro)
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
        const medicoId = obtenerMedicoId(req);
        const { turno } = req.body as { turno?: string };

        if (medicoId) {
            // El medico nunca puede cargar una consulta a nombre de otro profesional.
            req.body.medico = medicoId;

            if (turno) {
                if (!esObjectId(turno)) {
                    return respuestaEstandar(res, 400, false, 'El id del turno no es valido');
                }

                const turnoDoc = await Turno.findOne({
                    _id: turno,
                    medico: new Types.ObjectId(medicoId),
                    activo: true,
                });

                if (!turnoDoc) {
                    return respuestaEstandar(res, 403, false, 'El turno no pertenece al médico autenticado');
                }

                // El paciente de la consulta siempre debe coincidir con el del turno.
                req.body.paciente = String(turnoDoc.paciente);
            } else if (!req.body.paciente || !(await pacientePerteneceAlMedico(medicoId, String(req.body.paciente)))) {
                return respuestaEstandar(res, 403, false, 'El paciente no pertenece a los pacientes del médico');
            }
        } else if (!req.body.medico) {
            return respuestaEstandar(res, 400, false, 'El medico es obligatorio');
        }

        const consulta = await ConsultaMedica.create(req.body);
        return respuestaEstandar(res, 201, true, 'consulta creada', consulta);
    } catch (error) {
        next(error);
    }
};

// PUT /api/v1/consultasmedicas/:id -> edita campos (ej: diagnostico y tratamiento)
export const actualizar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string' || !esObjectId(id)) {
            return respuestaEstandar(res, 400, false, 'id no valido');
        }

        const medicoId = obtenerMedicoId(req);
        const filtro: Record<string, any> = { _id: id };

        if (medicoId) {
            // El medico solo edita sus consultas y no puede reasignarlas a otro medico.
            filtro.medico = new Types.ObjectId(medicoId);
            req.body.medico = medicoId;
        }

        const consulta = await ConsultaMedica.findOneAndUpdate(filtro, req.body, {
            new: true,
            runValidators: true,
        });
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
        if (typeof id !== 'string' || !esObjectId(id)) {
            return respuestaEstandar(res, 400, false, 'id no valido');
        }

        const medicoId = obtenerMedicoId(req);
        const filtro: Record<string, any> = { _id: id };
        if (medicoId) filtro.medico = new Types.ObjectId(medicoId);

        const consulta = await ConsultaMedica.findOneAndUpdate(filtro, { activo: false }, { new: true });
        if (!consulta) {
            return respuestaEstandar(res, 404, false, 'consulta no encontrada');
        }
        return respuestaEstandar(res, 200, true, 'consulta dada de baja', consulta);
    } catch (error) {
        next(error);
    }
};
