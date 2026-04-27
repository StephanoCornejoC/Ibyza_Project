import { z } from 'zod';

/**
 * Schema Zod para el formulario de contacto general.
 * Corresponde al endpoint POST /api/contacto/
 */
export const contactSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),

  apellido: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres'),

  email: z
    .string()
    .email('Ingresa un correo electrónico válido'),

  telefono: z
    .string()
    .min(7, 'Ingresa un número de teléfono válido')
    .regex(/^[0-9+\s()-]+$/, 'Número de teléfono inválido'),

  proyecto_interes: z.string().optional(),

  mensaje: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(1000, 'Mensaje demasiado largo'),
});

export default contactSchema;
