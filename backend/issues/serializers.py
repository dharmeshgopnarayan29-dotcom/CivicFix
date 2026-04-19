from rest_framework import serializers
from .models import Issue

class IssueSerializer(serializers.ModelSerializer):
    reporter_name = serializers.ReadOnlyField(source='reported_by.username')

    class Meta:
        model = Issue
        fields = '__all__'
        read_only_fields = ('reported_by', 'created_at', 'updated_at')
