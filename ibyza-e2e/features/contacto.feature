#language: es

@critical @contacto
Característica: Formulario de contacto y citas
  Como cliente potencial
  Quiero contactar a IBYZA o agendar una visita
  Para recibir información personalizada

  Antecedentes:
    Dado que el sitio IBYZA está disponible

  @smoke
  Escenario: Acceder a la página de contacto
    Cuando Carlos navega a la página de contacto
    Entonces debe ver el encabezado "Contactanos"
    Y debe ver los tabs "Enviar mensaje" y "Agendar visita"
    Y debe ver la información de contacto con teléfono, email y dirección

  @critical
  Escenario: Enviar formulario de contacto exitosamente
    Cuando Carlos navega a la página de contacto
    Y completa el formulario de contacto con datos válidos
    Y envía el formulario
    Entonces debe ver un mensaje de éxito

  Escenario: Validar formulario de contacto con datos inválidos
    Cuando Carlos navega a la página de contacto
    Y envía el formulario de contacto vacío
    Entonces debe ver al menos un error de validación

  @critical
  Escenario: Cambiar entre tabs limpia el estado
    Dado que Carlos está en la página de contacto
    Cuando Carlos llena el tab "Enviar mensaje" parcialmente
    Y cambia al tab "Agendar visita"
    Y vuelve al tab "Enviar mensaje"
    Entonces el formulario no debe mostrar errores previos

  Escenario: Ver proyectos de interés en el panel lateral
    Cuando Carlos navega a la página de contacto
    Entonces debe ver una sección "Proyectos de interes"
    Y NO debe ver proyectos con estado "Vendido"

  Escenario: Validar email de contacto
    Cuando Carlos navega a la página de contacto
    Y completa el formulario con email inválido "no-es-email"
    Y envía el formulario
    Entonces debe ver un error indicando email inválido
