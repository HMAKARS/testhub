#!/bin/bash

BASE_DIR="testhub/backend/e2e"
DETECTOR_DIR="$BASE_DIR/detectors"

mkdir -p "$DETECTOR_DIR"

# detectors/__init__.py
cat > "$DETECTOR_DIR/__init__.py" << 'EOF'
from .django import DjangoDetector
from .flask import FlaskDetector
from .spring import SpringDetector
from .laravel import LaravelDetector
from .vue import VueDetector
from .react import ReactDetector
from .static_html import StaticHTMLDetector
from .nextjs import NextJSDetector
from .nestjs import NestJSDetector
from .svelte import SvelteDetector
from .astro import AstroDetector

def get_all_detectors():
    return [
        DjangoDetector,
        FlaskDetector,
        SpringDetector,
        LaravelDetector,
        VueDetector,
        ReactDetector,
        StaticHTMLDetector,
        NextJSDetector,
        NestJSDetector,
        SvelteDetector,
        AstroDetector,
    ]
EOF

# detectors/base.py
cat > "$DETECTOR_DIR/base.py" << 'EOF'
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
EOF

# 감지기 템플릿 생성 함수
generate_detector() {
    local filename="$1"
    local class_name="$2"
    local framework_name="$3"
    local detect_logic="$4"
    local entry_logic="$5"

    cat > "$DETECTOR_DIR/$filename" << EOF
from .base import BaseDetector
from pathlib import Path

class $class_name(BaseDetector):
    @property
    def name(self):
        return "$framework_name"

    def detect(self, component_type: str) -> bool:
        if component_type not in ["frontend", "backend"]:
            return False
$detect_logic

    def entry_files(self, component_type: str) -> list:
$entry_logic
EOF
}

# 각 감지기 생성
generate_detector "django.py" "DjangoDetector" "django" \
"        return (self.path / 'manage.py').exists()" \
"        return [str(p.relative_to(self.path)) for p in self.path.rglob('manage.py')]"

generate_detector "flask.py" "FlaskDetector" "flask" \
"        return any((self.path / f).exists() for f in ['app.py', 'wsgi.py'])" \
"        return [str(p.relative_to(self.path)) for p in self.path.rglob('app.py')]"

generate_detector "spring.py" "SpringDetector" "spring" \
"        return any((self.path / d).exists() for d in ['src/main/java', 'pom.xml'])" \
"        return [str(p.relative_to(self.path)) for p in self.path.rglob('Application.java')]"

generate_detector "laravel.py" "LaravelDetector" "laravel" \
"        return (self.path / 'artisan').exists()" \
"        return [str(p.relative_to(self.path)) for p in self.path.rglob('artisan')]"

generate_detector "vue.py" "VueDetector" "vue" \
"        return (self.path / 'package.json').exists() and (self.path / 'src').exists()" \
"        return [str(p.relative_to(self.path)) for p in self.path.rglob('main.js')]"

generate_detector "react.py" "ReactDetector" "react" \
"        return (self.path / 'package.json').exists() and (self.path / 'src').exists()" \
"        return [str(p.relative_to(self.path)) for p in self.path.rglob('index.js')]"

generate_detector "static_html.py" "StaticHTMLDetector" "static_html" \
"        return any(f.suffix == '.html' for f in self.path.glob('*.html'))" \
"        return [str(p.relative_to(self.path)) for p in self.path.rglob('*.html')]"

generate_detector "nextjs.py" "NextJSDetector" "nextjs" \
"        return (self.path / 'next.config.js').exists()" \
"        return [str(p.relative_to(self.path)) for p in self.path.rglob('pages/index.tsx')]"

generate_detector "nestjs.py" "NestJSDetector" "nestjs" \
"        return (self.path / 'main.ts').exists() and (self.path / 'src').exists()" \
"        return [str(p.relative_to(self.path)) for p in self.path.rglob('main.ts')]"

generate_detector "svelte.py" "SvelteDetector" "svelte" \
"        return (self.path / 'svelte.config.js').exists()" \
"        return [str(p.relative_to(self.path)) for p in self.path.rglob('src/main.js')]"

generate_detector "astro.py" "AstroDetector" "astro" \
"        return (self.path / 'astro.config.mjs').exists()" \
"        return [str(p.relative_to(self.path)) for p in self.path.rglob('src/pages/index.astro')]"

echo "✅ 감지기 파일 전체 생성 완료: $DETECTOR_DIR"
