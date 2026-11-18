import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { ExcepcionAgenda } from './excepcionAgenda.models';
import { TipoExcepcion } from './enum/tipoExcepcion.enum';
import { respuestaEstandar } from '../../utils/respuestaEstandar';
import { Turno } from '../turno/turno.models';
import { EstadoTurno } from '../turno/enum/estadoTurno.enum';
import Paciente from '../paciente/paciente.models';

const obtenerPacienteId = (paciente: unknown): string | null => {
  if (paciente instanceof Types.ObjectId) {
    return paciente.toString();
  }
  return typeof paciente === 'string' && /^[\da-f]{24}$/i.test(paciente) ? paciente : null;
};

export const crearExcepcionAgenda = async (req: Request, res: Response) => {
  try {
    const { medico, fecha, tipo, horaInicio, horaFin, duracionTurnoMinutos, motivo } = req.body;

    // 1. Validar formato estricto YYYY-MM-DD
    if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return respuestaEstandar(
        res,
        400,
        false,
        'La fecha es obligatoria y debe tener el formato YYYY-MM-DD.'
      );
    }

    // 2. Desestructurar de forma segura para TypeScript
    const partesFecha = fecha.split('-').map(Number);
    if (partesFecha.length !== 3 || partesFecha.some(isNaN)) {
      return respuestaEstandar(res, 400, false, 'La fecha indicada no es válida.');
    }

    const anio = partesFecha[0] as number;
    const mes = partesFecha[1] as number;
    const dia = partesFecha[2] as number;

    // 3. Validar que la fecha sea real (ej: que no envíen 31 de febrero)
    const fechaObj = new Date(anio, mes - 1, dia);
    if (
      fechaObj.getFullYear() !== anio ||
      fechaObj.getMonth() !== mes - 1 ||
      fechaObj.getDate() !== dia
    ) {
      return respuestaEstandar(res, 400, false, 'La fecha indicada no es válida.');
    }

    // 4. Obtener la fecha de hoy en formato string YYYY-MM-DD (hora local)
    const hoy = new Date();
    const fechaHoy = [
      hoy.getFullYear(),
      String(hoy.getMonth() + 1).padStart(2, '0'),
      String(hoy.getDate()).padStart(2, '0'),
    ].join('-');

    // 5. Validar que no sea una fecha pasada
    if (fecha < fechaHoy) {
      return respuestaEstandar(
        res,
        400,
        false,
        'La fecha no puede ser anterior a la fecha de hoy.'
      );
    }

    // Validación extra por si el tipo es modificación de horario
    if (tipo === TipoExcepcion.MODIFICACION_HORARIO && (!horaInicio || !horaFin)) {
      return respuestaEstandar(
        res,
        400,
        false,
        'Debe especificar la hora de inicio y fin cuando se trata de una modificación de horario.'
      );
    }

    const inicioDia = new Date(`${fecha}T00:00:00.000Z`);
    const inicioDiaSiguiente = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000);
    
    const turnosAReprogramar = await Turno.find({
      medico,
      fecha: { $gte: inicioDia, $lt: inicioDiaSiguiente },
      activo: true,
      estado: { $in: [EstadoTurno.PENDIENTE, EstadoTurno.CONFIRMADO] },
    })
      .populate('medico', 'nombre apellido')
      .sort({ hora: 1 });

    const pacientesIds = turnosAReprogramar
      .map(({ paciente }) => obtenerPacienteId(paciente))
      .filter((id): id is string => id !== null);

    const pacientes = await Paciente.find({ _id: { $in: pacientesIds } })
      .select('nombre apellido email telefono');

    const pacientesPorId = new Map(pacientes.map((paciente) => [paciente._id.toString(), paciente.toJSON()]));
    
    const turnosConContacto = turnosAReprogramar.map((turno) => {
      const pacienteId = obtenerPacienteId(turno.paciente);

      return {
        ...turno.toJSON(),
        paciente: pacienteId ? pacientesPorId.get(pacienteId) ?? turno.paciente : turno.paciente,
      };
    });

    const nuevaExcepcion = await ExcepcionAgenda.create({
      medico,
      fecha: inicioDia,
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
      {
        ...nuevaExcepcion.toJSON(),
        turnosAReprogramar: turnosConContacto,
      }
    );
  } catch (error: any) {
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
      .populate('medico', 'nombre apellido especialidad')
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

export const getTurnosAReprogramar = async (req: Request, res: Response) => {
  try {
    const hoy = new Date();
    const fechaHoyStr = [
      hoy.getFullYear(),
      String(hoy.getMonth() + 1).padStart(2, '0'),
      String(hoy.getDate()).padStart(2, '0'),
    ].join('-');
    const inicioHoy = new Date(`${fechaHoyStr}T00:00:00.000Z`);

    const excepcionesActivas = await ExcepcionAgenda.find({
      activo: true,
      fecha: { $gte: inicioHoy },
    });

    if (excepcionesActivas.length === 0) {
      return respuestaEstandar(res, 200, true, 'No hay excepciones activas con turnos afectados', []);
    }

    let turnosAfectados: any[] = [];

    for (const exc of excepcionesActivas) {
      const fechaExcStr = new Date(exc.fecha).toISOString().split('T')[0];
      const inicioDia = new Date(`${fechaExcStr}T00:00:00.000Z`);
      const finDia = new Date(`${fechaExcStr}T23:59:59.999Z`);

      const turnosEnFecha = await Turno.find({
        medico: exc.medico,
        fecha: { $gte: inicioDia, $lte: finDia },
        activo: true,
        estado: { $in: [EstadoTurno.PENDIENTE, EstadoTurno.CONFIRMADO] },
      })
        .populate('paciente', 'nombre apellido telefono email dni')
        .populate('medico', 'nombre apellido')
        .populate('especialidad', 'nombre')
        .sort({ hora: 1 });

      const filtrados = turnosEnFecha.filter((turno) => {
        if (exc.tipo === TipoExcepcion.BLOQUEO_TOTAL) return true;
        if (exc.tipo === TipoExcepcion.MODIFICACION_HORARIO && exc.horaInicio && exc.horaFin) {
          return turno.hora < exc.horaInicio || turno.hora >= exc.horaFin;
        }
        return false;
      });

      const conMotivo = filtrados.map((t) => ({
        ...t.toJSON(),
        motivoExcepcion: exc.motivo,
      }));

      turnosAfectados = turnosAfectados.concat(conMotivo);
    }

    return respuestaEstandar(
      res,
      200,
      true,
      'Turnos a reprogramar obtenidos exitosamente',
      turnosAfectados
    );
  } catch (error: any) {
    return respuestaEstandar(
      res,
      500,
      false,
      'Error al obtener los turnos a reprogramar',
      error.message
    );
  }
};