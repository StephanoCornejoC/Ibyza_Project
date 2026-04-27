# IBYZA — Plataforma web inmobiliaria

Monorepo del sitio web de **IBYZA Ingeniería y Construcción S.A.C.** Incluye backend Django, frontend React y suite de tests E2E.

---

## Estructura del monorepo

```
Ibyza_Project/
├── ibyza-api/      Backend — Django 6 + DRF + PostgreSQL
├── ibyza-web/      Frontend — React 19 + Vite 8 + Styled Components
└── ibyza-e2e/      Tests E2E — Serenity BDD + Cucumber
```

---

## Stack tecnológico

### Backend (`ibyza-api/`)

- **Django 6** + **Django REST Framework**
- **PostgreSQL** (producción) / SQLite (desarrollo)
- **django-unfold** — admin moderno e intuitivo en español
- **Culqi** — pasarela de pago peruana (tarjeta de crédito)
- **Resend** — email transaccional (3 000 envíos/mes gratis)
- **WhiteNoise** + **Gunicorn** para servir estáticos en producción

### Frontend (`ibyza-web/`)

- **React 19** + **Vite 8**
- **Styled Components** (theming centralizado)
- **React Router 7** — SPA con rutas para Inicio, Nosotros, Proyectos, Contacto, Separar
- **Zustand** — estado global ligero
- **React Hook Form** + **Zod** — formularios validados
- **Framer Motion** + **GSAP** — animaciones premium
- **Lenis** — scroll suave

### Tests E2E (`ibyza-e2e/`)

- **Serenity BDD** + **Cucumber**
- **Selenium WebDriver**
- Reportes con screenshots y living documentation

---

## Setup local rápido

### Pre-requisitos

- **Python 3.12+**
- **Node 20+**
- **Git**

### Backend

```bash
cd ibyza-api
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env  # editar con tus credenciales

python manage.py migrate
python manage.py create_admin            # crea superusuario admin/admin
python manage.py seed_proyectos          # carga los 6 proyectos
python manage.py seed_contenido          # carga textos, FAQ, testimonios
python manage.py runserver
```

→ Backend disponible en `http://127.0.0.1:8000` y admin en `http://127.0.0.1:8000/admin/`.

### Frontend

```bash
cd ibyza-web
npm install
cp .env.example .env  # editar VITE_API_URL si el backend no está en 127.0.0.1:8000
npm run dev
```

→ Frontend disponible en `http://localhost:5173`.

### Tests E2E

```bash
cd ibyza-e2e
npm install
npm test
```

> Asegurarse de tener backend y frontend corriendo antes de lanzar los tests E2E.

---

## Despliegue

### Estado actual

- **Demo (ahora):** desplegar en **Render** (free tier 90 días).
- **Producción (después):** migrar a **Railway** una vez se confirme contratación.

Documentación completa en [`ibyza-api/DEPLOY.md`](ibyza-api/DEPLOY.md).

### Resumen rápido

| Componente | Plataforma demo | Plataforma producción |
|---|---|---|
| Backend | Render (Web Service free + PostgreSQL free) | Railway (~$5/mes) |
| Frontend | Vercel (free tier) | Vercel (free tier) |
| Storage de media | Disco efímero de Render | Cloudflare R2 / AWS S3 |
| Email | Resend (3 000/mes gratis) | Resend / SES |
| Pasarela pago | Culqi sandbox | Culqi producción |

---

## Credenciales y secretos

**Nunca** subir archivos `.env` con credenciales reales.

- En desarrollo: copiar `*/.env.example` a `*/.env` y completar localmente.
- En producción (Render/Railway): configurar las variables directamente en el dashboard del proveedor.

Variables sensibles del proyecto:

- `SECRET_KEY` (Django) — Render la genera automáticamente
- `RESEND_API_KEY` — desde [resend.com/api-keys](https://resend.com/api-keys)
- `CULQI_PUBLIC_KEY` / `CULQI_SECRET_KEY` — desde [panel.culqi.com](https://panel.culqi.com)
- `DJANGO_SUPERUSER_PASSWORD` — generar manualmente, mínimo 12 caracteres

---

## Tests automatizados

| Suite | Cantidad | Ubicación | Comando |
|---|---|---|---|
| Unitarios + integración (backend) | 155 | `ibyza-api/tests/` | `python manage.py test` |
| E2E (UI completa) | varios | `ibyza-e2e/features/` | `npm test` (en `ibyza-e2e/`) |

---

## Cliente

**IBYZA Ingeniería y Construcción S.A.C.**
Contacto del proyecto: Diana Silva — diana.silva.v94@gmail.com — +51 953 728 070

Dominio: [ibyzacorp.com](https://ibyzacorp.com)

---

## Equipo de desarrollo

[**COREM Labs**](https://coremlabs.pe) — Stephano Cornejo (Tech Lead)
