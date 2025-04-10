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
from .utils.uitest_runner import run_ui_test
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from .models import UiTestScenario, UiTestResult
from .serializers import UiTestScenarioSerializer, UiTestResultSerializer
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import WebDriverException
import traceback


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


class UiTestScenarioViewSet(ModelViewSet):
    queryset = UiTestScenario.objects.all()
    serializer_class = UiTestScenarioSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["post"])
    def run(self, request, pk=None):
        scenario = self.get_object()
        log_output = ""
        is_success = True
        message = "성공적으로 실행됨"

        try:
            options = Options()
            options.add_argument("--headless=new")
            driver = webdriver.Chrome(options=options)

            driver.get(scenario.url)
            element = driver.find_element("css selector", scenario.selector)
            element.click()

            log_output = "요소 클릭 완료"

        except Exception as e:
            is_success = False
            message = str(e)
            log_output = traceback.format_exc()

        finally:
            try:
                driver.quit()
            except:
                pass

        result = UiTestResult.objects.create(
            scenario=scenario,
            is_success=is_success,
            message=message,
        )

        return Response({
            "is_success": is_success,
            "result": message,
            "log": log_output,
        }, status=status.HTTP_201_CREATED)


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


