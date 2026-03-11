from rest_framework import viewsets, mixins, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Company, Site, Subscription, Invitation
from .serializers import (
    CompanySerializer,
    CompanyCreateSerializer,
    SiteSerializer,
    SubscriptionSerializer,
    InvitationSerializer,
    InvitationCreateSerializer,
    SignupSerializer,
    AcceptInvitationSerializer,
)
from core.permissions import IsAdmin, IsManagerOrAbove


class CompanyViewSet(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    Company settings for the current tenant.
    Only admins can update; managers can view.
    """
    serializer_class = CompanySerializer

    def get_object(self):
        return self.request.tenant

    def get_permissions(self):
        if self.action in ('update', 'partial_update'):
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated(), IsManagerOrAbove()]

    def retrieve(self, request, *args, **kwargs):
        tenant = request.tenant
        if not tenant:
            return Response(
                {'detail': 'No company associated with your account.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(tenant)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my')
    def my_company(self, request):
        """Shortcut to get the current user's company."""
        tenant = request.tenant
        if not tenant:
            return Response(
                {'detail': 'No company associated with your account.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(tenant)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='usage')
    def usage(self, request):
        """Get current usage stats for the company."""
        tenant = request.tenant
        if not tenant:
            return Response(
                {'detail': 'No company associated with your account.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        from equipment.models import Equipment
        from django.contrib.auth import get_user_model
        User = get_user_model()

        equipment_count = Equipment.objects.filter(company=tenant).count()
        user_count = User.objects.filter(
            company=tenant, is_active=True).count()
        site_count = tenant.sites.filter(is_active=True).count()

        return Response({
            'equipment': {'current': equipment_count, 'limit': tenant.max_equipment},
            'users': {'current': user_count, 'limit': tenant.max_users},
            'sites': {'current': site_count, 'limit': tenant.max_sites},
            'plan': tenant.plan,
        })


class SiteViewSet(viewsets.ModelViewSet):
    """Sites belonging to the current company."""
    serializer_class = SiteSerializer
    permission_classes = [IsAuthenticated, IsManagerOrAbove]

    def get_queryset(self):
        tenant = getattr(self.request, 'tenant', None)
        if tenant:
            return Site.objects.filter(company=tenant)
        return Site.objects.none()

    def perform_create(self, serializer):
        tenant = self.request.tenant
        # Check plan limit for sites
        current_sites = tenant.sites.filter(is_active=True).count()
        if current_sites >= tenant.max_sites:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                f'Plan limit reached: {current_sites}/{tenant.max_sites} sites. '
                f'Upgrade your plan to add more.'
            )
        serializer.save(company=tenant)


class SubscriptionViewSet(
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """Subscription info for the current company."""
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_object(self):
        tenant = self.request.tenant
        return Subscription.objects.filter(company=tenant).first()

    def retrieve(self, request, *args, **kwargs):
        subscription = self.get_object()
        if not subscription:
            return Response(
                {'detail': 'No subscription found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)


class InvitationViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Manage user invitations for the current company."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_class(self):
        if self.action == 'create':
            return InvitationCreateSerializer
        return InvitationSerializer

    def get_queryset(self):
        tenant = getattr(self.request, 'tenant', None)
        if tenant:
            return Invitation.objects.filter(company=tenant).select_related(
                'invited_by', 'accepted_by'
            )
        return Invitation.objects.none()

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['company'] = getattr(self.request, 'tenant', None)
        ctx['user'] = self.request.user
        return ctx

    def perform_create(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        if instance.status == 'pending':
            instance.status = 'cancelled'
            instance.save(update_fields=['status'])


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """Public endpoint: Create a new company with an admin user and trial subscription."""
    serializer = SignupSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    result = serializer.save()

    company = result['company']
    user = result['user']

    # Generate JWT tokens for immediate login
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)

    return Response({
        'company': CompanySerializer(company).data,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
        },
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        },
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def accept_invitation(request):
    """Public endpoint: Accept an invitation and create user account."""
    serializer = AcceptInvitationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    # Generate JWT tokens for immediate login
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)

    return Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'company': str(user.company_id),
        },
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        },
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def validate_invitation(request):
    """Check if an invitation token is still valid."""
    token = request.query_params.get('token')
    if not token:
        return Response(
            {'detail': 'Token parameter is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        invitation = Invitation.objects.select_related('company').get(
            token=token, status='pending'
        )
    except Invitation.DoesNotExist:
        return Response(
            {'valid': False, 'detail': 'Invalid or expired invitation.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if invitation.is_expired:
        invitation.status = 'expired'
        invitation.save(update_fields=['status'])
        return Response(
            {'valid': False, 'detail': 'This invitation has expired.'},
            status=status.HTTP_410_GONE,
        )

    return Response({
        'valid': True,
        'email': invitation.email,
        'role': invitation.role,
        'company_name': invitation.company.name,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout(request):
    """Create a Stripe Checkout session for upgrading the plan."""
    from . import billing

    tenant = getattr(request, 'tenant', None)
    if not tenant:
        return Response(
            {'detail': 'No company associated with your account.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    plan = request.data.get('plan')
    if plan not in ('starter', 'professional', 'enterprise'):
        return Response(
            {'detail': 'Invalid plan. Choose: starter, professional, enterprise.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    success_url = request.data.get(
        'success_url', request.build_absolute_uri('/settings?billing=success'))
    cancel_url = request.data.get(
        'cancel_url', request.build_absolute_uri('/settings?billing=cancelled'))

    try:
        session = billing.create_checkout_session(
            tenant, plan, success_url, cancel_url)
        return Response({'checkout_url': session.url, 'session_id': session.id})
    except ValueError as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_portal(request):
    """Create a Stripe Customer Portal session for managing billing."""
    from . import billing

    tenant = getattr(request, 'tenant', None)
    if not tenant:
        return Response(
            {'detail': 'No company associated with your account.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return_url = request.data.get(
        'return_url', request.build_absolute_uri('/settings'))

    try:
        session = billing.create_portal_session(tenant, return_url)
        return Response({'portal_url': session.url})
    except ValueError as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription_view(request):
    """Cancel the current subscription at period end."""
    from . import billing

    tenant = getattr(request, 'tenant', None)
    if not tenant:
        return Response(
            {'detail': 'No company associated with your account.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    result = billing.cancel_subscription(tenant)
    if result:
        return Response({'detail': 'Subscription will be cancelled at the end of the billing period.'})
    return Response(
        {'detail': 'No active subscription to cancel.'},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def billing_config(request):
    """Return publishable key and current plan info for the frontend."""
    from django.conf import settings as django_settings

    tenant = getattr(request, 'tenant', None)
    subscription = None
    if tenant:
        try:
            subscription = tenant.subscription
        except Exception:
            pass

    return Response({
        'publishable_key': django_settings.STRIPE_PUBLISHABLE_KEY,
        'plans': {
            'starter': {
                'name': 'Starter',
                'price_monthly': 99,
                'max_equipment': 200,
                'max_users': 10,
                'max_sites': 5,
            },
            'professional': {
                'name': 'Professional',
                'price_monthly': 299,
                'max_equipment': 1000,
                'max_users': 50,
                'max_sites': 20,
            },
            'enterprise': {
                'name': 'Enterprise',
                'price_monthly': 799,
                'max_equipment': 99999,
                'max_users': 9999,
                'max_sites': 999,
            },
        },
        'current_plan': tenant.plan if tenant else 'free',
        'subscription_status': subscription.status if subscription else None,
    })
