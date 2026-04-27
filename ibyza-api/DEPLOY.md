# Guía de despliegue — IBYZA Backend

## Objetivo

- **Demo (ahora):** desplegar el backend en **Render** para mostrar al cliente IBYZA el panel de administración y la web funcionando con dominio temporal.
- **Producción (después):** migrar a **Railway** una vez se confirme la propuesta y se contrate el plan definitivo. Las variables y la estructura son compatibles entre ambos proveedores.

---

## Parte 1 — Despliegue temporal en Render

### Pre-requisitos

- Cuenta en [render.com](https://render.com) (gratuita).
- Repositorio de GitHub con el código (puede ser el monorepo `PROYECTOS_IBYZA/` o solo `ibyza-api/`).
- API key de [Resend](https://resend.com/api-keys) (3000 emails/mes gratis).
- Llaves de prueba de [Culqi](https://panel.culqi.com) (`pk_test_...` y `sk_test_...`).
- Dominio del frontend (Vercel: `https://ibyza-web.vercel.app` por ejemplo).

### Paso 1 — Subir el repo a GitHub

```bash
cd ibyza-api/
git init
git add .
git commit -m "feat: backend listo para deploy en Render"
git remote add origin https://github.com/<tu-usuario>/ibyza-api.git
git branch -M main
git push -u origin main
```

> Si el repo es un monorepo (contiene también `ibyza-web/`), descomenta la línea `rootDir: ibyza-api` dentro de `render.yaml`.

### Paso 2 — Crear el servicio en Render

1. Entrar a [render.com/dashboard](https://dashboard.render.com).
2. Click en **"New +"** → **"Blueprint"**.
3. Conectar el repositorio de GitHub.
4. Render detecta automáticamente `render.yaml` y muestra:
   - 1 base de datos PostgreSQL: `ibyza-db`
   - 1 servicio web: `ibyza-api`
5. Click en **"Apply"**.

### Paso 3 — Configurar variables marcadas con `sync: false`

En el dashboard del servicio `ibyza-api` → pestaña **"Environment"**:

| Variable | Valor |
|---|---|
| `ALLOWED_HOSTS` | `ibyza-api.onrender.com,ibyzacorp.com` |
| `CORS_ALLOWED_ORIGINS` | `https://ibyza-web.vercel.app,https://ibyzacorp.com` |
| `RESEND_API_KEY` | la key de resend.com |
| `EMAIL_RECIPIENTS` | `ventas@ibyzacorp.com,stephano.cornejoc@gmail.com` |
| `CULQI_PUBLIC_KEY` | `pk_test_...` (sandbox) |
| `CULQI_SECRET_KEY` | `sk_test_...` (sandbox) |
| `DJANGO_SUPERUSER_PASSWORD` | una contraseña segura (mínimo 12 caracteres) |

Click en **"Save Changes"**. Render reinicia el servicio automáticamente.

### Paso 4 — Verificar que arrancó

1. Ir a la URL del servicio: `https://ibyza-api.onrender.com/admin/`
2. Login con `admin` y la contraseña configurada en `DJANGO_SUPERUSER_PASSWORD`.
3. Si ves el panel de administración → **OK**.

### Paso 5 — Cargar datos iniciales (solo la primera vez)

Render permite abrir un **shell** dentro del servicio:

1. Dashboard → servicio `ibyza-api` → pestaña **"Shell"**.
2. Ejecutar:

```bash
python manage.py seed_contenido    # textos, FAQ, testimonios, beneficios
python manage.py seed_proyectos    # los 6 proyectos reales con datos
python manage.py load_info_faltante  # opcional: fachadas y planos extra
```

> **Importante:** estos comandos NO se corren automáticamente en cada deploy para no sobrescribir los cambios que Diana haga desde el admin. Solo se ejecutan manualmente la primera vez.

### Paso 6 — Conectar el frontend al backend de Render

En **Vercel** (donde está el frontend `ibyza-web`):

- Settings → Environment Variables → agregar:
  - `VITE_API_URL=https://ibyza-api.onrender.com`
- Hacer un redeploy del frontend.

### Paso 7 — Verificación end-to-end

Probar desde el sitio público (Vercel):

- [ ] Página de inicio carga proyectos
- [ ] Detalle de proyecto muestra plano y galería
- [ ] Formulario de contacto envía mensaje (verificar que llegue email)
- [ ] Formulario de cita registra solicitud
- [ ] Botón "Separar departamento" abre el modal y procesa pago Culqi (sandbox)
- [ ] Comprobante de transferencia se sube correctamente
- [ ] Admin muestra el contacto / cita / separación recibida

---

## Limitaciones del Free tier de Render

| Limitación | Impacto | Mitigación |
|---|---|---|
| **Sleep tras 15 min** sin tráfico | El primer request tras inactividad tarda ~30 segundos | Para demo es aceptable. Producción → upgradear a "Starter" ($7/mes) |
| **DB free durante 90 días** | Después caduca y borra los datos | Hacer dump antes del día 89: `python manage.py dumpdata > backup.json` |
| **750 horas/mes de cómputo** | Suficiente si solo hay un servicio activo | Sin acción |
| **Media files en disco efímero** | Las imágenes que Diana suba al admin se pueden perder en redeploys | Subir solo desde admin contenido **persistente** (ej: catálogos PDF) en S3/R2 cuando se vaya a producción |

---

## Parte 2 — Plan de migración a Railway

Cuando IBYZA confirme la contratación definitiva (post-demo), migrar a Railway:

### Por qué Railway en producción

- Sin sleep automático (sitio siempre rápido).
- Costo similar ($5-10/mes incluyendo DB).
- Mejor experiencia de logs y métricas.
- Disco persistente para media files (con un volumen montado).

### Pasos para migrar

1. **Backup de la DB de Render**

   ```bash
   # En Render Shell:
   python manage.py dumpdata --natural-foreign --natural-primary \
     -e contenttypes -e auth.Permission \
     > /tmp/backup.json
   # Descargar el archivo desde la pestaña "Disks" o usar pg_dump
   ```

2. **Crear el proyecto en Railway**

   - [railway.app/new](https://railway.app/new) → Deploy from GitHub repo.
   - Railway detecta `railway.toml` (ya existe en el repo) y aprovisiona.
   - Agregar plugin **PostgreSQL** desde el panel.

3. **Copiar variables de entorno** desde Render a Railway (mismos nombres y valores).

4. **Actualizar `ALLOWED_HOSTS`** y **`CORS_ALLOWED_ORIGINS`** con la nueva URL de Railway (`*.up.railway.app`) y el dominio final `ibyzacorp.com`.

5. **Restaurar datos**

   ```bash
   # En Railway Shell:
   python manage.py loaddata /tmp/backup.json
   ```

6. **Apuntar el dominio `ibyzacorp.com` al servicio de Railway** (CNAME o A record).

7. **Reconfigurar el frontend** (Vercel) con `VITE_API_URL=https://api.ibyzacorp.com`.

8. **Pausar / borrar los servicios de Render** una vez verificado.

### Estimación de tiempo

- Migración completa: **30-45 minutos** (asumiendo backup ya tomado).
- Sin downtime si se hace fuera de horario (hot swap del DNS).

---

## Comandos útiles

| Comando | Cuándo usar |
|---|---|
| `python manage.py check --deploy` | Verificar config antes de deploy |
| `python manage.py collectstatic --noinput` | Recolectar archivos estáticos |
| `python manage.py migrate` | Aplicar migraciones |
| `python manage.py create_admin` | Crear superusuario (idempotente) |
| `python manage.py seed_contenido` | Cargar textos, FAQ, testimonios, beneficios |
| `python manage.py seed_proyectos` | Cargar los 6 proyectos reales |
| `python manage.py seed_proyectos --clear` | Borrar y recrear (CUIDADO en prod) |
| `python manage.py dumpdata > backup.json` | Backup antes de migrar |
| `python manage.py loaddata backup.json` | Restaurar backup |
| `python manage.py test` | Correr suite de tests (155 tests) |

---

## Solución de problemas comunes

### El deploy falla con "DATABASE_URL es requerido en producción"

→ Verificar que `DATABASE_URL` esté en Environment y apunte a la DB de Render.

### El admin no carga estilos

→ Verificar que `collectstatic` se ejecutó (debería estar en `buildCommand`). Limpiar caché del navegador.

### CORS error desde el frontend

→ `CORS_ALLOWED_ORIGINS` debe incluir el dominio EXACTO del frontend (con `https://`, sin barra final).

### El email no llega

→ Verificar `RESEND_API_KEY` y que el destinatario coincida con un dominio verificado en Resend (mientras se use `onboarding@resend.dev`, solo llega al dueño de la cuenta Resend).

### "Service is sleeping"

→ Free tier de Render. El primer request despierta el servicio (~30s). Para evitar: upgradear a plan Starter o usar un cron externo (uptimerobot.com) que pingee cada 10 min.

### Las imágenes que subo desde el admin desaparecen

→ Render free tier usa disco efímero. Las imágenes solo persisten hasta el siguiente deploy. Solución definitiva (post-demo): integrar django-storages con Cloudflare R2 o AWS S3.
