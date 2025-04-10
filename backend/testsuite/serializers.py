from rest_framework import serializers
from .models import UiTestScenario, UiTestResult
from .models import ApiTestCase
from .models import UiTestCase

class ApiTestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApiTestCase
        fields = '__all__'

class UiTestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = UiTestCase
        fields = '__all__'


# testsuite/serializers.py

class UiTestScenarioSerializer(serializers.ModelSerializer):
    success_count = serializers.SerializerMethodField()
    fail_count = serializers.SerializerMethodField()
    total_runs = serializers.SerializerMethodField()

    class Meta:
        model = UiTestScenario
        fields = ['id', 'name', 'url', 'selector', 'created_at', 'success_count', 'fail_count', 'total_runs']

    def get_success_count(self, obj):
        return obj.results.filter(is_success=True).count()

    def get_fail_count(self, obj):
        return obj.results.filter(is_success=False).count()

    def get_total_runs(self, obj):
        return obj.results.count()


class UiTestScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = UiTestScenario
        fields = '__all__'

class UiTestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = UiTestResult
        fields = '__all__'


