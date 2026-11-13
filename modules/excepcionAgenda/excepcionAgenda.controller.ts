import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { ExcepcionAgenda } from './excepcionAgenda.models';
import { TipoExcepcion } from './enum/tipoExcepcion.enum';
import { respuestaEstandar } from '../../utils/respuestaEstandar';


export const crearExcepcionAgenda = async (req: Request, res: Response) => {
  try {
    const { medico, fecha, tipo, horaInicio, horaFin, duracionTurnoMinutos, motivo } = req.body;

    // Validación extra por si el tipo es modificación de horario
    if (tipo === TipoExcepcion.MODIFICACION_HORARIO && (!horaInicio || !horaFin)) {
      return respuestaEstandar(
        res,
        400,
        false,
        'Debe especificar la hora de inicio y fin cuando se trata de una modificación de horario.'
      );
    }

    const nuevaExcepcion = await ExcepcionAgenda.create({
      medico,
      fecha,
      tipo,
      horaInicio: tipo === TipoExcepcion.MODIFICACION_HORARIO ? horaInicio : undefined,
      horaFin: tipo === TipoExcepcion.MODIFICACION_HORARIO ? horaFin : undefined,
      duracionTurnoMinutos: duracionTurnoMinutos || 30,
      motivo,
      activo: true,
    });

    return respuestaEstandar(
      res,
      201,
      true,
      'Excepción de agenda registrada correctamente',
      nuevaExcepcion
    );
  } catch (error: any) {
    // Código 11000 de MongoDB: Violación de índice único (Ya existe excepción para ese médico en esa fecha)
    if (error.code === 11000) {
      return respuestaEstandar(
        res,
        409,
        false,
        'Ya existe una excepción activa registrada para este médico en la fecha indicada.'
      );
    }
    return respuestaEstandar(
      res,
      500,
      false,
      'Error al registrar la excepción de agenda',
      error.message
    );
  }
};

export const getExcepcionesAgenda = async (req: Request, res: Response) => {
  try {
    const { medico } = req.query;
    const filtro: Record<string, any> = { activo: true };

    if (medico) {
      filtro.medico = new Types.ObjectId(medico as string);
    }

    const excepciones = await ExcepcionAgenda.find(filtro)
      .populate('medico', 'nombre apellido especialidad') // Opcional: trae datos del médico
      .sort({ fecha: 1 });

    return respuestaEstandar(
      res,
      200,
      true,
      'Excepciones de agenda obtenidas exitosamente',
      excepciones
    );
  } catch (error: any) {
    return respuestaEstandar(
      res,
      500,
      false,
      'Error al obtener las excepciones de agenda',
      error.message
    );
  }
};


export const desactivarExcepcionAgenda = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const excepcionActualizada = await ExcepcionAgenda.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!excepcionActualizada) {
      return respuestaEstandar(res, 404, false, 'No se encontró la excepción de agenda indicada.');
    }

    return respuestaEstandar(
      res,
      200,
      true,
      'Excepción de agenda desactivada correctamente. El médico recupera su horario habitual.',
      excepcionActualizada
    );
  } catch (error: any) {
    return respuestaEstandar(
      res,
      500,
      false,
      'Error al desactivar la excepción de agenda',
      error.message
    );
  }
};