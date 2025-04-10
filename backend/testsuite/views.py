from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import ApiTestCase, UiTestCase, UiTestScenario, UiTestResult
from .serializers import (
    ApiTestCaseSerializer,
    UiTestCaseSerializer,
    UiTestScenarioSerializer,
    UiTestResultSerializer,
)
from django.utils.timezone import now, timedelta
from django.db.models.functions import TruncDate
from django.db.models import Count

class ApiTestCaseViewSet(viewsets.ModelViewSet):
    queryset = ApiTestCase.objects.all().order_by("-created_at")
    serializer_class = ApiTestCaseSerializer

    @action(detail=True, methods=["post"])
    def run(self, request, pk=None):
        instance = self.get_object()

        result = {
            "is_success": True,
            "status_code": 200,
            "response_body": {"message": "테스트 시나리오 정상 실행됨"},
        }

        return Response(result)


class UiTestCaseViewSet(viewsets.ModelViewSet):
    queryset = UiTestCase.objects.all()
    serializer_class = UiTestCaseSerializer


class UiTestScenarioViewSet(viewsets.ModelViewSet):
    queryset = UiTestScenario.objects.all()
    serializer_class = UiTestScenarioSerializer

    @action(detail=True, methods=["post"])
    def run(self, request, pk=None):
        scenario = self.get_object()

        # 테스트 로직 (임시)
        is_success = True
        message = "테스트가 성공적으로 실행되었습니다."

        result = UiTestResult.objects.create(
            scenario=scenario,
            test_case=scenario.test_case,  # 여기가 중요
            is_success=is_success,
            message=message,
        )

        return Response(UiTestResultSerializer(result).data, status=status.HTTP_201_CREATED)


class UiTestCaseRunView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        test_case = get_object_or_404(UiTestCase, pk=pk)

        result_data = {
            "is_success": True,
            "status_code": 200,
            "response_body": {"message": "OK"}
        }

        UiTestResult.objects.create(
            test_case=test_case,
            is_success=result_data["is_success"],
            status_code=result_data["status_code"],
            response_body=result_data["response_body"]
        )

        return Response(result_data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ui_test_result_summary(request):
    last_7_days = now() - timedelta(days=7)
    results = UiTestResult.objects.filter(executed_at__gte=last_7_days)

    total = results.count()
    success = results.filter(is_success=True).count()
    fail = results.filter(is_success=False).count()

    # ✅ 날짜 기준으로 그룹핑 (안전하고 DB 독립적)
    daily_counts = (
        results
        .annotate(day=TruncDate("executed_at"))
        .values("day")
        .annotate(count=Count("id"))
        .order_by("day")
    )

    return Response({
        "total": total,
        "success": success,
        "fail": fail,
        "daily": daily_counts,
    })
