import axios from 'axios';

/**
 * Instancia configurada de Axios para el backend Django IBYZA.
 * La URL base se toma de la variable de entorno VITE_API_URL.
 * En desarrollo apunta a http://127.0.0.1:8000
 * En producción usar la variable de entorno correspondiente.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor de request — se puede usar para agregar tokens en el futuro
api.interceptors.request.use(
  (config) => {
    // Aquí se podría agregar Authorization header si hubiera auth
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Transforma recursivamente URLs relativas de media (/media/...)
 * en URLs absolutas apuntando al backend Django.
 */
const MEDIA_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

function transformMediaUrls(data) {
  if (typeof data === 'string') {
    if (data.startsWith('/media/')) return `${MEDIA_BASE}${data}`;
    return data;
  }
  if (Array.isArray(data)) return data.map(transformMediaUrls);
  if (data && typeof data === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = transformMediaUrls(value);
    }
    return result;
  }
  return data;
}

// Interceptor de response — normaliza media URLs + errores del servidor
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = transformMediaUrls(response.data);
    }
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Error de conexión con el servidor';

    // Re-lanza el error con mensaje amigable para los hooks
    return Promise.reject(new Error(message));
  }
);

/**
 * Convierte una URL relativa de media (/media/...) en una URL absoluta
 * apuntando al backend Django. Si ya es absoluta, la devuelve sin cambios.
 * @param {string|null} url - URL relativa o absoluta
 * @returns {string} URL absoluta o cadena vacia
 */
export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default api;
