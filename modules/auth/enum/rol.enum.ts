// ENUM: roles del sistema (valores string, el frontend los lee tal cual).
// Se conecta con: types/usuario.interface.ts y usuario.models.ts (los importan).
export enum Rol {
    ADMIN = 'ADMIN',
    RECEPCIONISTA = 'RECEPCIONISTA',
    PACIENTE = 'PACIENTE',
    MEDICO = 'MEDICO',
}