# testhub/backend/e2e/analyzer_ai_openai.py

from pathlib import Path
import requests
import json

OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3"  # llama3, mistral 등 설치된 모델 이름

def analyze_project_with_ai_ollama(path: Path) -> dict:
    """
    Ollama 기반 AI를 사용해 업로드된 프로젝트의 프론트/백엔드 구조를 분석
    """
    # 최대 100개 파일까지만 요약
    all_files = [str(p.relative_to(path)) for p in path.rglob("*") if p.is_file()]
    structure_summary = "\n".join(all_files[:100])

    prompt = f"""
The following is the full file structure of a web application project:

{structure_summary}

Please detect the frontend and backend technology stacks used in this project, and recommend the entry point file(s) for each area.

Respond only in the following JSON format:

{{
  "frontend": {{
    "type": "react" | "vue" | "static_html" | "nextjs" | "svelte" | "astro" | "unknown",
    "entry": ["src/index.js", ...]
  }},
  "backend": {{
    "type": "django" | "flask" | "spring" | "laravel" | "nestjs" | "unknown",
    "entry": ["manage.py", "src/main/java/App.java", ...]
  }}
}}

"""

    try:
        res = requests.post(OLLAMA_API_URL, json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        })

        res.raise_for_status()
        raw_output = res.json()["response"]
        print(raw_output)

        try:
            return json.loads(raw_output)
        except Exception:
            return {
                "error": "AI 응답을 JSON으로 파싱할 수 없습니다.",
                "raw_response": raw_output
            }

    except Exception as e:
        return {
            "error": f"Ollama 요청 중 오류 발생: {str(e)}"
        }
