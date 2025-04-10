from .base import BaseDetector
from pathlib import Path

class NestJSDetector(BaseDetector):
    @property
    def name(self):
        return "nestjs"

    def detect(self, component_type: str) -> bool:
        if component_type not in ["frontend", "backend"]:
            return False
        return (self.path / 'main.ts').exists() and (self.path / 'src').exists()

    def entry_files(self, component_type: str) -> list:
        return [str(p.relative_to(self.path)) for p in self.path.rglob('main.ts')]
