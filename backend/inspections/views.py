from rest_framework import viewsets, filters, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from .models import InspectionReport, InspectionReportItem, Inspection
from .serializers import (
    InspectionReportSerializer, InspectionReportListSerializer,
    InspectionReportItemSerializer, InspectionSerializer
)


class InspectionReportFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(
        choices=InspectionReport.STATUS_CHOICES)
    inspection_date_from = django_filters.DateFilter(
        field_name='inspection_date', lookup_expr='gte')
    inspection_date_to = django_filters.DateFilter(
        field_name='inspection_date', lookup_expr='lte')
    equipment = django_filters.UUIDFilter(field_name='equipment__id')

    class Meta:
        model = InspectionReport
        fields = ['status', 'equipment']


class InspectionReportViewSet(viewsets.ModelViewSet):
    queryset = InspectionReport.objects.select_related(
        'equipment', 'created_by', 'approved_by').prefetch_related('items')
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend,
                       filters.SearchFilter, filters.OrderingFilter]
    filterset_class = InspectionReportFilter
    search_fields = ['report_number', 'inspector_name',
                     'equipment__equipment_number']
    ordering_fields = ['inspection_date', 'created_at']
    ordering = ['-inspection_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return InspectionReportListSerializer
        return InspectionReportSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user,
                        updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=True, methods=['post'])
    def generate_pdf(self, request, pk=None):
        """Generate PDF for this inspection report"""
        report = self.get_object()
        # TODO: Implement PDF generation using WeasyPrint
        # This will be implemented in the next phase
        return Response({
            'message': 'PDF generation will be implemented',
            'report_id': str(report.id)
        })

    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        """Finalize and lock the report"""
        report = self.get_object()
        if report.status == 'final':
            return Response(
                {'error': 'Report is already finalized'},
                status=status.HTTP_400_BAD_REQUEST
            )

        report.status = 'final'
        report.save()

        serializer = self.get_serializer(report)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve the report"""
        from django.utils import timezone
        report = self.get_object()

        report.status = 'approved'
        report.approved_by = request.user
        report.approved_at = timezone.now()
        report.save()

        serializer = self.get_serializer(report)
        return Response(serializer.data)


class InspectionViewSet(viewsets.ModelViewSet):
    queryset = Inspection.objects.select_related('equipment', 'created_by')
    serializer_class = InspectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend,
                       filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['inspection_type', 'result', 'equipment']
    search_fields = ['inspector_name', 'equipment__equipment_number']
    ordering_fields = ['inspection_date', 'created_at']
    ordering = ['-inspection_date']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
