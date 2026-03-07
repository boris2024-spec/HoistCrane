from django.db import models
from django.conf import settings
import uuid


class Equipment(models.Model):
    """
    Main Equipment model - stores lifting equipment data.
    Fields aligned with the full equipment registry specification.
    """
    EQUIPMENT_TYPE_CHOICES = [
        ('lifting_accessories', 'אביזרי הרמה'),
        ('no_inspection_required', 'לא חייב בבדיקה'),
        ('forklifts', 'מלגזות'),
        ('lifting_facilities', 'מתקני הרמה'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('maintenance', 'Under Maintenance'),
        ('inactive', 'Inactive'),
        ('retired', 'Retired'),
    ]

    INSPECTION_STATUS_CHOICES = [
        ('valid', 'תקין'),
        ('approaching', 'מתקרב'),
        ('expired', 'לא תקין'),
        ('none', 'ללא בדיקה'),
    ]

    # ── Primary identification ──────────────────────────────────────
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    equipment_number = models.CharField(
        max_length=100, unique=True, verbose_name='פריט ציוד')
    equipment_type = models.CharField(
        max_length=50, choices=EQUIPMENT_TYPE_CHOICES, verbose_name='תחום ציוד')
    super_domain = models.CharField(
        max_length=200, blank=True, verbose_name='תחום על')
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='active', verbose_name='סטטוס פריט ציוד')
    inspection_status = models.CharField(
        max_length=20, choices=INSPECTION_STATUS_CHOICES, default='none',
        blank=True, verbose_name='סטטוס בדיקות')
    internal_serial_number = models.CharField(
        max_length=200, blank=True, verbose_name='מספר סידורי פנימי')

    # ── Manufacturer details ────────────────────────────────────────
    manufacturer = models.CharField(
        max_length=200, blank=True, verbose_name='יצרן')
    model = models.CharField(
        max_length=200, blank=True, verbose_name='דגם')
    serial_number = models.CharField(
        max_length=200, blank=True, null=True, verbose_name='מספר סידורי יצרן')
    manufacture_year = models.IntegerField(
        null=True, blank=True, verbose_name='שנת ייצור')
    manufacture_date = models.DateField(
        null=True, blank=True, verbose_name='תאריך ייצור')
    license_number = models.CharField(
        max_length=200, blank=True, verbose_name='מספר רישיון / רישוי')
    warranty_expiry = models.DateField(
        null=True, blank=True, verbose_name='פקיעת תוקף אחריות')

    # ── Technical specifications ────────────────────────────────────
    capacity = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text='Capacity in tons/kg', verbose_name='קיבולת')
    capacity_unit = models.CharField(max_length=20, default='kg')
    height = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text='Height in meters', verbose_name='גובה')
    working_pressure = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text='Working pressure', verbose_name='לחץ עבודה')
    volume = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='נפח')
    safe_working_load = models.CharField(
        max_length=200, blank=True, verbose_name='עומס עבודה בטוח')
    max_allowed_pressure = models.CharField(
        max_length=200, blank=True, verbose_name='לחץ מירבי מותר')
    measurement_unit = models.CharField(
        max_length=100, blank=True, verbose_name='יחידת מדידה')
    measurement_resolution = models.CharField(
        max_length=100, blank=True, verbose_name='רזולוציית מדידה')
    measurement_range = models.CharField(
        max_length=200, blank=True, verbose_name='טווח מדידה')

    # ── Organisation hierarchy ──────────────────────────────────────
    employer = models.CharField(
        max_length=200, blank=True, help_text='חברה', verbose_name='חברה')
    service_company = models.CharField(
        max_length=200, blank=True, verbose_name='חברת שירות / קבלן')
    wing = models.CharField(
        max_length=200, blank=True, verbose_name='אגף')
    division = models.CharField(
        max_length=200, blank=True, verbose_name='חטיבה')
    department = models.CharField(
        max_length=200, blank=True, verbose_name='מחלקה')
    sub_department = models.CharField(
        max_length=200, blank=True, verbose_name='תת מחלקה')
    unit = models.CharField(
        max_length=200, blank=True, verbose_name='יחידה')

    # ── Location hierarchy ──────────────────────────────────────────
    country = models.CharField(
        max_length=100, blank=True, verbose_name='מדינה')
    district = models.CharField(
        max_length=200, blank=True, verbose_name='מחוז / איזור')
    city = models.CharField(
        max_length=200, blank=True, verbose_name='עיר / יישוב')
    site_name = models.CharField(
        max_length=200, blank=True, help_text='אתר / סניף', verbose_name='אתר / סניף')
    yam_number = models.CharField(
        max_length=100, blank=True, verbose_name='מספר יא״מ')
    site_status = models.CharField(
        max_length=100, blank=True, verbose_name='סטטוס אתר / סניף')
    campus = models.CharField(
        max_length=200, blank=True, verbose_name='קמפוס')
    address = models.CharField(
        max_length=500, blank=True, verbose_name='כתובת')
    building = models.CharField(
        max_length=200, blank=True, verbose_name='מבנה / מתקן')
    floor_number = models.CharField(
        max_length=50, blank=True, verbose_name='קומה')
    room = models.CharField(
        max_length=100, blank=True, verbose_name='חדר')
    workplace_name = models.CharField(
        max_length=200, blank=True, verbose_name='מקום עבודה')
    location_details = models.TextField(
        blank=True, verbose_name='מיקום')
    production_line = models.CharField(
        max_length=200, blank=True, verbose_name='קו ייצור')
    project = models.CharField(
        max_length=200, blank=True, verbose_name='פרויקט')

    # ── Status and dates ────────────────────────────────────────────
    purchase_date = models.DateField(
        null=True, blank=True, verbose_name='תאריך רכישה')
    installation_date = models.DateField(
        null=True, blank=True, verbose_name='תאריך התקנה')
    last_inspection_date = models.DateField(
        null=True, blank=True, verbose_name='בדיקה אחרונה')
    next_inspection_date = models.DateField(
        null=True, blank=True, verbose_name='בדיקה הבאה')
    periodic_inspections = models.TextField(
        blank=True, verbose_name='בדיקות תקופתיות')

    # ── Additional info ─────────────────────────────────────────────
    description = models.TextField(blank=True, verbose_name='תאור')
    notes = models.TextField(blank=True, verbose_name='הערה')
    tag = models.CharField(
        max_length=200, blank=True, verbose_name='תגית')
    inspector_name = models.CharField(
        max_length=200, blank=True, help_text='אחראי/ת', verbose_name='אחראי/ת')
    equipment_set = models.CharField(
        max_length=200, blank=True, verbose_name='ערכת ציוד')
    certified_workers = models.TextField(
        blank=True, verbose_name='עובדים מוסמכים')
    file_count = models.IntegerField(
        default=0, verbose_name='מספר קבצים')
    image = models.ImageField(
        upload_to='equipment/images/', null=True, blank=True, verbose_name='תמונה')
    url = models.URLField(
        max_length=500, blank=True, verbose_name='URL')

    # ── Metadata ────────────────────────────────────────────────────
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
            models.Index(fields=['inspection_status']),
            models.Index(fields=['employer']),
            models.Index(fields=['site_name']),
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
