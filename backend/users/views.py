from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CustomUser
from .serializers import (
    UserSerializer, UserCreateSerializer,
    ProfileUpdateSerializer, ChangePasswordSerializer,
)
from core.permissions import CanManageUsers
from tenants.mixins import TenantQuerySetMixin


class UserViewSet(TenantQuerySetMixin, viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    permission_classes = [permissions.IsAuthenticated, CanManageUsers]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        if self.action in ('update_profile', 'me') and self.request.method in ('PATCH', 'PUT'):
            return ProfileUpdateSerializer
        return UserSerializer

    def perform_create(self, serializer):
        tenant = getattr(self.request, 'tenant', None)
        serializer.save(company=tenant)

    @action(detail=False, methods=['get', 'patch'],
            permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Get or update current user profile"""
        if request.method == 'PATCH':
            serializer = ProfileUpdateSerializer(
                request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(UserSerializer(request.user).data)
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'],
            permission_classes=[permissions.IsAuthenticated],
            url_path='change-password')
    def change_password(self, request):
        """Change current user's password"""
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not request.user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'old_password': 'סיסמה נוכחית שגויה'},
                status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'הסיסמה שונתה בהצלחה'})
