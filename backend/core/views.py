from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import ActivityLog, Notification
from .serializers import (
    ActivityLogSerializer,
    NotificationSerializer,
    NotificationMarkReadSerializer,
)
from .permissions import IsAdmin, IsManagerOrAbove


class ActivityLogViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Read-only activity log. Admins see all, managers see their own."""
    serializer_class = ActivityLogSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['action', 'entity_type', 'user']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']

    def get_queryset(self):
        qs = ActivityLog.objects.select_related('user')
        tenant = getattr(self.request, 'tenant', None)
        if tenant:
            qs = qs.filter(company=tenant)
        if self.request.user.role == 'admin':
            return qs
        return qs.filter(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='entity/(?P<entity_type>[^/.]+)/(?P<entity_id>[^/.]+)')
    def entity_timeline(self, request, entity_type=None, entity_id=None):
        """Get activity timeline for a specific entity."""
        qs = ActivityLog.objects.select_related('user').filter(
            entity_type=entity_type, entity_id=entity_id
        ).order_by('-timestamp')
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class NotificationViewSet(mixins.ListModelMixin,
                          mixins.RetrieveModelMixin,
                          viewsets.GenericViewSet):
    """Notifications for the authenticated user."""
    serializer_class = NotificationSerializer

    def get_queryset(self):
        qs = Notification.objects.filter(recipient=self.request.user)
        tenant = getattr(self.request, 'tenant', None)
        if tenant:
            qs = qs.filter(company=tenant)
        return qs

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(
            recipient=request.user, is_read=False
        ).count()
        return Response({'unread_count': count})

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        if not notification.is_read:
            from django.utils import timezone
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save(update_fields=['is_read', 'read_at'])
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        serializer = NotificationMarkReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        count = serializer.update_notifications(request.user)
        return Response({'marked_read': count})
