from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Only admin users can access."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsManagerOrAbove(BasePermission):
    """Admin or manager users can access."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('admin', 'manager')
        )


class IsViewerReadOnly(BasePermission):
    """
    Viewers can only read. Technicians, managers, and admins can write.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in ('admin', 'manager', 'technician')


class CanModifyEquipment(BasePermission):
    """
    Read: any authenticated user.
    Write: admin, manager, technician.
    Delete: admin, manager only.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        if request.method == 'DELETE':
            return request.user.role in ('admin', 'manager')
        return request.user.role in ('admin', 'manager', 'technician')


class CanManageUsers(BasePermission):
    """Only admins can manage users. Others can read."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role == 'admin'


class CanManageInspections(BasePermission):
    """
    Read: any authenticated user.
    Create/Update: admin, manager, technician.
    Delete: admin, manager.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        if request.method == 'DELETE':
            return request.user.role in ('admin', 'manager')
        return request.user.role in ('admin', 'manager', 'technician')


class CanManageIssues(BasePermission):
    """
    Read: any authenticated user.
    Create: any authenticated user (anyone can report).
    Update/Delete: admin, manager, or assigned technician.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS or request.method == 'POST':
            return True
        return request.user.role in ('admin', 'manager', 'technician')

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.role in ('admin', 'manager'):
            return True
        # Technicians can update issues assigned to them
        if request.user.role == 'technician':
            return obj.assigned_to == request.user
        return False


class CanManageDocuments(BasePermission):
    """
    Read: any authenticated user.
    Write: admin, manager, technician.
    Delete: admin, manager.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        if request.method == 'DELETE':
            return request.user.role in ('admin', 'manager')
        return request.user.role in ('admin', 'manager', 'technician')
