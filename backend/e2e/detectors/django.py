from .base import BaseDetector
from pathlib import Path

class DjangoDetector(BaseDetector):
    @property
    def name(self):
        return "django"

    def detect(self, component_type: str) -> bool:
        if component_type not in ["frontend", "backend"]:
            return False
        return (self.path / 'manage.py').exists()

    def entry_files(self, component_type: str) -> list:
        return [str(p.relative_to(self.path)) for p in self.path.rglob('manage.py')]
