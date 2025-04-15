import os
import zipfile
import tempfile

from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from pathlib import Path

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import E2ETestScenario
from .serializers import E2ETestScenarioSerializer
from .executor import execute_scenario  # ✅ 시나리오 실행기 사용
from .scenario_generator import generate_test_scenarios


from .analyzer import analyze_frontend, analyze_backend
from .analyzer_ai_gemini import analyze_project_with_gemini
from .analyzer_ai_ollama import analyze_project_with_ai_ollama


class E2EUploadView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"detail": "파일이 제공되지 않았습니다."}, status=status.HTTP_400_BAD_REQUEST)

        if not uploaded_file.name.endswith(".zip"):
            return Response({"detail": "ZIP 형식의 파일만 업로드 가능합니다."}, status=status.HTTP_400_BAD_REQUEST)

        # 업로드 디렉토리 설정
        upload_root = os.path.join(settings.MEDIA_ROOT, "uploaded")
        os.makedirs(upload_root, exist_ok=True)

        # 프로젝트 이름으로 디렉토리 생성
        project_name = os.path.splitext(uploaded_file.name)[0]
        project_path = os.path.join(upload_root, project_name)
        os.makedirs(project_path, exist_ok=True)

        # 압축 해제
        with tempfile.TemporaryDirectory() as temp_dir:
            zip_path = os.path.join(temp_dir, uploaded_file.name)

            with open(zip_path, "wb") as f:
                for chunk in uploaded_file.chunks():
                    f.write(chunk)

            try:
                with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                    zip_ref.extractall(project_path)
            except zipfile.BadZipFile:
                return Response({"detail": "ZIP 파일이 손상되었거나 읽을 수 없습니다."},
                                status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "projectName": project_name,
            "detail": "✅ 업로드 및 압축 해제 성공",
        }, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def analyze_project(request):
    """
    업로드된 프로젝트 구조를 AI를 통해 분석
    """
    project_name = request.data.get("project_name")
    if not project_name:
        return Response({"error": "project_name is required."}, status=400)

    upload_path = os.path.join(settings.MEDIA_ROOT, "uploaded", project_name)
    if not os.path.exists(upload_path):
        return Response({"error": "해당 프로젝트가 존재하지 않습니다."}, status=404)

    # AI 분석기 실행
    ai_result = analyze_project_with_gemini(Path(upload_path))

    return Response({
        "project": project_name,
        "frontend": {
            "type": ai_result.get("frontend", {}).get("type", "unknown"),
            "entry": ai_result.get("frontend", {}).get("entry", [])
        },
        "backend": {
            "type": ai_result.get("backend", {}).get("type", "unknown"),
            "entry": ai_result.get("backend", {}).get("entry", [])
        },
        "note": "분석은 AI 기반으로 수행되었습니다."
    }, status=200)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_e2e_scenarios(request):
    project_name = request.data.get("project_name")
    failure_log = request.data.get("failure_log", None)
    print(failure_log)

    if not project_name:
        return Response({"error": "project_name is required"}, status=400)

    upload_path = os.path.join(settings.MEDIA_ROOT, "uploaded", project_name)
    if not os.path.exists(upload_path):
        return Response({"error": "해당 프로젝트가 존재하지 않습니다."}, status=404)

    result = generate_test_scenarios(Path(upload_path), failure_log=failure_log, project_name=project_name)
    print(result)

    if "error" in result:
        return Response(result, status=500)

    serializer = E2ETestScenarioSerializer(
        E2ETestScenario.objects.filter(project_name=project_name).order_by("-id")[:len(result["scenarios"])],
        many=True
    )

    return Response({"scenarios": serializer.data})

class E2ETestScenarioViewSet(viewsets.ModelViewSet):
    queryset = E2ETestScenario.objects.all().order_by("-created_at")
    serializer_class = E2ETestScenarioSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["post"])
    def run(self, request, pk=None):
        scenario = self.get_object()
        try:
            result = execute_scenario(scenario.steps)  # steps: List[Dict]
            return Response({
                "success": result["success"],
                "log": result["log"],
                "time_taken": result.get("time_taken", None)
            })
        except Exception as e:
            return Response({
                "success": False,
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data

        instance.name = data.get("name", instance.name)
        instance.steps = data.get("steps", instance.steps)
        instance.save()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def run_e2e_scenario_view(request, pk):
    try:
        scenario = E2ETestScenario.objects.get(pk=pk)
    except E2ETestScenario.DoesNotExist:
        return Response({"error": "시나리오를 찾을 수 없습니다."}, status=404)

    result = execute_scenario(scenario.steps)  # ✅ .steps만 넘겨야 함
    print(result)
    return Response(result, status=200)
