from .base import BaseDetector
from pathlib import Path

class StaticHTMLDetector(BaseDetector):
    @property
    def name(self):
        return "static_html"

    def detect(self, component_type: str) -> bool:
        if component_type not in ["frontend", "backend"]:
            return False
        return any(f.suffix == '.html' for f in self.path.glob('*.html'))

    def entry_files(self, component_type: str) -> list:
        return [str(p.relative_to(self.path)) for p in self.path.rglob('*.html')]
