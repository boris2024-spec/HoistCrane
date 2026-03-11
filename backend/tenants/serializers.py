from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
import secrets

from .models import Company, Site, Subscription, UsageRecord, Invitation


class CompanySerializer(serializers.ModelSerializer):
    equipment_count = serializers.SerializerMethodField()
    user_count = serializers.SerializerMethodField()
    site_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id', 'name', 'legal_name', 'tax_id', 'industry', 'logo',
            'plan', 'max_equipment', 'max_users', 'max_sites', 'max_storage_bytes',
            'contact_email', 'contact_phone', 'website',
            'is_active', 'created_at', 'updated_at',
            'equipment_count', 'user_count', 'site_count',
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'equipment_count', 'user_count', 'site_count',
        ]

    def get_equipment_count(self, obj):
        return obj.equipment.count()

    def get_user_count(self, obj):
        return obj.users.filter(is_active=True).count()

    def get_site_count(self, obj):
        return obj.sites.filter(is_active=True).count()


class CompanyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['name', 'legal_name', 'tax_id', 'industry',
                  'contact_email', 'contact_phone', 'website']


class SiteSerializer(serializers.ModelSerializer):
    equipment_count = serializers.SerializerMethodField()

    class Meta:
        model = Site
        fields = [
            'id', 'company', 'name', 'address', 'city', 'district',
            'country', 'coordinates', 'contact_person', 'contact_phone',
            'floor_plan', 'is_active', 'created_at', 'updated_at',
            'equipment_count',
        ]
        read_only_fields = ['id', 'company',
                            'created_at', 'updated_at', 'equipment_count']

    def get_equipment_count(self, obj):
        return obj.equipment.count()


class SubscriptionSerializer(serializers.ModelSerializer):
    is_trial_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = Subscription
        fields = [
            'id', 'company', 'plan', 'status',
            'trial_start', 'trial_end', 'is_trial_active',
            'current_period_start', 'current_period_end',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields


class UsageRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsageRecord
        fields = ['id', 'company', 'metric', 'value', 'recorded_at']
        read_only_fields = fields


class InvitationSerializer(serializers.ModelSerializer):
    invited_by_name = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = Invitation
        fields = [
            'id', 'company', 'company_name', 'email', 'role',
            'invited_by', 'invited_by_name', 'status',
            'expires_at', 'created_at',
        ]
        read_only_fields = [
            'id', 'company', 'company_name', 'invited_by',
            'invited_by_name', 'status', 'expires_at', 'created_at',
        ]

    def get_invited_by_name(self, obj):
        if obj.invited_by:
            full = f"{obj.invited_by.first_name} {obj.invited_by.last_name}".strip()
            return full or obj.invited_by.username
        return None

    def get_company_name(self, obj):
        return obj.company.name


class InvitationCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(
        choices=['admin', 'manager', 'technician', 'viewer'],
        default='viewer',
    )

    def validate_email(self, value):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        company = self.context['company']
        # Check if user already exists in this company
        if User.objects.filter(email=value, company=company).exists():
            raise serializers.ValidationError(
                'User with this email already exists in this company.')
        # Check if there's already a pending invitation
        if Invitation.objects.filter(
            email=value, company=company, status='pending'
        ).exists():
            raise serializers.ValidationError(
                'A pending invitation already exists for this email.')
        return value

    def create(self, validated_data):
        company = self.context['company']
        user = self.context['user']
        invitation = Invitation.objects.create(
            company=company,
            email=validated_data['email'],
            role=validated_data['role'],
            invited_by=user,
            token=secrets.token_urlsafe(48),
            expires_at=timezone.now() + timedelta(days=7),
        )
        return invitation


class SignupSerializer(serializers.Serializer):
    """Signup flow: creates Company + Admin User + Trial Subscription."""
    company_name = serializers.CharField(max_length=300)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    first_name = serializers.CharField(
        max_length=150, required=False, default='')
    last_name = serializers.CharField(
        max_length=150, required=False, default='')

    def validate_email(self, value):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                'A user with this email already exists.')
        return value

    def create(self, validated_data):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        # 1. Create company
        company = Company.objects.create(
            name=validated_data['company_name'],
            contact_email=validated_data['email'],
            plan='free',
            max_equipment=50,
            max_users=3,
            max_sites=1,
        )

        # 2. Create admin user
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role='admin',
            company=company,
        )

        # 3. Create trial subscription (14 days)
        now = timezone.now()
        Subscription.objects.create(
            company=company,
            plan='free',
            status='trial',
            trial_start=now,
            trial_end=now + timedelta(days=14),
            current_period_start=now,
            current_period_end=now + timedelta(days=14),
        )

        return {'company': company, 'user': user}


class AcceptInvitationSerializer(serializers.Serializer):
    """Accept an invitation and create a user account."""
    token = serializers.CharField()
    password = serializers.CharField(min_length=8, write_only=True)
    first_name = serializers.CharField(
        max_length=150, required=False, default='')
    last_name = serializers.CharField(
        max_length=150, required=False, default='')

    def validate_token(self, value):
        try:
            invitation = Invitation.objects.get(token=value, status='pending')
        except Invitation.DoesNotExist:
            raise serializers.ValidationError(
                'Invalid or expired invitation token.')
        if invitation.is_expired:
            invitation.status = 'expired'
            invitation.save(update_fields=['status'])
            raise serializers.ValidationError('This invitation has expired.')
        self.invitation = invitation
        return value

    def create(self, validated_data):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        invitation = self.invitation
        user = User.objects.create_user(
            username=invitation.email,
            email=invitation.email,
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=invitation.role,
            company=invitation.company,
        )

        invitation.status = 'accepted'
        invitation.accepted_by = user
        invitation.save(update_fields=['status', 'accepted_by'])

        return user
