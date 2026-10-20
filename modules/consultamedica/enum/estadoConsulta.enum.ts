// ENUM: estados posibles de una consulta médica.
// PENDIENTE = turno asignado pero aún no se atendió.
// ATENDIDA  = el médico ya hizo la consulta.
// CANCELADA = no se realizó.
// Se conecta con: types/consultamedica.interface.ts y consultamedica.models.ts (la usan).
export enum EstadoConsulta {
    PENDIENTE = 'pendiente',
    ATENDIDA = 'atendida',
    CANCELADA = 'cancelada',
}