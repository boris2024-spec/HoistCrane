from django.http import JsonResponse
from rest_framework import status


class TenantQuerySetMixin:
    """
    Automatically filters querysets by the current tenant (company).
    Use on ViewSets that have models with a 'company' ForeignKey.
    """

    tenant_field = 'company'

    def get_queryset(self):
        qs = super().get_queryset()
        tenant = getattr(self.request, 'tenant', None)
        if tenant:
            return qs.filter(**{self.tenant_field: tenant})
        return qs


class TenantCreateMixin:
    """
    Automatically assigns the company to new objects on creation.
    """

    tenant_field = 'company'

    def perform_create(self, serializer):
        tenant = getattr(self.request, 'tenant', None)
        if tenant:
            serializer.save(**{self.tenant_field: tenant})
        else:
            serializer.save()
