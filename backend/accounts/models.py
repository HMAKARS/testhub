from django.db import models

# Create your models here.
# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ("admin", "관리자"),
        ("tester", "테스터"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="tester")
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)  # 기본 활성화

    def __str__(self):
        return self.username
