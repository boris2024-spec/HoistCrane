from rest_framework import serializers
from .models import Issue, IssueComment


class IssueCommentSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source='created_by.username', read_only=True)

    class Meta:
        model = IssueComment
        fields = ['id', 'comment', 'created_by',
                  'created_by_name', 'created_at']
        read_only_fields = ['created_at', 'created_by']


class IssueSerializer(serializers.ModelSerializer):
    equipment_number = serializers.CharField(
        source='equipment.equipment_number', read_only=True)
    reported_by_name = serializers.CharField(
        source='reported_by.username', read_only=True)
    assigned_to_name = serializers.CharField(
        source='assigned_to.username', read_only=True)
    resolved_by_name = serializers.CharField(
        source='resolved_by.username', read_only=True)
    comments = IssueCommentSerializer(many=True, read_only=True)

    class Meta:
        model = Issue
        fields = [
            'id', 'equipment', 'equipment_number',
            'title', 'description', 'issue_type', 'priority', 'status',
            'reported_date', 'resolved_date', 'due_date',
            'reported_by', 'reported_by_name',
            'assigned_to', 'assigned_to_name',
            'resolved_by', 'resolved_by_name',
            'resolution_notes', 'updated_at', 'comments'
        ]
        read_only_fields = ['reported_date', 'updated_at', 'reported_by']


class IssueListSerializer(serializers.ModelSerializer):
    equipment_number = serializers.CharField(
        source='equipment.equipment_number', read_only=True)
    assigned_to_name = serializers.CharField(
        source='assigned_to.username', read_only=True)

    class Meta:
        model = Issue
        fields = [
            'id', 'equipment', 'equipment_number', 'title',
            'issue_type', 'priority', 'status',
            'reported_date', 'due_date',
            'assigned_to', 'assigned_to_name'
        ]
