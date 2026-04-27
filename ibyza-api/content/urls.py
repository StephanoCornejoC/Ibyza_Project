from django.urls import path
from .views import ContenidoWebView

urlpatterns = [
    path('', ContenidoWebView.as_view()),
]
