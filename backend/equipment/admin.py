from django.contrib import admin
from .models import Equipment, EquipmentSpecification


class EquipmentSpecificationInline(admin.TabularInline):
    model = EquipmentSpecification
    extra = 1


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ['equipment_number', 'equipment_type', 'super_domain',
                    'manufacturer', 'model', 'status', 'inspection_status',
                    'employer', 'site_name', 'next_inspection_date', 'created_at']
    list_filter = ['equipment_type', 'status', 'inspection_status',
                   'manufacturer', 'country', 'city', 'site_name', 'created_at']
    search_fields = ['equipment_number', 'serial_number', 'internal_serial_number',
                     'manufacturer', 'model', 'site_name', 'employer',
                     'city', 'address', 'tag', 'description']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
    inlines = [EquipmentSpecificationInline]

    fieldsets = (
        ('זיהוי ראשי', {
            'fields': ('equipment_number', 'equipment_type', 'super_domain',
                       'status', 'inspection_status', 'internal_serial_number')
        }),
        ('פרטי יצרן', {
            'fields': ('manufacturer', 'model', 'serial_number',
                       'manufacture_year', 'manufacture_date',
                       'license_number', 'warranty_expiry')
        }),
        ('מפרט טכני', {
            'fields': ('capacity', 'capacity_unit', 'height', 'working_pressure', 'volume',
                       'safe_working_load', 'max_allowed_pressure',
                       'measurement_unit', 'measurement_resolution', 'measurement_range')
        }),
        ('היררכיה ארגונית', {
            'fields': ('employer', 'service_company', 'wing', 'division',
                       'department', 'sub_department', 'unit')
        }),
        ('מיקום', {
            'fields': ('country', 'district', 'city',
                       'site_name', 'yam_number', 'site_status', 'campus',
                       'address', 'building', 'floor_number', 'room',
                       'workplace_name', 'location_details',
                       'production_line', 'project')
        }),
        ('תאריכים ובדיקות', {
            'fields': ('purchase_date', 'installation_date',
                       'last_inspection_date', 'next_inspection_date',
                       'periodic_inspections')
        }),
        ('מידע נוסף', {
            'fields': ('description', 'notes', 'tag', 'inspector_name',
                       'equipment_set', 'certified_workers', 'file_count',
                       'image', 'url')
        }),
        ('מטא-דאטה', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
