import type { Request, Response, NextFunction } from 'express';
import { HorarioAtencion } from '../modules/horarioAtencion/horarioAtencion.models';
import { respuestaEstandar } from '../utils/respuestaEstandar';
import type { IHorarioAtencionDTO } from '../modules/horarioAtencion/dtos/horarioAtencion.schema';

const horaAMinutos = (hora: string): number => {
  const [horas =0 , minutos=0] = hora.split(':').map(Number);
  return horas * 60 + minutos;
};

export const verificarHorarioDisponible = async (
  req: Request<{ id?: string }, unknown, IHorarioAtencionDTO>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { medico, diaSemana, horaInicio, horaFin, duracionTurnoMinutos = 30 } = req.body;
    const id = req.params.id as string | undefined

    const inicioNuevo = horaAMinutos(horaInicio);
    const finNuevo = horaAMinutos(horaFin);

    if (finNuevo <= inicioNuevo) {
      return respuestaEstandar(res, 400, false, 'La hora de fin debe ser posterior a la hora de inicio', null);
    }
    // Regla 2: Validar que la duración total sea múltiplo exacto de los turnos (ej: 30 min)
    const duracionTotalMinutos = finNuevo - inicioNuevo;
    if (duracionTotalMinutos % duracionTurnoMinutos !== 0) {
      return respuestaEstandar( res, 400, false, `El rango horario debe ser múltiplo de la duración del turno (${duracionTurnoMinutos} minutos)`, null );
    }
  
    // Regla 3: Construir el filtro para MongoDB
    const filtroQuery: Record<string, any> = {
      medico,
      diaSemana,
      activo: true,
    };

    //SI VIENE UN ID (PUT/PATCH), EXCLUIMOS ESTE REGISTRO DE LA BÚSQUEDA
    if (id) {
      filtroQuery._id = { $ne: id };
    }

    const horariosExistentes = await HorarioAtencion.find(filtroQuery);
    // Comprobación de cruce de rangos
    const haySolapamiento = horariosExistentes.some((horario) => {
      const inicioExistente = horaAMinutos(horario.horaInicio);
      const finExistente = horaAMinutos(horario.horaFin);

      // Existe solapamiento si: (NuevoInicio < ExistenteFin) Y (NuevoFin > ExistenteInicio)
      return inicioNuevo < finExistente && finNuevo > inicioExistente;
    });

    if (haySolapamiento) {
      return respuestaEstandar(res, 409, false, 'El rango horario especificado se solapa con otro horario ya asignado para este médico', null);
    }

    return next();
  } catch (error: any) {
    return respuestaEstandar( res, 500, false, 'Error interno al verificar la disponibilidad del horario', error.messag );
  }
};