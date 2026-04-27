import { z } from 'zod';

/**
 * Schema Zod para el formulario de separación de departamento.
 * Valida los datos del comprador antes de proceder al pago con Culqi.
 */
export const separationSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(80, 'Nombre demasiado largo'),

  apellido: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(80, 'Apellido demasiado largo'),

  email: z
    .string()
    .email('Ingresa un correo electrónico válido'),

  telefono: z
    .string()
    .min(7, 'Ingresa un número de teléfono válido')
    .max(20, 'Número demasiado largo')
    .regex(/^[0-9+\s()-]+$/, 'Número de teléfono inválido'),

  dni: z
    .string()
    .regex(/^\d{8}$/, 'El DNI debe tener exactamente 8 digitos numericos'),

  // El monto se define automáticamente desde el departamento
  // pero se incluye para validación de consistencia
  monto: z
    .number()
    .positive('El monto debe ser mayor a 0'),
});

export default separationSchema;
