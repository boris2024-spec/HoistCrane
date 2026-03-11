from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .webhooks import stripe_webhook

router = DefaultRouter()
router.register(r'company', views.CompanyViewSet, basename='company')
router.register(r'sites', views.SiteViewSet, basename='site')
router.register(r'subscription', views.SubscriptionViewSet,
                basename='subscription')
router.register(r'invitations', views.InvitationViewSet, basename='invitation')

urlpatterns = [
    path('', include(router.urls)),
    path('signup/', views.signup, name='signup'),
    path('accept-invitation/', views.accept_invitation, name='accept-invitation'),
    path('validate-invitation/', views.validate_invitation,
         name='validate-invitation'),
    # Billing / Stripe
    path('billing/config/', views.billing_config, name='billing-config'),
    path('billing/checkout/', views.create_checkout, name='billing-checkout'),
    path('billing/portal/', views.create_portal, name='billing-portal'),
    path('billing/cancel/', views.cancel_subscription_view, name='billing-cancel'),
    path('billing/webhook/', stripe_webhook, name='stripe-webhook'),
]
