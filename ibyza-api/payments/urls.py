from django.urls import path
from .views import SeparacionView, SeparacionTransferenciaView

urlpatterns = [
    path('separacion/', SeparacionView.as_view()),
    path('separacion-transferencia/', SeparacionTransferenciaView.as_view()),
]
