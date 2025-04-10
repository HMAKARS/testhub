# backend/e2e/serializers.py
from rest_framework import serializers
from .models import UploadedProject

class UploadedProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedProject
        fields = ['id', 'zip_file', 'uploaded_at']
