/**
 * Utilidades de formateo para la aplicación IBYZA.
 * Centralizar aquí asegura consistencia en toda la UI.
 */

/**
 * Formatea un número como precio en soles peruanos (PEN).
 * Ejemplo: formatPrice(250000) → "S/ 250,000"
 *
 * @param {number} amount - Monto numérico
 * @param {string} currency - Símbolo de moneda (default: "S/")
 * @returns {string}
 */
export const formatPrice = (amount, currency = 'S/') => {
  if (amount == null || isNaN(amount)) return '—';
  const formatted = new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${currency} ${formatted}`;
};

/**
 * Formatea un número como precio en dólares (USD).
 * Ejemplo: formatPriceUSD(85000) → "$ 85,000"
 *
 * @param {number} amount
 * @returns {string}
 */
export const formatPriceUSD = (amount) => formatPrice(amount, '$');

/**
 * Formatea una fecha ISO o Date a formato legible en español.
 * Ejemplo: formatDate('2025-06-15') → "15 de junio de 2025"
 *
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Formatea fecha corta.
 * Ejemplo: formatDateShort('2025-06-15') → "15/06/2025"
 *
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateShort = (date) => {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-PE');
};

/**
 * Formatea el área de un departamento.
 * Ejemplo: formatArea(85.5) → "85.5 m²"
 *
 * @param {number} area
 * @returns {string}
 */
export const formatArea = (area) => {
  if (area == null || isNaN(area)) return '—';
  return `${area} m²`;
};

/**
 * Convierte un slug a título legible.
 * Ejemplo: slugToTitle('proyecto-miraflores-2025') → "Proyecto Miraflores 2025"
 *
 * @param {string} slug
 * @returns {string}
 */
export const slugToTitle = (slug) => {
  if (!slug) return '';
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Trunca un texto a un número máximo de caracteres.
 * Ejemplo: truncate('Texto muy largo...', 50)
 *
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};
