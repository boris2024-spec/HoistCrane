from django.db import models
from django.conf import settings
import uuid


class MaintenanceSchedule(models.Model):
    """Recurring maintenance schedule for equipment."""
    FREQUENCY_CHOICES = [
        ('daily', 'יומי'),
        ('weekly', 'שבועי'),
        ('monthly', 'חודשי'),
        ('quarterly', 'רבעוני'),
        ('semi_annual', 'חצי שנתי'),
        ('annual', 'שנתי'),
        ('custom', 'מותאם אישית'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    equipment = models.ForeignKey(
        'equipment.Equipment', on_delete=models.CASCADE,
        related_name='maintenance_schedules', verbose_name='ציוד')
    title = models.CharField(max_length=300, verbose_name='כותרת')
    description = models.TextField(blank=True, verbose_name='תיאור')
    frequency = models.CharField(
        max_length=20, choices=FREQUENCY_CHOICES, verbose_name='תדירות')
    custom_interval_days = models.PositiveIntegerField(
        null=True, blank=True,
        help_text='Number of days between tasks (for custom frequency)',
        verbose_name='מרווח ימים מותאם')
    start_date = models.DateField(verbose_name='תאריך התחלה')
    end_date = models.DateField(null=True, blank=True, verbose_name='תאריך סיום')
    is_active = models.BooleanField(default=True, verbose_name='פעיל')
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='assigned_schedules',
        verbose_name='אחראי')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='created_schedules')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'maintenance_schedules'
        ordering = ['start_date']

    def __str__(self):
        return f"{self.title} - {self.equipment.equipment_number}"


class MaintenanceTask(models.Model):
    """Individual maintenance task instance generated from a schedule."""
    STATUS_CHOICES = [
        ('pending', 'ממתין'),
        ('in_progress', 'בביצוע'),
        ('completed', 'הושלם'),
        ('overdue', 'באיחור'),
        ('cancelled', 'בוטל'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'נמוכה'),
        ('medium', 'בינונית'),
        ('high', 'גבוהה'),
        ('critical', 'קריטית'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    schedule = models.ForeignKey(
        MaintenanceSchedule, on_delete=models.CASCADE,
        related_name='tasks', null=True, blank=True, verbose_name='לוח זמנים')
    equipment = models.ForeignKey(
        'equipment.Equipment', on_delete=models.CASCADE,
        related_name='maintenance_tasks', verbose_name='ציוד')
    title = models.CharField(max_length=300, verbose_name='כותרת')
    description = models.TextField(blank=True, verbose_name='תיאור')
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='סטטוס')
    priority = models.CharField(
        max_length=20, choices=PRIORITY_CHOICES, default='medium', verbose_name='עדיפות')
    due_date = models.DateField(verbose_name='תאריך יעד')
    completed_date = models.DateField(null=True, blank=True, verbose_name='תאריך השלמה')
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='assigned_tasks',
        verbose_name='אחראי')
    notes = models.TextField(blank=True, verbose_name='הערות')
    cost = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='עלות')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='created_tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'maintenance_tasks'
        ordering = ['due_date']
        indexes = [
            models.Index(fields=['status', 'due_date']),
            models.Index(fields=['equipment', 'status']),
        ]

    def __str__(self):
        return f"{self.title} - {self.status}"
