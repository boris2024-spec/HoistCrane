from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'equipment', 'document_type', 'document_date',
                    'file_size', 'uploaded_by', 'uploaded_at']
    list_filter = ['document_type', 'document_date', 'uploaded_at']
    search_fields = ['title', 'description', 'equipment__equipment_number']
    readonly_fields = ['uploaded_at', 'updated_at', 'file_size']

    fieldsets = (
        ('Basic Info', {
            'fields': ('equipment', 'title', 'document_type')
        }),
        ('File', {
            'fields': ('file', 'file_size', 'mime_type')
        }),
        ('Details', {
            'fields': ('description', 'document_date', 'expiry_date')
        }),
        ('Metadata', {
            'fields': ('uploaded_by', 'uploaded_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
