import type { Request, Response } from "express";
import Paciente from './paciente.models';
import type { ICrearPacienteDTO, IQueryPacientes } from "./dtos/paciente.schema";

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

const createPaciente = async (req: Request<unknown, unknown, ICrearPacienteDTO>, res: Response) => {
    try {
        const nuevoPaciente = await Paciente.create(req.body);

        return respuestaEstandar(res, 201, true, 'Paciente creado exitosamente', nuevoPaciente);
    } catch (error: any) {
        return respuestaEstandar(res, 500, false, 'Error al crear el paciente', error.message);
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

export { getPacientes, createPaciente, deletePaciente };