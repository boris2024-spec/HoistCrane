from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import MaintenanceSchedule, MaintenanceTask
from .serializers import MaintenanceScheduleSerializer, MaintenanceTaskSerializer
from core.permissions import IsManagerOrAbove
from tenants.mixins import TenantQuerySetMixin, TenantCreateMixin


class MaintenanceScheduleViewSet(TenantQuerySetMixin, viewsets.ModelViewSet):
    serializer_class = MaintenanceScheduleSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAbove]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['equipment', 'frequency', 'is_active', 'assigned_to']
    search_fields = ['title', 'description']
    ordering_fields = ['start_date', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = MaintenanceSchedule.objects.select_related(
            'equipment', 'assigned_to', 'created_by', 'company'
        )
        tenant = getattr(self.request, 'tenant', None)
        if tenant:
            qs = qs.filter(company=tenant)
        return qs

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            company=getattr(self.request, 'tenant', None),
        )


class MaintenanceTaskViewSet(TenantQuerySetMixin, viewsets.ModelViewSet):
    serializer_class = MaintenanceTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['equipment', 'schedule', 'status', 'priority', 'assigned_to']
    search_fields = ['title', 'description', 'notes']
    ordering_fields = ['due_date', 'priority', 'created_at']
    ordering = ['due_date']

    def get_queryset(self):
        qs = MaintenanceTask.objects.select_related(
            'equipment', 'schedule', 'assigned_to', 'created_by', 'company'
        )
        tenant = getattr(self.request, 'tenant', None)
        if tenant:
            qs = qs.filter(company=tenant)
        return qs

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            company=getattr(self.request, 'tenant', None),
        )

    @action(detail=False, methods=['get'], url_path='calendar')
    def calendar(self, request):
        """Get tasks for calendar view, filtered by date range."""
        start = request.query_params.get('start')
        end = request.query_params.get('end')

        qs = self.get_queryset()
        if start:
            qs = qs.filter(due_date__gte=start)
        if end:
            qs = qs.filter(due_date__lte=end)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='overdue')
    def overdue(self, request):
        """Get all overdue tasks."""
        from datetime import date
        qs = self.get_queryset().filter(
            status__in=['pending', 'in_progress'],
            due_date__lt=date.today()
        )
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
