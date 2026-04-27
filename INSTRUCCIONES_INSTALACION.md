# IBYZA — Instrucciones de Instalacion Rapida

## Requisitos previos
- Python 3.12+ (https://python.org)
- Node.js 20+ (https://nodejs.org)
- Git (opcional)

---

## 1. BACKEND (ibyza-api)

```bash
cd ibyza-api

# Crear entorno virtual
python -m venv venv

# Activar entorno (Windows)
venv\Scripts\activate
# Activar entorno (Mac/Linux)
# source venv/bin/activate

# Instalar dependencias
pip install -r requirements-dev.txt

# Copiar variables de entorno
copy .env.example .env
# En Mac/Linux: cp .env.example .env

# Aplicar migraciones
python manage.py migrate

# Cargar datos reales
python manage.py seed_contenido
python manage.py seed_proyectos

# Crear admin (usuario: admin, password: admin123)
python manage.py createsuperuser
# O usar el comando automatico:
# set DJANGO_SUPERUSER_PASSWORD=admin123
# python manage.py create_admin

# Ejecutar tests (155 tests)
python manage.py test tests/ -v 2

# Iniciar servidor
python manage.py runserver 8000
```

Backend disponible en: http://127.0.0.1:8000
Admin Django: http://127.0.0.1:8000/admin/

---

## 2. FRONTEND (ibyza-web)

```bash
cd ibyza-web

# Instalar dependencias
npm install

# Copiar variables de entorno
copy .env.example .env
# En Mac/Linux: cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

Frontend disponible en: http://localhost:5173

> Si el puerto 5173 esta ocupado, Vite usara 5174.
> En ese caso, agregar `http://localhost:5174` al CORS del backend:
> Editar `ibyza-api/.env` → `CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000`
> y reiniciar el backend.

---

## 3. CREDENCIALES

- **Admin Django**: admin / admin123 (crear con createsuperuser)
- **API**: sin autenticacion (publica)
- **Culqi**: usar claves de test del panel Culqi

---

## 4. ESTRUCTURA

```
PROYECTOS_IBYZA/
├── ibyza-api/          ← Backend Django 6 + DRF
│   ├── projects/       ← Proyectos inmobiliarios
│   ├── contact/        ← Formularios de contacto y citas
│   ├── payments/       ← Pasarela Culqi
│   ├── content/        ← CMS (contenido editable)
│   └── tests/          ← 155 tests
│
├── ibyza-web/          ← Frontend React 19 + Vite 8
│   └── src/
│       ├── features/   ← Paginas (home, projects, about, contact)
│       └── shared/     ← Componentes reutilizables, theme, hooks
│
└── INSTRUCCIONES_INSTALACION.md
```

---

## 5. DATOS REALES CARGADOS

| Proyecto | Estado | Deptos disponibles |
|----------|--------|--------------------|
| Mira Verde | Vendido | 0 |
| Bolivar 205 | Vendido | 0 |
| Parke 10 | Vendido | 0 |
| Catolica | En venta | 3 ($98,900 USD c/u) |
| Boreal | Vendido | 0 |
| IBYZA Tower | Preventa | Por definir |

---

## 6. PARA DEPLOY EN PRODUCCION

Ver variables de entorno necesarias en Railway en el archivo:
`ibyza-api/.env.example`

El backend esta listo para Railway (railway.toml + Procfile incluidos).
El frontend se puede deployar en Vercel con `VITE_API_URL=https://tu-backend.up.railway.app`
