from django.urls import path
from .views import SolicitudContactoView, SolicitudCitaView, DisponibilidadCitasView

urlpatterns = [
    path('', SolicitudContactoView.as_view()),
    path('citas/', SolicitudCitaView.as_view()),
    path('disponibilidad/', DisponibilidadCitasView.as_view(), name='disponibilidad-citas'),
]
