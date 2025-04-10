from django.urls import path
from .views import E2EUploadView , analyze_project

urlpatterns = [
    path("upload/", E2EUploadView.as_view(), name="e2e-upload"),
    path("analyze/", analyze_project, name="e2e-analyze"),  # ✅ 이 줄이 꼭 있어야 함!
]
