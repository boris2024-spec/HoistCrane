from rest_framework import viewsets, filters, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from .models import Issue, IssueComment
from .serializers import IssueSerializer, IssueListSerializer, IssueCommentSerializer
from core.permissions import CanManageIssues
from tenants.mixins import TenantQuerySetMixin, TenantCreateMixin


class IssueFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Issue.STATUS_CHOICES)
    priority = django_filters.ChoiceFilter(choices=Issue.PRIORITY_CHOICES)
    issue_type = django_filters.ChoiceFilter(choices=Issue.TYPE_CHOICES)
    equipment = django_filters.UUIDFilter(field_name='equipment__id')
    assigned_to = django_filters.UUIDFilter(field_name='assigned_to__id')

    class Meta:
        model = Issue
        fields = ['status', 'priority',
                  'issue_type', 'equipment', 'assigned_to']


class IssueViewSet(TenantQuerySetMixin, viewsets.ModelViewSet):
    queryset = Issue.objects.select_related(
        'equipment', 'reported_by', 'assigned_to', 'resolved_by', 'company').prefetch_related('comments')
    permission_classes = [permissions.IsAuthenticated, CanManageIssues]
    filter_backends = [DjangoFilterBackend,
                       filters.SearchFilter, filters.OrderingFilter]
    filterset_class = IssueFilter
    search_fields = ['title', 'description', 'equipment__equipment_number']
    ordering_fields = ['reported_date', 'priority', 'due_date']
    ordering = ['-reported_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return IssueListSerializer
        return IssueSerializer

    def perform_create(self, serializer):
        serializer.save(
            reported_by=self.request.user,
            company=getattr(self.request, 'tenant', None),
        )

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Add a comment to the issue"""
        issue = self.get_object()
        comment_text = request.data.get('comment')

        if not comment_text:
            return Response(
                {'error': 'Comment text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        comment = IssueComment.objects.create(
            issue=issue,
            comment=comment_text,
            created_by=request.user
        )

        serializer = IssueCommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Mark issue as resolved"""
        from django.utils import timezone
        issue = self.get_object()

        issue.status = 'resolved'
        issue.resolved_by = request.user
        issue.resolved_date = timezone.now()
        issue.resolution_notes = request.data.get('resolution_notes', '')
        issue.save()

        serializer = self.get_serializer(issue)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close the issue"""
        issue = self.get_object()
        issue.status = 'closed'
        issue.save()

        serializer = self.get_serializer(issue)
        return Response(serializer.data)
