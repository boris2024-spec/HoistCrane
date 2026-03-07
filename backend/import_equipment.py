from django.contrib.auth import get_user_model
from equipment.models import Equipment
import os
import sys
import django
import csv
from datetime import datetime
import chardet

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hoistcraneproject.settings')
django.setup()


User = get_user_model()


def detect_encoding(file_path):
    """Detect file encoding"""
    with open(file_path, 'rb') as f:
        result = chardet.detect(f.read())
    return result['encoding']


def parse_date(date_str):
    """Parse date from various formats"""
    if not date_str or date_str.strip() == '':
        return None

    date_formats = [
        '%d/%m/%Y',
        '%d.%m.%Y',
        '%Y-%m-%d',
        '%d-%m-%Y',
    ]

    for fmt in date_formats:
        try:
            return datetime.strptime(date_str.strip(), fmt).date()
        except ValueError:
            continue

    print(f"Warning: Could not parse date: {date_str}")
    return None


def map_equipment_type(type_str):
    """Map Hebrew equipment type to English"""
    type_mapping = {
        'מנוף': 'crane',
        'מנופון': 'hoist',
        'מלגזה': 'forklift',
        'מעלית': 'elevator',
        'במה': 'platform',
    }

    if not type_str:
        return 'other'

    for hebrew, english in type_mapping.items():
        if hebrew in type_str:
            return english

    return 'other'


def import_equipment_from_csv(csv_file_path):
    """Import equipment data from CSV file"""

    # Detect encoding
    encoding = detect_encoding(csv_file_path)
    print(f"Detected encoding: {encoding}")

    # Try different encodings if detection fails
    encodings_to_try = [encoding, 'windows-1255',
                        'utf-8', 'iso-8859-8', 'cp1255']

    csv_data = None
    used_encoding = None

    for enc in encodings_to_try:
        try:
            with open(csv_file_path, 'r', encoding=enc) as f:
                csv_reader = csv.reader(f, delimiter=';')
                rows = list(csv_reader)
                used_encoding = enc
                print(f"Successfully read file with encoding: {enc}")
                break
        except Exception as e:
            print(f"Failed to read with encoding {enc}: {e}")
            continue

    if not rows or len(rows) < 2:
        print("Error: Could not read CSV file or file is empty")
        return

    # Get or create admin user for created_by field
    try:
        admin_user = User.objects.first()
    except:
        admin_user = None

    imported_count = 0
    error_count = 0
    skipped_count = 0

    # Skip header row
    for row_idx, row in enumerate(rows[1:], start=1):
        try:
            # CSV structure based on analysis:
            # 0: row_number
            # 1: equipment_type
            # 2: category_he
            # 3: status_active
            # 4: status_validation
            # 5: equipment_number
            # 6: site_name
            # 7: department
            # 8: workplace_name
            # 9: location_details
            # 10: manufacturer
            # 11: model
            # 12: serial_number
            # 13: description
            # 14: notes
            # 15: inspector_name
            # 16: inspection_dates (contains both last and next inspection dates)

            if len(row) < 16:
                print(
                    f"Skipping row {row_idx}: insufficient columns ({len(row)})")
                skipped_count += 1
                continue

            equipment_number = row[5].strip() if len(row) > 5 else ''
            if not equipment_number:
                print(f"Skipping row {row_idx}: no equipment number")
                skipped_count += 1
                continue

            # Skip if equipment already exists
            if Equipment.objects.filter(equipment_number=equipment_number).exists():
                print(
                    f"Equipment {equipment_number} already exists, skipping...")
                skipped_count += 1
                continue

            equipment_type_raw = row[1].strip() if len(row) > 1 else ''
            manufacturer = row[10].strip() if len(row) > 10 else ''
            model = row[11].strip() if len(row) > 11 else ''
            serial_number = row[12].strip() if len(row) > 12 else ''
            description = row[13].strip() if len(row) > 13 else ''
            notes = row[14].strip() if len(row) > 14 else ''
            inspector_name = row[15].strip() if len(row) > 15 else ''

            site_name = row[6].strip() if len(row) > 6 else ''
            department = row[7].strip() if len(row) > 7 else ''
            workplace_name = row[8].strip() if len(row) > 8 else ''
            location_details = row[9].strip() if len(row) > 9 else ''

            # Extract dates from column 16
            last_inspection_date = None
            next_inspection_date = None
            if len(row) > 16 and row[16]:
                import re
                dates_text = row[16]
                date_pattern = r'\d{2}/\d{2}/\d{4}'
                found_dates = re.findall(date_pattern, dates_text)
                if len(found_dates) >= 1:
                    last_inspection_date = parse_date(found_dates[0])
                if len(found_dates) >= 2:
                    next_inspection_date = parse_date(found_dates[1])

            # Create Equipment object
            equipment = Equipment.objects.create(
                equipment_number=equipment_number,
                equipment_type=map_equipment_type(equipment_type_raw),
                manufacturer=manufacturer or '',
                model=model or '',
                serial_number=serial_number or None,
                site_name=site_name,
                department=department,
                workplace_name=workplace_name,
                location_details=location_details,
                description=description[:500] if description else '',
                notes=notes,
                inspector_name=inspector_name,
                last_inspection_date=last_inspection_date,
                next_inspection_date=next_inspection_date,
                status='active',
                created_by=admin_user,
                updated_by=admin_user,
            )

            imported_count += 1
            if imported_count % 100 == 0:
                print(f"Imported {imported_count} records...")

        except Exception as e:
            error_count += 1
            print(f"Error importing row {row_idx}: {e}")
            if error_count < 5:  # Show first 5 errors
                print(f"Row data: {row[:10]}")  # First 10 columns only
            continue

    print(f"\n{'='*50}")
    print(f"Import completed!")
    print(f"Successfully imported: {imported_count}")
    print(f"Skipped: {skipped_count}")
    print(f"Errors: {error_count}")
    print(f"{'='*50}")


if __name__ == '__main__':
    csv_file = 'equipment_import.csv'

    if not os.path.exists(csv_file):
        print(f"Error: File {csv_file} not found!")
        print("Please place the CSV file in the backend directory")
        sys.exit(1)

    print("Starting equipment import...")
    print(f"CSV file: {csv_file}")

    import_equipment_from_csv(csv_file)
