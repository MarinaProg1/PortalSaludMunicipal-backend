import type { Request, Response } from 'express';
import { EstadoTurno } from './emun/estadoTurno.emun';
import { Turno } from './turno.models';
import type { ICreateTurnoDTO, IQueryUrgencia } from './dtos/turno.schema';
import { respuestaEstandar } from '../../utils/respuestaEstandar';

const getTurnos = async (
 req: Request<unknown, unknown, unknown, { id?: string }>,
 res: Response
) => {
  try {
    const { id } = req.query;

    const pacientePopulate = {
      path: 'paciente',
      select: 'nombre apellido obraSocial',
      populate: {
        path: 'obraSocial',
        select: 'razonSocial' 
      }
    };

    if (id) {
      const turno = await Turno.findById(id).populate(pacientePopulate).populate('medico', 'nombre apellido').populate('especialidad', 'nombre');

      if (!turno) return respuestaEstandar(res, 404, false, 'Turno no encontrado');
      return respuestaEstandar(res, 200, true, 'Turno obtenido exitosamente', turno);
    }

    const turnos = await Turno.find({ activo: true })
      .populate(pacientePopulate)
      .populate('medico', 'nombre apellido')
      .populate('especialidad', 'nombre');

    return respuestaEstandar(res, 200, true, 'Turnos obtenidos exitosamente', turnos);
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error interno del servidor', error.message);
  }
};

const createTurno = async (
  req: Request<unknown, unknown, ICreateTurnoDTO, IQueryUrgencia>,
  res: Response
) => {
  try {
    const esUrgente = req.query.urgencia === 'true';

    const datosDelTurno = {
      ...req.body,
      estado: esUrgente ? EstadoTurno.ATENDIDO : EstadoTurno.PENDIENTE,
      observaciones: esUrgente ? 'Ingreso por guardia médica' : '',
    };

    if (esUrgente) console.log('🚨 ALERTA: registrado un turno de urgencia');

    const nuevoTurno = await Turno.create(datosDelTurno);
    return respuestaEstandar(res, 201, true, 'Turno creado exitosamente', nuevoTurno);
  } catch (error: any) {
    //Capturar cuando el turno ya está reservado a nivel de índice de MongoDB (E11000)
    if (error.code === 11000) {
      return respuestaEstandar( res, 409, false, 'El médico ya tiene asignado un turno asignado en la misma fecha y hora', null);
    }

    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map((err: any) => err.message);
      return respuestaEstandar(res, 400, false, 'Error de validación', errores);
    }

    return respuestaEstandar(res, 500, false, 'Error interno del servidor', error.message);
  }
};

const deleteTurno = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    const turnoBorrado = await Turno.findByIdAndUpdate(
      id,
      { activo: false, estado: EstadoTurno.CANCELADO },
      { new: true }
    );

    if (!turnoBorrado) {
      return respuestaEstandar(res, 404, false, `Turno no encontrado con ID ${id}`);
    }

    return respuestaEstandar(res, 200, true, 'Turno eliminado exitosamente', turnoBorrado);
  } catch (error: any) {
    console.error('Error al eliminar el turno:', error);
    return respuestaEstandar(res, 400, false, 'ID con formato inválido', error.message);
  }
};

const marcarAtendido = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    const turnoActualizado = await Turno.findByIdAndUpdate(
      id,
      { estado: EstadoTurno.ATENDIDO },
      { new: true }
    );

    if (!turnoActualizado) {
      return respuestaEstandar(res, 404, false, `Turno no encontrado con ID ${id}`);
    }

    return respuestaEstandar(res, 200, true, 'Turno marcado como atendido', turnoActualizado);
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error de servidor', error.message);
  }
};

export { getTurnos, createTurno, deleteTurno, marcarAtendido };