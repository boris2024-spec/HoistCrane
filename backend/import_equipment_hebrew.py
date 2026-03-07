#!/usr/bin/env python
"""
Import equipment data from Hebrew CSV file
"""
from django.contrib.auth import get_user_model
from equipment.models import Equipment
import os
import sys
import django
import csv
from datetime import datetime

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hoistcraneproject.settings')
django.setup()


User = get_user_model()


def parse_date(date_str):
    """Parse date in DD/MM/YYYY format"""
    if not date_str or date_str.strip() == '':
        return None
    try:
        # Try DD/MM/YYYY format
        return datetime.strptime(date_str.strip(), '%d/%m/%Y').date()
    except ValueError:
        try:
            # Try YYYY-MM-DD format
            return datetime.strptime(date_str.strip(), '%Y-%m-%d').date()
        except ValueError:
            print(f"Warning: Could not parse date: {date_str}")
            return None


def map_inspection_status(status_str):
    """Map Hebrew inspection status to English status"""
    status_map = {
        'בתוקף': 'active',  # Valid
        'לא בתוקף': 'inactive',  # Not valid
        'תקף': 'active',
        'לא תקף': 'inactive',
        'פעיל': 'active',
        '': 'active'  # Default
    }
    return status_map.get(status_str.strip(), 'active')


def map_equipment_type(type_str):
    """Map Hebrew equipment type to model choices"""
    type_map = {
        'מנוף הרמה': 'crane',  # Crane
        'גני ליפט': 'platform',  # Genie lift
        'מלגזה': 'forklift',  # Forklift
        'מעלית': 'elevator',  # Elevator
        '': 'other'
    }

    type_lower = type_str.lower().strip()

    # Check for partial matches
    if 'lift' in type_lower or 'ליפט' in type_lower or 'genie' in type_lower:
        return 'platform'
    elif 'מנוף' in type_lower or 'crane' in type_lower:
        return 'crane'
    elif 'מלגזה' in type_lower or 'forklift' in type_lower:
        return 'forklift'
    elif 'מעלית' in type_lower or 'elevator' in type_lower:
        return 'elevator'

    return type_map.get(type_str.strip(), 'other')


def import_equipment_from_csv(csv_file_path):
    """Import equipment from CSV file"""

    # Get or create default user for imports
    try:
        default_user = User.objects.get(username='admin')
    except User.DoesNotExist:
        default_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        print("Created default admin user")

    imported_count = 0
    updated_count = 0
    error_count = 0

    print(f"Opening CSV file: {csv_file_path}")

    # Try different encodings
    encodings = ['cp1255', 'windows-1255', 'utf-8-sig', 'iso-8859-8', 'latin1']
    file_content = None
    used_encoding = None

    for encoding in encodings:
        try:
            with open(csv_file_path, 'r', encoding=encoding, errors='replace') as f:
                file_content = f.read()
            used_encoding = encoding
            print(f"Successfully read file with encoding: {encoding}")
            break
        except Exception as e:
            print(f"Failed with {encoding}: {e}")
            continue

    if not file_content:
        print("Error: Could not read file with any supported encoding")
        return

    try:
        # Parse CSV from string
        import io
        csvfile = io.StringIO(file_content)

        # Try to detect delimiter
        sample = file_content[:1024]

        delimiter = ';' if ';' in sample else ','
        print(f"Using delimiter: '{delimiter}'")

        reader = csv.DictReader(csvfile, delimiter=delimiter)

        # Print headers for debugging
        print(f"CSV Headers: {reader.fieldnames}")

        for row_num, row in enumerate(reader, start=2):
            try:
                # Extract data from CSV columns
                # Adjust these field names based on actual CSV structure
                equipment_number = row.get(
                    'מספר ציוד', row.get('', '')).strip()

                if not equipment_number:
                    # Try to get from first column
                    equipment_number = list(row.values())[
                        0].strip() if row.values() else ''

                if not equipment_number or equipment_number == '':
                    print(f"Row {row_num}: Skipping - no equipment number")
                    continue

                # Get other fields with Hebrew names
                equipment_name = row.get(
                    'חברה', row.get('תאור ציוד', '')).strip()
                inspection_status = row.get(
                    'סטטוס פרט ציוד', row.get('סטטוס בדיקה', '')).strip()
                inspection_type = row.get('סטטוס פרט ציוד', '').strip()

                serial_number = row.get(
                    'מסלקד', row.get('מספר סידורי', '')).strip()
                location = row.get('מיקום', '').strip()
                employer = row.get('אתר / סרק', row.get('מזמין', '')).strip()
                manufacturer = row.get('יצרן', '').strip()
                site_name = row.get('אתר / סרק', '').strip()

                description = row.get('תאור', row.get('תאור', '')).strip()
                inspector = row.get('אחראי', row.get('בודק/ת', '')).strip()

                # Dates
                last_inspection = row.get(
                    'תאריך יישוא', row.get('בדיקה תקופתית', '')).strip()
                next_inspection = row.get(
                    'תקף עד', row.get('בדיקה תקופתית', '')).strip()

                # Map status
                status = map_inspection_status(inspection_status)

                # Map equipment type from name
                equipment_type = map_equipment_type(equipment_name)

                # Parse dates
                last_inspection_date = parse_date(last_inspection)
                next_inspection_date = parse_date(next_inspection)

                # Check if equipment exists
                equipment, created = Equipment.objects.update_or_create(
                    equipment_number=equipment_number,
                    defaults={
                        'equipment_type': equipment_type,
                        'status': status,
                        'manufacturer': manufacturer,
                        'model': equipment_name[:200] if equipment_name else '',
                        'serial_number': serial_number,
                        'site_name': site_name,
                        'employer': employer,
                        'location_details': location,
                        'description': description,
                        'inspector_name': inspector,
                        'last_inspection_date': last_inspection_date,
                        'next_inspection_date': next_inspection_date,
                        'created_by': default_user,
                        'updated_by': default_user,
                    }
                )

                if created:
                    imported_count += 1
                    print(
                        f"Row {row_num}: Created equipment {equipment_number}")
                else:
                    updated_count += 1
                    print(
                        f"Row {row_num}: Updated equipment {equipment_number}")

            except Exception as e:
                error_count += 1
                print(f"Row {row_num}: Error - {str(e)}")
                # Print first 200 chars of row data for debugging
                row_str = str(row)[:200]
                print(f"Row data (first 200 chars): {row_str}")
                continue

    except Exception as e:
        print(f"Error reading CSV: {str(e)}")
        return

    print("\n" + "="*60)
    print(f"Import completed!")
    print(f"Created: {imported_count}")
    print(f"Updated: {updated_count}")
    print(f"Errors: {error_count}")
    print(f"Total processed: {imported_count + updated_count}")
    print("="*60)


if __name__ == '__main__':
    if len(sys.argv) > 1:
        csv_file = sys.argv[1]
    else:
        # Default file path
        csv_file = 'Equipment_List_-_31-01-2026_167596.csv'

    if not os.path.exists(csv_file):
        print(f"File not found: {csv_file}")
        print(f"Usage: python import_equipment_hebrew.py <csv_file_path>")
        sys.exit(1)

    import_equipment_from_csv(csv_file)
