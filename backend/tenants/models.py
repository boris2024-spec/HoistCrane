from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
import uuid


class Company(models.Model):
    """Organization / tenant in the SaaS platform."""

    PLAN_CHOICES = [
        ('free', 'Free'),
        ('starter', 'Starter'),
        ('professional', 'Professional'),
        ('enterprise', 'Enterprise'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=300, verbose_name='שם חברה')
    legal_name = models.CharField(
        max_length=300, blank=True, verbose_name='שם משפטי')
    tax_id = models.CharField(max_length=50, blank=True, verbose_name='ח.פ.')
    industry = models.CharField(
        max_length=100, blank=True, verbose_name='תעשייה')
    logo = models.ImageField(upload_to='companies/logos/',
                             blank=True, verbose_name='לוגו')

    # Subscription plan
    plan = models.CharField(
        max_length=20, choices=PLAN_CHOICES, default='free', verbose_name='תוכנית')
    max_equipment = models.IntegerField(
        default=50, verbose_name='מקסימום ציוד')
    max_users = models.IntegerField(default=3, verbose_name='מקסימום משתמשים')
    max_sites = models.IntegerField(default=1, verbose_name='מקסימום אתרים')
    max_storage_bytes = models.BigIntegerField(
        default=1073741824, verbose_name='אחסון מקסימלי (בייט)')  # 1 GB

    # Company-specific settings
    settings = models.JSONField(default=dict, blank=True)

    # Contact
    contact_email = models.EmailField(
        blank=True, verbose_name='אימייל ליצירת קשר')
    contact_phone = models.CharField(
        max_length=20, blank=True, verbose_name='טלפון')
    website = models.URLField(max_length=300, blank=True, verbose_name='אתר')

    is_active = models.BooleanField(default=True, verbose_name='פעיל')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'companies'
        verbose_name = 'Company'
        verbose_name_plural = 'Companies'
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def plan_limits(self):
        """Return the limits for the current plan."""
        return {
            'max_equipment': self.max_equipment,
            'max_users': self.max_users,
            'max_sites': self.max_sites,
            'max_storage_bytes': self.max_storage_bytes,
        }


class Site(models.Model):
    """Physical location / site belonging to a company."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name='sites')
    name = models.CharField(max_length=300, verbose_name='שם אתר')
    address = models.TextField(blank=True, verbose_name='כתובת')
    city = models.CharField(max_length=200, blank=True, verbose_name='עיר')
    district = models.CharField(
        max_length=200, blank=True, verbose_name='מחוז')
    country = models.CharField(
        max_length=100, default='Israel', verbose_name='מדינה')
    coordinates = models.JSONField(
        # {"lat": 32.08, "lng": 34.78}
        null=True, blank=True, verbose_name='קואורדינטות')
    contact_person = models.CharField(
        max_length=200, blank=True, verbose_name='איש קשר')
    contact_phone = models.CharField(
        max_length=20, blank=True, verbose_name='טלפון')
    floor_plan = models.FileField(
        upload_to='sites/plans/', blank=True, verbose_name='תוכנית קומה')

    is_active = models.BooleanField(default=True, verbose_name='פעיל')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sites'
        verbose_name = 'Site'
        verbose_name_plural = 'Sites'
        ordering = ['name']
        indexes = [
            models.Index(fields=['company', 'name']),
        ]

    def __str__(self):
        return f"{self.name} ({self.company.name})"


class Subscription(models.Model):
    """Billing subscription for a company."""

    STATUS_CHOICES = [
        ('trial', 'Trial'),
        ('active', 'Active'),
        ('past_due', 'Past Due'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.OneToOneField(
        Company, on_delete=models.CASCADE, related_name='subscription')
    plan = models.CharField(
        max_length=20, choices=Company.PLAN_CHOICES, default='free')
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='trial')

    # Stripe integration (prepared for future)
    stripe_customer_id = models.CharField(max_length=100, blank=True)
    stripe_subscription_id = models.CharField(max_length=100, blank=True)

    # Trial
    trial_start = models.DateTimeField(null=True, blank=True)
    trial_end = models.DateTimeField(null=True, blank=True)

    # Billing period
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'subscriptions'
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'

    def __str__(self):
        return f"{self.company.name} — {self.plan} ({self.status})"

    @property
    def is_trial_active(self):
        if self.status != 'trial' or not self.trial_end:
            return False
        from django.utils import timezone
        return timezone.now() < self.trial_end


class UsageRecord(models.Model):
    """Track resource usage for metered billing and plan enforcement."""

    METRIC_CHOICES = [
        ('equipment_count', 'Equipment Count'),
        ('user_count', 'User Count'),
        ('site_count', 'Site Count'),
        ('storage_bytes', 'Storage Bytes'),
        ('api_calls', 'API Calls'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name='usage_records')
    metric = models.CharField(max_length=50, choices=METRIC_CHOICES)
    value = models.BigIntegerField(validators=[MinValueValidator(0)])
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'usage_records'
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['company', 'metric', '-recorded_at']),
        ]

    def __str__(self):
        return f"{self.company.name} — {self.metric}: {self.value}"


class Invitation(models.Model):
    """User invitation for a company."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name='invitations')
    email = models.EmailField(verbose_name='אימייל')
    role = models.CharField(max_length=20, default='viewer')
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='sent_invitations')
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending')
    token = models.CharField(max_length=64, unique=True)
    accepted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='accepted_invitations')
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'invitations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['company', 'status']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return f"Invitation for {self.email} to {self.company.name}"

    @property
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at
