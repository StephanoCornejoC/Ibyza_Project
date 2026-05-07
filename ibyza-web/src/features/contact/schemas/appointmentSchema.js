import { z } from 'zod';

// Traduce los mensajes default de Zod al español. Esto cubre los casos
// que los `min/regex/email` custom NO interceptan (ej: campo undefined,
// tipo incorrecto, enum invalido, etc).
z.setErrorMap((issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.received === 'undefined' || issue.received === 'null') {
      return { message: 'Este campo es obligatorio' };
    }
    return { message: `Tipo invalido. Esperado ${issue.expected}` };
  }
  if (issue.code === z.ZodIssueCode.invalid_string) {
    if (issue.validation === 'email') return { message: 'Correo electronico invalido' };
    if (issue.validation === 'url') return { message: 'URL invalida' };
    if (issue.validation === 'regex') return { message: 'Formato invalido' };
  }
  if (issue.code === z.ZodIssueCode.too_small) {
    if (issue.type === 'string') {
      return { message: `Debe tener al menos ${issue.minimum} caracteres` };
    }
    return { message: `Valor demasiado pequeño (minimo ${issue.minimum})` };
  }
  if (issue.code === z.ZodIssueCode.too_big) {
    if (issue.type === 'string') {
      return { message: `Debe tener como maximo ${issue.maximum} caracteres` };
    }
    return { message: `Valor demasiado grande (maximo ${issue.maximum})` };
  }
  if (issue.code === z.ZodIssueCode.invalid_enum_value) {
    return { message: 'Selecciona una opcion valida' };
  }
  if (issue.code === z.ZodIssueCode.invalid_literal) {
    return { message: 'Este campo es obligatorio' };
  }
  return { message: ctx.defaultError };
});

/**
 * Schema Zod para el formulario de cita/visita.
 * Corresponde al endpoint POST /api/contacto/citas/
 * Tipos backend: 'presencial' | 'virtual' (Google Meet)
 */
export const appointmentSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),

  apellido: z
    .string()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres'),

  email: z
    .string()
    .email('Ingresa un correo electrónico válido'),

  telefono: z
    .string()
    .min(7, 'Ingresa un número de teléfono válido')
    .regex(/^[0-9+\s()-]+$/, 'Número de teléfono inválido'),

  tipo: z.enum(['presencial', 'virtual'], {
    errorMap: () => ({ message: 'Selecciona un tipo de cita' }),
  }),

  fecha_preferida: z
    .string()
    .min(1, 'Selecciona una fecha preferida'),

  hora_preferida: z
    .string()
    .min(1, 'Selecciona una hora preferida'),

  mensaje: z
    .string()
    .max(500, 'Mensaje demasiado largo')
    .optional(),

  // Aceptacion explicita de politicas de privacidad: requerido para enviar
  // el formulario. RHF entrega `false` cuando el checkbox no fue tocado y
  // `true` cuando si. z.literal(true) descarta cualquier otro valor.
  acepta_politicas: z.literal(true, {
    errorMap: () => ({
      message: 'Debes aceptar las politicas de privacidad para continuar',
    }),
  }),
});

export default appointmentSchema;
