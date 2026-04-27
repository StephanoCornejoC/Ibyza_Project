#language: es

@smoke @critical @navegacion
Característica: Navegación del sitio IBYZA
  Como visitante del sitio web de IBYZA
  Quiero poder navegar entre las secciones principales
  Para conocer los proyectos y contactar al equipo

  Antecedentes:
    Dado que el sitio IBYZA está disponible

  @smoke
  Escenario: Cargar la página de inicio
    Cuando Carlos abre la página de inicio
    Entonces el título de la página debe contener "IBYZA"
    Y debe ver el logo "IBYZA" en la barra de navegación
    Y debe ver los enlaces "Inicio, Nosotros, Proyectos, Contacto"
    Y debe ver el botón "Ver proyectos"

  @critical
  Esquema del escenario: Navegar entre las secciones principales
    Cuando Carlos navega al enlace "<enlace>"
    Entonces la URL debe contener "<ruta>"
    Y el título de la página debe contener "<titulo>"

    Ejemplos:
      | enlace    | ruta       | titulo     |
      | Nosotros  | /nosotros  | Nosotros   |
      | Proyectos | /proyectos | Proyectos  |
      | Contacto  | /contacto  | Contacto   |
      | Inicio    | /          | IBYZA      |

  @critical
  Escenario: Click en el logo lleva al inicio
    Dado que Carlos está en la página "/contacto"
    Cuando Carlos hace click en el logo
    Entonces la URL debe ser "/"

  Escenario: Página 404 para rutas inexistentes
    Cuando Carlos abre la página "/pagina-que-no-existe"
    Entonces debe ver el mensaje "404"
