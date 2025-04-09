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
