import { z } from 'zod';

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
    .min(2, 'El apellido debe tener al menos 2 caracteres'),

  email: z
    .string()
    .email('Ingresa un correo electronico valido'),

  telefono: z
    .string()
    .min(7, 'Ingresa un numero de telefono valido')
    .regex(/^[0-9+\s()-]+$/, 'Numero de telefono invalido'),

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
});

export default appointmentSchema;
