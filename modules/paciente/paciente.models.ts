import { Document,Schema, model } from "mongoose";
import type {IPaciente} from './types/paciente.interface';
import { DireccionSchema } from "../../utils/direccion.interfaces";
import { TelefonoSchema } from "../../utils/telefono.interfaces";
// falta fecha de nacimiento y correo electronico opcional 
const pacienteSchema = new Schema<IPaciente>({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        uppercase: true,
    },
    apellido: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        uppercase: true,
    },
    dni: {
        type: String,
        required: [true, 'El DNI del paciente es obligatorio'],
        unique: [true, 'El DNI del paciente debe ser único'],
        match: [/^[0-9]{7,8}$/, 'El DNI debe tener 8 dígitos'],
    },
    sexo: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        uppercase: true,
    },
   
    email: {
        type: String,
        required: [true, 'El correo electrónico del paciente es obligatorio'],
        unique: [true, 'El correo electrónico del paciente debe ser único'],
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'El correo electrónico no es válido'],
    },
    direccion: {
        type: DireccionSchema
    },
    telefono:{
        type: TelefonoSchema
    },
    obraSocial:{
        type: Schema.Types.ObjectId, //si no tiene obra social que sea null , tener una opcion que sea otras.
        ref: 'ObraSocial', 
    },
     activo: {
        type: Boolean,
        default: true,
        select: false
    
     }
    },
    {
        timestamps: true,
})

pacienteSchema.set('toJSON', {
    transform: (documento: Document, pacienteRetorno: Record<string, any>) => {
        pacienteRetorno.id = pacienteRetorno._id;
        delete pacienteRetorno._id;
        delete pacienteRetorno.__v;
    }
});

const PacienteModel = model<IPaciente>('Paciente', pacienteSchema);

export default PacienteModel;