import type { Request, Response } from 'express';
import { EstadoTurno } from './enum/estadoTurno.enum';
import { Turno } from './turno.models';
import { ICreateTurnoDTO, IQueryUrgencia, IUpdateTurnoDTO } from './dtos/turno.schema';
import { respuestaEstandar } from '../../utils/respuestaEstandar';
import { DiasSemana } from '../horarioAtencion/enum/diasSemana.enum';
import { HorarioAtencion } from '../horarioAtencion/horarioAtencion.models';
import { ExcepcionAgenda } from '../excepcionAgenda/excepcionAgenda.models';
import { TipoExcepcion } from '../excepcionAgenda/enum/tipoExcepcion.enum';
import { Types } from 'mongoose';
import { IExcepcionAgenda } from '../excepcionAgenda/types/excepcionAgenda.interface';
import Paciente from '../paciente/paciente.models';
import { ConsultaMedica } from '../consultamedica/consultamedica.models';
import type { RequestAutenticado } from '../../middlewares/autenticar.middleware';


const DIAS_MAPA: Record<number, DiasSemana> = {
  0: DiasSemana.DOMINGO,
  1: DiasSemana.LUNES,
  2: DiasSemana.MARTES,
  3: DiasSemana.MIERCOLES,
  4: DiasSemana.JUEVES,
  5: DiasSemana.VIERNES,
  6: DiasSemana.SABADO,
};
//funcion fecha el dia de hoy en formato YYYY-MM-DD
const obtenerFechaHoyStr = (): string => {
  const hoyObj = new Date();
  const anio = hoyObj.getFullYear();
  const mes = String(hoyObj.getMonth() + 1).padStart(2, '0');
  const dia = String(hoyObj.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};
// Función auxiliar para generar todos los horarios posibles de un bloque
const generarSlots = (horaInicio: string, horaFin: string, duracionMinutos: number): string[] => {
  const slots: string[] = [];
  const [hInicio = 0, mInicio = 0] = horaInicio.split(':').map(Number);
  const [hFin = 0, mFin = 0] = horaFin.split(':').map(Number);
  
  let minutosActuales = hInicio * 60 + mInicio;
  const minutosFin = hFin * 60 + mFin;

  while (minutosActuales < minutosFin) {
    const horaStr = String(Math.floor(minutosActuales / 60)).padStart(2, '0');
    const minStr = String(minutosActuales % 60).padStart(2, '0');
    slots.push(`${horaStr}:${minStr}`);
    minutosActuales += duracionMinutos;
  }
  return slots;
};

const getTurnos = async (
  req: Request<unknown, unknown, unknown, { id?: string; especialidad?: string; medico?: string; fecha?: string }>,
  res: Response
) => {
  try {
    const { id, especialidad, medico, fecha } = req.query;

    const filtro: Record<string, any> = { activo: true };

    if (id) {
      filtro._id = new Types.ObjectId(id);
    }

    if (especialidad) {
      filtro.especialidad = new Types.ObjectId(especialidad);
    }

    if (medico) {
      filtro.medico = new Types.ObjectId(medico);
    }

    if (fecha) {
      const inicioDia = new Date(`${fecha}T00:00:00.000Z`);
      const finDia = new Date(`${fecha}T23:59:59.999Z`);
      filtro.fecha = { $gte: inicioDia, $lte: finDia };
    }

    const pacientePopulate = {
      path: 'paciente',
      select: 'nombre apellido obraSocial',
      populate: {
        path: 'obraSocial',
        select: 'razonSocial' 
      }
    };

    const turnos = await Turno.find(filtro)
      .populate(pacientePopulate)
      .populate('medico', 'nombre apellido')
      .populate('especialidad', 'nombre')
      .sort({ fecha: 1, hora: 1 });

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

const getTurnosDisponibles = async (req: Request, res: Response) => {
  try {
    const { medico, fecha } = req.query as { medico?: string; fecha?: string };

    if (!medico || !fecha) {
      return respuestaEstandar(res, 400, false, 'El ID del médico y la fecha son obligatorios', null);
    }

    const fechaObjTurno = new Date(fecha as string | Date);
    
    if (isNaN(fechaObjTurno.getTime())) {
      return respuestaEstandar(res, 400, false, 'El formato de la fecha no es válido.');
    }

    const anioT = fechaObjTurno.getUTCFullYear();
    const mesT = String(fechaObjTurno.getUTCMonth() + 1).padStart(2, '0');
    const diaT = String(fechaObjTurno.getUTCDate()).padStart(2, '0');
   
    const fechaTurnoStr = `${anioT}-${mesT}-${diaT}`;
    const hoyStr = obtenerFechaHoyStr();

    if (fechaTurnoStr < hoyStr) {
      return respuestaEstandar(res, 400, false, 'No se pueden consultar disponibilidades de fechas pasadas.');
    }

    const inicioDia = new Date(`${fechaTurnoStr}T00:00:00.000Z`);
    const finDia = new Date(`${fechaTurnoStr}T23:59:59.999Z`);

    // Obtenemos el nombre del día de la semana para calcular slots base si hace falta
    const fechaObj = new Date(`${fechaTurnoStr}T00:00:00Z`);
    const diaNombre: DiasSemana | undefined = DIAS_MAPA[fechaObj.getUTCDay()];

    if (!diaNombre) {
      return respuestaEstandar(res, 400, false, 'La fecha proporcionada no es válida', null);
    }

    // 1. Verificar excepciones de agenda
    const excepcionDia = await ExcepcionAgenda.findOne<IExcepcionAgenda>({
      medico,
      fecha: { $gte: inicioDia, $lte: finDia },
      activo: true
    });

    let todosLosSlots: string[] = [];
    let duracionTurno = 30;

    if (excepcionDia) {
      const motivoExcepcion = excepcionDia.motivo || '';

      if (excepcionDia.tipo === TipoExcepcion.BLOQUEO_TOTAL) {
        return respuestaEstandar(res, 200, true, `El médico no atiende este día: ${motivoExcepcion}`, {
          fecha: fechaTurnoStr,
          horariosDisponibles: []
        });
      } else if (excepcionDia.tipo === TipoExcepcion.MODIFICACION_HORARIO && excepcionDia.horaInicio && excepcionDia.horaFin) {
        duracionTurno = excepcionDia.duracionTurnoMinutos || 30;
        todosLosSlots = generarSlots(excepcionDia.horaInicio, excepcionDia.horaFin, duracionTurno);
      }
    } else {
      // Si no hay excepción, cargamos los horarios de atención habituales de ese día
      const horariosAtencion = await HorarioAtencion.find({
        medico: new Types.ObjectId(medico),
        diaSemana: diaNombre,
        activo: true
      });

      if (!horariosAtencion || horariosAtencion.length === 0) {
        return respuestaEstandar(res, 200, true, 'El médico no atiende en el día seleccionado', {
          horariosDisponibles: []
        });
      }

      horariosAtencion.forEach(bloque => {
        duracionTurno = bloque.duracionTurnoMinutos;
        const slotsBloque = generarSlots(bloque.horaInicio, bloque.horaFin, bloque.duracionTurnoMinutos);
        todosLosSlots = todosLosSlots.concat(slotsBloque);
      });
    }

    // 2. Buscar turnos ocupados
    const turnosOcupados = await Turno.find({
      medico: new Types.ObjectId(medico),
      fecha: { $gte: inicioDia, $lte: finDia },
      activo: true,
      estado: { $ne: EstadoTurno.CANCELADO }
    });

    const horasOcupadas = turnosOcupados.map(t => t.hora);
    const horariosLibres = todosLosSlots.filter(slot => !horasOcupadas.includes(slot));

    return respuestaEstandar(res, 200, true, 'Disponibilidad obtenida exitosamente', {
      fecha: fechaTurnoStr,
      diaSemana: diaNombre,
      duracionTurnoMinutos: duracionTurno,
      todosLosSlots,            
      horariosDisponibles: horariosLibres 
    });

  } catch (error: unknown) {
    const err = error as Error;
    return respuestaEstandar(res, 500, false, 'Error al calcular los turnos disponibles', err.message);
  }
};

const getDisponibilidadMes = async (req: Request, res: Response) => {
  try {
    const { medico, anio, mes } = req.query as { medico?: string; anio?: string; mes?: string };

    if (!medico || !anio || !mes) {
      return respuestaEstandar(res, 400, false, 'Faltan parámetros obligatorios (medico, anio, mes)', null);
    }

    const anioNum = parseInt(anio, 10);
    const mesNum = parseInt(mes, 10);

    if (isNaN(anioNum) || isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
      return respuestaEstandar(res, 400, false, 'Año o mes con formato inválido', null);
    }

    const totalDias = new Date(anioNum, mesNum, 0).getDate();
    const diasDisponibilidad = [];

    const horariosAtencion = await HorarioAtencion.find({ medico: new Types.ObjectId(medico), activo: true });
    const hoyStr = obtenerFechaHoyStr();

    for (let dia = 1; dia <= totalDias; dia++) {
      const mesStr = String(mesNum).padStart(2, '0');
      const diaStr = String(dia).padStart(2, '0');
      const fechaStr = `${anioNum}-${mesStr}-${diaStr}`;

      if (fechaStr < hoyStr) {
        diasDisponibilidad.push({ fecha: fechaStr, diaNum: dia, tieneDisponibilidad: false, totalLibres: 0 });
        continue;
      }

      const inicioDia = new Date(`${fechaStr}T00:00:00.000Z`);
      const finDia = new Date(`${fechaStr}T23:59:59.999Z`);

      const fechaObj = new Date(`${fechaStr}T00:00:00Z`);
      const diaNombre = DIAS_MAPA[fechaObj.getUTCDay()];

      // 1. Revisar si hay excepciones para este día puntual
      const excepcionDia = await ExcepcionAgenda.findOne<IExcepcionAgenda>({
        medico,
        fecha: { $gte: inicioDia, $lte: finDia },
        activo: true
      });

      let slotsTeoricos: string[] = [];

      if (excepcionDia) {
        if (excepcionDia.tipo === TipoExcepcion.BLOQUEO_TOTAL) {
          diasDisponibilidad.push({ fecha: fechaStr, diaNum: dia, tieneDisponibilidad: false, totalLibres: 0 });
          continue;
        } else if (excepcionDia.tipo === TipoExcepcion.MODIFICACION_HORARIO && excepcionDia.horaInicio && excepcionDia.horaFin) {
          const duracion = excepcionDia.duracionTurnoMinutos || 30;
          slotsTeoricos = generarSlots(excepcionDia.horaInicio, excepcionDia.horaFin, duracion);
        }
      } else {
        const bloquesDia = horariosAtencion.filter(h => h.diaSemana === diaNombre);
        bloquesDia.forEach(bloque => {
          const slotsBloque = generarSlots(bloque.horaInicio, bloque.horaFin, bloque.duracionTurnoMinutos);
          slotsTeoricos = slotsTeoricos.concat(slotsBloque);
        });
      }

      if (slotsTeoricos.length === 0) {
        diasDisponibilidad.push({ fecha: fechaStr, diaNum: dia, tieneDisponibilidad: false, totalLibres: 0 });
        continue;
      }

      const turnosOcupados = await Turno.find({
        medico: new Types.ObjectId(medico),
        fecha: { $gte: inicioDia, $lte: finDia },
        activo: true,
        estado: { $ne: EstadoTurno.CANCELADO }
      });

      const horasOcupadas = turnosOcupados.map(t => t.hora);
      const slotsLibres = slotsTeoricos.filter(slot => !horasOcupadas.includes(slot));

      diasDisponibilidad.push({
        fecha: fechaStr,
        diaNum: dia,
        tieneDisponibilidad: slotsLibres.length > 0,
        totalLibres: slotsLibres.length
      });
    }

    return respuestaEstandar(res, 200, true, 'Disponibilidad mensual obtenida exitosamente', diasDisponibilidad);

  } catch (error: unknown) {
    const err = error as Error;
    return respuestaEstandar(res, 500, false, 'Error al calcular la disponibilidad mensual', err.message);
  }
};
const createTurno = async (
  req: Request<unknown, unknown, ICreateTurnoDTO, IQueryUrgencia>,
  res: Response
) => {
  try {
    const esUrgente = req.query.urgencia === 'true';

    const { fecha, paciente } = req.body; // Asegúrate de que el body reciba el ID del paciente

    const observaciones = (req.body.observaciones || '').trim();


    if (!fecha || !paciente) {
      return respuestaEstandar(res, 400, false, 'La fecha y el paciente son obligatorios para registrar un turno.');
    }
    const turnosCanceladosCount = await Turno.countDocuments({
      paciente,
      estado: EstadoTurno.CANCELADO,
      activo: false // O según cómo manejes los cancelados en tu DB
    });

    // Si tiene más de 3 cancelaciones, aplicamos la regla de bloqueo temporal
    if (turnosCanceladosCount > 3) {
      // Opcional: Buscar el último turno cancelado para medir la fecha exacta de la sanción (ej: 15 días)
      const ultimoTurnoCancelado = await Turno.findOne({
        paciente,
        estado: EstadoTurno.CANCELADO
      }).sort({ _id: -1 }); // O la fecha de modificación/cancelación

      if (ultimoTurnoCancelado) {
        const fechaCancelacion = new Date(ultimoTurnoCancelado._id.getTimestamp() || ultimoTurnoCancelado.fecha);
        const diasPenalizacion = 15; // 15 días de suspensión (puedes cambiarlo a 7)
        const fechaFinSancion = new Date(fechaCancelacion);
        fechaFinSancion.setDate(fechaFinSancion.getDate() + diasPenalizacion);

        const hoy = new Date();

        // Si la sanción sigue activa
        if (hoy < fechaFinSancion) {
          const diasRestantes = Math.ceil((fechaFinSancion.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
          return respuestaEstandar(
            res, 
            403, 
            false, 
            `Acción bloqueada: El paciente registra múltiples cancelaciones. No podrá solicitar nuevos turnos por ${diasRestantes} días más.`
          );
        }
      }
    }

    //2. Resto de tus validaciones habituales (fechas pasadas, etc.)
    const fechaObjTurno = new Date(fecha as string | Date);
    
    if (isNaN(fechaObjTurno.getTime())) {
      return respuestaEstandar(res, 400, false, 'El formato de la fecha no es válido.');
    }

    const anioT = fechaObjTurno.getUTCFullYear();
    const mesT = String(fechaObjTurno.getUTCMonth() + 1).padStart(2, '0');
    const diaT = String(fechaObjTurno.getUTCDate()).padStart(2, '0');
    const fechaTurnoStr = `${anioT}-${mesT}-${diaT}`;
      
    const hoyStr = obtenerFechaHoyStr();

    if (fechaTurnoStr < hoyStr) {
      return respuestaEstandar(
        res, 
        400, 
        false, 
        'No se pueden registrar turnos con fechas anteriores al día de hoy.'
      );
    }

    const fechaNormalizada = new Date(fechaTurnoStr + 'T00:00:00.000Z');
    const datosDelTurno = {
      ...req.body,
      fecha: fechaNormalizada,
      estado: esUrgente ? EstadoTurno.ATENDIDO : EstadoTurno.PENDIENTE,
      observaciones: observaciones || (esUrgente ? 'Ingreso por guardia médica' : ''),
    };

    const nuevoTurno = await Turno.create(datosDelTurno);
    return respuestaEstandar(res, 201, true, 'Turno creado exitosamente', nuevoTurno);

  } catch (error: unknown) {
    const err = error as Error;
    if ((err as any).code === 11000) {
      return respuestaEstandar(res, 409, false, 'El paciente ya tiene asignado un turno en la misma fecha y hora', null);
    }
    return respuestaEstandar(res, 500, false, 'Error interno del servidor', err.message);
  }
};

const updateTurno = async (
  req: Request<{ id: string }, unknown, IUpdateTurnoDTO>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;

    const turnoExistente = await Turno.findById(id);

    if (!turnoExistente) {
      return respuestaEstandar(res, 404, false, `Turno no encontrado con ID ${id}`);
    }
    if (turnoExistente.estado === EstadoTurno.ATENDIDO) {
      return respuestaEstandar(
        res, 
        400, 
        false, 
        'No se puede modificar este turno porque ya se encuentra en estado ATENDIDO.'
      );
    }

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
      { new: true, runValidators: true }
    )
      .populate(pacientePopulate)
      .populate('medico', 'nombre apellido')
      .populate('especialidad', 'nombre');

    return respuestaEstandar(res, 200, true, 'Turno actualizado exitosamente', turnoActualizado);
    
  } catch (error: any) {
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
    const turno = await Turno.findById(id);

    if (!turno) {
      return respuestaEstandar(res, 404, false, `Turno no encontrado con ID ${id}`);
    }

    if (turno.estado === EstadoTurno.ATENDIDO) {
      return respuestaEstandar(res, 400, false, 'Este turno ya se encuentra marcado como atendido y no puede modificarse.');
    }

    const fechaTurnoIso = new Date(turno.fecha).toISOString();
    const fechaTurnoStr = fechaTurnoIso.split('T')[0];

    const hoyObj = new Date();
    const anio = hoyObj.getFullYear();
    const mes = String(hoyObj.getMonth() + 1).padStart(2, '0');
    const dia = String(hoyObj.getDate()).padStart(2, '0');
    const hoyStr = `${anio}-${mes}-${dia}`;

    if (fechaTurnoStr !== hoyStr) {
      return respuestaEstandar(
        res, 
        400, 
        false, 
        'Acción no permitida: Solo se pueden atender turnos programados para el día de la fecha.'
      );
    }

    turno.estado = EstadoTurno.ATENDIDO;
    await turno.save();

    return respuestaEstandar(res, 200, true, 'Turno marcado como atendido exitosamente', turno);
    
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error de servidor', error.message);
  }
};
const getTurnosPendientesHistoricos = async (req: Request, res: Response) => {
  try {
    const hoyStr = obtenerFechaHoyStr();
    // Fin del día de hoy para incluir todo lo acumulado hasta el momento actual
    const finHoy = new Date(`${hoyStr}T23:59:59.999Z`);

    const pacientePopulate = {
      path: 'paciente',
      select: 'nombre apellido obraSocial dni telefono',
      populate: {
        path: 'obraSocial',
        select: 'razonSocial'
      }
    };

    const turnosHistoricos = await Turno.find({
      fecha: { $lte: finHoy },
      activo: true,
      estado: { 
        $nin: [EstadoTurno.ATENDIDO, EstadoTurno.CANCELADO] 
      }
    })
      .populate(pacientePopulate)
      .populate('medico', 'nombre apellido especialidad')
      .populate('especialidad', 'nombre')
      .sort({ fecha: -1, hora: -1 }); // Los más recientes primero o como prefieras

    return respuestaEstandar(
      res, 
      200, 
      true, 
      'Turnos pendientes históricos obtenidos exitosamente', 
      turnosHistoricos
    );
  } catch (error: unknown) {
    const err = error as Error;
    return respuestaEstandar(res, 500, false, 'Error al obtener los turnos pendientes históricos', err.message);
  }
};

const cancelarTurno = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    const turno = await Turno.findById(id);

    if (!turno) {
      return respuestaEstandar(res, 404, false, `Turno no encontrado con ID ${id}`);
    }

    if (turno.estado === EstadoTurno.ATENDIDO) {
      return respuestaEstandar(res, 400, false, 'No se puede cancelar un turno que ya ha sido atendido.');
    }

    if (turno.estado === EstadoTurno.CANCELADO) {
      return respuestaEstandar(res, 400, false, 'Este turno ya se encuentra cancelado.');
    }

    // Actualizamos el estado a cancelado
    turno.estado = EstadoTurno.CANCELADO;
    turno.activo = false; // Opcional según si quieres ocultarlo de listas activas
    await turno.save();

    return respuestaEstandar(res, 200, true, 'Turno cancelado exitosamente', turno);

  } catch (error: unknown) {
    const err = error as Error;
    return respuestaEstandar(res, 500, false, 'Error al cancelar el turno', err.message);
  }
};

// Devuelve únicamente los turnos del paciente logueado.
// Por defecto incluye los turnos futuros y los de los últimos 30 días.
// Con ?historial=true devuelve todo el historial sin filtro de fecha.
const getMisTurnos = async (
  req: Request<unknown, unknown, unknown, { historial?: string }>,
  res: Response
) => {
  try {
    const usuario = (req as RequestAutenticado).usuario;

    if (!usuario?.email) {
      return respuestaEstandar(res, 401, false, 'No autorizado');
    }

    const paciente = await Paciente.findOne({ email: usuario.email.toLowerCase() });

    if (!paciente) {
      return respuestaEstandar(res, 404, false, 'No se encontró la ficha de paciente asociada a tu usuario');
    }

    const filtro: Record<string, unknown> = { paciente: paciente._id, activo: true };

    if (req.query.historial !== 'true') {
      const limite = new Date();
      limite.setDate(limite.getDate() - 30);
      limite.setHours(0, 0, 0, 0);
      filtro.fecha = { $gte: limite };
    }

    const turnos = await Turno.find(filtro)
      .populate('medico', 'nombre apellido')
      .populate('especialidad', 'nombre')
      .sort({ fecha: 1, hora: 1 });

    return respuestaEstandar(res, 200, true, 'Turnos obtenidos exitosamente', turnos);
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error al obtener los turnos', error.message);
  }
};

// Devuelve el detalle de un turno propio junto con la consulta médica asociada (si existe)
const getMiTurnoById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const usuario = (req as RequestAutenticado).usuario;

    if (!usuario?.email) {
      return respuestaEstandar(res, 401, false, 'No autorizado');
    }

    const paciente = await Paciente.findOne({ email: usuario.email.toLowerCase() });

    if (!paciente) {
      return respuestaEstandar(res, 404, false, 'No se encontró la ficha de paciente asociada a tu usuario');
    }

    const turno = await Turno.findOne({ _id: req.params.id, paciente: paciente._id })
      .populate('medico', 'nombre apellido')
      .populate('especialidad', 'nombre');

    if (!turno) {
      return respuestaEstandar(res, 404, false, 'Turno no encontrado');
    }

    const consulta = await ConsultaMedica.findOne({
      turno: turno._id,
      paciente: paciente._id,
      activo: true,
    })
      .populate('medico', 'nombre apellido')
      .select('motivo diagnostico tratamiento observaciones estado fecha medico');

    return respuestaEstandar(res, 200, true, 'Turno obtenido exitosamente', {
      turno,
      consulta: consulta || null,
    });
  } catch (error: any) {
    return respuestaEstandar(res, 400, false, 'Error al obtener el turno', error.message);
  }
};


export { 
  getTurnos, 
  getTurnoById, 
  getTurnosDisponibles, 
  getDisponibilidadMes, 
  createTurno, 
  updateTurno, 
  deleteTurno, 
  marcarAtendido ,
  getTurnosPendientesHistoricos,
  cancelarTurno,
  getMisTurnos, 
  getMiTurnoById 
};