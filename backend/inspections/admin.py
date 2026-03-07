from django.contrib import admin
from .models import InspectionReport, InspectionReportItem, Inspection


class InspectionReportItemInline(admin.TabularInline):
    model = InspectionReportItem
    extra = 1
    fields = ['line_no', 'manufacturer', 'description', 'serial_number',
              'capacity', 'condition', 'passed']


@admin.register(InspectionReport)
class InspectionReportAdmin(admin.ModelAdmin):
    list_display = ['report_number', 'equipment', 'inspection_date', 'inspector_name',
                    'status', 'created_at']
    list_filter = ['status', 'inspection_date', 'created_at']
    search_fields = ['report_number', 'inspector_name',
                     'equipment__equipment_number']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
    inlines = [InspectionReportItemInline]

    fieldsets = (
        ('Basic Info', {
            'fields': ('equipment', 'report_number', 'status')
        }),
        ('Inspection Details', {
            'fields': ('inspection_date', 'next_inspection_date', 'inspector_name', 'inspector_license')
        }),
        ('Location', {
            'fields': ('workplace_name', 'employer', 'site', 'fab', 'location')
        }),
        ('Findings', {
            'fields': ('defects_description', 'no_defects_note', 'repairs_required', 'general_notes')
        }),
        ('Files', {
            'fields': ('pdf_file', 'source_scan')
        }),
        ('Structured Data', {
            'fields': ('data',),
            'classes': ('collapse',)
        }),
        ('Approval', {
            'fields': ('approved_by', 'approved_at')
        }),
        ('Metadata', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Inspection)
class InspectionAdmin(admin.ModelAdmin):
    list_display = ['equipment', 'inspection_type', 'inspection_date',
                    'result', 'inspector_name', 'created_at']
    list_filter = ['inspection_type', 'result', 'inspection_date']
    search_fields = ['equipment__equipment_number', 'inspector_name']
    readonly_fields = ['created_at']
