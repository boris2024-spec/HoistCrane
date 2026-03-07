from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InspectionReportViewSet, InspectionViewSet

router = DefaultRouter()
router.register(r'reports', InspectionReportViewSet,
                basename='inspection-report')
router.register(r'', InspectionViewSet, basename='inspection')

urlpatterns = [
    path('', include(router.urls)),
]
