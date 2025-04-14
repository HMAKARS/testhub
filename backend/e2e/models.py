from django.db import models

class UploadedProject(models.Model):
    zip_file = models.FileField(upload_to="e2e/projects/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

class ParsedFile(models.Model):
    project = models.ForeignKey(UploadedProject, on_delete=models.CASCADE, related_name="parsed_files")
    file_path = models.CharField(max_length=512)
    content = models.TextField()

class E2ETestScenario(models.Model):
    project_name = models.CharField(max_length=200)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    steps = models.JSONField(default=list)  # ✅ 이 줄 추가
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.project_name}] {self.name}"



