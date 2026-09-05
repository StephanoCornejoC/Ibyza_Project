/**
 * Catálogo curado de iconos disponibles para el CMS.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO
 * ---------------------------
 * El campo `icono` del modelo Beneficio guarda el NOMBRE del icono como texto,
 * porque quien administra el contenido elige el icono desde el admin de Django.
 * Antes eso se resolvía con `import * as LucideIcons from 'lucide-react'`, lo
 * que obliga al bundler a incluir los ~1500 iconos de la librería: el chunk
 * `vendor-icons` pesaba 143 KB comprimido, más que React entero (90 KB).
 *
 * Con imports nombrados sobre una lista cerrada, Rollup sí puede hacer
 * tree-shaking y solo entran al bundle los iconos que están acá.
 *
 * CÓMO AGREGAR UN ICONO
 * ---------------------
 * 1. Buscarlo en https://lucide.dev/icons y confirmar que existe en la versión
 *    instalada de lucide-react.
 * 2. Agregarlo al import y al objeto VALUE_ICONS (mismo nombre en ambos).
 * 3. Correr `python manage.py makemigrations content` en el backend: el modelo
 *    Beneficio usa esta misma lista como `choices`, así que hay que regenerar
 *    la migración para que el desplegable del admin lo ofrezca.
 *
 * Mantener esta lista sincronizada con `VALUE_ICON_CHOICES` en
 * ibyza-api/content/models.py.
 */
import {
  // Confianza y seguridad
  Shield,
  ShieldCheck,
  BadgeCheck,
  Lock,
  // Excelencia y reconocimiento
  Star,
  Sparkles,
  Award,
  Trophy,
  Gem,
  // Personas y relación
  Users,
  Heart,
  HandHeart,
  Handshake,
  // Innovación y crecimiento
  Zap,
  Lightbulb,
  TrendingUp,
  Target,
  Compass,
  // Construcción e inmobiliario
  Building2,
  Home,
  Key,
  MapPin,
  Hammer,
  Ruler,
  // Sostenibilidad
  Leaf,
  Recycle,
  // Proceso
  CheckCircle2,
  Clock,
} from 'lucide-react';

/** Nombre del icono que se usa cuando el CMS trae uno desconocido o vacío. */
export const DEFAULT_VALUE_ICON = 'Shield';

/** Mapa nombre -> componente. La clave es lo que se guarda en el CMS. */
export const VALUE_ICONS = {
  Shield,
  ShieldCheck,
  BadgeCheck,
  Lock,
  Star,
  Sparkles,
  Award,
  Trophy,
  Gem,
  Users,
  Heart,
  HandHeart,
  Handshake,
  Zap,
  Lightbulb,
  TrendingUp,
  Target,
  Compass,
  Building2,
  Home,
  Key,
  MapPin,
  Hammer,
  Ruler,
  Leaf,
  Recycle,
  CheckCircle2,
  Clock,
};

/** Lista de nombres válidos, útil para validaciones y tests. */
export const VALUE_ICON_NAMES = Object.keys(VALUE_ICONS);

/**
 * Resuelve el componente de icono a partir de lo que venga del CMS.
 * Acepta un nombre (string) o un componente ya resuelto, y nunca devuelve
 * undefined: si el nombre no está en el catálogo, cae al icono por defecto.
 */
export const resolveValueIcon = (icon) => {
  if (icon && typeof icon !== 'string') return icon;
  return VALUE_ICONS[icon] || VALUE_ICONS[DEFAULT_VALUE_ICON];
};
