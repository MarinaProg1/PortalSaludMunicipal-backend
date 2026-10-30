import type { Request, Response } from "express"; 
import axios from "axios"; 
import { respuestaEstandar } from "../../utils/respuestaEstandar";
import PacienteModel from "../paciente/paciente.models"; 
import HistorialMedico from "../historialMedico/historialMedico.models";

export const sugerirAsistencia = async (req: Request, res: Response) => {
    try {
        const { pacienteId, motivo, sintomas } = req.body;

        const paciente = await PacienteModel.findById(pacienteId).select("nombre apellido dni sexo fechaNacimiento email");
        if (!paciente) {
            return respuestaEstandar(res, 404, false, "Paciente no encontrado");
        }

        const historial = await HistorialMedico.findOne({ paciente: pacienteId, activo: true });

        const alergias = historial?.alergias?.length ? historial.alergias.join(", ") : "Ninguna";
        const enfermedadesCronicas = historial?.enfermedadesCronicas?.length ? historial.enfermedadesCronicas.join(", ") : "Ninguna";
        const medicacionActual = historial?.medicacionActual?.length ? historial.medicacionActual.join(", ") : "Ninguna";
        const antecedentesFamiliares = historial?.antecedentesFamiliares || "Sin antecedentes";
        const antecedentesQuirurgicos = historial?.antecedentesQuirurgicos || "Sin antecedentes";

        const prompt = `
        Actúa como un asistente de apoyo para un medico clinico.

        Tu tarea es sugerir la asistencia médica más adecuada para un paciente basado en su historial médico y los síntomas actuales que presenta.
Datos del paciente:
- Nombre y apellido: ${paciente.nombre} ${paciente.apellido}
- DNI: ${paciente.dni}
- Sexo: ${paciente.sexo}
- Email: ${paciente.email || "No registrado"}

Motivo de consulta: ${motivo || "No especificado"}
Síntomas descriptos: ${sintomas || "No especificados"}

Historial médico:
- Alergias: ${alergias}
- Enfermedades crónicas: ${enfermedadesCronicas}
- Medicación actual: ${medicacionActual}
- Antecedentes familiares: ${antecedentesFamiliares}
- Antecedentes quirúrgicos: ${antecedentesQuirurgicos}

Genera una sugerencia práctica para el médico con el siguiente formato:

OBSERVACIONES SUGERIDAS:
[Escribir en lenguaje clínico claro, objetivo y breve, para completar directamente en el campo "observaciones" de la consulta médica]

HIPÓTESIS A CONSIDERAR:
[Máximo 2 o 3 hipótesis razonables, siempre aclarando que son orientativas]

ESTUDIOS A VALORAR:
[Si corresponde, indicar estudios simples a tener en cuenta]

RECOMENDACIONES:
[Recomendaciones generales para esta consulta]

IMPORTANTE:
- Usa un tono profesional pero conciso.
- NO recetes dosis exactas de medicamentos controlados.
- NO asegures un diagnóstico certero.
- Prioriza la seguridad y el criterio médico.
- Redactalo listo para que el médico lo pueda editar y guardar tal cual o con modificaciones.
`.trim();

        const respuestaIa = await axios.post(
            process.env.GROQ_URL as string,
            {
                model: process.env.GROQ_MODEL,
                messages: [
                    {
                        role: "system",
                        content: "Eres un asistente médico orientativo para apoyar al profesional de salud. Siempre debes dejar claro que es solo orientación y nunca un diagnóstico definitivo."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 700
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const sugerencia = respuestaIa.data.choices[0].message.content;

        return respuestaEstandar(res, 200, true, "Sugerencia generada con IA", { sugerencia });
    } catch (error: any) {
        console.error("Error al generar sugerencia con IA:", error.response?.data || error.message);
        return respuestaEstandar(res, 500, false, "Error al generar sugerencia con IA", error.response?.data?.error?.message || error.message);
    }
};