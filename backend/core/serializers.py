from rest_framework import serializers
from django.utils import timezone
from .models import ActivityLog, Notification


class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'user_name', 'action', 'entity_type',
            'entity_id', 'entity_repr', 'changes', 'ip_address',
            'timestamp',
        ]
        read_only_fields = fields

    def get_user_name(self, obj):
        if obj.user:
            full = f"{obj.user.first_name} {obj.user.last_name}".strip()
            return full or obj.user.username
        return None


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'title', 'message', 'entity_type',
            'entity_id', 'is_read', 'read_at', 'created_at',
        ]
        read_only_fields = [
            'id', 'type', 'title', 'message', 'entity_type',
            'entity_id', 'created_at',
        ]


class NotificationMarkReadSerializer(serializers.Serializer):
    notification_ids = serializers.ListField(
        child=serializers.UUIDField(), required=False,
        help_text='List of notification IDs to mark as read. If empty, marks all as read.',
    )

    def update_notifications(self, user):
        ids = self.validated_data.get('notification_ids')
        qs = Notification.objects.filter(recipient=user, is_read=False)
        if ids:
            qs = qs.filter(id__in=ids)
        count = qs.update(is_read=True, read_at=timezone.now())
        return count
