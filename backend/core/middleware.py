import json
from .models import ActivityLog


def get_client_ip(request):
    """Extract client IP from request, handling proxied requests."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


class AuditMiddleware:
    """Middleware that logs create/update/delete API operations to ActivityLog."""

    AUDIT_METHODS = {'POST', 'PUT', 'PATCH', 'DELETE'}
    SKIP_PATHS = {'/api/token/', '/api/token/refresh/', '/api/schema/'}

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if (
            request.method not in self.AUDIT_METHODS
            or not hasattr(request, 'user')
            or not request.user.is_authenticated
        ):
            return response

        path = request.path
        if any(path.startswith(skip) for skip in self.SKIP_PATHS):
            return response

        # Only log successful mutations (2xx)
        if not (200 <= response.status_code < 300):
            return response

        action = self._get_action(request.method, path)
        entity_type = self._get_entity_type(path)

        if not entity_type:
            return response

        entity_id = self._extract_entity_id(path, response, request.method)
        entity_repr = self._get_entity_repr(response)

        try:
            ActivityLog.objects.create(
                user=request.user,
                company=getattr(request, 'tenant', None),
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                entity_repr=entity_repr[:300] if entity_repr else '',
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
            )
        except Exception:
            pass  # Never break the request due to audit logging

        return response

    def _get_action(self, method, path):
        if method == 'DELETE':
            return 'delete'
        if method == 'POST':
            if 'import' in path:
                return 'import'
            if 'export' in path:
                return 'export'
            if 'approve' in path:
                return 'approve'
            if 'resolve' in path:
                return 'resolve'
            return 'create'
        return 'update'  # PUT, PATCH

    def _get_entity_type(self, path):
        segments = [s for s in path.split('/') if s and s != 'api' and s != 'v1']
        if segments:
            return segments[0]  # equipment, inspections, documents, issues, users
        return None

    def _extract_entity_id(self, path, response, method):
        import uuid as uuid_mod
        # Try to get ID from URL path segments
        segments = [s for s in path.split('/') if s]
        for seg in segments:
            try:
                return uuid_mod.UUID(seg)
            except (ValueError, AttributeError):
                continue

        # For POST (create), try to get from response body
        if method == 'POST' and hasattr(response, 'data') and isinstance(response.data, dict):
            id_val = response.data.get('id')
            if id_val:
                try:
                    return uuid_mod.UUID(str(id_val))
                except (ValueError, AttributeError):
                    pass
        return None

    def _get_entity_repr(self, response):
        if hasattr(response, 'data') and isinstance(response.data, dict):
            for key in ('equipment_number', 'title', 'report_number', 'name', 'username'):
                val = response.data.get(key)
                if val:
                    return str(val)
        return ''
