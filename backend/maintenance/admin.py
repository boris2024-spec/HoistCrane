from django.contrib import admin
from .models import MaintenanceSchedule, MaintenanceTask


@admin.register(MaintenanceSchedule)
class MaintenanceScheduleAdmin(admin.ModelAdmin):
    list_display = ['title', 'equipment', 'frequency', 'is_active', 'start_date']
    list_filter = ['frequency', 'is_active']
    search_fields = ['title', 'description']


@admin.register(MaintenanceTask)
class MaintenanceTaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'equipment', 'status', 'priority', 'due_date']
    list_filter = ['status', 'priority']
    search_fields = ['title', 'description']
