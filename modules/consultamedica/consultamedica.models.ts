// MODEL: schema de ConsultaMédica en MongoDB (colección consultasMedicas).
// Hibrido: tiene fecha propia + turno opcional (no duplica datos del turno de ella:
// si hay turno, paciente/medico/fecha viven del turno; si no, se usan los propios).
// Se conecta con: ./types/consultamedica.interface, ../enum/estadoConsulta.enum.
// OJO: los ref 'Paciente' y 'Turno' apuntan a modelos de tu compañera; 'Medico' apunta
// a un modelo que todavía no existe en el repo (cuando exista, se habilita el populate).
import { Schema, model, Document } from 'mongoose';
import type { IConsultaMedica } from './types/consultamedica.interface';
import { EstadoConsulta } from './enum/estadoConsulta.enum';

const ConsultaMedicaSchema = new Schema<IConsultaMedica>(
    {
        paciente: {
            type: Schema.Types.ObjectId,
            ref: 'Paciente',
            required: [true, 'El paciente es obligatorio'],
        },
        medico: {
            type: Schema.Types.ObjectId,
            ref: 'Medico',
            required: [true, 'El medico es obligatorio'],
        },
        turno: {
            type: Schema.Types.ObjectId,
            ref: 'Turno',
        },
        fecha: {
            type: Date,
            default: Date.now,
        },
        motivo: {
            type: String,
            required: [true, 'El motivo de la consulta es obligatorio'],
            trim: true,
        },
        diagnostico: {
            type: String,
            trim: true,
        },
        tratamiento: {
            type: String,
            trim: true,
        },
        observaciones: {
            type: String,
            trim: true,
        },
        estado: {
            type: String,
            enum: Object.values(EstadoConsulta),
            default: EstadoConsulta.PENDIENTE,
        },
        activo: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

ConsultaMedicaSchema.set('toJSON', {
    transform: (_documento: Document, consultaRetorno: Record<string, any>) => {
        consultaRetorno.id = consultaRetorno._id;
        delete consultaRetorno._id;
        delete consultaRetorno.__v;
    },
});

export const ConsultaMedica = model<IConsultaMedica>('ConsultaMedica', ConsultaMedicaSchema, 'consultasMedicas');