import type { Request, Response } from "express";
import Paciente from './paciente.models';
import type { ICrearPacienteDTO, IQueryPacientes, IActualizarPacienteDTO, IActualizarContactoDireccionDTO } from "./dtos/paciente.schema";
import { respuestaEstandar } from '../../utils/respuestaEstandar';

const getPacientes = async (req: Request<unknown, unknown, unknown, IQueryPacientes>, res: Response) => {
    try {
        const { obraSocial, dni } = req.query;
        const filtro: Record<string, string> = {};

        if (obraSocial) filtro['obraSocial.razonSocial'] = obraSocial.toUpperCase();

        if (dni) filtro.dni = dni;

        const pacientes = await Paciente.find(filtro);

        return respuestaEstandar(res, 200, true, 'Pacientes obtenidos exitosamente', pacientes);
    } catch (error: any) {
        return respuestaEstandar(res, 500, false, 'Error al obtener los pacientes', error.message);
    }
};

const getPacienteById = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const paciente = await Paciente.findById(req.params.id).populate('obraSocial');

        if (!paciente) {
            return respuestaEstandar(res, 404, false, 'Paciente no encontrado');
        }

        return respuestaEstandar(res, 200, true, 'Paciente obtenido exitosamente', paciente);
    } catch (error: any) {
        return respuestaEstandar(res, 400, false, 'Error al obtener el paciente', error.message);
    }
};

const createPaciente = async (req: Request<unknown, unknown, ICrearPacienteDTO>, res: Response) => {
    try {
        const nuevoPaciente = await Paciente.create(req.body);

        return respuestaEstandar(res, 201, true, 'Paciente creado exitosamente', nuevoPaciente);
    } catch (error: any) {
        return respuestaEstandar(res, 500, false, 'Error al crear el paciente', error.message);
    }
};
const updatePaciente = async (req: Request<{ id: string }, unknown, IActualizarPacienteDTO>, res: Response) => {
    try {
        const pacienteActualizado = await Paciente.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { 
                returnDocument: 'after', 
                runValidators: true,
                context: 'query'
            }
        );

        if (!pacienteActualizado) {
            return respuestaEstandar(res, 404, false, 'Paciente no encontrado');
        }

        return respuestaEstandar(res, 200, true, 'Paciente actualizado exitosamente', pacienteActualizado);
    } catch (error: any) {
        return respuestaEstandar(res, 400, false, 'Error al actualizar el paciente', error.message);
    }
};

// 2. Endpoint Específico para Dirección, Teléfono y Email
const updateContactoDireccion = async (req: Request<{ id: string }, unknown, IActualizarContactoDireccionDTO>, res: Response) => {
    try {
        // Usamos $set de forma dinámica solo con los campos que llegaron en el body
        const pacienteActualizado = await Paciente.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { 
                returnDocument: 'after', 
                runValidators: true,
                context: 'query'
            }
        );

        if (!pacienteActualizado) {
            return respuestaEstandar(res, 404, false, 'Paciente no encontrado');
        }

        return respuestaEstandar(res, 200, true, 'Datos de contacto y dirección actualizados correctamente', pacienteActualizado);
    } catch (error: any) {
        return respuestaEstandar(res, 400, false, 'Error al actualizar el contacto y dirección', error.message);
    }
};

const deletePaciente = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const pacienteBorrado = await Paciente.findByIdAndDelete(req.params.id);

        if (!pacienteBorrado) {
            return respuestaEstandar(res, 404, false, 'Paciente no encontrado');
        }

        return respuestaEstandar(res, 200, true, 'Paciente eliminado correctamente', pacienteBorrado);
    } catch (error: any) {
        return respuestaEstandar(res, 400, false, 'Error al eliminar el paciente', error.message);
    }
};

export { getPacientes, getPacienteById, createPaciente, deletePaciente, updatePaciente, updateContactoDireccion };