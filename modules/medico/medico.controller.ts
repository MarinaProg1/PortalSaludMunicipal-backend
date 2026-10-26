import { Request, Response } from 'express';
import MedicoModel from './medico.models';
import { respuestaEstandar } from '../../utils/respuestaEstandar';

export const createMedico = async (req: Request, res: Response) => {
  try {
    const { matricula } = req.body;
    if (!matricula) {
      return respuestaEstandar(res, 400, false, 'La matrícula es obligatoria');
    }
    const existeMatricula = await MedicoModel.findOne({ 
      matricula: matricula.toUpperCase().trim() 
    });
    if (existeMatricula) {
      return respuestaEstandar(res, 409, false, `La matrícula ${matricula} ya está registrada`);
    }
    const nuevoMedico = await MedicoModel.create(req.body);
    return respuestaEstandar(res, 201, true, 'Médico creado', nuevoMedico);
  } catch (error: any) {
    if (error.code === 11000 && error.keyPattern?.matricula) {
      return respuestaEstandar(res, 409, false, 'Matrícula duplicada');
    }
    return respuestaEstandar(res, 400, false, 'Error al crear médico', error.message);
  }
};

export const getMedico = async (req: Request, res: Response) => {
  try {
    const medicos = await MedicoModel.find({ activo: true });
    return respuestaEstandar(res, 200, true, 'Médicos listados', medicos);
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error al obtener médicos', error.message);
  }
};

export const deleteMedico = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await MedicoModel.findByIdAndUpdate(id, { activo: false });
    return respuestaEstandar(res, 200, true, 'Médico desactivado');
  } catch (error: any) {
    return respuestaEstandar(res, 400, false, 'Error al eliminar', error.message);
  }
};