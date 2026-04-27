from django.urls import path
from .views import ProyectoListView, ProyectoDetailView, DepartamentosView, AvancesView

urlpatterns = [
    path('', ProyectoListView.as_view()),
    path('<slug:slug>/', ProyectoDetailView.as_view()),
    path('<slug:slug>/departamentos/', DepartamentosView.as_view()),
    path('<slug:slug>/avances/', AvancesView.as_view()),
]
