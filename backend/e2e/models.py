from django.db import models

# Create your models here.
# backend/e2e/models.py
from django.db import models

class UploadedProject(models.Model):
    zip_file = models.FileField(upload_to="e2e/projects/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

class ParsedFile(models.Model):
    project = models.ForeignKey(UploadedProject, on_delete=models.CASCADE, related_name="parsed_files")
    file_path = models.CharField(max_length=512)
    content = models.TextField()
