# IBYZA — Suite E2E (Serenity/JS Screenplay Pattern)

Pruebas end-to-end usando **Serenity/JS** + **Cucumber** (Gherkin en español) + **Playwright** siguiendo el **Screenplay Pattern**.

## Estructura

```
ibyza-e2e/
├── features/                    # Features Gherkin (BDD)
│   ├── navegacion.feature      # Navegación, logo, links, 404
│   ├── inicio.feature          # Hero, Quienes Somos, carrusel
│   ├── proyectos.feature       # Listado, detalle, filtros, API
│   ├── contacto.feature        # Formularios, tabs, validación
│   ├── separacion.feature      # Flujo de pago Culqi/Transferencia
│   └── admin.feature           # Admin Django + API pública
├── src/
│   ├── screenplay/ui/          # Page Objects (Screenplay)
│   │   ├── Navbar.js
│   │   ├── PaginaInicio.js
│   │   ├── PaginaProyectos.js
│   │   ├── PaginaContacto.js
│   │   └── ModalSeparacion.js
│   └── step-definitions/       # Implementación de pasos Gherkin
│       ├── hooks.js            # Before/After + configuración Serenity
│       ├── navegacion.steps.js
│       ├── inicio.steps.js
│       ├── proyectos.steps.js
│       ├── contacto.steps.js
│       ├── separacion.steps.js
│       └── admin.steps.js
├── package.json
└── cucumber.mjs
```

## Uso

### Instalación
```bash
cd ibyza-e2e
npm install
npx playwright install chromium
```

### Prerequisitos
Los tests requieren que ambos servidores estén corriendo:
- **Backend** Django en `http://127.0.0.1:8000`
- **Frontend** Vite en `http://localhost:5173`

### Correr la suite
```bash
npm test                    # Todos los escenarios
npm run test:headed         # Con navegador visible (debug)
npm run test:smoke          # Solo escenarios @smoke
npm run test:critical       # Solo escenarios @critical
npm run test:navegacion     # Solo feature de navegación
npm run test:proyectos      # Solo feature de proyectos
npm run test:contacto       # Solo feature de contacto
npm run test:admin          # Solo feature de admin
```

### Variables de entorno
```bash
BASE_URL=http://localhost:5173      # URL del frontend
API_URL=http://127.0.0.1:8000       # URL del backend
HEADLESS=true                       # true | false
```

## Cobertura

| Feature | Escenarios | Tags |
|---|---|---|
| `navegacion.feature` | 7 | @smoke @critical |
| `inicio.feature` | 4 | @smoke @critical |
| `proyectos.feature` | 7 | @smoke @critical |
| `contacto.feature` | 6 | @critical |
| `separacion.feature` | 6 | @critical |
| `admin.feature` | 5 | @smoke @critical |
| **Total** | **34** | — |

## Screenplay Pattern

El Screenplay Pattern separa claramente **actores**, **tareas**, **interacciones** y **preguntas**:

- **Actores**: `Carlos` (usuario visitante del sitio)
- **Abilities**: `BrowseTheWebWithPlaywright` (interactuar con el browser)
- **Tasks**: `Navegar a página`, `Abrir modal`, etc.
- **Interactions**: `Click.on(...)`, `Enter.theValue(...).into(...)`, `Navigate.to(...)`
- **Questions**: `Text.of(...)`, `Page.current().url()`, `.isVisible()`

Ejemplo:
```gherkin
Escenario: Navegar al detalle de un proyecto
  Cuando Carlos navega a la página de proyectos
  Y hace click en el proyecto "Católica"
  Entonces la URL debe contener "/proyectos/catolica"
  Y debe ver el botón "Volver a Proyectos"
```

## Tags disponibles

- `@smoke` — Humo, tests básicos de que el sistema responde
- `@critical` — Flujos críticos de negocio
- `@navegacion`, `@inicio`, `@proyectos`, `@contacto`, `@pagos`, `@admin` — Por feature

## Limitaciones conocidas

Algunos escenarios requieren inspección DOM en vivo para afinar los selectores:
- Flujos completos de separación (modal + Culqi tokens)
- Detección exacta de departamentos disponibles (depende del estado en DB)

Estos escenarios sirven como plantilla para un QA para terminar la automatización usando Playwright Inspector (`HEADLESS=false npm test`).

## Reporte

Los resultados se imprimen en consola con formato `progress` y `summary`. Para reportes HTML:
```bash
npm install --save-dev @serenity-js/serenity-bdd
# Agregar format a cucumber.mjs: '@serenity-js/serenity-bdd'
# Luego:
npx serenity-bdd run --destination=reports
```
