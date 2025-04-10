from .base import BaseDetector
from pathlib import Path

class AstroDetector(BaseDetector):
    @property
    def name(self):
        return "astro"

    def detect(self, component_type: str) -> bool:
        if component_type not in ["frontend", "backend"]:
            return False
        return (self.path / 'astro.config.mjs').exists()

    def entry_files(self, component_type: str) -> list:
        return [str(p.relative_to(self.path)) for p in self.path.rglob('src/pages/index.astro')]
