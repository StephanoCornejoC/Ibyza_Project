from django.urls import path
from .views import (
    ProyectoListView, ProyectoDetailView, DepartamentosView, AvancesView,
    DatosBancariosView,
)

urlpatterns = [
    path('', ProyectoListView.as_view()),
    path('<slug:slug>/', ProyectoDetailView.as_view()),
    path('<slug:slug>/departamentos/', DepartamentosView.as_view()),
    path('<slug:slug>/avances/', AvancesView.as_view()),
    path('<slug:slug>/datos-bancarios/', DatosBancariosView.as_view(), name='datos-bancarios'),
]
