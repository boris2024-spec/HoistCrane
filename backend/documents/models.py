from django.db import models
from django.conf import settings
from equipment.models import Equipment
import uuid
import os


def document_upload_path(instance, filename):
    """Generate upload path for documents"""
    return f'documents/{instance.equipment.equipment_number}/{instance.document_type}/{filename}'


class Document(models.Model):
    """
    Documents related to equipment (manuals, certificates, reports, etc.)
    """
    DOCUMENT_TYPE_CHOICES = [
        ('manual', 'Manual'),
        ('certificate', 'Certificate'),
        ('inspection', 'Inspection Report'),
        ('warranty', 'Warranty'),
        ('maintenance', 'Maintenance Record'),
        ('photo', 'Photo'),
        ('drawing', 'Technical Drawing'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'tenants.Company', on_delete=models.CASCADE,
        null=True, blank=True, related_name='documents')
    equipment = models.ForeignKey(
        Equipment, on_delete=models.CASCADE, related_name='documents')

    title = models.CharField(max_length=300)
    document_type = models.CharField(
        max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    file = models.FileField(upload_to=document_upload_path)

    description = models.TextField(blank=True)
    document_date = models.DateField(
        null=True, blank=True, help_text='Document date or validity date')
    expiry_date = models.DateField(
        null=True, blank=True, help_text='Expiry date for certificates')

    # File metadata
    file_size = models.BigIntegerField(
        null=True, blank=True, help_text='File size in bytes')
    mime_type = models.CharField(max_length=100, blank=True)

    # Metadata
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'documents'
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['document_type']),
            models.Index(fields=['document_date']),
        ]

    def __str__(self):
        return f"{self.title} ({self.equipment.equipment_number})"

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)

    @property
    def file_extension(self):
        return os.path.splitext(self.file.name)[1].lower() if self.file else ''
