import type { Request, Response } from "express";
import bcrypt from 'bcrypt';
import mongoose from "mongoose";
import Medico from './medico.models';
import { respuestaEstandar } from '../../utils/respuestaEstandar';
import type { IMedicoDTO, IMedicoUpdateDTO } from './dtos/medico.schema';
import { Usuario } from "../auth/usuario.models";
import { Rol } from "../auth/enum/rol.enum";

const getMedico = async (req: Request, res: Response) => {
  try {
    const { nombre, especialidades, page = "1", limit = "10" } = req.query as any;
    const filtro: any = { activo: true };


    if (nombre) filtro.nombre = { $regex: nombre, $options: 'i' };
    if (especialidades) filtro.especialidades = { $in: Array.isArray(especialidades) ? especialidades : [especialidades] };

    const medicos = await Medico.find(filtro)
      .populate('especialidades', 'nombre')
      .populate('obraSocial', 'nombre')
      .sort({ apellido: 1 })
      .skip((Number(page)-1)*Number(limit))
      .limit(Number(limit));

    return respuestaEstandar(res, 200, true, 'Médicos obtenidos', medicos);
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error al obtener Médicos', error.message);
  }
};

const createMedico = async (req: Request<unknown, unknown, IMedicoDTO & { password?: string; user?: string }>, res: Response) => {
    const { numeroMatricula, dni, email, user: nombreUsuario, password, ...datosMedico } = req.body;

    try {
        // 1. Validaciones previas de duplicados (Matrícula, DNI, Email o User)
        const condicionesOr: Array<{ email?: string; user?: string; dni?: string; numeroMatricula?: number }> = [
            { email: email.toLowerCase() },
            { dni },
            { numeroMatricula }
        ];

        if (nombreUsuario) {
            condicionesOr.push({ user: nombreUsuario });
        }

        // Verificamos si ya existe un usuario o médico con alguno de estos datos únicos
        const usuarioExistente = await Usuario.findOne({
            $or: [{ email: email.toLowerCase() }, ...(nombreUsuario ? [{ user: nombreUsuario }] : [])]
        });

        if (usuarioExistente) {
            const campo = usuarioExistente.email === email.toLowerCase() ? 'correo electrónico' : 'nombre de usuario';
            return respuestaEstandar(res, 400, false, `El ${campo} ya se encuentra registrado en el sistema`);
        }

        const medicoExistente = await Medico.findOne({
            $or: [{ dni }, { numeroMatricula }, { email: email.toLowerCase() }]
        });

        if (medicoExistente) {
            let mensaje = 'Ya existe un médico registrado con estos datos';
            if (medicoExistente.dni === dni) mensaje = 'El DNI ya está registrado';
            else if (medicoExistente.numeroMatricula === numeroMatricula) mensaje = 'La matrícula ya está registrada';
            else if (medicoExistente.email === email.toLowerCase()) mensaje = 'El email ya está registrado';
            
            return respuestaEstandar(res, 409, false, mensaje);
        }

        // 2. Iniciamos la sesión y la transacción de Mongoose
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 3. Hashear la contraseña (si no viene, usamos el DNI o la matrícula por defecto)
            const passwordPlana = password || dni; 
            const hashedPassword = await bcrypt.hash(passwordPlana, 10);

            // 4. Crear el Usuario dentro de la transacción
            const nuevoUsuario = await Usuario.create(
                [
                    {
                        email,
                        user: nombreUsuario || email,
                        password: hashedPassword,
                        rol: Rol.MEDICO, 
                        debeCambiarPassword: true,
                    }
                ],
                { session }
            );

            // 5. Crear el Médico dentro de la transacción
            const nuevoMedico = await Medico.create(
                [
                    {
                        ...datosMedico,
                        numeroMatricula,
                        dni,
                        email,
                        // usuario: nuevoUsuario[0]._id // Descomenta si guardas la referencia en el schema de médico
                    }
                ],
                { session }
            );

            // 6. Confirmar transacción
            await session.commitTransaction();
            session.endSession();

            const usuarioCreado = nuevoUsuario[0];
            const medicoCreado = nuevoMedico[0];

            return respuestaEstandar(res, 201, true, 'Médico y usuario creados exitosamente', {
                medico: medicoCreado,
                usuario: usuarioCreado ? {
                    id: usuarioCreado.id,
                    email: usuarioCreado.email,
                    user: usuarioCreado.user,
                } : null
            });

        } catch (innerError: any) {
            // Si algo falla dentro de la transacción, hacemos rollback
            await session.abortTransaction();
            session.endSession();
            throw innerError;
        }

    } catch (error: any) {
        if (error?.code === 11000) {
            return respuestaEstandar(res, 409, false, 'El email, DNI, matrícula o nombre de usuario ya están registrados');
        }

        return respuestaEstandar(res, 500, false, 'Error al crear el médico y su usuario', error.message);
    }
};


const updateMedico = async (req: Request<{ id: string }, unknown, IMedicoUpdateDTO>, res: Response) => {
  try {
    const actualizado = await Medico.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!actualizado) return respuestaEstandar(res, 404, false, 'Médico no encontrado');
    return respuestaEstandar(res, 200, true, 'Médico actualizado correctamente', actualizado);
  } catch (error: any) {
    return respuestaEstandar(res, 400, false, 'Error al actualizar', error.message);
  }
};

const deleteMedico = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const borrado = await Medico.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!borrado) return respuestaEstandar(res, 404, false, 'Médico no encontrado');
    return respuestaEstandar(res, 200, true, 'Médico desactivado correctamente', borrado);
  } catch (error: any) {
    return respuestaEstandar(res, 400, false, 'Error al eliminar', error.message);
  }
};

export { getMedico, createMedico, updateMedico, deleteMedico };