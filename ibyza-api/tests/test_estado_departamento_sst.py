"""
Tests para el refactor "Single Source of Truth" del estado del Departamento.

Cubren las 4 casuísticas reportadas por el dueño:

  1. Separar por la web → cambio automático de estado del depto + Separación creada.
  2. Admin → Departamentos → estado NO editable directamente (solo vía Separación).
  3. Admin → Separaciones → soporta efectivo, cheque, transferencia (no solo Culqi).
  4. Admin → Inline de Pisos → estado readonly, deptos nuevos siempre 'disponible'.

Capa: Unit (signals/admin) + API (POST público).
Tecnica ISTQB: Transición de estados, partición de equivalencia, error guessing.
"""
from decimal import Decimal
from unittest.mock import patch

from django.contrib.admin.sites import AdminSite
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import RequestFactory, TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from payments.admin import SeparacionAdmin
from payments.models import Separacion
from projects.admin import DepartamentoAdmin, DepartamentoInline
from projects.models import Departamento
from tests.conftest import BaseTestData


# ──────────────────────────────────────────────────────────────────────
# Casuística 1: signals — Separación → estado del Departamento
# ──────────────────────────────────────────────────────────────────────

class SignalSincronizacionEstadoTest(BaseTestData, TestCase):
    """El estado del Departamento se DERIVA de sus separaciones."""

    def setUp(self):
        self.proyecto = self.crear_proyecto()
        self.nivel = self.crear_nivel(self.proyecto)
        self.departamento = self.crear_departamento(self.nivel)

    def _crear_separacion(self, **kwargs):
        defaults = dict(
            departamento=self.departamento,
            nombre='Carlos', apellido='Garcia',
            email='c@t.com', telefono='999111222',
            dni='12345678', monto=Decimal('1000.00'),
        )
        defaults.update(kwargs)
        return Separacion.objects.create(**defaults)

    def test_separacion_aprobada_cambia_depto_a_separado(self):
        self.assertEqual(self.departamento.estado, 'disponible')
        self._crear_separacion(estado='completado', metodo_pago='efectivo')
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'separado')

    def test_separacion_pendiente_no_afecta_depto(self):
        self._crear_separacion(estado='pendiente', metodo_pago='transferencia')
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'disponible')

    def test_separacion_fallida_no_afecta_depto(self):
        self._crear_separacion(estado='fallido', metodo_pago='culqi')
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'disponible')

    def test_separacion_cancelada_libera_depto(self):
        """Una vez aprobada, si cambia a fallido, el depto vuelve a disponible."""
        sep = self._crear_separacion(estado='completado', metodo_pago='cheque')
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'separado')

        sep.estado = 'fallido'
        sep.save(update_fields=['estado'])
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'disponible')

    def test_borrar_separacion_aprobada_libera_depto(self):
        sep = self._crear_separacion(estado='completado', metodo_pago='efectivo')
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'separado')

        sep.delete()
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'disponible')

    def test_otra_aprobada_mantiene_depto_separado(self):
        """Si quedan otras aprobadas, el depto sigue separado al cancelar una."""
        s1 = self._crear_separacion(
            estado='completado', metodo_pago='transferencia', dni='11111111',
        )
        self._crear_separacion(
            estado='completado', metodo_pago='efectivo', dni='22222222',
        )
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'separado')

        # Cancelo la primera: como queda otra aprobada, sigue separado.
        s1.estado = 'fallido'
        s1.save(update_fields=['estado'])
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'separado')

    def test_estado_vendido_no_se_modifica_por_signal(self):
        """'vendido' es estado terminal: el signal no lo toca."""
        self.departamento.estado = 'vendido'
        self.departamento.save(update_fields=['estado'])

        # Crear/borrar separaciones no debe afectar 'vendido'.
        sep = self._crear_separacion(estado='completado', metodo_pago='culqi')
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'vendido')

        sep.delete()
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'vendido')


# ──────────────────────────────────────────────────────────────────────
# Casuística 1: POST público fuerza origen='web'
# ──────────────────────────────────────────────────────────────────────

@override_settings(
    CULQI_SECRET_KEY='sk_test_fake_key',
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)
class PostPublicoOrigenWebTest(BaseTestData, TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.proyecto = self.crear_proyecto()
        self.nivel = self.crear_nivel(self.proyecto)
        self.departamento = self.crear_departamento(self.nivel, codigo='W-01')

    @patch('payments.views.culqipy')
    def test_post_publico_setea_origen_web(self, mock_culqipy):
        mock_culqipy.Charge.create.return_value = {
            'object': 'charge', 'id': 'chr_origen_web',
        }
        data = self.datos_separacion(self.departamento.pk)
        # Aunque el front intentase mandar origen='admin', el backend lo ignora.
        data['origen'] = 'admin'

        response = self.client.post('/api/pagos/separacion/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        sep = Separacion.objects.get(pk=response.data['id'])
        self.assertEqual(sep.origen, 'web')
        self.assertEqual(sep.metodo_pago, 'culqi')

    @patch('payments.views.culqipy')
    def test_post_culqi_exitoso_aprueba_y_cambia_depto(self, mock_culqipy):
        """End-to-end web: Culqi OK → Separación 'completado' → Depto 'separado'."""
        mock_culqipy.Charge.create.return_value = {
            'object': 'charge', 'id': 'chr_e2e',
        }
        data = self.datos_separacion(self.departamento.pk)
        response = self.client.post('/api/pagos/separacion/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        sep = Separacion.objects.get(pk=response.data['id'])
        self.assertEqual(sep.estado, 'completado')
        self.assertEqual(sep.origen, 'web')

        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'separado')


# ──────────────────────────────────────────────────────────────────────
# Casuística 2: Admin Departamento — estado readonly
# ──────────────────────────────────────────────────────────────────────

class DepartamentoAdminReadonlyEstadoTest(BaseTestData, TestCase):
    def setUp(self):
        self.proyecto = self.crear_proyecto()
        self.nivel = self.crear_nivel(self.proyecto)
        self.departamento = self.crear_departamento(self.nivel)
        self.factory = RequestFactory()
        User = get_user_model()
        self.admin_user = User.objects.create_superuser(
            username='admin', email='a@a.com', password='x',
        )

    def test_estado_readonly_al_crear(self):
        site = AdminSite()
        admin_obj = DepartamentoAdmin(Departamento, site)
        request = self.factory.get('/admin/projects/departamento/add/')
        request.user = self.admin_user

        readonly = admin_obj.get_readonly_fields(request, obj=None)
        self.assertIn('estado', readonly)

    def test_estado_readonly_al_editar(self):
        site = AdminSite()
        admin_obj = DepartamentoAdmin(Departamento, site)
        request = self.factory.get(
            f'/admin/projects/departamento/{self.departamento.pk}/change/'
        )
        request.user = self.admin_user

        readonly = admin_obj.get_readonly_fields(request, obj=self.departamento)
        self.assertIn('estado', readonly)

    def test_admin_no_puede_editar_estado_directamente(self):
        """Aunque alguien manipule el form, los signals son la fuente de verdad.

        Cambiar `estado` directamente en el modelo es posible por código (lo
        usan los signals y migrations), pero el admin lo bloquea vía
        readonly_fields. Verificamos contractualmente.
        """
        site = AdminSite()
        admin_obj = DepartamentoAdmin(Departamento, site)
        request = self.factory.get('/admin/')
        request.user = self.admin_user

        # `estado` aparece en readonly tanto creando como editando.
        self.assertIn('estado', admin_obj.get_readonly_fields(request, None))
        self.assertIn(
            'estado',
            admin_obj.get_readonly_fields(request, self.departamento),
        )


# ──────────────────────────────────────────────────────────────────────
# Casuística 3: Admin Separación — multi-método + acción aprobar
# ──────────────────────────────────────────────────────────────────────

class SeparacionAdminMultiMetodoTest(BaseTestData, TestCase):
    def setUp(self):
        self.proyecto = self.crear_proyecto()
        self.nivel = self.crear_nivel(self.proyecto)
        self.departamento = self.crear_departamento(self.nivel)

    def _crear_pendiente(self, metodo_pago, **kwargs):
        defaults = dict(
            departamento=self.departamento,
            nombre='Test', apellido='Manual',
            email='t@t.com', telefono='999000111',
            dni='99999999', monto=Decimal('500'),
            estado='pendiente', metodo_pago=metodo_pago, origen='admin',
        )
        defaults.update(kwargs)
        return Separacion.objects.create(**defaults)

    def test_separacion_admin_acepta_metodo_efectivo(self):
        sep = self._crear_pendiente('efectivo', numero_operacion='REC-001')
        self.assertEqual(sep.metodo_pago, 'efectivo')
        self.assertEqual(sep.origen, 'admin')

    def test_separacion_admin_acepta_metodo_cheque(self):
        sep = self._crear_pendiente('cheque', numero_operacion='CHQ-505')
        self.assertEqual(sep.metodo_pago, 'cheque')

    def test_separacion_admin_acepta_metodo_otro(self):
        sep = self._crear_pendiente('otro', notas_admin='Pago en especie')
        self.assertEqual(sep.metodo_pago, 'otro')
        self.assertEqual(sep.notas_admin, 'Pago en especie')

    def test_aprobar_efectivo_marca_depto_separado(self):
        """Acción admin: aprobar efectivo dispara signal y separa el depto."""
        sep = self._crear_pendiente('efectivo')
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'disponible')

        site = AdminSite()
        admin_obj = SeparacionAdmin(Separacion, site)
        factory = RequestFactory()
        request = factory.post('/admin/payments/separacion/')
        User = get_user_model()
        request.user = User.objects.create_superuser(
            username='diana', email='d@d.com', password='x',
        )
        # Stub para message_user (no nos importa el mensaje aquí).
        admin_obj.message_user = lambda *a, **kw: None

        admin_obj.aprobar_transferencia(
            request, Separacion.objects.filter(pk=sep.pk),
        )

        sep.refresh_from_db()
        self.assertEqual(sep.estado, 'completado')
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'separado')

    def test_aprobar_culqi_no_se_aprueba_manualmente(self):
        """Culqi NO es elegible para aprobación manual (ya se procesó online)."""
        sep = self._crear_pendiente('culqi')
        site = AdminSite()
        admin_obj = SeparacionAdmin(Separacion, site)
        factory = RequestFactory()
        request = factory.post('/admin/payments/separacion/')
        User = get_user_model()
        request.user = User.objects.create_superuser(
            username='diana2', email='d2@d.com', password='x',
        )
        admin_obj.message_user = lambda *a, **kw: None

        admin_obj.aprobar_transferencia(
            request, Separacion.objects.filter(pk=sep.pk),
        )

        sep.refresh_from_db()
        self.assertEqual(sep.estado, 'pendiente')  # no cambió

    def test_choices_metodo_pago_incluyen_los_nuevos(self):
        valores = {v for v, _ in Separacion.METODO_PAGO_CHOICES}
        self.assertEqual(
            valores,
            {'culqi', 'transferencia', 'efectivo', 'cheque', 'otro'},
        )

    def test_choices_origen_son_web_y_admin(self):
        valores = {v for v, _ in Separacion.ORIGEN_CHOICES}
        self.assertEqual(valores, {'web', 'admin'})

    def test_admin_initial_origen_es_admin(self):
        site = AdminSite()
        admin_obj = SeparacionAdmin(Separacion, site)
        factory = RequestFactory()
        request = factory.get('/admin/payments/separacion/add/')
        User = get_user_model()
        request.user = User.objects.create_superuser(
            username='diana3', email='d3@d.com', password='x',
        )
        initial = admin_obj.get_changeform_initial_data(request)
        self.assertEqual(initial.get('origen'), 'admin')


# ──────────────────────────────────────────────────────────────────────
# Casuística 4: Inline de Nivel — estado readonly, default 'disponible'
# ──────────────────────────────────────────────────────────────────────

class DepartamentoInlineReadonlyTest(BaseTestData, TestCase):
    def setUp(self):
        self.proyecto = self.crear_proyecto()
        self.nivel = self.crear_nivel(self.proyecto)

    def test_inline_estado_es_readonly(self):
        from projects.models import Nivel
        site = AdminSite()
        inline = DepartamentoInline(Nivel, site)
        self.assertIn('estado_display', inline.readonly_fields)
        self.assertNotIn('estado', inline.fields)

    def test_departamento_nuevo_se_crea_disponible(self):
        depto = Departamento.objects.create(
            nivel=self.nivel,
            codigo='NEW-1',
            tipo='2dorm',
            area_total=Decimal('70'),
            area_techada=Decimal('60'),
            precio=Decimal('150000'),
        )
        # No seteamos estado: debe usar el default del modelo.
        self.assertEqual(depto.estado, 'disponible')

    def test_modelo_default_es_disponible(self):
        field = Departamento._meta.get_field('estado')
        self.assertEqual(field.default, 'disponible')


# ──────────────────────────────────────────────────────────────────────
# Casuística 5: ciclo de vida del codigo_acceso del comprador
# ──────────────────────────────────────────────────────────────────────

class CodigoAccesoCicloDeVidaTest(BaseTestData, TestCase):
    """El codigo_acceso es propiedad del estado del depto (SST):
       - disponible -> sin codigo
       - separado/vendido -> codigo autogenerado
       - vuelve a disponible -> codigo borrado (revoca acceso del comprador anterior)
    """

    def setUp(self):
        self.proyecto = self.crear_proyecto()
        self.nivel = self.crear_nivel(self.proyecto)
        self.departamento = self.crear_departamento(self.nivel)

    def _crear_separacion(self, **kwargs):
        from decimal import Decimal
        defaults = dict(
            departamento=self.departamento,
            nombre='Carlos', apellido='Garcia',
            email='c@t.com', telefono='999111222',
            dni='12345678', monto=Decimal('1000.00'),
        )
        defaults.update(kwargs)
        return Separacion.objects.create(**defaults)

    def test_disponible_inicial_no_tiene_codigo(self):
        self.assertIsNone(self.departamento.codigo_acceso)

    def test_codigo_se_genera_al_separar(self):
        self._crear_separacion(estado='completado', metodo_pago='efectivo')
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'separado')
        self.assertIsNotNone(self.departamento.codigo_acceso)
        self.assertTrue(self.departamento.codigo_activo)

    def test_codigo_se_limpia_al_volver_a_disponible(self):
        sep = self._crear_separacion(estado='completado', metodo_pago='efectivo')
        self.departamento.refresh_from_db()
        codigo_original = self.departamento.codigo_acceso
        self.assertIsNotNone(codigo_original)

        sep.delete()
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'disponible')
        self.assertIsNone(self.departamento.codigo_acceso)
        self.assertTrue(self.departamento.codigo_activo)

    def test_codigo_se_regenera_al_volver_a_separar(self):
        """Comprador A separa -> revoca -> Comprador B separa => codigo distinto."""
        sep_a = self._crear_separacion(
            estado='completado', metodo_pago='efectivo', dni='11111111',
        )
        self.departamento.refresh_from_db()
        codigo_a = self.departamento.codigo_acceso

        sep_a.delete()
        self.departamento.refresh_from_db()
        self.assertIsNone(self.departamento.codigo_acceso)

        self._crear_separacion(
            estado='completado', metodo_pago='efectivo', dni='22222222',
        )
        self.departamento.refresh_from_db()
        codigo_b = self.departamento.codigo_acceso
        self.assertIsNotNone(codigo_b)
        self.assertNotEqual(codigo_a, codigo_b)

    def test_codigo_se_mantiene_al_pasar_a_vendido(self):
        """De separado a vendido el codigo NO se regenera (es el mismo comprador)."""
        self._crear_separacion(estado='completado', metodo_pago='efectivo')
        self.departamento.refresh_from_db()
        codigo_separado = self.departamento.codigo_acceso

        self.departamento.estado = 'vendido'
        self.departamento.save()
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.codigo_acceso, codigo_separado)

    def test_codigo_activo_se_resetea_al_volver_a_disponible(self):
        """Si Diana revoco con codigo_activo=False y luego se libera el depto,
        el flag se resetea para el proximo comprador."""
        sep = self._crear_separacion(estado='completado', metodo_pago='efectivo')
        self.departamento.refresh_from_db()
        self.departamento.codigo_activo = False
        self.departamento.save()
        self.departamento.refresh_from_db()
        self.assertFalse(self.departamento.codigo_activo)

        sep.delete()
        self.departamento.refresh_from_db()
        self.assertTrue(self.departamento.codigo_activo)
        self.assertIsNone(self.departamento.codigo_acceso)
