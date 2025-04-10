from .base import BaseDetector
from pathlib import Path

class SpringDetector(BaseDetector):
    @property
    def name(self):
        return "spring"

    def detect(self, component_type: str) -> bool:
        if component_type not in ["frontend", "backend"]:
            return False
        return any((self.path / d).exists() for d in ['src/main/java', 'pom.xml'])

    def entry_files(self, component_type: str) -> list:
        return [str(p.relative_to(self.path)) for p in self.path.rglob('Application.java')]
