from rest_framework import serializers
from .models import ApiTestCase

class ApiTestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApiTestCase
        fields = '__all__'
