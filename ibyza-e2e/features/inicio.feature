#language: es

@smoke @critical @inicio
Característica: Página de Inicio
  Como visitante de IBYZA
  Quiero ver el contenido destacado en la página de inicio
  Para conocer la empresa y los proyectos disponibles

  Antecedentes:
    Dado que el sitio IBYZA está disponible

  @smoke
  Escenario: Hero de inicio se muestra correctamente
    Cuando Carlos abre la página de inicio
    Entonces debe ver el logo grande "IBYZA" en el hero
    Y debe ver el tagline "Ingenieria y Construccion"
    Y debe ver los botones "Ver proyectos" y "Contactar asesor"

  @critical
  Escenario: Sección "Quienes Somos" visible
    Cuando Carlos abre la página de inicio
    Y hace scroll a la sección "Quienes Somos"
    Entonces debe ver el encabezado "Quienes"
    Y debe ver las 3 tarjetas de valores "Compromiso, Innovacion, Integridad"

  @critical
  Escenario: Carrusel de proyectos muestra datos del backend
    Cuando Carlos abre la página de inicio
    Y hace scroll al carrusel de proyectos
    Entonces debe ver al menos 3 proyectos en el carrusel
    Y cada proyecto debe tener nombre visible
    Y cada proyecto debe tener estado "En venta", "Preventa", "En construccion" o "Vendido"

  Escenario: Precios en dolares en el carrusel
    Cuando Carlos abre la página de inicio
    Y hace scroll al carrusel de proyectos
    Entonces los precios mostrados deben usar el símbolo "$"
