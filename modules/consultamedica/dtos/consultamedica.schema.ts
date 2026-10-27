// DTOS: validación con zod del body de crear y editar consulta médica.
// El id de paciente/medico/turno llega como string ObjectId y se valida con regex.
// Se conecta con: ../../middlewares/validarDatos.middleware (validarSchema los usa),
//                 consultamedica.routes.ts (los importa).
import { z } from 'zod';
import { EstadoConsulta } from '../enum/estadoConsulta.enum';

const ObjectIdRegex = /^[0-9a-fA-F]{24}$/;

export const crearConsultaMedicaSchema = z.object({
    body: z.object({
        paciente: z.string({ error: 'El paciente es obligatorio' })
            .regex(ObjectIdRegex, 'El paciente debe ser un ObjectId valido'),
        medico: z.string({ error: 'El medico es obligatorio' })
            .regex(ObjectIdRegex, 'El medico debe ser un ObjectId valido'),
        turno: z.string({ error: 'El turno debe ser un ObjectId' })
            .regex(ObjectIdRegex, 'El turno debe ser un ObjectId valido')
            .optional(),
        motivo: z.string({ error: 'El motivo es obligatorio' })
            .trim()
            .min(1, 'El motivo de la consulta es obligatorio'),
        diagnostico: z.string().trim().optional(),
        tratamiento: z.string().trim().optional(),
        observaciones: z.string().trim().optional(),
        estado: z.enum([EstadoConsulta.PENDIENTE, EstadoConsulta.ATENDIDA, EstadoConsulta.CANCELADA]).optional(),
    })
});

export const actualizarConsultaMedicaSchema = z.object({
    body: crearConsultaMedicaSchema.shape.body.partial(),
});

export type ICrearConsultaMedicaDTO = z.infer<typeof crearConsultaMedicaSchema>['body'];
export type IActualizarConsultaMedicaDTO = z.infer<typeof actualizarConsultaMedicaSchema>['body'];