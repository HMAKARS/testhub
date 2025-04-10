from .base import BaseDetector
from pathlib import Path

class FlaskDetector(BaseDetector):
    @property
    def name(self):
        return "flask"

    def detect(self, component_type: str) -> bool:
        if component_type not in ["frontend", "backend"]:
            return False
        return any((self.path / f).exists() for f in ['app.py', 'wsgi.py'])

    def entry_files(self, component_type: str) -> list:
        return [str(p.relative_to(self.path)) for p in self.path.rglob('app.py')]
