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
    Actúa como un asistente médico para apoyo clínico en consulta ambulatoria. 
    Tu única función es orientar, NO reemplazar el criterio del médico tratante.
            
    DATOS DEL PACIENTE:
    - Nombre y Apellido: ${paciente.nombre} ${paciente.apellido}
    - DNI: ${paciente.dni}
    - Sexo: ${paciente.sexo}
            
    HISTORIAL MÉDICO:
    - Alergias: ${alergias}
    - Enfermedades crónicas: ${enfermedadesCronicas}
    - Medicación actual: ${medicacionActual}
    - Antecedentes familiares: ${antecedentesFamiliares}
    - Antecedentes quirúrgicos: ${antecedentesQuirurgicos}
            
    CONSULTA ACTUAL:
    - Motivo de consulta: ${motivo || "No especificado"}
    - Síntomas: ${sintomas || "No especificados"}
            
    INSTRUCCIONES:
    - Sé MUY CONCISO. Usa viñetas cortas. Máximo 2-4 renglones por apartado.
    - Ten en cuenta SIEMPRE las alergias, la medicación actual y las enfermedades crónicas para descartar contraindicaciones.
    - Sugiere ÚNICAMENTE lo estrictamente necesario para una primera valoración ambulatoria.
    - Los medicamentos deben ser ORIENTATIVOS. Usa nombres genéricos, con posología habitual y forma de administración si aplica.
    - Si NO corresponde indicación farmacológica, escribe: "No requiere medicación por ahora".
    - Los estudios deben ser concretos (ej: Hemograma completo, Orina completa, Glucemia, etc). No sugieras "panel amplio" sin especificar.
    - Prioriza signos de alarma y cuándo derivar o acudir a urgencias si correspondiere.
    - Responde EXCLUSIVAMENTE con el siguiente formato, sin texto extra, sin introducción ni conclusión.
            
    FORMATO OBLIGATORIO:
            
    OBSERVACIONES SUGERIDAS:
    - (breve descripción objetiva de lo relevante)
            
    HIPÓTESIS A CONSIDERAR:
    - (máximo 2-3 hipótesis más probables)
            
    ESTUDIOS A SOLICITAR:
    - (solo los necesarios. Si ninguno, indicar: "Ninguno por ahora")

    MEDICAMENTOS A CONSIDERAR (ORIENTATIVOS):
    - (tener en cuenta alergias y medicación actual. Si no corresponde, indicar lo solicitado)

    RECOMENDACIONES:
    - (medidas generales, signos de alarma y seguimiento)
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