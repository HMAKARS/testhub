# testsuite/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ApiTestCaseViewSet,
    UiTestCaseViewSet,
    UiTestScenarioViewSet,
    UiTestCaseRunView,
    ui_test_result_summary
)

router = DefaultRouter()
router.register(r"apitests", ApiTestCaseViewSet)
router.register(r"uitestcases", UiTestCaseViewSet)
router.register(r"uitests", UiTestScenarioViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("uitestcases/<int:pk>/run/", UiTestCaseRunView.as_view(), name="uitestcase-run"),
    path("uitests/results/summary/", ui_test_result_summary, name="ui-test-summary"),
]
