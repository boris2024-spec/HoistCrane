from rest_framework import serializers
from .models import Equipment, EquipmentSpecification


class EquipmentSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentSpecification
        fields = ['id', 'key', 'value', 'unit']


class EquipmentSerializer(serializers.ModelSerializer):
    specifications = EquipmentSpecificationSerializer(
        many=True, read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.username', read_only=True)
    updated_by_name = serializers.CharField(
        source='updated_by.username', read_only=True)

    class Meta:
        model = Equipment
        fields = [
            'id', 'equipment_number', 'equipment_type', 'status',
            'manufacturer', 'model', 'serial_number', 'manufacture_year', 'manufacture_date',
            'capacity', 'capacity_unit', 'height', 'working_pressure', 'volume',
            'site_name', 'workplace_name', 'employer', 'department', 'location_details',
            'purchase_date', 'installation_date', 'last_inspection_date', 'next_inspection_date',
            'description', 'notes', 'inspector_name', 'specifications',
            'created_by', 'created_by_name', 'updated_by', 'updated_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at',
                            'updated_at', 'created_by', 'updated_by']


class EquipmentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    class Meta:
        model = Equipment
        fields = [
            'id', 'equipment_number', 'equipment_type', 'status',
            'manufacturer', 'model', 'serial_number', 'manufacture_date', 'manufacture_year',
            'site_name', 'inspector_name', 'employer', 'department', 'workplace_name',
            'capacity', 'capacity_unit', 'height',
            'last_inspection_date', 'next_inspection_date',
            'description',
            'installation_date', 'purchase_date',
            'created_at', 'updated_at'
        ]
