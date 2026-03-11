"""
Stripe billing service for HoistCrane SaaS.

Handles:
- Customer creation
- Checkout sessions for subscriptions
- Subscription management (upgrade/downgrade/cancel)
- Webhook processing
- Customer portal sessions
"""

import logging
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

# Plan limits configuration
PLAN_LIMITS = {
    'free': {
        'max_equipment': 50,
        'max_users': 3,
        'max_sites': 1,
        'max_storage_bytes': 1 * 1024 * 1024 * 1024,  # 1 GB
    },
    'starter': {
        'max_equipment': 200,
        'max_users': 10,
        'max_sites': 5,
        'max_storage_bytes': 10 * 1024 * 1024 * 1024,  # 10 GB
    },
    'professional': {
        'max_equipment': 1000,
        'max_users': 50,
        'max_sites': 20,
        'max_storage_bytes': 50 * 1024 * 1024 * 1024,  # 50 GB
    },
    'enterprise': {
        'max_equipment': 99999,
        'max_users': 9999,
        'max_sites': 999,
        'max_storage_bytes': 500 * 1024 * 1024 * 1024,  # 500 GB
    },
}


def _get_stripe():
    """Lazy-load and configure stripe module."""
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


def create_customer(company):
    """Create a Stripe customer for a company."""
    stripe = _get_stripe()
    if not stripe.api_key:
        logger.warning(
            'Stripe API key not configured, skipping customer creation')
        return None

    customer = stripe.Customer.create(
        name=company.name,
        email=company.contact_email or None,
        metadata={
            'company_id': str(company.id),
            'plan': company.plan,
        },
    )

    company.subscription.stripe_customer_id = customer.id
    company.subscription.save(update_fields=['stripe_customer_id'])

    logger.info('Created Stripe customer %s for company %s',
                customer.id, company.id)
    return customer


def create_checkout_session(company, plan, success_url, cancel_url):
    """
    Create a Stripe Checkout session for subscribing to a plan.
    Returns the session URL for redirecting the user.
    """
    stripe = _get_stripe()
    if not stripe.api_key:
        raise ValueError('Stripe is not configured')

    price_id = settings.STRIPE_PRICE_IDS.get(plan)
    if not price_id:
        raise ValueError(f'No Stripe price configured for plan: {plan}')

    subscription = company.subscription

    # Create Stripe customer if needed
    if not subscription.stripe_customer_id:
        customer = create_customer(company)
        customer_id = customer.id
    else:
        customer_id = subscription.stripe_customer_id

    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode='subscription',
        line_items=[{'price': price_id, 'quantity': 1}],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            'company_id': str(company.id),
            'plan': plan,
        },
    )

    return session


def create_portal_session(company, return_url):
    """Create a Stripe Customer Portal session for managing billing."""
    stripe = _get_stripe()
    if not stripe.api_key:
        raise ValueError('Stripe is not configured')

    subscription = company.subscription
    if not subscription.stripe_customer_id:
        raise ValueError('No Stripe customer found for this company')

    session = stripe.billing_portal.Session.create(
        customer=subscription.stripe_customer_id,
        return_url=return_url,
    )

    return session


def cancel_subscription(company):
    """Cancel a company's Stripe subscription at period end."""
    stripe = _get_stripe()
    if not stripe.api_key:
        logger.warning('Stripe API key not configured')
        return None

    subscription = company.subscription
    if not subscription.stripe_subscription_id:
        logger.warning(
            'No Stripe subscription to cancel for company %s', company.id)
        return None

    stripe_sub = stripe.Subscription.modify(
        subscription.stripe_subscription_id,
        cancel_at_period_end=True,
    )

    logger.info('Scheduled cancellation for subscription %s',
                subscription.stripe_subscription_id)
    return stripe_sub


def _apply_plan_limits(company, plan):
    """Update company limits based on the plan."""
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS['free'])
    company.plan = plan
    company.max_equipment = limits['max_equipment']
    company.max_users = limits['max_users']
    company.max_sites = limits['max_sites']
    company.max_storage_bytes = limits['max_storage_bytes']
    company.save(update_fields=[
        'plan', 'max_equipment', 'max_users', 'max_sites', 'max_storage_bytes',
    ])


def handle_checkout_completed(session):
    """Process a completed checkout session — activate subscription."""
    from .models import Company, Subscription, UsageRecord

    company_id = session.get('metadata', {}).get('company_id')
    plan = session.get('metadata', {}).get('plan', 'starter')

    if not company_id:
        logger.error('Checkout session missing company_id metadata')
        return

    try:
        company = Company.objects.get(id=company_id)
    except Company.DoesNotExist:
        logger.error('Company %s not found for checkout session', company_id)
        return

    stripe_subscription = session.get('subscription')

    subscription = company.subscription
    subscription.plan = plan
    subscription.status = 'active'
    subscription.stripe_subscription_id = stripe_subscription or ''
    subscription.current_period_start = timezone.now()
    subscription.save(update_fields=[
        'plan', 'status', 'stripe_subscription_id', 'current_period_start', 'updated_at',
    ])

    _apply_plan_limits(company, plan)

    # Record usage event
    UsageRecord.objects.create(
        company=company,
        metric='plan_upgrade',
        value=1,
        description=f'Upgraded to {plan} plan',
    )

    logger.info('Activated %s plan for company %s', plan, company_id)


def handle_subscription_updated(stripe_subscription):
    """Process subscription update events from Stripe."""
    from .models import Subscription
    from datetime import datetime

    stripe_sub_id = stripe_subscription.get('id')
    if not stripe_sub_id:
        return

    try:
        subscription = Subscription.objects.select_related('company').get(
            stripe_subscription_id=stripe_sub_id
        )
    except Subscription.DoesNotExist:
        logger.warning(
            'Subscription not found for Stripe ID %s', stripe_sub_id)
        return

    status_map = {
        'active': 'active',
        'past_due': 'past_due',
        'canceled': 'cancelled',
        'unpaid': 'past_due',
        'trialing': 'trial',
    }

    stripe_status = stripe_subscription.get('status', '')
    new_status = status_map.get(stripe_status, subscription.status)
    subscription.status = new_status

    # Update period
    period_start = stripe_subscription.get('current_period_start')
    period_end = stripe_subscription.get('current_period_end')
    if period_start:
        subscription.current_period_start = datetime.fromtimestamp(
            period_start, tz=timezone.utc
        )
    if period_end:
        subscription.current_period_end = datetime.fromtimestamp(
            period_end, tz=timezone.utc
        )

    subscription.save(update_fields=[
        'status', 'current_period_start', 'current_period_end', 'updated_at',
    ])

    logger.info('Updated subscription %s status to %s',
                stripe_sub_id, new_status)


def handle_subscription_deleted(stripe_subscription):
    """Handle subscription cancellation/deletion."""
    from .models import Subscription

    stripe_sub_id = stripe_subscription.get('id')
    if not stripe_sub_id:
        return

    try:
        subscription = Subscription.objects.select_related('company').get(
            stripe_subscription_id=stripe_sub_id
        )
    except Subscription.DoesNotExist:
        logger.warning(
            'Subscription not found for Stripe ID %s', stripe_sub_id)
        return

    subscription.status = 'cancelled'
    subscription.save(update_fields=['status', 'updated_at'])

    # Downgrade to free plan
    _apply_plan_limits(subscription.company, 'free')

    logger.info('Cancelled subscription %s, downgraded to free', stripe_sub_id)


def handle_invoice_payment_failed(invoice):
    """Handle failed invoice payment."""
    from .models import Subscription

    stripe_sub_id = invoice.get('subscription')
    if not stripe_sub_id:
        return

    try:
        subscription = Subscription.objects.get(
            stripe_subscription_id=stripe_sub_id
        )
    except Subscription.DoesNotExist:
        return

    subscription.status = 'past_due'
    subscription.save(update_fields=['status', 'updated_at'])

    logger.info('Invoice payment failed for subscription %s', stripe_sub_id)
