import type { Request, Response } from "express";
import Especialidad from './especialidad.models';
import { respuestaEstandar } from '../../utils/respuestaEstandar';
import type { ICrearEspecialidadDTO } from './dtos/especialidad.schema';

export const getEspecialidades = async (req: Request, res: Response) => {
  try {
    const { nombre, activo } = req.query;
    const filtros: any = {};

    if (nombre) {
<<<<<<< HEAD
      filtros.nombre = { $regex: nombre, $options: 'i' }; // busca sin importar mayúsculas
=======
      filtros.nombre = { $regex: nombre, $options: 'i' }; 
>>>>>>> feature/especialidad
    }
    if (activo !== undefined) {
      filtros.activo = activo === 'true';
    } else {
<<<<<<< HEAD
      filtros.activo = true; // por defecto solo activas
=======
      filtros.activo = true; 
>>>>>>> feature/especialidad
    }

    const lista = await Especialidad.find(filtros).sort({ nombre: 1 });
    return respuestaEstandar(res, 200, true, `Se encontraron ${lista.length} especialidades`, lista);
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error al listar', error.message);
  }
};

export const getEspecialidadById = async (req: Request, res: Response) => {
  try {
    const item = await Especialidad.findById(req.params.id);
    if (!item) return respuestaEstandar(res, 404, false, 'Especialidad no encontrada');
    return respuestaEstandar(res, 200, true, 'Especialidad encontrada', item);
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error', error.message);
  }
};

export const createEspecialidad = async (req: Request<unknown, unknown, ICrearEspecialidadDTO>, res: Response) => {
  try {
    const existe = await Especialidad.findOne({ nombre: req.body.nombre.toUpperCase() });
    if (existe) return respuestaEstandar(res, 400, false, 'Ya existe una especialidad con ese nombre');

    const nueva = await Especialidad.create(req.body);
    return respuestaEstandar(res, 201, true, 'Especialidad creada con éxito', nueva);
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error al crear', error.message);
  }
};

export const updateEspecialidad = async (req: Request, res: Response) => {
  try {
    const actualizada = await Especialidad.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!actualizada) return respuestaEstandar(res, 404, false, 'No encontrada');
    return respuestaEstandar(res, 200, true, 'Actualizada correctamente', actualizada);
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error al actualizar', error.message);
  }
};

export const deleteEspecialidad = async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    // Borrado lógico, no físico
=======
>>>>>>> feature/especialidad
    const borrada = await Especialidad.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!borrada) return respuestaEstandar(res, 404, false, 'No encontrada');
    return respuestaEstandar(res, 200, true, 'Especialidad desactivada', borrada);
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error al eliminar', error.message);
  }
};