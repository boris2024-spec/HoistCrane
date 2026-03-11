from django.contrib import admin
from .models import ActivityLog, Notification


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'entity_type', 'entity_repr', 'timestamp')
    list_filter = ('action', 'entity_type', 'timestamp')
    search_fields = ('entity_repr', 'user__username')
    readonly_fields = ('id', 'user', 'action', 'entity_type', 'entity_id',
                       'entity_repr', 'changes', 'ip_address', 'user_agent', 'timestamp')
    ordering = ('-timestamp',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'type', 'title', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('title', 'recipient__username')
