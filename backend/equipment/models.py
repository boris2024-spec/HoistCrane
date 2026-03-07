from django.db import models
from django.conf import settings
import uuid


class Equipment(models.Model):
    """
    Main Equipment model - stores lifting equipment data
    """
    EQUIPMENT_TYPE_CHOICES = [
        ('crane', 'Crane'),
        ('hoist', 'Hoist'),
        ('forklift', 'Forklift'),
        ('elevator', 'Elevator'),
        ('platform', 'Platform'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('maintenance', 'Under Maintenance'),
        ('inactive', 'Inactive'),
        ('retired', 'Retired'),
    ]

    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    equipment_number = models.CharField(
        max_length=100, unique=True, verbose_name='Equipment Number')
    equipment_type = models.CharField(
        max_length=50, choices=EQUIPMENT_TYPE_CHOICES)

    # Manufacturer details
    manufacturer = models.CharField(max_length=200, blank=True)
    model = models.CharField(max_length=200, blank=True)
    serial_number = models.CharField(max_length=200, blank=True, null=True)
    manufacture_year = models.IntegerField(null=True, blank=True)
    manufacture_date = models.DateField(null=True, blank=True)

    # Technical specifications
    capacity = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                                   help_text='Capacity in tons/kg')
    capacity_unit = models.CharField(max_length=20, default='kg')
    height = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                                 help_text='Height in meters')
    working_pressure = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                                           help_text='Working pressure')
    volume = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)

    # Location and ownership
    site_name = models.CharField(
        max_length=200, blank=True, help_text='Site/Location name')
    workplace_name = models.CharField(max_length=200, blank=True)
    employer = models.CharField(
        max_length=200, blank=True, help_text='Employer/Owner')
    department = models.CharField(max_length=200, blank=True)
    location_details = models.TextField(blank=True)

    # Status and dates
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='active')
    purchase_date = models.DateField(null=True, blank=True)
    installation_date = models.DateField(null=True, blank=True)
    last_inspection_date = models.DateField(null=True, blank=True)
    next_inspection_date = models.DateField(null=True, blank=True)

    # Additional info
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    inspector_name = models.CharField(
        max_length=200, blank=True, help_text='Inspector name')

    # Metadata
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                   null=True, related_name='created_equipment')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                   null=True, related_name='updated_equipment')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'equipment'
        verbose_name = 'Equipment'
        verbose_name_plural = 'Equipment'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['equipment_number']),
            models.Index(fields=['status']),
            models.Index(fields=['equipment_type']),
        ]

    def __str__(self):
        return f"{self.equipment_number} - {self.manufacturer} {self.model}"


class EquipmentSpecification(models.Model):
    """
    Additional specifications for equipment (flexible key-value pairs)
    """
    equipment = models.ForeignKey(
        Equipment, on_delete=models.CASCADE, related_name='specifications')
    key = models.CharField(max_length=200)
    value = models.TextField()
    unit = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'equipment_specifications'
        unique_together = ['equipment', 'key']

    def __str__(self):
        return f"{self.equipment.equipment_number} - {self.key}: {self.value}"
