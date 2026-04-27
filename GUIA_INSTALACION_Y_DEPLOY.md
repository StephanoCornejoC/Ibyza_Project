# IBYZA — Guía de Instalación y Despliegue

Guía completa para:
1. **Levantar el proyecto en una PC nueva** (instalación local)
2. **Desplegar a producción** (backend en Render, frontend en Vercel)

---

## 📦 Estructura del proyecto

```
PROYECTOS_IBYZA/
├── ibyza-api/                    # Backend Django + DRF + Resend + Culqi
│   ├── ibyza/                    # Settings y URLs
│   ├── projects/                 # Proyectos, niveles, departamentos
│   ├── contact/                  # Formularios de contacto y citas
│   ├── content/                  # CMS (textos, FAQ, testimonios)
│   ├── payments/                 # Pasarela Culqi + transferencias
│   ├── tests/                    # 155 tests
│   ├── render.yaml               # Config deploy Render
│   ├── Procfile                  # Comandos de release
│   ├── requirements.txt
│   └── .env.example
│
├── ibyza-web/                    # Frontend React + Vite
│   ├── src/
│   │   ├── features/             # Páginas (home, about, projects, contact, separation)
│   │   ├── shared/               # Componentes, hooks, utils, stores
│   │   └── app/                  # Router, App
│   ├── vercel.json               # Config deploy Vercel
│   ├── package.json
│   └── .env.example
│
├── ibyza-e2e/                    # Tests E2E con Serenity/JS + Playwright
│   ├── features/                 # 6 feature files Gherkin
│   ├── src/screenplay/           # Page Objects + Tasks
│   └── src/step-definitions/     # Steps en JS
│
└── GUIA_INSTALACION_Y_DEPLOY.md  # Este archivo
```

---

# Parte 1 — Instalación local en PC nueva

## Pre-requisitos

| Software | Versión mínima | Verificar |
|---|---|---|
| **Python** | 3.12+ | `python --version` |
| **Node.js** | 20+ | `node --version` |
| **Git** | cualquiera | `git --version` |

Si no los tienes:
- Python: https://www.python.org/downloads/
- Node.js: https://nodejs.org/ (LTS)
- Git: https://git-scm.com/

## Paso 1: Descomprimir el proyecto

Coloca la carpeta `PROYECTOS_IBYZA/` donde quieras (ej. `D:\PROYECTOS\IBYZA\` o `C:\Users\TuUsuario\Documents\`).

## Paso 2: Backend (ibyza-api)

```bash
cd ibyza-api

# Crear entorno virtual
python -m venv venv

# Activar venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Copiar .env.example a .env y editar valores
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux
```

**Edita `ibyza-api/.env`** con tus valores reales:

```env
SECRET_KEY=genera-una-clave-aleatoria
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_URL=                    # vacío = SQLite local (recomendado en dev)

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Resend (https://resend.com — gratis 3000 emails/mes)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=IBYZA <onboarding@resend.dev>
EMAIL_RECIPIENTS=stephano.cornejoc@gmail.com

# Culqi (https://panel.culqi.com)
CULQI_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxx
CULQI_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
```

> 💡 La `RESEND_API_KEY` actual está en el `.env` original que recibiste. Cópiala tal cual.

```bash
# Aplicar migraciones (crea db.sqlite3)
python manage.py migrate

# Cargar datos iniciales (6 proyectos, contenido CMS, FAQ, testimonios)
python manage.py seed_proyectos
python manage.py seed_contenido
python manage.py seed_content     # FAQ + testimonios + beneficios

# Crear superusuario admin (interactivo, te pide username/email/password)
python manage.py createsuperuser
# O usar el comando automático si pones DJANGO_SUPERUSER_PASSWORD en .env:
# python manage.py create_admin

# Cargar imágenes reales (fachadas, planos, galería, avances)
python manage.py load_media
python manage.py load_info_faltante

# Iniciar servidor backend
python manage.py runserver 0.0.0.0:8000
```

✅ Backend corriendo en `http://localhost:8000`
- Admin: `http://localhost:8000/admin/`
- API: `http://localhost:8000/api/proyectos/`

## Paso 3: Frontend (ibyza-web)

Abre **otra terminal** (sin cerrar la del backend):

```bash
cd ibyza-web

# Instalar dependencias
npm install

# Copiar .env.example a .env
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux
```

**Edita `ibyza-web/.env`**:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_CULQI_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxx
VITE_WHATSAPP_NUMBER=+51993674174
```

```bash
# Iniciar servidor frontend
npm run dev
```

✅ Frontend corriendo en `http://localhost:5173`

## Paso 4: (Opcional) Tests E2E

```bash
cd ibyza-e2e
npm install
npx playwright install chromium

# Asegúrate de que back y front están corriendo
BASE_URL=http://localhost:5173 API_URL=http://127.0.0.1:8000 HEADLESS=true npm test
```

✅ Esperado: **34/34 escenarios pasando**.

## Verificación rápida

| Acción | URL | Esperado |
|---|---|---|
| Web pública | http://localhost:5173 | Hero IBYZA + carrusel de proyectos |
| Página /separacion | http://localhost:5173/separacion | 3 cards (Depto 905, 1005, 1102) |
| Admin Django | http://localhost:8000/admin/ | Login → panel con 13 modelos |
| API proyectos | http://localhost:8000/api/proyectos/ | JSON con 6 proyectos |

---

# Parte 2 — Despliegue a Producción

## Stack de producción

| Servicio | Plataforma | Plan | URL final |
|---|---|---|---|
| **Backend** Django | Render | Free (750h/mes) | `https://ibyza-api.onrender.com` |
| **PostgreSQL** | Render | Free (90 días, luego $7/mes) | gestionado por Render |
| **Frontend** React | Vercel | Hobby (gratis) | `https://ibyza-web.vercel.app` |
| **Email** | Resend | Free (3000/mes) | configurado por API |

## Paso A: Subir el código a GitHub

Antes de desplegar, necesitas un repo en GitHub.

```bash
# En la raíz de PROYECTOS_IBYZA/
cd D:\ruta\PROYECTOS_IBYZA

# Inicializar git (si no está)
git init
git add .
git commit -m "Initial commit IBYZA"

# Crear repo en https://github.com/new (privado recomendado)
# Luego conectar:
git remote add origin https://github.com/TU_USUARIO/ibyza.git
git branch -M main
git push -u origin main
```

> 🔒 Asegúrate que `.env`, `db.sqlite3`, `node_modules/` y `venv/` estén en `.gitignore` (ya están configurados).

## Paso B: Backend en Render

### 1. Crear cuenta
https://render.com → registrarse con GitHub

### 2. Conectar el repo
- Dashboard Render → **"New +"** → **"Blueprint"**
- Selecciona el repo `ibyza`
- Render detecta `ibyza-api/render.yaml` y aprovisiona automáticamente:
  - 1 PostgreSQL (DB)
  - 1 Web Service (API)

### 3. Configurar variables de entorno (en Render dashboard)

Render te pedirá completar las variables marcadas con `sync: false`:

| Variable | Valor sugerido |
|---|---|
| `ALLOWED_HOSTS` | `ibyza-api.onrender.com,ibyzacorp.com` |
| `CORS_ALLOWED_ORIGINS` | `https://ibyza-web.vercel.app,https://ibyzacorp.com` |
| `RESEND_API_KEY` | `re_Z7szPXvt_2q59GTpXx2jAwSM29X8WPG84` (tu key real) |
| `EMAIL_RECIPIENTS` | `stephano.cornejoc@gmail.com` |
| `CULQI_PUBLIC_KEY` | (de panel.culqi.com — produccion) |
| `CULQI_SECRET_KEY` | (de panel.culqi.com — produccion) |
| `DJANGO_SUPERUSER_PASSWORD` | una contraseña segura |

### 4. Deploy
- Render hace el deploy automáticamente al hacer push a `main`
- El primer deploy tarda **~5-10 min** (instala Python, dependencias, corre migraciones, seeds)
- Logs disponibles en tiempo real en el dashboard

### 5. Verificar

```
https://ibyza-api.onrender.com/admin/       → login del admin
https://ibyza-api.onrender.com/api/proyectos/ → JSON con 6 proyectos
```

> ⚠️ **Nota Render free tier**: el servicio se duerme después de 15 min sin tráfico. La primera petición tras el "sleep" tarda ~30s en despertar. Para evitarlo, considera el plan Starter ($7/mes) o usa un servicio como UptimeRobot que pinguee cada 14 min.

### 6. Cargar imágenes reales (una sola vez)

Después del primer deploy, ejecuta los comandos que cargan media local. Render ofrece **Shell** desde el dashboard:

- En el servicio `ibyza-api`, click pestaña **"Shell"**
- Ejecuta:

```bash
python manage.py load_media
python manage.py load_info_faltante
```

> 📌 **Limitación de Render free**: el filesystem es efímero (se borra en cada deploy). Para producción real, las imágenes deberían moverse a Cloudinary o AWS S3 con `django-storages`. Si los proyectos tienen pocas imágenes, las puedes resubir desde el admin después de cada deploy.

## Paso C: Frontend en Vercel

### 1. Crear cuenta
https://vercel.com → registrarse con GitHub

### 2. Importar proyecto
- Dashboard Vercel → **"Add New..."** → **"Project"**
- Selecciona el repo `ibyza`
- **Configure Project**:
  - **Framework Preset**: Vite
  - **Root Directory**: `ibyza-web` ← ¡importante!
  - Build Command: (auto detectado: `npm run build`)
  - Output Directory: (auto detectado: `dist`)

### 3. Configurar variables de entorno

En la sección **Environment Variables** del setup:

| Variable | Valor |
|---|---|
| `VITE_API_URL` | `https://ibyza-api.onrender.com` |
| `VITE_CULQI_PUBLIC_KEY` | tu key pública de Culqi |
| `VITE_WHATSAPP_NUMBER` | `+51993674174` |

### 4. Deploy

Click **"Deploy"** — Vercel hace el build (~2 min) y te da la URL final.

### 5. Configurar dominio personalizado (cuando esté listo)

Cuando tengas `ibyzacorp.com`:

**En Vercel** (`ibyza-web` → Settings → Domains):
- Agregar `ibyzacorp.com` y `www.ibyzacorp.com`
- Vercel te da los registros DNS (CNAME o A)

**En el panel de tu dominio** (GoDaddy, Cloudflare, etc):
- Agregar los registros DNS que Vercel pidió
- Esperar propagación DNS (10-60 min)

**Después actualizar en Render** (`ibyza-api`):
- `ALLOWED_HOSTS=ibyza-api.onrender.com,ibyzacorp.com,www.ibyzacorp.com`
- `CORS_ALLOWED_ORIGINS=https://ibyzacorp.com,https://www.ibyzacorp.com`

## Paso D: Verificar dominio en Resend (opcional)

Mientras no verifiques `ibyzacorp.com` en Resend, los emails solo pueden ir al email del dueño de la cuenta Resend.

Para enviar a múltiples destinatarios:

1. Resend dashboard → **Domains** → **Add Domain** → `ibyzacorp.com`
2. Agregar los 3 registros DNS que Resend te muestra (TXT) en tu panel del dominio
3. Esperar verificación (~10 min)
4. En Render, actualizar:
   - `RESEND_FROM_EMAIL=IBYZA <no-reply@ibyzacorp.com>`
   - `EMAIL_RECIPIENTS=stephano.cornejoc@gmail.com,valeriaemanuel1@gmail.com,...`

---

# Comandos útiles

## Backend

```bash
# Tests
python manage.py test                          # 155 tests

# Crear migraciones tras cambios en modelos
python manage.py makemigrations
python manage.py migrate

# Crear superusuario interactivo
python manage.py createsuperuser

# Recargar contenido inicial
python manage.py seed_proyectos
python manage.py seed_contenido
python manage.py seed_content

# Recargar imágenes
python manage.py load_media
python manage.py load_info_faltante

# Shell Django (REPL)
python manage.py shell

# Collectstatic (para producción)
python manage.py collectstatic --noinput
```

## Frontend

```bash
npm run dev          # Desarrollo (http://localhost:5173)
npm run build        # Build producción (genera dist/)
npm run preview      # Preview del build
npm run lint         # ESLint
```

## E2E

```bash
npm test                          # Todos los escenarios (34)
npm run test:smoke                # Solo smoke
npm run test:critical             # Solo flujos críticos
npm run test:navegacion           # Solo navegación
npm run test:headed               # Con navegador visible (debug)
```

---

# Troubleshooting

## "Módulo no encontrado" en backend
```bash
# Re-instalar dependencias dentro del venv activado
pip install -r requirements.txt
```

## Frontend no se conecta al backend (CORS error)
Verifica que `CORS_ALLOWED_ORIGINS` en `ibyza-api/.env` incluya `http://localhost:5173`.

## "Database is locked" en SQLite
SQLite no soporta múltiples writers. Si pasa, cierra todos los `runserver` y ejecuta:
```bash
python manage.py migrate
```

## Render: "Build failed"
Revisa los logs. Causas comunes:
- `requirements.txt` falta una dependencia
- Variable de entorno faltante (revisa `render.yaml`)
- `DATABASE_URL` no se conectó (Render tarda ~30s en provisionar la DB la primera vez)

## Vercel: "Error: Cannot find module"
- Verifica que **Root Directory** esté en `ibyza-web` (no en la raíz del repo)

## Render free se duerme
- Plan free duerme tras 15 min sin tráfico → primera petición tarda ~30s
- Solución temporal: usar https://uptimerobot.com (gratis) para hacer ping cada 14 min a `https://ibyza-api.onrender.com/admin/login/`
- Solución definitiva: upgrade a Starter ($7/mes)

---

# Credenciales de referencia

## Admin local (si usaste seed)
- Usuario: `admin`
- Password: lo que pongas con `createsuperuser` o `DJANGO_SUPERUSER_PASSWORD`

## Servicios
- **Resend API**: ya en `.env` (no la pierdas)
- **Culqi keys**: las que tengas (test o prod)

---

# Estado final del proyecto

| Componente | Estado |
|---|---|
| Backend Django | ✅ 155 tests OK, listo para Render |
| Frontend React | ✅ 0 URLs externas, listo para Vercel |
| Pasarela Culqi + Transferencia | ✅ Implementada con atomic locks |
| Resend (emails) | ✅ Configurado, requiere dominio para producción |
| Tests E2E (Serenity/JS) | ✅ 34/34 escenarios |
| Admin Django | ✅ 13 modelos editables (Proyectos, Deptos, FAQ, etc) |
| Página `/separacion` | ✅ Camino directo de pago con Culqi |
| Redirect `/` → `/admin/` | ✅ Configurado en backend |

Listo para entregar. 🚀
