import type { Request, Response } from "express";
import bcrypt from 'bcrypt';
import Paciente from './paciente.models';
import { Usuario } from '../auth/usuario.models';
import type { ICrearPacienteDTO, IQueryPacientes, IActualizarPacienteDTO, IActualizarContactoDireccionDTO } from "./dtos/paciente.schema";
import { respuestaEstandar } from '../../utils/respuestaEstandar';
import mongoose from "mongoose";
import { Rol } from "../auth/enum/rol.enum";
import type { RequestAutenticado } from '../../middlewares/autenticar.middleware';
import { Turno } from "../turno/turno.models";
import { ConsultaMedica } from "../consultamedica/consultamedica.models";

const getPacientes = async (req: Request<unknown, unknown, unknown, IQueryPacientes>, res: Response) => {
    try {
        const { obraSocial, dni } = req.query;
        const filtro: Record<string, string> = {};

        if (obraSocial) filtro.obraSocial = obraSocial;

        if (dni) filtro.dni = dni;

        const pacientes = await Paciente.find(filtro).populate('obraSocial');

        return respuestaEstandar(res, 200, true, 'Pacientes obtenidos exitosamente', pacientes);
    } catch (error: any) {
        return respuestaEstandar(res, 500, false, 'Error al obtener los pacientes', error.message);
    }
};

// Devuelve la ficha del paciente logueado (a partir del email del token)
const getMiPerfil = async (req: Request, res: Response) => {
    try {
        const usuario = (req as RequestAutenticado).usuario;

        if (!usuario?.email) {
            return respuestaEstandar(res, 401, false, 'No autorizado');
        }

        const paciente = await Paciente.findOne({ email: usuario.email.toLowerCase() }).populate('obraSocial');

        if (!paciente) {
            return respuestaEstandar(res, 404, false, 'No se encontró la ficha de paciente asociada a tu usuario');
        }

        return respuestaEstandar(res, 200, true, 'Perfil obtenido exitosamente', paciente);
    } catch (error: any) {
        return respuestaEstandar(res, 500, false, 'Error al obtener el perfil', error.message);
    }
};

const getPacienteById = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const paciente = await Paciente.findById(req.params.id).populate('obraSocial');

        if (!paciente) {
            return respuestaEstandar(res, 404, false, 'Paciente no encontrado');
        }

        return respuestaEstandar(res, 200, true, 'Paciente obtenido exitosamente', paciente);
    } catch (error: any) {
        return respuestaEstandar(res, 400, false, 'Error al obtener el paciente', error.message);
    }
};

const createPaciente = async (req: Request<unknown, unknown, ICrearPacienteDTO & { password?: string; user?: string }>, res: Response) => {
    const { email, user: nombreUsuario, password, ...datosPaciente } = req.body;

    try {
        // 1. Construir el filtro dinámicamente para evitar problemas de tipos con undefined
        const condicionesOr: Array<{ email?: string; user?: string }> = [{ email: email.toLowerCase() }];

        if (nombreUsuario) {
            condicionesOr.push({ user: nombreUsuario });
        }

        // Buscamos si ya existe un usuario con el mismo email o nombre de usuario
        const usuarioExistente = await Usuario.findOne({
            $or: condicionesOr
        });

        if (usuarioExistente) {
            // Determinamos qué campo exacto duplicó para dar un mensaje más preciso
            const campoDuplicado = usuarioExistente.email === email.toLowerCase() ? 'correo electrónico' : 'nombre de usuario';
            return respuestaEstandar(res, 400, false, `El ${campoDuplicado} ya se encuentra registrado en el sistema`);
        }

        // 2. Iniciamos la sesión y la transacción de Mongoose
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 3. Hashear la contraseña
            const passwordPlana = password || datosPaciente.dni; // Password por defecto (ej: DNI) si no viene en el body
            const hashedPassword = await bcrypt.hash(passwordPlana, 10);

            // 4. Crear el Usuario dentro de la transacción
            const nuevoUsuario = await Usuario.create(
                [
                    {
                        email,
                        user: nombreUsuario || email,
                        password: hashedPassword,
                        rol: Rol.PACIENTE,
                        debeCambiarPassword: true,
                    }
                ],
                { session }
            );

            // 5. Crear el Paciente dentro de la transacción
            const nuevoPaciente = await Paciente.create(
                [
                    {
                        ...datosPaciente,
                        email,
                    }
                ],
                { session }
            );

            // 6. Confirmar transacción
            await session.commitTransaction();

            const usuarioCreado = nuevoUsuario[0];
            const pacienteCreado = nuevoPaciente[0];

            return respuestaEstandar(res, 201, true, 'Paciente y usuario creados exitosamente', {
                paciente: pacienteCreado,
                usuario: usuarioCreado ? {
                    id: usuarioCreado.id,
                    email: usuarioCreado.email,
                    user: usuarioCreado.user,
                } : null
            });

        } catch (innerError: any) {
            // Si algo falla dentro de la transacción, hacemos rollback.
            // Si Mongo ya la abortó automáticamente, no dejamos que ese error tape el original.
            try {
                await session.abortTransaction();
            } catch {
                // La transacción ya estaba abortada
            }

            throw innerError; // Lo lanzamos al catch externo para manejarlo
        } finally {
            await session.endSession();
        }

    } catch (error: any) {
        const mensajeError = String(error?.message || '');
        const esDuplicado = error?.code === 11000 || mensajeError.includes('E11000');

        // Mongoose puede devolver un error de validación con el mensaje del campo `unique`
        const esDniDuplicado =
            mensajeError.includes('El DNI del paciente debe ser único') ||
            (esDuplicado && (error?.keyPattern?.dni || mensajeError.includes('dni')));

        const esEmailDuplicado =
            mensajeError.includes('El correo electrónico del paciente debe ser único') ||
            (esDuplicado && (error?.keyPattern?.email || mensajeError.includes('email')));

        const esUsuarioDuplicado = esDuplicado && (error?.keyPattern?.user || mensajeError.includes('user'));

        if (esDniDuplicado) {
            return respuestaEstandar(res, 409, false, 'El DNI ya está registrado');
        }

        if (esEmailDuplicado) {
            return respuestaEstandar(res, 409, false, 'El correo electrónico ya está registrado');
        }

        if (esUsuarioDuplicado) {
            return respuestaEstandar(res, 409, false, 'El nombre de usuario ya está registrado');
        }

        if (esDuplicado) {
            return respuestaEstandar(res, 409, false, 'El email o el nombre de usuario ya están registrados');
        }

        return respuestaEstandar(res, 500, false, 'Error al crear el paciente y su usuario', error.message);
    }
};
const updatePaciente = async (req: Request<{ id: string }, unknown, IActualizarPacienteDTO>, res: Response) => {
    try {
        const pacienteAnterior = await Paciente.findById(req.params.id);

        if (!pacienteAnterior) {
            return respuestaEstandar(res, 404, false, 'Paciente no encontrado');
        }

        const emailAnterior = (pacienteAnterior.email || '').toLowerCase();
        const emailNuevo = req.body.email ? req.body.email.toLowerCase() : null;

        // Si cambia el email, verificamos que no lo use otro usuario antes de actualizar
        if (emailNuevo && emailNuevo !== emailAnterior) {
            const usuarioConEmail = await Usuario.findOne({ email: emailNuevo });

            if (usuarioConEmail) {
                return respuestaEstandar(res, 409, false, 'El correo electrónico ya está registrado en el sistema');
            }
        }

        const pacienteActualizado = await Paciente.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { 
                returnDocument: 'after', 
                runValidators: true,
                context: 'query'
            }
        );

        if (!pacienteActualizado) {
            return respuestaEstandar(res, 404, false, 'Paciente no encontrado');
        }

        // Mantener sincronizado el email del usuario de login del paciente
        if (emailNuevo && emailNuevo !== emailAnterior) {
            const usuarioPaciente = await Usuario.findOne({
                email: emailAnterior,
                rol: Rol.PACIENTE,
            });

            if (usuarioPaciente) {
                const datosUsuario: Record<string, string> = { email: emailNuevo };

                // Si el nombre de usuario era el email viejo, también lo actualizamos
                if ((usuarioPaciente.user || '').toLowerCase() === emailAnterior) {
                    datosUsuario.user = emailNuevo;
                }

                await Usuario.updateOne({ _id: usuarioPaciente._id }, { $set: datosUsuario });
            }
        }

        return respuestaEstandar(res, 200, true, 'Paciente actualizado exitosamente', pacienteActualizado);
    } catch (error: any) {
        const mensajeError = String(error?.message || '');
        const esDuplicado = error?.code === 11000 || mensajeError.includes('E11000');

        if (esDuplicado || mensajeError.includes('debe ser único')) {
            if (mensajeError.includes('DNI') || error?.keyPattern?.dni) {
                return respuestaEstandar(res, 409, false, 'El DNI ya está registrado');
            }

            return respuestaEstandar(res, 409, false, 'El correo electrónico ya está registrado');
        }

        return respuestaEstandar(res, 400, false, 'Error al actualizar el paciente', error.message);
    }
};

// 2. Endpoint Específico para Dirección, Teléfono y Email
const updateContactoDireccion = async (req: Request<{ id: string }, unknown, IActualizarContactoDireccionDTO>, res: Response) => {
    try {
        // Usamos $set de forma dinámica solo con los campos que llegaron en el body
        const pacienteActualizado = await Paciente.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { 
                returnDocument: 'after', 
                runValidators: true,
                context: 'query'
            }
        );

        if (!pacienteActualizado) {
            return respuestaEstandar(res, 404, false, 'Paciente no encontrado');
        }

        return respuestaEstandar(res, 200, true, 'Datos de contacto y dirección actualizados correctamente', pacienteActualizado);
    } catch (error: any) {
        return respuestaEstandar(res, 400, false, 'Error al actualizar el contacto y dirección', error.message);
    }
};

// Devuelve los turnos de un paciente junto con la consulta médica de cada turno.
// Por defecto incluye los turnos futuros y los de los últimos 30 días.
// Con ?historial=true devuelve todo el historial sin filtro de fecha.
const getTurnosPaciente = async (
    req: Request<{ id: string }, unknown, unknown, { historial?: string }>,
    res: Response
) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return respuestaEstandar(res, 400, false, 'El id del paciente no es valido');
        }

        const paciente = await Paciente.findById(id);

        if (!paciente) {
            return respuestaEstandar(res, 404, false, 'Paciente no encontrado');
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

        const consultas = await ConsultaMedica.find({
            turno: { $in: turnos.map((turno) => turno._id) },
            paciente: paciente._id,
            activo: true,
        }).select('turno motivo diagnostico tratamiento observaciones estado fecha');

        return respuestaEstandar(res, 200, true, 'Turnos del paciente obtenidos exitosamente', {
            turnos,
            consultas,
        });
    } catch (error: any) {
        return respuestaEstandar(res, 500, false, 'Error al obtener los turnos del paciente', error.message);
    }
};

const deletePaciente = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const pacienteBorrado = await Paciente.findByIdAndDelete(req.params.id);

        if (!pacienteBorrado) {
            return respuestaEstandar(res, 404, false, 'Paciente no encontrado');
        }

        // Eliminar también el usuario de login asociado al paciente
        if (pacienteBorrado.email) {
            await Usuario.deleteOne({
                email: pacienteBorrado.email.toLowerCase(),
                rol: Rol.PACIENTE,
            });
        }

        return respuestaEstandar(res, 200, true, 'Paciente eliminado correctamente', pacienteBorrado);
    } catch (error: any) {
        return respuestaEstandar(res, 400, false, 'Error al eliminar el paciente', error.message);
    }
};

export { getPacientes, getPacienteById, getMiPerfil, getTurnosPaciente, createPaciente, deletePaciente, updatePaciente, updateContactoDireccion };