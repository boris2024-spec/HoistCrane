from rest_framework.exceptions import APIException
from rest_framework import status


class BusinessLogicError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'A business logic error occurred.'
    default_code = 'business_error'


class ResourceConflictError(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Resource conflict.'
    default_code = 'conflict'


class ResourceNotFoundError(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Resource not found.'
    default_code = 'not_found'


class PermissionDeniedError(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'You do not have permission to perform this action.'
    default_code = 'permission_denied'


class ImportError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Import failed.'
    default_code = 'import_error'
