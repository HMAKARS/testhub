# backend/e2e/serializers.py
from rest_framework import serializers
from .models import UploadedProject,E2ETestScenario

class UploadedProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedProject
        fields = ['id', 'zip_file', 'uploaded_at']

class E2ETestScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = E2ETestScenario
        fields = '__all__'
