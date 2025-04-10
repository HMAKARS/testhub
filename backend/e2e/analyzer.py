from pathlib import Path
from .detectors import get_all_detectors

def analyze_component(path: Path, component_type: str) -> dict:
    for DetectorClass in get_all_detectors():
        detector = DetectorClass(path)
        if detector.detect(component_type):
            return {
                "type": detector.name,
                "entry": detector.entry_files(component_type),
            }
    return {
        "type": "unknown",
        "entry": [],
    }

def analyze_frontend(path: Path) -> dict:
    return analyze_component(path, "frontend")

def analyze_backend(path: Path) -> dict:
    return analyze_component(path, "backend")
