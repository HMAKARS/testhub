import os
import zipfile
import tempfile

from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from pathlib import Path

from .analyzer import analyze_frontend, analyze_backend
from .analyzer_ai import analyze_project_with_ai


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
    ai_result = analyze_project_with_ai(Path(upload_path))

    return Response({
        "project": project_name,
        "frontend": ai_result.get("frontend", {"type": "unknown", "entry": []}),
        "backend": ai_result.get("backend", {"type": "unknown", "entry": []}),
        "note": "분석은 AI 기반으로 수행되었습니다."
    }, status=200)
