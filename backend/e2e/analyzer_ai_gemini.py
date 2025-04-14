from pathlib import Path
from decouple import config
import google.generativeai as genai
import json
import re

# 환경변수에서 API 키 가져오기
GEMINI_API_KEY = config("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")


def extract_json(text: str) -> str:
    """
    ```json ... ``` 블록 또는 중괄호만 존재할 때 JSON 추출
    """
    # ```json 코드 블록 안에 JSON이 있을 경우
    match = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        return match.group(1)

    # ``` 없이 순수 중괄호만 있는 경우
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return match.group(0)

    return None



def analyze_project_with_gemini(path: Path) -> dict:
    all_files = [str(p.relative_to(path)) for p in path.rglob("*") if p.is_file()]
    structure_summary = "\n".join(all_files[:100])

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

    try:
        response = model.generate_content(prompt)
        raw_text = response.text
        print("[Gemini 응답]:\n", raw_text)

        # 수정된 extract_json 함수 사용
        json_str = extract_json(raw_text)
        if not json_str:
            raise ValueError("❌ JSON 형식 응답을 추출할 수 없습니다.")

        parsed = json.loads(json_str)
        return parsed

    except Exception as e:
        return {
            "error": str(e),
            "raw_response": raw_text if 'raw_text' in locals() else "응답 없음"
        }

def generate_test_scenarios_with_ai(path: Path) -> list:
    """AI가 코드를 분석하고 테스트 시나리오를 자동 생성"""
    all_files = [str(p.relative_to(path)) for p in path.rglob("*.py") if "venv" not in str(p)]
    file_list_summary = "\n".join(all_files[:50])

    prompt = f"""
너는 시니어 QA 자동화 엔지니어야. 아래는 웹 백엔드 프로젝트의 전체 Python 파일 구조야:

{file_list_summary}

각 파일을 살펴보고, 사용자가 주로 사용하는 기능들에 대해 테스트 시나리오를 아래 형식으로 만들어줘:

[
  {{
    "name": "회원가입 성공 시나리오",
    "steps": [
      "POST /api/register/ 에 유효한 사용자 정보를 보낸다",
      "응답 코드가 201인지 확인한다"
    ]
  }},
  ...
]
"""

    response = model.generate_content(prompt)
    raw = response.text

    try:
        json_text = extract_json_from_text(raw)
        return json.loads(json_text)
    except Exception as e:
        return [{"error": str(e), "raw": raw}]

import re

def extract_json_from_text(text: str) -> str:
    """Gemini 응답에서 JSON만 추출"""
    match = re.search(r"```json\s*(\{.*?\}|\[.*?\])\s*```", text, re.DOTALL)
    return match.group(1) if match else text

def run_test_scenario(scenario: dict) -> dict:
    """시나리오를 실행하고 결과를 반환"""
    try:
        # 예시: 시나리오에 따라 HTTP 요청 수행
        import requests
        result_log = []
        for step in scenario["steps"]:
            result_log.append(f"실행: {step}")
            # 실제 실행 로직은 이후 구현 (ex: requests.post(), selenium 등)

        return {
            "name": scenario["name"],
            "success": True,
            "log": result_log
        }
    except Exception as e:
        return {
            "name": scenario.get("name", "Unknown"),
            "success": False,
            "log": [str(e)]
        }



