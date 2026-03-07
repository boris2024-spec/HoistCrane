from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    equipment_number = serializers.CharField(
        source='equipment.equipment_number', read_only=True)
    uploaded_by_name = serializers.CharField(
        source='uploaded_by.username', read_only=True)
    file_extension = serializers.ReadOnlyField()

    class Meta:
        model = Document
        fields = [
            'id', 'equipment', 'equipment_number',
            'title', 'document_type', 'file', 'file_extension',
            'description', 'document_date', 'expiry_date',
            'file_size', 'mime_type',
            'uploaded_by', 'uploaded_by_name',
            'uploaded_at', 'updated_at'
        ]
        read_only_fields = ['uploaded_at', 'updated_at', 'file_size']


class DocumentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['equipment', 'title', 'document_type', 'file', 'description',
                  'document_date', 'expiry_date']
