"""
URL configuration for hoistcraneproject project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

# Versioned API patterns
api_v1_patterns = [
    path('equipment/', include('equipment.urls')),
    path('inspections/', include('inspections.urls')),
    path('documents/', include('documents.urls')),
    path('issues/', include('issues.urls')),
    path('users/', include('users.urls')),
    path('core/', include('core.urls')),
    path('maintenance/', include('maintenance.urls')),
    path('tenants/', include('tenants.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Versioned API (recommended)
    path('api/v1/', include((api_v1_patterns, 'v1'))),

    # OpenAPI schema & docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'),
         name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Legacy API endpoints (backward compatibility)
    path('api/equipment/', include('equipment.urls')),
    path('api/inspections/', include('inspections.urls')),
    path('api/documents/', include('documents.urls')),
    path('api/issues/', include('issues.urls')),
    path('api/users/', include('users.urls')),
    path('api/core/', include('core.urls')),
    path('api/maintenance/', include('maintenance.urls')),
    path('api/tenants/', include('tenants.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL,
                          document_root=settings.STATIC_ROOT)
