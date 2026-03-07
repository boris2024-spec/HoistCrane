#!/usr/bin/env python
from django.db.models import Count
from equipment.models import Equipment
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hoistcraneproject.settings')
django.setup()


# Найти запись с данными
eq = Equipment.objects.exclude(model='').first()

if eq:
    print(f"Equipment Number: {eq.equipment_number}")
    print(f"Model: {eq.model}")
    print(f"Type: {eq.equipment_type}")
    print(f"Status: {eq.status}")
    print(f"Manufacturer: {eq.manufacturer}")
    print(f"Serial Number: {eq.serial_number}")
    print(f"Inspector: {eq.inspector_name}")
    print(f"Employer: {eq.employer}")
    print(f"Site: {eq.site_name}")
    print(f"Location: {eq.location_details}")
    print(f"Description: {eq.description[:200] if eq.description else 'None'}")
    print(f"Last inspection: {eq.last_inspection_date}")
    print(f"Next inspection: {eq.next_inspection_date}")
else:
    print("No equipment with model found")

# Статистика
print("\n" + "="*60)
print("Statistics:")
print(f"Total equipment: {Equipment.objects.count()}")

stats = Equipment.objects.values('equipment_type').annotate(
    count=Count('id')).order_by('-count')
print("\nBy equipment type:")
for stat in stats:
    print(f"  {stat['equipment_type']}: {stat['count']}")

print("\nBy status:")
stats = Equipment.objects.values('status').annotate(
    count=Count('id')).order_by('-count')
for stat in stats:
    print(f"  {stat['status']}: {stat['count']}")

# Проверим записи с данными
print("\n" + "="*60)
print("Sample equipment with data:")
for eq in Equipment.objects.exclude(model='')[:5]:
    print(
        f"  {eq.equipment_number}: {eq.model[:50]} ({eq.equipment_type}, {eq.status})")
