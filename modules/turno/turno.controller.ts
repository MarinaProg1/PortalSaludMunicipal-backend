import type { Request, Response } from 'express';
import { EstadoTurno } from './enum/estadoTurno.enum';
import { Turno } from './turno.models';
import type { ICreateTurnoDTO, IQueryUrgencia, IUpdateTurnoDTO } from './dtos/turno.schema';
import { respuestaEstandar } from '../../utils/respuestaEstandar';
import Paciente from '../paciente/paciente.models';
import type { RequestAutenticado } from '../../middlewares/autenticar.middleware';

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
const getTurnoById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    const pacientePopulate = {
      path: 'paciente',
      select: 'nombre apellido obraSocial',
      populate: {
        path: 'obraSocial',
        select: 'razonSocial'
      }
    };

    const turno = await Turno.findById(id)
      .populate(pacientePopulate)
      .populate('medico', 'nombre apellido')
      .populate('especialidad', 'nombre');

    if (!turno) {
      return respuestaEstandar(res, 404, false, `Turno no encontrado con ID ${id}`);
    }

    return respuestaEstandar(res, 200, true, 'Turno obtenido exitosamente', turno);
  } catch (error: any) {
    return respuestaEstandar(res, 400, false, 'ID con formato inválido', error.message);
  }
};

const createTurno = async (
  req: Request<unknown, unknown, ICreateTurnoDTO, IQueryUrgencia>,
  res: Response
) => {
  try {
    const esUrgente = req.query.urgencia === 'true';
    const observaciones = (req.body.observaciones || '').trim();

    const datosDelTurno = {
      ...req.body,
      estado: esUrgente ? EstadoTurno.ATENDIDO : EstadoTurno.PENDIENTE,
      observaciones: observaciones || (esUrgente ? 'Ingreso por guardia médica' : ''),
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
const updateTurno = async (
  req: Request<{ id: string }, unknown, IUpdateTurnoDTO>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;

    const pacientePopulate = {
      path: 'paciente',
      select: 'nombre apellido obraSocial',
      populate: {
        path: 'obraSocial',
        select: 'razonSocial'
      }
    };

    const turnoActualizado = await Turno.findByIdAndUpdate(
      id,
      datosActualizacion,
      { new: true, runValidators: true } // new: true devuelve el documento actualizado; runValidators ejecuta las validaciones del modelo
    )
      .populate(pacientePopulate)
      .populate('medico', 'nombre apellido')
      .populate('especialidad', 'nombre');

    if (!turnoActualizado) {
      return respuestaEstandar(res, 404, false, `Turno no encontrado con ID ${id}`);
    }

    return respuestaEstandar(res, 200, true, 'Turno actualizado exitosamente', turnoActualizado);
  } catch (error: any) {
    // Capturar duplicados por índice único en MongoDB (ej. mismo médico, fecha y hora)
    if (error.code === 11000) {
      return respuestaEstandar(
        res, 
        409, 
        false, 
        'El médico ya tiene asignado un turno en la misma fecha y hora', 
        null
      );
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

// Devuelve únicamente los turnos del paciente logueado
const getMisTurnos = async (req: Request, res: Response) => {
  try {
    const usuario = (req as RequestAutenticado).usuario;

    if (!usuario?.email) {
      return respuestaEstandar(res, 401, false, 'No autorizado');
    }

    const paciente = await Paciente.findOne({ email: usuario.email.toLowerCase() });

    if (!paciente) {
      return respuestaEstandar(res, 404, false, 'No se encontró la ficha de paciente asociada a tu usuario');
    }

    const turnos = await Turno.find({ paciente: paciente._id, activo: true })
      .populate('medico', 'nombre apellido')
      .populate('especialidad', 'nombre')
      .sort({ fecha: 1, hora: 1 });

    return respuestaEstandar(res, 200, true, 'Turnos obtenidos exitosamente', turnos);
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error al obtener los turnos', error.message);
  }
};

export { getTurnos, getTurnoById , createTurno, updateTurno, deleteTurno, marcarAtendido, getMisTurnos };