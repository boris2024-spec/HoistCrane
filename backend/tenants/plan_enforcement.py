from django.http import JsonResponse


class PlanEnforcementMiddleware:
    """
    Enforces plan limits (max equipment, users, sites) on create operations.
    Returns 403 if the company has exceeded its plan limits.
    """

    ENFORCEMENT_PATHS = {
        'equipment': 'max_equipment',
        'users': 'max_users',
        'sites': 'max_sites',
    }

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if (
            request.method == 'POST'
            and hasattr(request, 'user')
            and request.user.is_authenticated
        ):
            tenant = getattr(request, 'tenant', None)
            if tenant:
                violation = self._check_limits(request, tenant)
                if violation:
                    return JsonResponse(
                        {
                            'detail': violation,
                            'code': 'plan_limit_exceeded',
                        },
                        status=403,
                    )

        return self.get_response(request)

    def _check_limits(self, request, tenant):
        path = request.path.rstrip('/')
        segments = [s for s in path.split('/') if s and s not in ('api', 'v1')]
        if not segments:
            return None

        resource = segments[0]

        # Only check on list endpoints (creating new objects)
        # Skip sub-actions like /equipment/{id}/photos/
        path_parts = [s for s in path.split('/') if s]
        # Count non-api/v1 parts: if resource + id + sub = 3+ => sub-action
        non_prefix = [s for s in path_parts if s not in ('api', 'v1')]
        if len(non_prefix) > 1:
            return None

        if resource == 'equipment':
            from equipment.models import Equipment
            current = Equipment.objects.filter(company=tenant).count()
            if current >= tenant.max_equipment:
                return (
                    f'Plan limit reached: {current}/{tenant.max_equipment} equipment. '
                    f'Upgrade your plan to add more.'
                )

        elif resource == 'users':
            from django.contrib.auth import get_user_model
            User = get_user_model()
            current = User.objects.filter(
                company=tenant, is_active=True).count()
            if current >= tenant.max_users:
                return (
                    f'Plan limit reached: {current}/{tenant.max_users} users. '
                    f'Upgrade your plan to add more.'
                )

        return None
