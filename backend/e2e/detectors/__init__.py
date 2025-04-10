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
