# Deploy a Railway — IBYZA Backend

**Guía paso a paso** para desplegar el backend Django a Railway.
Frontend se queda en Vercel (no se toca acá).

---

## 0. Prerequisitos

- [ ] Cuenta de Railway: https://railway.app (login con GitHub)
- [ ] Railway CLI instalado *(opcional pero recomendado)*:
  ```bash
  npm install -g @railway/cli
  railway login
  ```
- [ ] Repo del proyecto pusheado a GitHub con todos los cambios actuales
- [ ] Tener a mano las siguientes credenciales **antes de empezar**:
  - `SECRET_KEY` (generala con `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`)
  - `RESEND_API_KEY` (https://resend.com/api-keys)
  - `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ENDPOINT_URL`, `R2_PUBLIC_URL` (las que ya están en `.env` local)
  - `CULQI_PUBLIC_KEY`, `CULQI_SECRET_KEY` (de Diana, cuando active la pasarela)
  - `DJANGO_SUPERUSER_PASSWORD` (la que va a usar el `admin` en producción)

---

## 1. Crear el proyecto en Railway

1. Abrir https://railway.app/new
2. Click en **"Deploy from GitHub repo"**
3. Autorizar Railway si es la primera vez
4. Seleccionar el repo `Ibyza_Project` (o el que tenga el monorepo)
5. Railway detecta `railway.toml` y empieza el build automáticamente
6. ⚠️ **STOP**: el primer deploy va a fallar porque faltan env vars. Esto es esperado, ahora las configuramos.

## 2. Configurar el Root Directory

El repo es monorepo (`ibyza-api/` + `ibyza-web/`). Hay que decirle a Railway que solo deploye el backend:

1. En el panel del proyecto Railway, click en el servicio recién creado
2. **Settings → Source → Root Directory**
3. Escribir: `ibyza-api`
4. Save

## 3. Agregar PostgreSQL

1. En el panel del proyecto: **+ New → Database → Add PostgreSQL**
2. Railway crea la DB y genera automáticamente la variable `DATABASE_URL` en el servicio
3. **No tenés que copiarla manualmente** — Railway la inyecta como env var.

## 4. Configurar variables de entorno

En el servicio del backend: **Variables → + New Variable** (uno por uno):

### Variables obligatorias

| Variable | Valor | Notas |
|---|---|---|
| `SECRET_KEY` | *(la que generaste arriba)* | 50+ caracteres aleatorios |
| `DEBUG` | `False` | **NUNCA True en prod** |
| `ALLOWED_HOSTS` | `ibyza-api.up.railway.app` | Railway te da este dominio al crear el servicio. Después agregar `,api.ibyzacorp.com` cuando configures dominio custom |
| `CORS_ALLOWED_ORIGINS` | `https://ibyza-web.vercel.app,https://ibyzacorp.com` | Origenes del frontend. Sin `/` al final |
| `CSRF_TRUSTED_ORIGINS` | `https://ibyza-api.up.railway.app` | Necesario para que Diana se loguee al admin (Django 4+ con HTTPS) |
| `DATABASE_URL` | *(Railway la genera sola)* | Verificar que esté presente |

### Storage R2 (las mismas del `.env` local)

| Variable | Valor |
|---|---|
| `R2_ACCESS_KEY_ID` | `<tu access key>` |
| `R2_SECRET_ACCESS_KEY` | `<tu secret key>` |
| `R2_BUCKET_NAME` | `ibyza-media` |
| `R2_ENDPOINT_URL` | `https://<tu-account-id>.r2.cloudflarestorage.com` |
| `R2_PUBLIC_URL` | `https://pub-9d0de75710e94fad99ccfd993e746e82.r2.dev` |

> **Importante**: si vas a rotar las credenciales R2 (como tenés pendiente), hacelo en Cloudflare *antes* de configurarlas acá. Si ya están rotadas, usá las nuevas.

### Email (Resend)

| Variable | Valor |
|---|---|
| `RESEND_API_KEY` | `<tu api key de resend>` |
| `RESEND_FROM_EMAIL` | `IBYZA <onboarding@resend.dev>` *(temporal hasta verificar dominio)* |
| `EMAIL_RECIPIENTS` | `ventas@ibyzacorp.com,diana.silva.v94@gmail.com` |

### Culqi (cuando Diana te pase las keys)

| Variable | Valor |
|---|---|
| `CULQI_PUBLIC_KEY` | `pk_live_xxx` *(o `pk_test_xxx` para probar primero)* |
| `CULQI_SECRET_KEY` | `sk_live_xxx` *(o `sk_test_xxx`)* |

### Superuser inicial (se crea solo al primer deploy)

| Variable | Valor |
|---|---|
| `DJANGO_SUPERUSER_USERNAME` | `admin` |
| `DJANGO_SUPERUSER_EMAIL` | `admin@ibyzacorp.com` |
| `DJANGO_SUPERUSER_PASSWORD` | *(password fuerte para vos como super-admin)* |

> El comando `create_admin` corre en cada deploy pero es **idempotente** (solo crea el user si no existe). Para resetear la password de admin después, usar Railway CLI: `railway run python manage.py changepassword admin`.

## 5. Disparar el deploy

Una vez configuradas todas las variables:

1. **Deployments → Redeploy** (botón arriba a la derecha)
2. Ver los logs en vivo en la pestaña **Logs**
3. Esperar a que el build termine (~2-3 min):
   - `pip install`
   - `collectstatic`
   - `migrate`
   - `createcachetable`
   - `create_admin`
   - `gunicorn` arranca
4. Cuando veas `Listening at: http://0.0.0.0:$PORT`, está vivo

## 6. Generar el dominio público

1. **Settings → Networking → Generate Domain**
2. Railway te da algo como `ibyza-api-production.up.railway.app`
3. **Actualizar la variable `ALLOWED_HOSTS`** con este dominio si no lo pusiste antes
4. **Actualizar la variable `CSRF_TRUSTED_ORIGINS`** con `https://<dominio>` también
5. Railway redeploya automáticamente al cambiar env vars

## 7. Verificación post-deploy

Una vez vivo, probar:

```bash
# Healthcheck (debe responder 200)
curl https://<tu-dominio>.up.railway.app/healthz/

# API contenido (debe devolver JSON con los textos)
curl https://<tu-dominio>.up.railway.app/api/contenido/?pagina=inicio

# API proyectos
curl https://<tu-dominio>.up.railway.app/api/proyectos/

# Admin (debe responder 302 redirect a /admin/login/)
curl -I https://<tu-dominio>.up.railway.app/admin/
```

**Login al admin**:
1. Abrir `https://<tu-dominio>.up.railway.app/admin/`
2. Usuario: `admin`
3. Password: la que pusiste en `DJANGO_SUPERUSER_PASSWORD`
4. Verificar que el sidebar carga, los proyectos están vacíos (DB nueva), todo OK

## 8. Seeds iniciales (solo primera vez)

La DB de Railway está vacía. Para poblarla con la data inicial:

**Opción A — Con Railway CLI** (recomendado):
```bash
cd ibyza-api
railway link  # vincular el proyecto local con el de Railway
railway run python manage.py seed_contenido
railway run python manage.py seed_proyectos
railway run python manage.py setup_diana
```

**Opción B — Sin CLI**: agregar temporalmente los seeds al `startCommand` del `railway.toml`, redeployar, y volver a sacarlos. Más feo pero funciona.

> Después de los seeds, Diana ya puede entrar al admin y ver:
> - Los 6 proyectos cargados
> - Los textos del CMS
> - Su usuario `diana` con permisos limitados

## 9. Actualizar el frontend (Vercel)

El frontend en Vercel apunta a `localhost:8000` en dev. Para que apunte a Railway:

1. Vercel dashboard del proyecto `ibyza-web`
2. **Settings → Environment Variables**
3. Editar/agregar:
   ```
   VITE_API_URL=https://<tu-dominio-railway>.up.railway.app
   ```
4. **Redeploy** el frontend (Deployments → … → Redeploy)
5. Verificar en `https://ibyza-web.vercel.app/` que carga los proyectos correctamente

## 10. Dominio custom (opcional, post-deploy)

Si querés `api.ibyzacorp.com` en vez del subdominio de Railway:

1. Railway: **Settings → Networking → Custom Domain → + Add Domain**
2. Escribir `api.ibyzacorp.com`
3. Railway te da un CNAME para configurar
4. En el panel del proveedor de dominio (Namecheap, GoDaddy, etc.), agregar el CNAME
5. Esperar propagación DNS (5 min – 24h)
6. **Actualizar** `ALLOWED_HOSTS` y `CSRF_TRUSTED_ORIGINS` con el nuevo dominio
7. **Actualizar** `VITE_API_URL` en Vercel
8. Redeploy ambos

---

## Troubleshooting

| Síntoma | Solución |
|---|---|
| `502 Bad Gateway` | Logs muestran error de boot. Suele ser env var faltante (SECRET_KEY, DATABASE_URL). Verificar las variables y redeployar. |
| `DisallowedHost: Invalid HTTP_HOST` | Falta el dominio en `ALLOWED_HOSTS`. Agregar el dominio que aparece en el error y redeployar. |
| Admin no permite login (CSRF token missing/invalid) | Falta `CSRF_TRUSTED_ORIGINS=https://<dominio>` (con esquema https). |
| Imágenes no cargan en el frontend | Verificar `R2_PUBLIC_URL` correcto + que las imágenes están en el bucket. |
| CORS error en consola del browser | Agregar dominio de Vercel a `CORS_ALLOWED_ORIGINS` (sin barra final). |
| `relation "django_cache_table" does not exist` | El `createcachetable` falló. Correr manualmente: `railway run python manage.py createcachetable django_cache_table` |

## Costos esperados

| Recurso | Costo |
|---|---|
| Railway Hobby plan | $5/mes (incluido en plan, suficiente para IBYZA) |
| PostgreSQL Railway | Incluido en el plan |
| Tráfico/Outbound | Primeros 100 GB gratis |
| **Total estimado** | **~$5-8 USD/mes** (sin contar Cloudflare R2 que ya está separado y casi gratis) |

---

**Fin de la guía.**

Cualquier problema post-deploy, los logs en Railway son tu mejor amigo (pestaña **Logs** del servicio).
