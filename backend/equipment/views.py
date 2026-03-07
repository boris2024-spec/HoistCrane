from rest_framework import viewsets, filters, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from .models import Equipment, EquipmentSpecification
from .serializers import EquipmentSerializer, EquipmentListSerializer
import csv
import io
from datetime import datetime
import chardet
from openpyxl import Workbook
from openpyxl import load_workbook
from openpyxl.styles import Font, PatternFill, Alignment
from django.http import HttpResponse
from django.db import transaction
import uuid
import re


def _normalize_header(value: str) -> str:
    if value is None:
        return ''
    value = str(value)
    value = value.replace('\ufeff', '')  # BOM
    value = value.replace('\u00a0', ' ')  # NBSP
    value = re.sub(r"\s+", " ", value).strip()
    return value


def _get_first(row_dict: dict, candidates: list[str]) -> str:
    for key in candidates:
        if key in row_dict and row_dict.get(key) not in (None, ''):
            return str(row_dict.get(key)).strip()
    return ''


def _parse_date(value: str):
    if not value:
        return None
    value = str(value).strip()
    if value == '':
        return None

    # Try to extract a date token from a longer string
    m = re.search(
        r"(\d{1,2}[\./-]\d{1,2}[\./-]\d{2,4}|\d{4}-\d{2}-\d{2})", value)
    token = m.group(1) if m else value

    for fmt in ['%d/%m/%Y', '%d.%m.%Y', '%d-%m-%Y', '%Y-%m-%d', '%d/%m/%y', '%d.%m.%y']:
        try:
            return datetime.strptime(token.strip(), fmt).date()
        except Exception:
            continue
    return None


def _map_equipment_type(raw: str) -> str:
    raw = (raw or '').strip()
    if raw == '':
        return 'other'

    mapping = {
        'crane': 'crane',
        'hoist': 'hoist',
        'forklift': 'forklift',
        'elevator': 'elevator',
        'platform': 'platform',
        'מנוף': 'crane',
        'מנוף הרמה': 'crane',
        'מנופון': 'hoist',
        'מלגזה': 'forklift',
        'מעלית': 'elevator',
        'במה': 'platform',
        'גני': 'platform',
        'genie': 'platform',
        'lift': 'platform',
        'ליפט': 'platform',
    }

    raw_lower = raw.lower()
    for token, mapped in mapping.items():
        if token in raw_lower or token in raw:
            return mapped
    return 'other'


def _map_status(raw: str) -> str:
    raw = (raw or '').strip()
    if raw == '':
        return 'active'

    raw_lower = raw.lower()
    if raw_lower in {'active', 'maintenance', 'inactive', 'retired'}:
        return raw_lower

    he_map = {
        'פעיל': 'active',
        'בתוקף': 'active',
        'תקף': 'active',
        'תחזוקה': 'maintenance',
        'בתחזוקה': 'maintenance',
        'לא פעיל': 'inactive',
        'לא בתוקף': 'inactive',
        'לא תקף': 'inactive',
        'מושבת': 'inactive',
        'הוצא משימוש': 'retired',
        'גרוטאה': 'retired',
    }
    for token, mapped in he_map.items():
        if token in raw:
            return mapped

    return 'active'


def _extract_two_dates_from_text(text: str):
    if not text:
        return (None, None)
    tokens = re.findall(
        r"\d{1,2}[\./-]\d{1,2}[\./-]\d{2,4}|\d{4}-\d{2}-\d{2}", str(text))
    parsed = [_parse_date(t) for t in tokens]
    parsed = [d for d in parsed if d is not None]
    if len(parsed) >= 2:
        return (parsed[0], parsed[1])
    if len(parsed) == 1:
        return (parsed[0], None)
    return (None, None)


HEADER_CANDIDATES = {
    'equipment_number': ['מספר סידורי פנימי', 'פריט ציוד', 'מספר ציוד', 'Equipment Number', 'מספר סידורי'],
    'equipment_type': ['תחום ציוד', 'סוג ציוד', 'סוג', 'Equipment Type'],
    'status': ['סטטוס פריט ציוד', 'סטטוס', 'סטטוס פרט ציוד', 'Status'],
    'inspection_status': ['סטטוס בדיקות', 'סטטוס בדיקה', 'Inspection Status'],
    'company': ['חברה', 'מעסיק', 'מזמין', 'Company', 'Employer'],
    'department': ['מחלקה', 'Department'],
    'site_name': ['אתר / סניף', 'אתר', 'אתר / סרק', 'Site', 'Site/Branch'],
    'workplace_name': ['מקום עבודה', 'Workplace'],
    'location': ['מיקום', 'מיקום פריט ציוד', 'Location'],
    'manufacturer': ['יצרן', 'Manufacturer'],
    'manufacture_date': ['תאריך ייצור', 'Manufacture Date'],
    'manufacture_year': ['שנת ייצור', 'Manufacture Year'],
    'serial_number': ['מספר סידורי יצרן', 'מספר סידורי', 'Serial Number', 'מסלקד'],
    'model': ['דגם', 'Model'],
    'description': ['תאור', 'תיאור', 'Description'],
    'responsible': ['אחראי/ת', 'אחראי', 'בודק', 'בודק/ת', 'Inspector'],
    'periodic_inspections': ['בדיקות תקופתיות', 'בדיקה אחרונה', 'בדיקה הבאה', 'Inspection Dates'],
}


def _import_normalized_rows(*, user, rows_iter):
    """Import rows that already have normalized headers.

    rows_iter yields tuples: (row_index:int, normalized_row:dict[str, Any]).
    """
    imported_count = 0
    skipped_existing = 0
    error_count = 0
    errors = []

    def get_value(normalized_row: dict, field_key: str) -> str:
        candidates = HEADER_CANDIDATES[field_key]
        normalized_candidates = [_normalize_header(c) for c in candidates]
        return _get_first(normalized_row, normalized_candidates)

    with transaction.atomic():
        for row_index, normalized_row in rows_iter:
            try:
                equipment_number = (
                    get_value(normalized_row, 'equipment_number') or '').strip()
                if not equipment_number:
                    raise ValueError(
                        'Missing equipment number (פריט ציוד / מספר סידורי פנימי)')

                if Equipment.objects.filter(equipment_number=equipment_number).exists():
                    skipped_existing += 1
                    continue

                equipment_type_raw = get_value(
                    normalized_row, 'equipment_type')
                status_raw = get_value(normalized_row, 'status')
                inspection_status_raw = get_value(
                    normalized_row, 'inspection_status')
                company = get_value(normalized_row, 'company')
                department = get_value(normalized_row, 'department')
                site_name = get_value(normalized_row, 'site_name')
                workplace_name = get_value(normalized_row, 'workplace_name')
                location = get_value(normalized_row, 'location')
                manufacturer = get_value(normalized_row, 'manufacturer')
                model = get_value(normalized_row, 'model')
                serial_number = get_value(normalized_row, 'serial_number')
                description = get_value(normalized_row, 'description')
                responsible = get_value(normalized_row, 'responsible')

                manufacture_date = _parse_date(
                    get_value(normalized_row, 'manufacture_date'))
                manufacture_year_raw = get_value(
                    normalized_row, 'manufacture_year')
                manufacture_year = None
                if manufacture_year_raw:
                    try:
                        manufacture_year = int(
                            str(manufacture_year_raw).strip()[:4])
                    except Exception:
                        manufacture_year = None
                if not manufacture_year and manufacture_date:
                    manufacture_year = manufacture_date.year

                periodic_text = get_value(
                    normalized_row, 'periodic_inspections')

                last_inspection = _get_first(
                    normalized_row, [_normalize_header('בדיקה אחרונה')])
                next_inspection = _get_first(
                    normalized_row, [_normalize_header('בדיקה הבאה')])

                last_inspection_date = _parse_date(last_inspection)
                next_inspection_date = _parse_date(next_inspection)
                if not last_inspection_date and not next_inspection_date:
                    last_inspection_date, next_inspection_date = _extract_two_dates_from_text(
                        periodic_text)

                equipment = Equipment.objects.create(
                    equipment_number=equipment_number,
                    equipment_type=_map_equipment_type(equipment_type_raw),
                    status=_map_status(status_raw),
                    manufacturer=(manufacturer or '').strip(),
                    model=(model or '').strip(),
                    serial_number=(serial_number or '').strip() or None,
                    manufacture_date=manufacture_date,
                    manufacture_year=manufacture_year,
                    site_name=(site_name or '').strip(),
                    workplace_name=(workplace_name or '').strip(),
                    employer=(company or '').strip(),
                    department=(department or '').strip(),
                    location_details=(location or '').strip(),
                    description=(description or '').strip(),
                    inspector_name=(responsible or '').strip(),
                    last_inspection_date=last_inspection_date,
                    next_inspection_date=next_inspection_date,
                    created_by=user,
                    updated_by=user,
                )

                # Store extra columns in specifications so the import "fills" all columns
                if inspection_status_raw:
                    EquipmentSpecification.objects.update_or_create(
                        equipment=equipment,
                        key='inspection_status',
                        defaults={'value': str(
                            inspection_status_raw).strip(), 'unit': ''},
                    )
                if periodic_text:
                    EquipmentSpecification.objects.update_or_create(
                        equipment=equipment,
                        key='periodic_inspections_raw',
                        defaults={'value': str(
                            periodic_text).strip(), 'unit': ''},
                    )

                imported_count += 1

            except Exception as e:
                error_count += 1
                errors.append(f"Row {row_index}: {str(e)}")

    return {
        'success': True,
        'imported': imported_count,
        'skipped_existing': skipped_existing,
        'errors': error_count,
        'error_details': errors[:10],
    }


class EquipmentFilter(django_filters.FilterSet):
    # Multiple choice filters
    equipment_type = django_filters.CharFilter(method='filter_multiple')
    status = django_filters.CharFilter(method='filter_status_multiple')

    # Text filters
    manufacturer = django_filters.CharFilter(lookup_expr='icontains')
    model = django_filters.CharFilter(lookup_expr='icontains')
    serial_number = django_filters.CharFilter(lookup_expr='icontains')
    site_name = django_filters.CharFilter(lookup_expr='icontains')
    inspector_name = django_filters.CharFilter(lookup_expr='icontains')
    employer = django_filters.CharFilter(lookup_expr='icontains')
    department = django_filters.CharFilter(lookup_expr='icontains')
    workplace_name = django_filters.CharFilter(lookup_expr='icontains')

    # Range filters
    capacity_min = django_filters.NumberFilter(
        field_name='capacity', lookup_expr='gte')
    capacity_max = django_filters.NumberFilter(
        field_name='capacity', lookup_expr='lte')
    height_min = django_filters.NumberFilter(
        field_name='height', lookup_expr='gte')
    height_max = django_filters.NumberFilter(
        field_name='height', lookup_expr='lte')
    manufacture_year_min = django_filters.NumberFilter(
        field_name='manufacture_year', lookup_expr='gte')
    manufacture_year_max = django_filters.NumberFilter(
        field_name='manufacture_year', lookup_expr='lte')

    # Date range filters
    last_inspection_date_from = django_filters.DateFilter(
        field_name='last_inspection_date', lookup_expr='gte')
    last_inspection_date_to = django_filters.DateFilter(
        field_name='last_inspection_date', lookup_expr='lte')
    next_inspection_date_from = django_filters.DateFilter(
        field_name='next_inspection_date', lookup_expr='gte')
    next_inspection_date_to = django_filters.DateFilter(
        field_name='next_inspection_date', lookup_expr='lte')

    def filter_multiple(self, queryset, name, value):
        """Handle multiple comma-separated values"""
        if value:
            values = [v.strip() for v in value.split(',')]
            return queryset.filter(**{f'{name}__in': values})
        return queryset

    def filter_status_multiple(self, queryset, name, value):
        """Handle multiple status values"""
        if value:
            values = [v.strip() for v in value.split(',')]
            return queryset.filter(status__in=values)
        return queryset

    class Meta:
        model = Equipment
        fields = [
            'equipment_type', 'status', 'manufacturer', 'model', 'serial_number',
            'site_name', 'inspector_name', 'employer', 'department', 'workplace_name',
            'capacity_min', 'capacity_max', 'height_min', 'height_max',
            'manufacture_year_min', 'manufacture_year_max',
            'last_inspection_date_from', 'last_inspection_date_to',
            'next_inspection_date_from', 'next_inspection_date_to'
        ]


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend,
                       filters.SearchFilter, filters.OrderingFilter]
    filterset_class = EquipmentFilter
    search_fields = ['equipment_number', 'serial_number',
                     'manufacturer', 'model', 'site_name',
                     'workplace_name', 'employer', 'department',
                     'location_details', 'description', 'notes']
    ordering_fields = ['created_at',
                       'equipment_number', 'next_inspection_date']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return EquipmentListSerializer
        return EquipmentSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user,
                        updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='options')
    def options(self, request):
        """Return distinct filter option values for Equipment list UI."""
        inspector_names_qs = (
            Equipment.objects
            .exclude(inspector_name__isnull=True)
            .exclude(inspector_name__exact='')
            .values_list('inspector_name', flat=True)
            .distinct()
            .order_by('inspector_name')
        )

        return Response(
            {
                'inspector_names': list(inspector_names_qs),
            }
        )

    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_delete(self, request):
        """Delete multiple equipment items by ids.

        Expected payload: {"ids": ["uuid1", "uuid2", ...]}
        """
        ids = request.data.get('ids', [])

        if isinstance(ids, str):
            ids = [part.strip() for part in ids.split(',') if part.strip()]

        if not isinstance(ids, (list, tuple)) or len(ids) == 0:
            return Response(
                {'detail': 'ids must be a non-empty list of UUIDs'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            id_list = sorted({str(uuid.UUID(str(value))) for value in ids})
        except (TypeError, ValueError, AttributeError):
            return Response(
                {'detail': 'ids must be a non-empty list of UUIDs'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = Equipment.objects.filter(id__in=id_list)
        found_ids = {str(value)
                     for value in queryset.values_list('id', flat=True)}
        not_found = [
            equipment_id for equipment_id in id_list if equipment_id not in found_ids]

        equipment_to_delete = queryset.count()

        with transaction.atomic():
            queryset.delete()

        return Response(
            {
                'requested': len(id_list),
                'deleted': equipment_to_delete,
                'not_found': not_found,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=['get'])
    def inspections(self, request, pk=None):
        """Get all inspections for this equipment"""
        equipment = self.get_object()
        inspections = equipment.inspections.all()
        from inspections.serializers import InspectionSerializer
        serializer = InspectionSerializer(inspections, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get all documents for this equipment"""
        equipment = self.get_object()
        documents = equipment.documents.all()
        from documents.serializers import DocumentSerializer
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def issues(self, request, pk=None):
        """Get all issues for this equipment"""
        equipment = self.get_object()
        issues = equipment.issues.all()
        from issues.serializers import IssueSerializer
        serializer = IssueSerializer(issues, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='generate-pdf')
    def generate_pdf(self, request, pk=None):
        """Generate a PDF equipment card for this equipment item."""
        equipment = self.get_object()
        try:
            from .pdf_generator import generate_equipment_pdf
            pdf_buffer = generate_equipment_pdf(equipment)
            response = HttpResponse(
                pdf_buffer.read(), content_type='application/pdf')
            safe_name = equipment.equipment_number.replace(' ', '_')
            response[
                'Content-Disposition'] = f'attachment; filename="equipment_card_{safe_name}.pdf"'
            return response
        except Exception as e:
            return Response(
                {'detail': f'Error generating PDF: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get equipment statistics"""
        from django.db.models import Count
        stats = {
            'total': Equipment.objects.count(),
            'by_type': dict(Equipment.objects.values('equipment_type').annotate(count=Count('id')).values_list('equipment_type', 'count')),
            'by_status': dict(Equipment.objects.values('status').annotate(count=Count('id')).values_list('status', 'count')),
        }
        return Response(stats)

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Export all equipment to CSV with current filters applied"""
        from django.http import HttpResponse

        # Apply filters to queryset
        queryset = self.filter_queryset(self.get_queryset())

        # Create CSV response
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = f'attachment; filename="equipment_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'

        # Write BOM for Excel UTF-8 support
        response.write('\ufeff')

        writer = csv.writer(response)

        # Write headers (in Hebrew)
        headers = [
            'פריט ציוד', 'סוג ציוד', 'סטטוס', 'יצרן', 'דגם', 'מספר סידורי',
            'קיבולת', 'יחידת קיבולת', 'גובה', 'אתר', 'מקום עבודה', 'מעסיק',
            'מחלקה', 'בודק', 'תאריך ייצור', 'שנת ייצור', 'תאריך רכישה',
            'תאריך התקנה', 'בדיקה אחרונה', 'בדיקה הבאה', 'תיאור', 'הערות'
        ]
        writer.writerow(headers)

        # Write data
        for equipment in queryset:
            row = [
                equipment.equipment_number,
                equipment.get_equipment_type_display(),
                equipment.get_status_display(),
                equipment.manufacturer,
                equipment.model,
                equipment.serial_number or '',
                str(equipment.capacity) if equipment.capacity else '',
                equipment.capacity_unit or '',
                str(equipment.height) if equipment.height else '',
                equipment.site_name or '',
                equipment.workplace_name or '',
                equipment.employer or '',
                equipment.department or '',
                equipment.inspector_name or '',
                equipment.manufacture_date.strftime(
                    '%d/%m/%Y') if equipment.manufacture_date else '',
                str(equipment.manufacture_year) if equipment.manufacture_year else '',
                equipment.purchase_date.strftime(
                    '%d/%m/%Y') if equipment.purchase_date else '',
                equipment.installation_date.strftime(
                    '%d/%m/%Y') if equipment.installation_date else '',
                equipment.last_inspection_date.strftime(
                    '%d/%m/%Y') if equipment.last_inspection_date else '',
                equipment.next_inspection_date.strftime(
                    '%d/%m/%Y') if equipment.next_inspection_date else '',
                equipment.description or '',
                equipment.notes or ''
            ]
            writer.writerow(row)

        return response

    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        """Export all equipment to Excel (.xlsx) with current filters applied"""
        # Apply filters to queryset
        queryset = self.filter_queryset(self.get_queryset())

        # Create workbook and worksheet
        wb = Workbook()
        ws = wb.active
        ws.title = "Equipment"

        # Define headers (Hebrew)
        headers = [
            'פריט ציוד', 'סוג ציוד', 'סטטוס', 'יצרן', 'דגם', 'מספר סידורי',
            'קיבולת', 'יחידת קיבולת', 'גובה', 'אתר', 'מקום עבודה', 'מעסיק',
            'מחלקה', 'בודק', 'תאריך ייצור', 'שנת ייצור', 'תאריך רכישה',
            'תאריך התקנה', 'בדיקה אחרונה', 'בדיקה הבאה', 'תיאור', 'הערות'
        ]

        # Style header row
        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(
            start_color="4472C4", end_color="4472C4", fill_type="solid")
        header_alignment = Alignment(horizontal="center", vertical="center")

        # Write headers
        for col_num, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col_num, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = header_alignment

        # Write data
        for row_num, equipment in enumerate(queryset, 2):
            ws.cell(row=row_num, column=1, value=equipment.equipment_number)
            ws.cell(row=row_num, column=2,
                    value=equipment.get_equipment_type_display())
            ws.cell(row=row_num, column=3,
                    value=equipment.get_status_display())
            ws.cell(row=row_num, column=4, value=equipment.manufacturer or '')
            ws.cell(row=row_num, column=5, value=equipment.model or '')
            ws.cell(row=row_num, column=6, value=equipment.serial_number or '')
            ws.cell(row=row_num, column=7, value=float(
                equipment.capacity) if equipment.capacity else '')
            ws.cell(row=row_num, column=8, value=equipment.capacity_unit or '')
            ws.cell(row=row_num, column=9, value=float(
                equipment.height) if equipment.height else '')
            ws.cell(row=row_num, column=10, value=equipment.site_name or '')
            ws.cell(row=row_num, column=11,
                    value=equipment.workplace_name or '')
            ws.cell(row=row_num, column=12, value=equipment.employer or '')
            ws.cell(row=row_num, column=13, value=equipment.department or '')
            ws.cell(row=row_num, column=14,
                    value=equipment.inspector_name or '')
            ws.cell(row=row_num, column=15, value=equipment.manufacture_date.strftime(
                '%d/%m/%Y') if equipment.manufacture_date else '')
            ws.cell(row=row_num, column=16,
                    value=equipment.manufacture_year or '')
            ws.cell(row=row_num, column=17, value=equipment.purchase_date.strftime(
                '%d/%m/%Y') if equipment.purchase_date else '')
            ws.cell(row=row_num, column=18, value=equipment.installation_date.strftime(
                '%d/%m/%Y') if equipment.installation_date else '')
            ws.cell(row=row_num, column=19, value=equipment.last_inspection_date.strftime(
                '%d/%m/%Y') if equipment.last_inspection_date else '')
            ws.cell(row=row_num, column=20, value=equipment.next_inspection_date.strftime(
                '%d/%m/%Y') if equipment.next_inspection_date else '')
            ws.cell(row=row_num, column=21, value=equipment.description or '')
            ws.cell(row=row_num, column=22, value=equipment.notes or '')

        # Auto-adjust column widths
        for column in ws.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if cell.value:
                        max_length = max(max_length, len(str(cell.value)))
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            ws.column_dimensions[column_letter].width = adjusted_width

        # Prepare response
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="equipment_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx"'
        wb.save(response)
        return response

    @action(detail=False, methods=['post'])
    def import_csv(self, request):
        """Import equipment from CSV file.

        Supports both the legacy positional CSV format and header-based CSV files.
        Header-based import recognizes common Hebrew headers (incl. the set used by
        the /equipment/import UI).
        """
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        csv_file = request.FILES['file']

        # Detect encoding
        raw_data = csv_file.read()
        result = chardet.detect(raw_data)
        encoding = result['encoding']

        # Decode file
        try:
            decoded_file = raw_data.decode(encoding)
        except:
            decoded_file = raw_data.decode('utf-8')

        # Detect delimiter (fallback to ';')
        sample = decoded_file[:4096]
        delimiter = ';'
        try:
            dialect = csv.Sniffer().sniff(
                sample, delimiters=[',', ';', '\t', '|'])
            delimiter = dialect.delimiter
        except Exception:
            if sample.count(';') >= sample.count(','):
                delimiter = ';'
            elif sample.count(',') > 0:
                delimiter = ','

        csv_reader = csv.DictReader(io.StringIO(
            decoded_file), delimiter=delimiter)
        if not csv_reader.fieldnames:
            return Response({'error': 'CSV file has no header row'}, status=status.HTTP_400_BAD_REQUEST)

        raw_headers = list(csv_reader.fieldnames)
        header_map = {raw: _normalize_header(raw) for raw in raw_headers}

        def rows_iter():
            for row_index, row in enumerate(csv_reader, start=2):
                normalized_row = {}
                for raw_key, raw_value in row.items():
                    normalized_key = header_map.get(
                        raw_key, _normalize_header(raw_key))
                    normalized_row[normalized_key] = raw_value
                yield (row_index, normalized_row)

        result = _import_normalized_rows(
            user=request.user, rows_iter=rows_iter())
        return Response(result)

    @action(detail=False, methods=['post'])
    def import_excel(self, request):
        """Import equipment from an Excel .xlsx file (first sheet)."""
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        excel_file = request.FILES['file']
        filename = getattr(excel_file, 'name', '') or ''
        if not filename.lower().endswith('.xlsx'):
            return Response({'error': 'Only .xlsx files are supported'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from io import BytesIO
            content = excel_file.read()
            wb = load_workbook(filename=BytesIO(content), data_only=True)
            ws = wb.active

            rows = ws.iter_rows(values_only=True)
            header_row = next(rows, None)
            if not header_row:
                return Response({'error': 'Excel file is empty'}, status=status.HTTP_400_BAD_REQUEST)

            raw_headers = [_normalize_header(h) for h in header_row]
            if all(h == '' for h in raw_headers):
                return Response({'error': 'Excel header row is empty'}, status=status.HTTP_400_BAD_REQUEST)

            def rows_iter():
                row_index = 2
                for values in rows:
                    if values is None:
                        row_index += 1
                        continue

                    # Build row dict by headers; trim trailing empty cells
                    normalized_row = {}
                    for col_index, header in enumerate(raw_headers):
                        if not header:
                            continue
                        cell_value = values[col_index] if col_index < len(
                            values) else None
                        if cell_value is None:
                            continue
                        normalized_row[header] = str(cell_value).strip() if not isinstance(
                            cell_value, (int, float)) else str(cell_value)

                    # Skip blank lines
                    if len(normalized_row) == 0:
                        row_index += 1
                        continue

                    yield (row_index, normalized_row)
                    row_index += 1

            result = _import_normalized_rows(
                user=request.user, rows_iter=rows_iter())
            return Response(result)

        except Exception as e:
            return Response({'error': f'Failed to import Excel: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
