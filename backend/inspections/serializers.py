from rest_framework import serializers
from .models import InspectionReport, InspectionReportItem, Inspection
from equipment.serializers import EquipmentListSerializer


class InspectionReportItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectionReportItem
        fields = [
            'id', 'line_no', 'manufacturer', 'description', 'manufacture_year',
            'manufacture_date', 'serial_number', 'equipment_number',
            'capacity', 'pressure', 'volume', 'height',
            'condition', 'passed', 'additional_data'
        ]


class InspectionReportSerializer(serializers.ModelSerializer):
    items = InspectionReportItemSerializer(many=True, read_only=True)
    equipment_details = EquipmentListSerializer(
        source='equipment', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.username', read_only=True)
    approved_by_name = serializers.CharField(
        source='approved_by.username', read_only=True)

    class Meta:
        model = InspectionReport
        fields = [
            'id', 'equipment', 'equipment_details', 'report_number',
            'inspection_date', 'next_inspection_date', 'inspector_name', 'inspector_license',
            'workplace_name', 'employer', 'site', 'fab', 'location',
            'data', 'defects_description', 'no_defects_note', 'repairs_required', 'general_notes',
            'pdf_file', 'source_scan', 'status',
            'approved_by', 'approved_by_name', 'approved_at',
            'created_by', 'created_by_name', 'updated_by',
            'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['created_at',
                            'updated_at', 'created_by', 'updated_by']


class InspectionReportListSerializer(serializers.ModelSerializer):
    equipment_number = serializers.CharField(
        source='equipment.equipment_number', read_only=True)

    class Meta:
        model = InspectionReport
        fields = [
            'id', 'report_number', 'equipment', 'equipment_number',
            'inspection_date', 'inspector_name', 'status', 'created_at'
        ]


class InspectionSerializer(serializers.ModelSerializer):
    equipment_number = serializers.CharField(
        source='equipment.equipment_number', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.username', read_only=True)

    class Meta:
        model = Inspection
        fields = [
            'id', 'equipment', 'equipment_number', 'inspection_type',
            'inspection_date', 'next_due_date', 'inspector_name', 'inspector_license',
            'result', 'notes', 'report', 'created_by', 'created_by_name', 
            'created_at', 'workplace_name', 'employer', 'site', 'fab', 
            'location', 'cost', 'mileage', 'units', 'working_hours', 'attachment'
        ]
        read_only_fields = ['created_at', 'created_by']
