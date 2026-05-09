"""
Tests del management command `recalcular_estado_departamentos`.

Cubre el escenario real reportado por Stephano: data drift de antes del fix
SST + codigo_acceso. El command debe arreglar idempotentemente:
  - Depto 'separado' sin Separacion completada -> a 'disponible' + limpia codigo.
  - Depto 'disponible' con codigo_acceso colgado -> limpia codigo.
  - Depto 'separado' sin codigo (raro) -> genera codigo.
  - 'vendido' es terminal: no se toca.
"""
from decimal import Decimal
from io import StringIO

from django.core.management import call_command
from django.test import TestCase

from payments.models import Separacion
from projects.models import Departamento
from tests.conftest import BaseTestData


class RecalcularEstadoCommandTest(BaseTestData, TestCase):
    def setUp(self):
        self.proyecto = self.crear_proyecto(nombre='Catolica')
        self.nivel = self.crear_nivel(self.proyecto, numero=11, nombre='Piso 11')

    def _crear_sep(self, depto, **kwargs):
        defaults = dict(
            departamento=depto,
            nombre='X', apellido='Y', email='x@y.com', telefono='999',
            dni='12345678', monto=Decimal('1000'),
        )
        defaults.update(kwargs)
        return Separacion.objects.create(**defaults)

    def _run(self, dry_run=False):
        out = StringIO()
        args = ['recalcular_estado_departamentos']
        if dry_run:
            args.append('--dry-run')
        call_command(*args, stdout=out)
        return out.getvalue()

    def test_arregla_separado_huerfano_sin_separacion(self):
        """Caso real 1101: estado='separado' pero no hay Separacion completada."""
        depto = self.crear_departamento(self.nivel, codigo='1101', estado='separado')
        depto.codigo_acceso = 'CAT-1101-AAAA'
        depto.save()

        self._run()
        depto.refresh_from_db()
        self.assertEqual(depto.estado, 'disponible')
        self.assertIsNone(depto.codigo_acceso)
        self.assertTrue(depto.codigo_activo)

    def test_arregla_disponible_con_codigo_colgado(self):
        """Caso real 901: estado='disponible' pero codigo_acceso quedo colgado."""
        depto = self.crear_departamento(self.nivel, codigo='901', estado='disponible')
        # Forzamos drift via update directo (bypass del save() que ya limpia).
        Departamento.objects.filter(pk=depto.pk).update(
            codigo_acceso='CAT-901-BBBB',
        )
        depto.refresh_from_db()
        self.assertEqual(depto.codigo_acceso, 'CAT-901-BBBB')

        self._run()
        depto.refresh_from_db()
        self.assertEqual(depto.estado, 'disponible')
        self.assertIsNone(depto.codigo_acceso)

    def test_no_toca_vendido(self):
        depto = self.crear_departamento(self.nivel, codigo='1001', estado='vendido')
        depto.refresh_from_db()
        self.assertIsNotNone(depto.codigo_acceso)
        codigo_original = depto.codigo_acceso

        self._run()
        depto.refresh_from_db()
        self.assertEqual(depto.estado, 'vendido')
        self.assertEqual(depto.codigo_acceso, codigo_original)

    def test_separado_con_separacion_genera_codigo_si_falta(self):
        """Caso edge: separado sin codigo (no deberia pasar pero igual lo cubrimos)."""
        depto = self.crear_departamento(self.nivel, codigo='1201', estado='separado')
        Separacion.objects.create(
            departamento=depto, estado='completado',
            nombre='X', apellido='Y', email='x@y.com', telefono='999',
            dni='12345678', monto=Decimal('1000'),
        )
        Departamento.objects.filter(pk=depto.pk).update(codigo_acceso=None)
        depto.refresh_from_db()
        self.assertIsNone(depto.codigo_acceso)

        self._run()
        depto.refresh_from_db()
        self.assertEqual(depto.estado, 'separado')
        self.assertIsNotNone(depto.codigo_acceso)

    def test_dry_run_no_persiste(self):
        depto = self.crear_departamento(self.nivel, codigo='1101', estado='separado')
        depto.codigo_acceso = 'CAT-1101-CCCC'
        depto.save()

        out = self._run(dry_run=True)
        self.assertIn('DRY RUN', out)
        depto.refresh_from_db()
        # Sigue roto.
        self.assertEqual(depto.estado, 'separado')
        self.assertEqual(depto.codigo_acceso, 'CAT-1101-CCCC')

    def test_idempotente(self):
        depto = self.crear_departamento(self.nivel, codigo='1101', estado='separado')
        depto.codigo_acceso = 'CAT-1101-DDDD'
        depto.save()

        self._run()
        depto.refresh_from_db()
        estado_post_1 = depto.estado
        codigo_post_1 = depto.codigo_acceso

        # Segunda corrida no debe mover nada.
        out2 = self._run()
        depto.refresh_from_db()
        self.assertEqual(depto.estado, estado_post_1)
        self.assertEqual(depto.codigo_acceso, codigo_post_1)
        self.assertIn('Sin drift', out2)

    def test_sin_drift_no_reporta_cambios(self):
        # Depto coherente: disponible sin codigo.
        self.crear_departamento(self.nivel, codigo='1101', estado='disponible')
        out = self._run()
        self.assertIn('Sin drift de estado', out)
        self.assertIn('Sin drift de codigo_acceso', out)
