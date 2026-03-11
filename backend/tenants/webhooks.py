"""Stripe webhook handler for processing billing events."""

import logging
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from . import billing

logger = logging.getLogger(__name__)

HANDLED_EVENTS = {
    'checkout.session.completed',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_failed',
}


@csrf_exempt
@require_POST
def stripe_webhook(request):
    """
    Receive and process Stripe webhook events.
    Verifies the webhook signature before processing.
    """
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY

    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET

    if not webhook_secret:
        logger.error('STRIPE_WEBHOOK_SECRET not configured')
        return HttpResponse(status=400)

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        logger.error('Invalid Stripe webhook payload')
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        logger.error('Invalid Stripe webhook signature')
        return HttpResponse(status=400)

    event_type = event.get('type', '')
    event_data = event.get('data', {}).get('object', {})

    logger.info('Received Stripe event: %s', event_type)

    if event_type == 'checkout.session.completed':
        billing.handle_checkout_completed(event_data)

    elif event_type == 'customer.subscription.updated':
        billing.handle_subscription_updated(event_data)

    elif event_type == 'customer.subscription.deleted':
        billing.handle_subscription_deleted(event_data)

    elif event_type == 'invoice.payment_failed':
        billing.handle_invoice_payment_failed(event_data)

    return HttpResponse(status=200)
