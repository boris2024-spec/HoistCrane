from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Custom user model with additional fields for RBAC and multi-tenancy.
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('technician', 'Technician'),
        ('viewer', 'Viewer'),
    ]

    company = models.ForeignKey(
        'tenants.Company', on_delete=models.CASCADE,
        null=True, blank=True, related_name='users',
        verbose_name='חברה')
    role = models.CharField(
        max_length=20, choices=ROLE_CHOICES, default='viewer')
    phone = models.CharField(max_length=20, blank=True)
    organization = models.CharField(max_length=200, blank=True)
    job_title = models.CharField(
        max_length=200, blank=True, verbose_name='תפקיד')
    language = models.CharField(
        max_length=10, default='he', verbose_name='שפה')
    notification_preferences = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
