#language: es

@critical @admin
Característica: Panel de administración Django
  Como administrador de IBYZA
  Quiero gestionar el contenido del sitio desde el admin
  Para mantener la información actualizada

  Antecedentes:
    Dado que el admin de Django está disponible en "/admin/"

  @smoke
  Escenario: Acceder a la página de login del admin
    Cuando Carlos abre la página de login del admin
    Entonces debe ver el formulario de login
    Y debe ver los campos "Usuario" y "Contraseña"

  @critical
  Escenario: API de configuración disponible públicamente
    Cuando se consulta el endpoint "/api/configuracion/"
    Entonces la respuesta debe tener status 200
    Y la respuesta debe contener los campos "telefono, email, direccion"

  @critical
  Escenario: API de contenido público disponible
    Cuando se consulta el endpoint "/api/contenido/?seccion=hero"
    Entonces la respuesta debe tener status 200

  Escenario: Endpoint de proyectos responde correctamente
    Cuando se consulta el endpoint "/api/proyectos/"
    Entonces la respuesta debe tener status 200
    Y la respuesta debe tener paginación

  Escenario: Seguridad - Admin requiere autenticación
    Cuando se intenta acceder a "/admin/projects/proyecto/add/" sin login
    Entonces debe ser redirigido al login
