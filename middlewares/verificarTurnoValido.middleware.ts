import type { Request, Response, NextFunction } from 'express';
import Medico from '../modules/medico/medico.models';
import { HorarioAtencion } from '../modules/horarioAtencion/horarioAtencion.models';
import { respuestaEstandar } from '../utils/respuestaEstandar';
import { DiasSemana } from '../modules/horarioAtencion/enum/diasSemana.enum';

// Función auxiliar para convertir "HH:mm" a minutos totales
const horaAMinutos = (hora: string): number => {
  const [horas = 0, minutos = 0] = hora.split(':').map(Number);
  return horas * 60 + minutos;
};

const DIAS_MAPA: Record<number, DiasSemana> = {
  0: DiasSemana.DOMINGO,
  1: DiasSemana.LUNES,
  2: DiasSemana.MARTES,
  3: DiasSemana.MIERCOLES,
  4: DiasSemana.JUEVES,
  5: DiasSemana.VIERNES,
  6: DiasSemana.SABADO,
};

export const verificarTurnoValido = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { medico, especialidad, fecha, hora } = req.body;

    // VALIDACIÓN DE ESPECIALIDAD DEL MÉDICO
    const medicoEncontrado = await Medico.findById(medico);

    if (!medicoEncontrado) {
      return respuestaEstandar(res, 404, false, 'El médico especificado no existe');
    }

    const tieneEspecialidad = medicoEncontrado.especialidades.some(
      (espId: any) => espId.toString() === especialidad
    );

    if (!tieneEspecialidad) {
      return respuestaEstandar( res, 400, false, 'El médico seleccionado no atiende la especialidad indicada' );
    }

    //  OBTENER DÍA DE LA SEMANA CORRECTAMENTE
    // Si 'fecha' es string tipo "YYYY-MM-DD", agregamos "T00:00:00Z" para evitar desfases de zona horaria
    const fechaObj = typeof fecha === 'string' ? new Date(`${fecha}T00:00:00Z`) : new Date(fecha);
    const diaNombre = DIAS_MAPA[fechaObj.getUTCDay()];

    //  BUSCAR TODOS LOS BLOQUES DEL MÉDICO PARA ESE DÍA
    const horariosAtencion = await HorarioAtencion.find({ medico, diaSemana: diaNombre, activo: true });

    if (!horariosAtencion || horariosAtencion.length === 0) {
      return respuestaEstandar( res, 400, false, `El médico no atiende los días ${diaNombre}` );
    }

    // VALIDAR QUE LA HORA SOLICITADA CAIGA DENTRO DE ALGÚN BLOQUE Y COINCIDA CON LA DURACIÓN
    const horaSolicitadaMin = horaAMinutos(hora);

    const bloqueValido = horariosAtencion.find((bloque) => {
      const inicioMin = horaAMinutos(bloque.horaInicio);
      const finMin = horaAMinutos(bloque.horaFin);

      // Debe estar dentro del rango [horaInicio, horaFin)
      if (horaSolicitadaMin < inicioMin || horaSolicitadaMin >= finMin) {
        return false;
      }

      // Debe encajar exactamente en el intervalo de los turnos (ej. cada 30 min)
      const minutosDesdeInicio = horaSolicitadaMin - inicioMin;
      return minutosDesdeInicio % bloque.duracionTurnoMinutos === 0;
    });

    if (!bloqueValido) {
      return respuestaEstandar(res,400,false,`La hora ${hora} no corresponde a ningún turno disponible del médico para el día ${diaNombre}`);
    }

    return next();
  } catch (error: any) {
    return respuestaEstandar(res,500,false,'Error al verificar disponibilidad del turno',error.messag);
  }
};