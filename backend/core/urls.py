from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'activity-log', views.ActivityLogViewSet,
                basename='activitylog')
router.register(r'notifications', views.NotificationViewSet,
                basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
