"""
Recalcula el estado de TODOS los Departamentos a partir de sus Separaciones
y arregla el codigo_acceso huerfano. Util como one-shot para corregir data
drift que quedo de antes del fix SST + codigo_acceso.

Idempotente: correrlo varias veces es seguro. Si no hay drift, no toca nada.

Reglas (mismo SST que el signal de payments + el save() de Departamento):
  - 'vendido' es estado terminal: no se toca.
  - Si existe Separacion(estado='completado') -> depto.estado = 'separado'.
  - Si NO hay Separacion completada -> depto.estado = 'disponible'.
  - 'disponible' nunca tiene codigo_acceso (se limpia).
  - 'separado'/'vendido' siempre tienen codigo_acceso (se autogenera al save).

Uso:
    python manage.py recalcular_estado_departamentos
    python manage.py recalcular_estado_departamentos --dry-run
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from payments.models import Separacion
from projects.models import Departamento


class Command(BaseCommand):
    help = 'Recalcula estado y codigo_acceso de Departamentos segun sus Separaciones.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run', action='store_true',
            help='Muestra los cambios que haria sin aplicarlos.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        if dry_run:
            self.stdout.write(self.style.WARNING('=== DRY RUN: no se persisten cambios ==='))

        deptos = Departamento.objects.select_related('nivel__proyecto').order_by(
            'nivel__proyecto__nombre', 'nivel__numero', 'codigo',
        )

        cambios_estado = []
        cambios_codigo = []
        ignorados_vendidos = 0

        for depto in deptos:
            if depto.estado == 'vendido':
                ignorados_vendidos += 1
                continue

            tiene_aprobada = Separacion.objects.filter(
                departamento=depto, estado='completado',
            ).exists()
            nuevo_estado = 'separado' if tiene_aprobada else 'disponible'

            estado_drift = depto.estado != nuevo_estado
            codigo_drift_disponible = (
                nuevo_estado == 'disponible' and depto.codigo_acceso
            )
            codigo_drift_separado = (
                nuevo_estado == 'separado' and not depto.codigo_acceso
            )

            if not (estado_drift or codigo_drift_disponible or codigo_drift_separado):
                continue

            etiqueta = (
                f'{depto.nivel.proyecto.nombre} - Piso {depto.nivel.numero} - '
                f'Depto {depto.codigo}'
            )

            if estado_drift:
                cambios_estado.append(
                    f'  {etiqueta}: {depto.estado} -> {nuevo_estado}'
                )
            if codigo_drift_disponible:
                cambios_codigo.append(
                    f'  {etiqueta}: codigo "{depto.codigo_acceso}" se LIMPIA (depto disponible)'
                )
            if codigo_drift_separado:
                cambios_codigo.append(
                    f'  {etiqueta}: codigo se GENERA (depto separado sin codigo)'
                )

            if not dry_run:
                with transaction.atomic():
                    depto.estado = nuevo_estado
                    # save() completo: el modelo limpia codigo en disponible y
                    # genera en separado/vendido sin codigo.
                    depto.save()

        # Reporte
        self.stdout.write('')
        self.stdout.write(self.style.HTTP_INFO(
            f'Departamentos analizados: {deptos.count()} '
            f'({ignorados_vendidos} vendidos ignorados)'
        ))

        if cambios_estado:
            self.stdout.write(self.style.WARNING(
                f'\nCambios de estado ({len(cambios_estado)}):'
            ))
            for linea in cambios_estado:
                self.stdout.write(linea)
        else:
            self.stdout.write(self.style.SUCCESS('\nSin drift de estado.'))

        if cambios_codigo:
            self.stdout.write(self.style.WARNING(
                f'\nCambios de codigo_acceso ({len(cambios_codigo)}):'
            ))
            for linea in cambios_codigo:
                self.stdout.write(linea)
        else:
            self.stdout.write(self.style.SUCCESS('\nSin drift de codigo_acceso.'))

        if dry_run and (cambios_estado or cambios_codigo):
            self.stdout.write(self.style.WARNING(
                '\nDRY RUN: nada persistido. Volve a correr sin --dry-run para aplicar.'
            ))
        elif not dry_run and (cambios_estado or cambios_codigo):
            self.stdout.write(self.style.SUCCESS('\nCambios aplicados OK.'))
