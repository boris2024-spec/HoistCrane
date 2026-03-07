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
    guid = serializers.UUIDField(source='id', read_only=True)

    class Meta:
        model = Equipment
        fields = [
            'id', 'guid', 'equipment_number', 'equipment_type', 'super_domain',
            'status', 'inspection_status', 'internal_serial_number',
            # Manufacturer
            'manufacturer', 'model', 'serial_number', 'manufacture_year', 'manufacture_date',
            'license_number', 'warranty_expiry',
            # Technical
            'capacity', 'capacity_unit', 'height', 'working_pressure', 'volume',
            'safe_working_load', 'max_allowed_pressure',
            'measurement_unit', 'measurement_resolution', 'measurement_range',
            # Organisation
            'employer', 'service_company', 'wing', 'division',
            'department', 'sub_department', 'unit',
            # Location
            'country', 'district', 'city',
            'site_name', 'yam_number', 'site_status', 'campus',
            'address', 'building', 'floor_number', 'room',
            'workplace_name', 'location_details',
            'production_line', 'project',
            # Dates
            'purchase_date', 'installation_date',
            'last_inspection_date', 'next_inspection_date',
            'periodic_inspections',
            # Additional
            'description', 'notes', 'tag', 'inspector_name',
            'equipment_set', 'certified_workers', 'file_count',
            'image', 'url',
            # Relations
            'specifications',
            'created_by', 'created_by_name', 'updated_by', 'updated_by_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at',
                            'updated_at', 'created_by', 'updated_by']


class EquipmentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    guid = serializers.UUIDField(source='id', read_only=True)

    class Meta:
        model = Equipment
        fields = [
            'id', 'guid', 'equipment_number', 'equipment_type', 'super_domain',
            'status', 'inspection_status', 'internal_serial_number',
            'manufacturer', 'model', 'serial_number', 'manufacture_date', 'manufacture_year',
            'license_number', 'warranty_expiry',
            'capacity', 'capacity_unit', 'height',
            'safe_working_load', 'max_allowed_pressure',
            'measurement_unit', 'measurement_resolution', 'measurement_range',
            'employer', 'service_company', 'wing', 'division',
            'department', 'sub_department', 'unit',
            'country', 'district', 'city',
            'site_name', 'yam_number', 'site_status', 'campus',
            'address', 'building', 'floor_number', 'room',
            'workplace_name', 'location_details',
            'production_line', 'project',
            'purchase_date', 'installation_date',
            'last_inspection_date', 'next_inspection_date',
            'periodic_inspections',
            'description', 'notes', 'tag', 'inspector_name',
            'equipment_set', 'certified_workers', 'file_count',
            'image', 'url',
            'created_at', 'updated_at',
        ]
