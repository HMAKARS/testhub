from django.db import models

# Create your models here.
from django.db import models

class ApiTestCase(models.Model):
    name = models.CharField(max_length=100)
    platform = models.CharField(max_length=20, choices=[
        ("web", "Web"),
        ("mobile", "Mobile"),
        ("desktop", "Desktop"),
    ])
    action = models.CharField(max_length=50)  # 예: click, input
    target = models.CharField(max_length=200)  # CSS selector 또는 컴포넌트 ID

    # assertion을 JSON 형태로 저장 (ex: {"type": "text_present", "value": "출력 완료"})
    assertion = models.JSONField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.platform}] {self.name}"

class UiTestCase(models.Model):
    name = models.CharField(max_length=100)
    url = models.URLField()
    selector = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class UiTestScenario(models.Model):
    name = models.CharField(max_length=100)
    url = models.URLField()
    selector = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# testsuite/models.py

class UiTestResult(models.Model):
    scenario = models.ForeignKey(
        "UiTestScenario", on_delete=models.CASCADE, related_name="results",
        null=True, blank=True  # test_case 말고 scenario
    )
    is_success = models.BooleanField(default=False)
    status_code = models.IntegerField(null=True, blank=True)
    response_body = models.JSONField(null=True, blank=True)
    message = models.TextField(null=True, blank=True)  # 메시지 필드 추가
    executed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Result for {self.test_case.name if self.test_case else 'Unknown'} at {self.executed_at}"


