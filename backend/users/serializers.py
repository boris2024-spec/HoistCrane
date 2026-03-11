from rest_framework import serializers
from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'role', 'phone', 'organization', 'job_title', 'language',
                  'company', 'company_name', 'is_active',
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'company_name']

    def get_company_name(self, obj):
        return obj.company.name if obj.company else None


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for users to update their own profile."""
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'email', 'phone',
                  'job_title', 'language']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={
                                     'input_type': 'password'})

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'first_name', 'last_name',
                  'role', 'phone', 'organization', 'job_title']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user
