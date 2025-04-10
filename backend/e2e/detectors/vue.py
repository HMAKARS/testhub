from .base import BaseDetector
from pathlib import Path

class VueDetector(BaseDetector):
    @property
    def name(self):
        return "vue"

    def detect(self, component_type: str) -> bool:
        if component_type not in ["frontend", "backend"]:
            return False
        return (self.path / 'package.json').exists() and (self.path / 'src').exists()

    def entry_files(self, component_type: str) -> list:
        return [str(p.relative_to(self.path)) for p in self.path.rglob('main.js')]
