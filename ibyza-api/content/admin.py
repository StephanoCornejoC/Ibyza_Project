from django.contrib import admin
from django.contrib.auth.admin import GroupAdmin as DjangoGroupAdmin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth.models import Group, User
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from unfold.admin import ModelAdmin
from unfold.sites import UnfoldAdminSite
from .models import ContenidoWeb, ConfiguracionSitio, Beneficio


# ─── Monkey-patch: esconder grupos del sidebar con todos los items invisibles ───
# django-unfold permite filtrar items con `permission` callable pero deja el
# header del grupo visible aunque no haya items adentro. Este patch filtra los
# grupos vacios (todos los items con has_permission=False) asi Diana no ve
# headers huerfanos como "Usuarios y accesos" sin links.
_original_get_sidebar_list = UnfoldAdminSite.get_sidebar_list


def _get_sidebar_list_filtered(self, request):
    groups = _original_get_sidebar_list(self, request)
    filtered = []
    for group in groups:
        # Un item es visible cuando `has_permission` no fue seteado a False
        # explicitamente (default True si no hay callback).
        visible_items = [it for it in group.get('items', []) if it.get('has_permission', True)]
        if visible_items:
            group['items'] = visible_items
            filtered.append(group)
    return filtered


UnfoldAdminSite.get_sidebar_list = _get_sidebar_list_filtered


# ─── Ocultar User/Group del admin para non-superusers ───────────────────────
# Diana entra como staff (no superuser). NO debe ver ni Usuarios ni Grupos para
# evitar que se asigne permisos a si misma o cree usuarios. Stephano (admin
# superuser) los sigue viendo y gestionando. Tambien podrias gestionar usuarios
# desde la terminal con `python manage.py setup_diana`, `createsuperuser`, etc.

class _SuperuserOnlyMixin:
    """Hace que el modulo no aparezca en el sidebar del admin (ni sea accesible
    por URL) a usuarios que no sean superuser."""

    def has_module_permission(self, request):
        return bool(request.user and request.user.is_active and request.user.is_superuser)

    def has_view_permission(self, request, obj=None):
        return self.has_module_permission(request)

    def has_add_permission(self, request):
        return self.has_module_permission(request)

    def has_change_permission(self, request, obj=None):
        return self.has_module_permission(request)

    def has_delete_permission(self, request, obj=None):
        return self.has_module_permission(request)


class SuperuserOnlyUserAdmin(_SuperuserOnlyMixin, DjangoUserAdmin):
    pass


class SuperuserOnlyGroupAdmin(_SuperuserOnlyMixin, DjangoGroupAdmin):
    pass


# Re-registrar User y Group con el mixin restrictivo.
admin.site.unregister(User)
admin.site.unregister(Group)
admin.site.register(User, SuperuserOnlyUserAdmin)
admin.site.register(Group, SuperuserOnlyGroupAdmin)


@admin.register(ContenidoWeb)
class ContenidoWebAdmin(ModelAdmin):
    """Admin agrupado visualmente por Página → Sección.

    El changelist usa un template custom (`change_list.html`) que agrupa las filas
    bajo headers de Página y Sección, asi Diana ve un arbol jerarquico en vez
    de una tabla plana. Toda la edicion sigue siendo normal: click en la fila
    abre el form, "Agregar" arriba a la derecha, etc.
    """

    change_list_template = 'admin/content/contenidoweb/change_list.html'

    list_display = (
        'thumbnail',
        'get_pagina_display',
        'get_seccion_display',
        'clave',
        'preview_texto',
        'orden',
        'activo',
    )
    list_display_links = ('thumbnail', 'clave')
    list_filter = ('pagina', 'seccion', 'activo')
    search_fields = ('clave', 'valor')
    list_editable = ('orden', 'activo')
    ordering = ('pagina', 'seccion', 'orden', 'clave')
    save_on_top = True

    fieldsets = (
        ('Ubicación en el sitio', {
            'description': 'En qué página y sección de la web aparece este texto. El identificador interno es técnico — no lo cambies si no estás segura de lo que hacés.',
            'fields': ('pagina', 'seccion', 'clave', 'orden', 'activo'),
        }),
        ('Contenido visible', {
            'description': 'El texto y la imagen que va a ver el cliente en el sitio.',
            'fields': ('valor', 'imagen'),
        }),
    )

    def changelist_view(self, request, extra_context=None):
        """Inyecta los entries agrupados por pagina > seccion para el template.

        Adicionalmente embebe los `Beneficio` (Valores de IBYZA) como items
        virtuales bajo `pagina=nosotros, seccion=valores`. Cada beneficio
        linkea a su propio admin de edicion. Asi Diana ve TODO el contenido
        editable del sitio en un solo lugar.
        """
        extra_context = extra_context or {}

        # Solo agrupar cuando NO hay filtros/busqueda activos (vista 'arbol' por defecto).
        # Si Diana filtra por una pagina o busca algo, dejamos el listado plano normal.
        has_filters = bool(request.GET)
        extra_context['show_tree'] = not has_filters

        if not has_filters:
            qs = self.get_queryset(request).order_by('pagina', 'seccion', 'orden', 'clave')

            # Mapas de display name desde las choices (mas robusto que get_*_display por instancia).
            pagina_label = dict(ContenidoWeb.PAGINA_CHOICES)
            seccion_label = dict(ContenidoWeb.SECCION_CHOICES)

            # Estructura: [{label, key, secciones: [{label, key, items: [{...}]}]}]
            # Cada item es un dict con: pk, clave, valor, imagen_url, activo, edit_url, kind
            tree = []
            current_pagina = None
            current_seccion = None
            pagina_node = None
            seccion_node = None

            for obj in qs:
                if obj.pagina != current_pagina:
                    pagina_node = {
                        'key': obj.pagina,
                        'label': pagina_label.get(obj.pagina, obj.pagina),
                        'secciones': [],
                    }
                    tree.append(pagina_node)
                    current_pagina = obj.pagina
                    current_seccion = None
                if obj.seccion != current_seccion:
                    seccion_node = {
                        'key': obj.seccion,
                        'label': seccion_label.get(obj.seccion, obj.seccion),
                        'items': [],
                    }
                    pagina_node['secciones'].append(seccion_node)
                    current_seccion = obj.seccion

                seccion_node['items'].append({
                    'pk': obj.pk,
                    'clave': obj.clave,
                    'valor': obj.valor,
                    'imagen_url': obj.imagen.url if obj.imagen else None,
                    'activo': obj.activo,
                    'kind': 'contenidoweb',
                    'edit_url': f'/admin/content/contenidoweb/{obj.pk}/change/',
                })

            # Inyectar los Beneficios (Valores) como items virtuales bajo
            # `pagina=nosotros, seccion=valores`. Si la pagina no esta en el
            # tree todavia (poco probable), la creamos.
            beneficios = Beneficio.objects.filter(activo=True).order_by('orden')
            if beneficios.exists():
                # Buscar o crear pagina_node de nosotros
                nosotros_node = next((p for p in tree if p['key'] == 'nosotros'), None)
                if nosotros_node is None:
                    nosotros_node = {
                        'key': 'nosotros',
                        'label': pagina_label.get('nosotros', 'Nosotros'),
                        'secciones': [],
                    }
                    tree.append(nosotros_node)

                # Buscar o crear seccion 'valores'
                valores_section = next(
                    (s for s in nosotros_node['secciones'] if s['key'] == 'valores'),
                    None,
                )
                if valores_section is None:
                    valores_section = {
                        'key': 'valores',
                        'label': seccion_label.get('valores', 'Lo que nos define'),
                        'items': [],
                    }
                    nosotros_node['secciones'].append(valores_section)

                for b in beneficios:
                    valores_section['items'].append({
                        'pk': b.pk,
                        'clave': b.titulo,
                        'valor': b.descripcion,
                        'imagen_url': b.imagen.url if b.imagen else None,
                        'activo': b.activo,
                        'kind': 'beneficio',
                        'edit_url': f'/admin/content/beneficio/{b.pk}/change/',
                    })

            extra_context['contenido_tree'] = tree

        return super().changelist_view(request, extra_context=extra_context)

    @admin.display(description='Página', ordering='pagina')
    def get_pagina_display(self, obj):
        return obj.get_pagina_display()

    @admin.display(description='Sección', ordering='seccion')
    def get_seccion_display(self, obj):
        return obj.get_seccion_display()

    @admin.display(description='Texto')
    def preview_texto(self, obj):
        if not obj.valor:
            return mark_safe('<span style="color:#9ca3af">— sin texto —</span>')
        preview = obj.valor[:80] + '…' if len(obj.valor) > 80 else obj.valor
        return format_html('<span title="{}">{}</span>', obj.valor, preview)

    @admin.display(description='Imagen')
    def thumbnail(self, obj):
        if obj.imagen:
            return format_html(
                '<img src="{}" style="width:50px;height:38px;object-fit:cover;border-radius:6px;" />',
                obj.imagen.url,
            )
        return mark_safe(
            '<div style="width:50px;height:38px;background:#f3f4f6;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px;">Texto</div>'
        )


@admin.register(ConfiguracionSitio)
class ConfiguracionSitioAdmin(ModelAdmin):
    save_on_top = True
    fieldsets = (
        ('Datos de contacto', {
            'description': 'Estos datos aparecen en el pie de página (footer) y en la página de contacto del sitio.',
            'fields': ('direccion', 'telefono', 'email', 'horario', 'whatsapp'),
        }),
        ('Redes sociales', {
            'description': 'Pegá las URL completas (con https://). Dejá en blanco las redes que la empresa no usa.',
            'fields': ('facebook_url', 'instagram_url', 'tiktok_url', 'linkedin_url', 'youtube_url'),
        }),
        ('Slogan y descripción de la empresa', {
            'description': 'Frase principal y descripción que se usan en el inicio del sitio y en metadatos para Google.',
            'fields': ('slogan', 'descripcion_empresa'),
        }),
        ('Modal de bienvenida', {
            'description': 'Cuadro que aparece a los visitantes al entrar al sitio (una vez por sesión). Marcá "Modal activo" y completá los demás campos.',
            'fields': (
                'modal_activo',
                'modal_titulo',
                'modal_subtitulo',
                'modal_imagen',
                'modal_proyecto',
                'modal_cta_texto',
                'modal_cta_es_whatsapp',
            ),
        }),
        ('Citas y reuniones', {
            'description': 'Configuración que se usa al enviar la confirmación de cita por correo al cliente.',
            'fields': ('meet_link_permanente',),
        }),
        ('Políticas de Privacidad', {
            'description': 'Texto que aparece cuando el visitante hace clic en "Políticas de Privacidad" del formulario de cita. Acepta HTML básico (p, ul, li, strong, br).',
            'fields': ('politicas_privacidad_html',),
            'classes': ('collapse',),
        }),
        ('Origen del nombre IBYZA (no se muestra actualmente)', {
            'description': 'Texto sobre el origen del nombre IBYZA. Por ahora no se renderiza en el sitio; queda guardado por si se decide reactivarlo en el futuro.',
            'classes': ('collapse',),
            'fields': ('origen_nombre_texto',),
        }),
    )

    def has_add_permission(self, request):
        # Solo permitir 1 registro
        return not ConfiguracionSitio.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        # Si solo hay una configuración, redirigir directamente al edit
        from django.shortcuts import redirect
        config = ConfiguracionSitio.objects.first()
        if config:
            return redirect(
                f'/admin/content/configuracionsitio/{config.pk}/change/',
            )
        return super().changelist_view(request, extra_context)


@admin.register(Beneficio)
class BeneficioAdmin(ModelAdmin):
    """Admin del modelo Beneficio, que se usa para los Valores de IBYZA
    (sección "Lo que nos define" del Nosotros). Editable con título,
    descripción, imagen e icono."""

    list_display = ('imagen_thumb', 'titulo', 'descripcion_corta', 'icono_preview', 'orden', 'activo')
    list_display_links = ('imagen_thumb', 'titulo')
    list_filter = ('activo',)
    search_fields = ('titulo', 'descripcion')
    list_editable = ('orden', 'activo')
    ordering = ('orden',)
    save_on_top = True

    fieldsets = (
        ('Texto del valor', {
            'description': 'Aparece en el carrusel "Lo que nos define" de la página Nosotros.',
            'fields': ('titulo', 'descripcion'),
        }),
        ('Imagen e icono', {
            'description': 'Imagen de fondo de la card y nombre del icono de Lucide (https://lucide.dev/icons). Ejemplos de iconos: Shield, Star, Zap, Heart, Users, Award.',
            'fields': ('imagen', 'icono'),
        }),
        ('Visibilidad', {
            'fields': ('orden', 'activo'),
        }),
    )

    @admin.display(description='Imagen')
    def imagen_thumb(self, obj):
        if obj.imagen:
            return format_html(
                '<img src="{}" style="width:60px;height:42px;object-fit:cover;border-radius:6px;" />',
                obj.imagen.url,
            )
        return mark_safe(
            '<div style="width:60px;height:42px;background:#f3f4f6;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px;">—</div>'
        )

    @admin.display(description='Icono')
    def icono_preview(self, obj):
        return format_html(
            '<code style="background:#f3f4f6;padding:4px 8px;border-radius:4px;font-size:11px">{}</code>',
            obj.icono,
        )

    @admin.display(description='Descripción')
    def descripcion_corta(self, obj):
        if len(obj.descripcion) > 100:
            return obj.descripcion[:100] + '…'
        return obj.descripcion
