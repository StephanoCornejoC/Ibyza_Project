# PROMPT PARA SIGUIENTE SESION — IBYZA

Copiar y pegar esto al inicio de la siguiente sesion de Claude Code:

---

Continuamos con el proyecto IBYZA. El backend Django y frontend React ya estan al 65%. Revisa la memoria del proyecto en MEMORY.md para el contexto completo.

Rutas:
- Backend: D:\PROYECTOS\COREM\CLIENTES_COREM\IBYZA\PROYECTOS_IBYZA\ibyza-api\
- Frontend: D:\PROYECTOS\COREM\CLIENTES_COREM\IBYZA\PROYECTOS_IBYZA\ibyza-web\
- Docs cliente: D:\PROYECTOS\COREM\CLIENTES_COREM\IBYZA\DOCUMENTACION_IBYZA\

Necesito completar lo siguiente en orden de prioridad:

## 1. SUBIR IMAGENES REALES AL ADMIN DJANGO (P0)
Las imagenes estan en DOCUMENTACION_IBYZA/2. PROYECTOS/. Crea un management command `load_media` que copie automaticamente:
- Fachadas de cada proyecto (1. MIRA VERDE/IMAGEN FACHADA/fachada.png, etc.)
- Galeria de fotos (img 1.png, img 2.png, etc.)
- Avances de obra desde DOCUMENTACION_IBYZA/3. AVANCE DE OBRA/
- Brochures PDF como catalogos descargables
Mapea cada carpeta al proyecto correcto por slug.

## 2. SEPARACION POR TRANSFERENCIA (P0)
El cliente pidio alternativa a Culqi: subir comprobante de transferencia bancaria.
- Agregar campo `comprobante = ImageField` al modelo Separacion
- Nuevo endpoint POST /api/pagos/separacion-transferencia/ que acepte multipart con imagen
- En el frontend, agregar tab "Pago por transferencia" en SeparationModal paso 2
- Mostrar numeros de cuenta y nombre de empresa, el usuario sube foto del voucher
- Estado queda como "pendiente" hasta que admin lo apruebe manualmente

## 3. VISTA DE PLANTA INTERACTIVA (P1)
En ProjectDetailPage, la seccion de niveles necesita:
- Mostrar imagen del plano de planta por nivel (campo plano_planta en modelo Nivel)
- Al hacer hover sobre un departamento en la lista, destacarlo visualmente
- Al click, abrir modal con: plano del depto, area, precio, tipologia, boton "Separar"
- Las imagenes de planos las subira el cliente desde el admin

## 4. CALENDARIO VISUAL PARA CITAS (P1)
En ContactPage, tab "Agendar visita":
- Reemplazar el date picker simple por un calendario visual (tipo grid mensual)
- Mostrar horarios disponibles (9am-6pm L-V, 9am-1pm Sab)
- Bloquear domingos y feriados
- Al seleccionar fecha+hora, completar automaticamente los campos

## 5. DEPLOY A PRODUCCION (P1)
- Inicializar git si no existe, push a GitHub (repos: ibyza-api, ibyza-web)
- Crear proyecto Railway, agregar PostgreSQL addon
- Configurar todas las variables de entorno (ver .env.example)
- Deploy frontend a Vercel con VITE_API_URL apuntando al backend
- Verificar que todo funciona en produccion
- Configurar CORS con dominio real del frontend

## 6. PULIR RESPONSIVE Y UX (P2)
- Verificar todas las paginas en mobile (375px), tablet (768px), desktop (1280px)
- ProjectDetailPage: asegurar que galeria, planos y cards de departamentos se ven bien en mobile
- Navbar mobile: verificar que menu hamburguesa funciona correctamente
- Forms: verificar que inputs no se cortan en pantallas chicas

Empieza por el punto 1 (load_media) y avanza en orden. Ejecuta tests despues de cada cambio significativo. El backend tiene 155 tests que deben seguir pasando.

---
