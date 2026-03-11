"""
Management command to assign existing data to a default company.
Run this after applying the multi-tenancy migrations to ensure
all existing records belong to a company.

Usage:
    python manage.py assign_default_company
    python manage.py assign_default_company --company-name "My Company"
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from tenants.models import Company, Subscription
from users.models import CustomUser
from equipment.models import Equipment
from core.models import ActivityLog, Notification
from inspections.models import InspectionReport, Inspection
from issues.models import Issue
from documents.models import Document
from maintenance.models import MaintenanceSchedule, MaintenanceTask


class Command(BaseCommand):
    help = 'Assign all existing records without a company to a default company'

    def add_arguments(self, parser):
        parser.add_argument(
            '--company-name',
            type=str,
            default='Default Company',
            help='Name for the default company (default: "Default Company")',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        company_name = options['company_name']

        # Get or create the default company
        company, created = Company.objects.get_or_create(
            name=company_name,
            defaults={
                'plan': 'professional',
                'max_equipment': 9999,
                'max_users': 999,
                'max_sites': 999,
                'max_storage_bytes': 100 * 1024 * 1024 * 1024,  # 100 GB
            },
        )

        if created:
            self.stdout.write(self.style.SUCCESS(
                f'Created company: {company_name}'))
            # Create a trial subscription for it
            Subscription.objects.create(
                company=company,
                plan='professional',
                status='active',
            )
        else:
            self.stdout.write(f'Using existing company: {company_name}')

        # Models to update (model_class, label)
        models_to_update = [
            (CustomUser, 'Users'),
            (Equipment, 'Equipment'),
            (ActivityLog, 'Activity Logs'),
            (Notification, 'Notifications'),
            (InspectionReport, 'Inspection Reports'),
            (Inspection, 'Inspections'),
            (Issue, 'Issues'),
            (Document, 'Documents'),
            (MaintenanceSchedule, 'Maintenance Schedules'),
            (MaintenanceTask, 'Maintenance Tasks'),
        ]

        total = 0
        for model, label in models_to_update:
            qs = model.objects.filter(company__isnull=True)
            count = qs.update(company=company)
            if count:
                self.stdout.write(f'  Updated {count} {label}')
                total += count

        if total:
            self.stdout.write(self.style.SUCCESS(
                f'\nTotal: {total} records assigned to "{company_name}"'))
        else:
            self.stdout.write(self.style.SUCCESS(
                '\nAll records already have a company assigned.'))
