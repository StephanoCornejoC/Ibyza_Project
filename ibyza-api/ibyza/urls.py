from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from content.views import (
    ConfiguracionSitioView,
    BeneficiosView,
)
from projects.views import DepartamentosDisponiblesView, AvancePorCodigoView
from .views import healthz

urlpatterns = [
    # Healthcheck barato para Railway (no toca DB)
    path('healthz/', healthz, name='healthz'),

    # Raiz redirige al admin
    path('', RedirectView.as_view(url='/admin/', permanent=False), name='root-redirect'),

    path('admin/', admin.site.urls),
    path('api/proyectos/', include('projects.urls')),
    path('api/departamentos/disponibles/', DepartamentosDisponiblesView.as_view(), name='deptos-disponibles'),
    path('api/avance/<str:codigo>/', AvancePorCodigoView.as_view(), name='avance-por-codigo'),
    path('api/contacto/', include('contact.urls')),
    path('api/pagos/', include('payments.urls')),
    path('api/contenido/', include('content.urls')),
    path('api/configuracion/', ConfiguracionSitioView.as_view(), name='configuracion'),
    path('api/beneficios/', BeneficiosView.as_view(), name='beneficios'),
]

# Media files: en producción WhiteNoise no sirve media, se necesita
# servir directamente o usar django-storages + S3/R2 en el futuro.
# Por ahora servimos siempre para que funcione en Railway.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
