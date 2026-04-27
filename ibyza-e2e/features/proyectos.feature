#language: es

@critical @proyectos
Característica: Listado y detalle de proyectos
  Como cliente potencial
  Quiero explorar los proyectos disponibles
  Para encontrar un departamento que se ajuste a mis necesidades

  Antecedentes:
    Dado que el sitio IBYZA está disponible

  @smoke
  Escenario: Listar todos los proyectos
    Cuando Carlos navega a la página de proyectos
    Entonces debe ver al menos 6 proyectos listados
    Y cada proyecto debe tener imagen de fachada o placeholder
    Y cada proyecto debe tener botón "Ver proyecto"

  @critical
  Escenario: Ver detalle de un proyecto en venta
    Cuando Carlos navega a la página de proyectos
    Y hace click en el proyecto "Católica"
    Entonces la URL debe contener "/proyectos/catolica"
    Y debe ver el nombre "Católica" en el hero
    Y debe ver el botón "Volver a Proyectos"

  @critical
  Escenario: Botón volver regresa al listado
    Dado que Carlos está viendo el detalle del proyecto "Católica"
    Cuando Carlos hace click en "Volver a Proyectos"
    Entonces la URL debe ser "/proyectos"

  Escenario: Filtrar proyectos por estado
    Cuando Carlos navega a la página de proyectos
    Y hace click en el filtro "En venta"
    Entonces solo debe ver proyectos con estado "En venta"

  @critical
  Escenario: Ver departamentos de un proyecto
    Dado que Carlos está viendo el detalle del proyecto "Católica"
    Cuando Carlos hace scroll a la sección de departamentos
    Entonces debe ver al menos 1 departamento disponible
    Y cada departamento debe mostrar precio en dolares

  Escenario: Consultar API de proyectos directamente
    Cuando se consulta el endpoint "/api/proyectos/"
    Entonces la respuesta debe tener status 200
    Y la respuesta debe contener al menos 6 proyectos
