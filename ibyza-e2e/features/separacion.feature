#language: es

@critical @pagos
Característica: Flujo de separación de departamento
  Como comprador interesado
  Quiero separar un departamento disponible
  Para asegurar mi unidad deseada

  Antecedentes:
    Dado que el sitio IBYZA está disponible

  @critical
  Escenario: Abrir modal de separación desde departamento disponible
    Dado que Carlos está viendo el detalle del proyecto "Católica"
    Cuando Carlos hace click en "Separar" de un departamento disponible
    Entonces debe ver el modal de separación abierto
    Y debe ver el paso 1 "Datos del comprador"

  @critical
  Escenario: Completar datos del comprador
    Dado que Carlos abrió el modal de separación
    Cuando Carlos completa los datos del comprador con información válida
    Y hace click en "Continuar"
    Entonces debe ver el paso 2 "Confirmar y pagar"
    Y debe ver los tabs "Tarjeta" y "Transferencia"

  Escenario: Ver datos bancarios correctos por proyecto
    Dado que Carlos está en el paso de pago del proyecto "Católica"
    Cuando Carlos selecciona el tab "Transferencia"
    Entonces debe ver el nombre de la empresa receptora del proyecto
    Y debe ver los datos bancarios (RUC, cuenta, CCI)

  Escenario: Validar upload de comprobante
    Dado que Carlos está en el tab "Transferencia"
    Cuando Carlos intenta enviar sin subir comprobante
    Entonces el botón "Enviar comprobante" debe estar deshabilitado

  Escenario: Validación DNI en formulario de separación
    Dado que Carlos abrió el modal de separación
    Cuando Carlos ingresa un DNI con menos de 8 dígitos
    Y hace click en "Continuar"
    Entonces debe ver un error de validación del DNI

  Escenario: Cerrar modal de separación
    Dado que Carlos abrió el modal de separación
    Cuando Carlos cierra el modal
    Entonces el modal debe desaparecer
    Y Carlos debe seguir en la página del proyecto
