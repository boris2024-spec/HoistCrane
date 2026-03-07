from django.contrib import admin
from .models import Equipment, EquipmentSpecification


class EquipmentSpecificationInline(admin.TabularInline):
    model = EquipmentSpecification
    extra = 1


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ['equipment_number', 'equipment_type', 'manufacturer', 'model',
                    'status', 'next_inspection_date', 'created_at']
    list_filter = ['equipment_type', 'status', 'manufacturer', 'created_at']
    search_fields = ['equipment_number', 'serial_number',
                     'manufacturer', 'model', 'site_name']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
    inlines = [EquipmentSpecificationInline]

    fieldsets = (
        ('Basic Information', {
            'fields': ('equipment_number', 'equipment_type', 'status')
        }),
        ('Manufacturer Details', {
            'fields': ('manufacturer', 'model', 'serial_number', 'manufacture_year', 'manufacture_date')
        }),
        ('Technical Specifications', {
            'fields': ('capacity', 'capacity_unit', 'height', 'working_pressure', 'volume')
        }),
        ('Location & Ownership', {
            'fields': ('site_name', 'workplace_name', 'employer', 'department', 'location_details')
        }),
        ('Dates', {
            'fields': ('purchase_date', 'installation_date', 'last_inspection_date', 'next_inspection_date')
        }),
        ('Additional Info', {
            'fields': ('description', 'notes')
        }),
        ('Metadata', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
