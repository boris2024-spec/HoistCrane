from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'schedules', views.MaintenanceScheduleViewSet,
                basename='schedule')
router.register(r'tasks', views.MaintenanceTaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
]
