from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApiTestCaseViewSet

router = DefaultRouter()
router.register(r'apitests', ApiTestCaseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
