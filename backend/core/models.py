from django.db import models
from django.conf import settings
import uuid


class ActivityLog(models.Model):
    """Audit log for all user actions across the platform."""
    ACTION_CHOICES = [
        ('create', 'Created'),
        ('update', 'Updated'),
        ('delete', 'Deleted'),
        ('export', 'Exported'),
        ('import', 'Imported'),
        ('login', 'Logged In'),
        ('view', 'Viewed'),
        ('approve', 'Approved'),
        ('resolve', 'Resolved'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'tenants.Company', on_delete=models.CASCADE,
        null=True, blank=True, related_name='activity_logs')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='activity_logs')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    entity_type = models.CharField(max_length=50)  # equipment, inspection, issue, document
    entity_id = models.UUIDField(null=True, blank=True)
    entity_repr = models.CharField(max_length=300, blank=True)
    changes = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'activity_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['user', '-timestamp']),
        ]

    def __str__(self):
        return f"{self.user} {self.action} {self.entity_type} at {self.timestamp}"


class Notification(models.Model):
    """In-app notifications for users."""
    TYPE_CHOICES = [
        ('inspection_reminder', 'Inspection Reminder'),
        ('certificate_expiry', 'Certificate Expiry'),
        ('issue_assigned', 'Issue Assigned'),
        ('issue_resolved', 'Issue Resolved'),
        ('maintenance_due', 'Maintenance Due'),
        ('system', 'System Notification'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'tenants.Company', on_delete=models.CASCADE,
        null=True, blank=True, related_name='notifications')
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='notifications')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=300)
    message = models.TextField(blank=True)
    entity_type = models.CharField(max_length=50, blank=True)
    entity_id = models.UUIDField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read', '-created_at']),
        ]

    def __str__(self):
        return f"{self.title} → {self.recipient}"
