from django.db import models
from django.conf import settings
from equipment.models import Equipment
import uuid


class Issue(models.Model):
    """
    Issues/Problems/Incidents related to equipment
    """
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    TYPE_CHOICES = [
        ('malfunction', 'Malfunction'),
        ('maintenance', 'Maintenance Required'),
        ('safety', 'Safety Issue'),
        ('damage', 'Damage'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    equipment = models.ForeignKey(
        Equipment, on_delete=models.CASCADE, related_name='issues')

    title = models.CharField(max_length=300)
    description = models.TextField()
    issue_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    priority = models.CharField(
        max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='open')

    # Dates
    reported_date = models.DateTimeField(auto_now_add=True)
    resolved_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)

    # People
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                    null=True, related_name='reported_issues')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                    null=True, blank=True, related_name='assigned_issues')
    resolved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                    null=True, blank=True, related_name='resolved_issues')

    # Resolution
    resolution_notes = models.TextField(blank=True)

    # Metadata
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'issues'
        verbose_name = 'Issue'
        verbose_name_plural = 'Issues'
        ordering = ['-reported_date']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['reported_date']),
        ]

    def __str__(self):
        return f"{self.equipment.equipment_number} - {self.title}"


class IssueComment(models.Model):
    """
    Comments/updates on issues
    """
    issue = models.ForeignKey(
        Issue, on_delete=models.CASCADE, related_name='comments')
    comment = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'issue_comments'
        ordering = ['created_at']

    def __str__(self):
        return f"Comment on {self.issue.title} by {self.created_by}"
