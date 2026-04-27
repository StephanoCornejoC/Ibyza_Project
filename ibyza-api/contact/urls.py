from django.urls import path
from .views import SolicitudContactoView, SolicitudCitaView

urlpatterns = [
    path('', SolicitudContactoView.as_view()),
    path('citas/', SolicitudCitaView.as_view()),
]
