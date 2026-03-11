from rest_framework import serializers
from .models import MaintenanceSchedule, MaintenanceTask


class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    equipment_number = serializers.CharField(
        source='equipment.equipment_number', read_only=True)
    assigned_to_name = serializers.SerializerMethodField()
    tasks_count = serializers.SerializerMethodField()

    class Meta:
        model = MaintenanceSchedule
        fields = [
            'id', 'equipment', 'equipment_number', 'title', 'description',
            'frequency', 'custom_interval_days', 'start_date', 'end_date',
            'is_active', 'assigned_to', 'assigned_to_name', 'tasks_count',
            'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            full = f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip()
            return full or obj.assigned_to.username
        return None

    def get_tasks_count(self, obj):
        return obj.tasks.count()


class MaintenanceTaskSerializer(serializers.ModelSerializer):
    equipment_number = serializers.CharField(
        source='equipment.equipment_number', read_only=True)
    assigned_to_name = serializers.SerializerMethodField()
    schedule_title = serializers.CharField(
        source='schedule.title', read_only=True, default=None)

    class Meta:
        model = MaintenanceTask
        fields = [
            'id', 'schedule', 'schedule_title', 'equipment', 'equipment_number',
            'title', 'description', 'status', 'priority', 'due_date',
            'completed_date', 'assigned_to', 'assigned_to_name',
            'notes', 'cost', 'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            full = f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip()
            return full or obj.assigned_to.username
        return None
