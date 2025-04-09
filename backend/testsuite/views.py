from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ApiTestCase
from .serializers import ApiTestCaseSerializer


class ApiTestCaseViewSet(viewsets.ModelViewSet):
    queryset = ApiTestCase.objects.all().order_by("-created_at")
    serializer_class = ApiTestCaseSerializer

    @action(detail=True, methods=["post"])
    def run(self, request, pk=None):
        instance = self.get_object()

        # 여기서 실제 테스트 실행기를 호출할 예정이지만 지금은 mock 처리
        result = {
            "is_success": True,
            "status_code": 200,
            "response_body": {"message": "테스트 시나리오 정상 실행됨"},
        }

        return Response(result)
