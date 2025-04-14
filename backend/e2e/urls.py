# e2e/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import E2EUploadView, analyze_project, E2ETestScenarioViewSet , run_e2e_scenario_view , generate_e2e_scenarios

router = DefaultRouter()
router.register("scenarios", E2ETestScenarioViewSet, basename="e2e-scenario")

urlpatterns = [
    path("upload/", E2EUploadView.as_view(), name="e2e-upload"),
    path("analyze/", analyze_project, name="e2e-analyze"),
    path("scenarios/<int:pk>/run/", run_e2e_scenario_view, name="e2e-run-scenario"),  # ✅ 시나리오 실행
    path("", include(router.urls)),  # ✅ 시나리오 관련 라우팅
    path("scenario/generate/", generate_e2e_scenarios, name="e2e-scenario-generate"),
]
