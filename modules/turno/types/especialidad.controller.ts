import type { Request, Response } from "express";
import Especialidad from './especialidad.models';
import { respuestaEstandar } from '../../utils/respuestaEstandar';
import type { ICrearEspecialidadDTO } from './dtos/especialidad.schema';

const getEspecialidad = async (req: Request<unknown, unknown, unknown, ICrearEspecialidadDTO>, res: Response) => {
  try{
    const {nombre} = req.query as any;
    const filtro: Record<string, string> = {};

    if (nombre) filtro.nombre = nombre;

    const especialidades = await Especialidad.find(filtro);

    return respuestaEstandar(res, 200, true, 'Especialidades obtenidas exitosamente', especialidades);

  }catch(error: any){
    return respuestaEstandar(res, 500, false, 'Error al obtener las especialidades', error.message);
  }
}

const createEspecialidad = async (req: Request<unknown, unknown, ICrearEspecialidadDTO>, res: Response) => {
  try {
    const nuevaEspecialidad = await Especialidad.create(req.body);
    return respuestaEstandar(res, 201, true, 'Especialidad creada exitosamente', nuevaEspecialidad);
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error al crear el especialidad', error.message);
  }
};

const deleteEspecialidad = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const especialidadBorrada = await Especialidad.findByIdAndDelete(req.params.id);

    if (!especialidadBorrada) {
      return respuestaEstandar(res, 404, false, 'Especialidad no encontrada');
    }

    return respuestaEstandar(res, 200, true, 'Especialidad eliminada correctamente', especialidadBorrada);
  } catch (error: any) {
    return respuestaEstandar(res, 400, false, 'Error al eliminar la especialidad', error.message);
  }
};

export { getEspecialidad, createEspecialidad, deleteEspecialidad };