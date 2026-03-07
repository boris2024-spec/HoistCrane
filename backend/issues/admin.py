from django.contrib import admin
from .models import Issue, IssueComment


class IssueCommentInline(admin.TabularInline):
    model = IssueComment
    extra = 1
    readonly_fields = ['created_at', 'created_by']


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ['title', 'equipment', 'issue_type', 'priority', 'status',
                    'reported_date', 'assigned_to']
    list_filter = ['status', 'priority', 'issue_type', 'reported_date']
    search_fields = ['title', 'description', 'equipment__equipment_number']
    readonly_fields = ['reported_date', 'updated_at']
    inlines = [IssueCommentInline]

    fieldsets = (
        ('Basic Info', {
            'fields': ('equipment', 'title', 'description')
        }),
        ('Classification', {
            'fields': ('issue_type', 'priority', 'status')
        }),
        ('Assignment', {
            'fields': ('reported_by', 'assigned_to', 'resolved_by')
        }),
        ('Dates', {
            'fields': ('reported_date', 'due_date', 'resolved_date', 'updated_at')
        }),
        ('Resolution', {
            'fields': ('resolution_notes',)
        }),
    )
