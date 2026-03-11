from rest_framework import serializers


class AuditModelMixin:
    """
    Mixin for ViewSets that automatically sets created_by/updated_by
    on create and update operations.
    """

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user,
        )

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
