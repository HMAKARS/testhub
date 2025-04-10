from pathlib import Path
from abc import ABC, abstractmethod

class BaseDetector(ABC):
    def __init__(self, path: Path):
        self.path = path

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def detect(self, component_type: str) -> bool:
        pass

    @abstractmethod
    def entry_files(self, component_type: str) -> list:
        pass
