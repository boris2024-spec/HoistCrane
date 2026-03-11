from django.contrib import admin
from .models import Company, Site, Subscription, UsageRecord, Invitation


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'plan', 'is_active', 'created_at']
    list_filter = ['plan', 'is_active']
    search_fields = ['name', 'legal_name', 'tax_id']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'city', 'is_active']
    list_filter = ['is_active', 'country']
    search_fields = ['name', 'city', 'company__name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['company', 'plan', 'status',
                    'trial_end', 'current_period_end']
    list_filter = ['plan', 'status']
    search_fields = ['company__name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(UsageRecord)
class UsageRecordAdmin(admin.ModelAdmin):
    list_display = ['company', 'metric', 'value', 'recorded_at']
    list_filter = ['metric']
    search_fields = ['company__name']
    readonly_fields = ['id']


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = ['email', 'company', 'role',
                    'status', 'expires_at', 'created_at']
    list_filter = ['status', 'role']
    search_fields = ['email', 'company__name']
    readonly_fields = ['id', 'token', 'created_at']
