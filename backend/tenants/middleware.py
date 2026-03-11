from django.http import JsonResponse


class TenantMiddleware:
    """
    Resolves the tenant (company) for authenticated requests.
    Sets request.tenant to the user's company.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.tenant = None
        if hasattr(request, 'user') and request.user.is_authenticated:
            company = getattr(request.user, 'company', None)
            request.tenant = company
        return self.get_response(request)
