from django.db import models
from django.conf import settings
from equipment.models import Equipment
import uuid


class InspectionReport(models.Model):
    """
    Inspection Report (תסקיר בדיקה) - One-to-one replica of the inspection form
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('final', 'Final'),
    ]

    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'tenants.Company', on_delete=models.CASCADE,
        null=True, blank=True, related_name='inspection_reports')
    equipment = models.ForeignKey(
        Equipment, on_delete=models.CASCADE, related_name='inspection_reports')
    report_number = models.CharField(max_length=100, unique=True)

    # Report details
    inspection_date = models.DateField()
    next_inspection_date = models.DateField(null=True, blank=True)
    inspector_name = models.CharField(max_length=200)
    inspector_license = models.CharField(max_length=100, blank=True)

    # Location and ownership info
    workplace_name = models.CharField(max_length=200, blank=True)
    employer = models.CharField(max_length=200, blank=True)
    site = models.CharField(max_length=200, blank=True,
                            help_text='SUB FAB, etc.')
    fab = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=200, blank=True)

    # Inspection findings - stored as structured JSON
    data = models.JSONField(default=dict, blank=True,
                            help_text='Complete inspection data in JSON format')

    # Textual sections
    defects_description = models.TextField(
        blank=True, help_text='תאור ליקויים')
    no_defects_note = models.TextField(
        blank=True, help_text='אין ליקויים - הערות')
    repairs_required = models.TextField(blank=True, help_text='תיקונים נדרשים')
    general_notes = models.TextField(blank=True)

    # Files
    pdf_file = models.FileField(
        upload_to='inspection_reports/pdf/', null=True, blank=True)
    source_scan = models.FileField(upload_to='inspection_reports/scans/', null=True, blank=True,
                                   help_text='Original scanned document')

    # Status and approval
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='draft')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                    null=True, blank=True, related_name='approved_reports')
    approved_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                   null=True, related_name='created_reports')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                   null=True, related_name='updated_reports')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inspection_reports'
        verbose_name = 'Inspection Report'
        verbose_name_plural = 'Inspection Reports'
        ordering = ['-inspection_date']
        indexes = [
            models.Index(fields=['report_number']),
            models.Index(fields=['inspection_date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Report {self.report_number} - {self.equipment.equipment_number}"


class InspectionReportItem(models.Model):
    """
    Individual items in the inspection report table
    (rows in the equipment table within the report)
    """
    report = models.ForeignKey(
        InspectionReport, on_delete=models.CASCADE, related_name='items')
    line_no = models.IntegerField(help_text='Line number in the table')

    # Equipment details for this line
    manufacturer = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    manufacture_year = models.IntegerField(null=True, blank=True)
    manufacture_date = models.DateField(null=True, blank=True)
    serial_number = models.CharField(max_length=200, blank=True)
    equipment_number = models.CharField(max_length=100, blank=True)

    # Technical specs
    capacity = models.CharField(max_length=100, blank=True)
    pressure = models.CharField(max_length=100, blank=True)
    volume = models.CharField(max_length=100, blank=True)
    height = models.CharField(max_length=100, blank=True)

    # Inspection results
    condition = models.TextField(blank=True, help_text='Condition notes')
    passed = models.BooleanField(default=True)

    # Additional data (flexible)
    additional_data = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'inspection_report_items'
        ordering = ['report', 'line_no']
        unique_together = ['report', 'line_no']

    def __str__(self):
        return f"Report {self.report.report_number} - Line {self.line_no}"


class Inspection(models.Model):
    """
    Simple periodic inspection record (quick version)
    """
    TYPE_CHOICES = [
        ('annual', 'Annual'),
        ('periodic', 'Periodic'),
        ('post_repair', 'Post Repair'),
        ('pre_operation', 'Pre-Operation'),
    ]

    RESULT_CHOICES = [
        ('pass', 'Pass'),
        ('fail', 'Fail'),
        ('conditional', 'Conditional Pass'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'tenants.Company', on_delete=models.CASCADE,
        null=True, blank=True, related_name='inspections')
    equipment = models.ForeignKey(
        Equipment, on_delete=models.CASCADE, related_name='inspections')
    inspection_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    inspection_date = models.DateField()
    next_due_date = models.DateField(null=True, blank=True)

    inspector_name = models.CharField(max_length=200)
    inspector_license = models.CharField(max_length=100, blank=True)
    result = models.CharField(max_length=20, choices=RESULT_CHOICES)

    # Additional fields from the inspection form
    workplace_name = models.CharField(max_length=200, blank=True)
    employer = models.CharField(max_length=200, blank=True)
    site = models.CharField(max_length=200, blank=True)
    fab = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=200, blank=True)
    cost = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    mileage = models.IntegerField(null=True, blank=True)
    units = models.CharField(max_length=50, blank=True)
    working_hours = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)

    notes = models.TextField(blank=True)
    report = models.ForeignKey(InspectionReport, on_delete=models.SET_NULL,
                               null=True, blank=True, related_name='simple_inspections')

    # Attachment file
    attachment = models.FileField(upload_to='inspections/attachments/', null=True, blank=True,
                                  help_text='Inspection attachment or photo')

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inspections'
        ordering = ['-inspection_date']

    def __str__(self):
        return f"{self.equipment.equipment_number} - {self.inspection_type} ({self.inspection_date})"
