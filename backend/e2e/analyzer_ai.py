from pathlib import Path
from decouple import config
from pathlib import Path
import openai
import os

open_api_key = config("OPENAI_API_KEY")
print(open_api_key)
openai.api_key = open_api_key
client = openai.OpenAI()

def analyze_project_with_ai(path: Path) -> dict:
    # 파일 목록 수집
    all_files = [str(p.relative_to(path)) for p in path.rglob("*") if p.is_file()]
    structure_summary = "\n".join(all_files[:100])  # 최대 100개만 출력

    prompt = f"""
당신은 숙련된 소프트웨어 아키텍트입니다.
다음은 어떤 웹 프로젝트의 전체 파일 구조입니다:

{structure_summary}

위 구조를 기반으로, 이 프로젝트의 프론트엔드와 백엔드 기술 스택을 추측해 주세요.
또한 각각의 진입점 파일(entry point)을 몇 개 추천해 주세요.
아래 형식으로 응답해 주세요:

{{ 
  "frontend": {{
    "type": "react" | "vue" | "static_html" | "nextjs" | "svelte" | "astro" | "unknown",
    "entry": ["src/main.js", ...]
  }},
  "backend": {{
    "type": "django" | "flask" | "spring" | "laravel" | "nestjs" | "unknown",
    "entry": ["app.py", "src/main/java/..."]
  }}
}}
"""

    # ✅ OpenAI 최신 포맷 적용
    chat_response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "당신은 숙련된 소프트웨어 아키텍트입니다."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
    )

    raw = chat_response.choices[0].message.content

    # JSON 추출 시도
    import json
    try:
        parsed = json.loads(raw)
        return parsed
    except Exception:
        return {
            "error": "AI 응답을 파싱할 수 없습니다.",
            "raw_response": raw
        }



def build_structure_string(path: Path, indent: str = "") -> str:
    lines = []
    for child in sorted(path.iterdir()):
        if child.name.startswith(".") or child.name == "__pycache__":
            continue
        if child.is_dir():
            lines.append(f"{indent}{child.name}/")
            lines.append(build_structure_string(child, indent + "  "))
        else:
            lines.append(f"{indent}{child.name}")
    return "\n".join(lines)
