import google.generativeai as genai
from decouple import config
import json

genai.configure(api_key=config("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")

def ask_scenario_llm(code_summary: str) -> list:
    prompt = f"""
당신은 숙련된 QA 엔지니어입니다.

아래는 웹 애플리케이션의 코드 요약입니다. 이 코드를 분석하여 사용자 관점에서 수행될 수 있는 E2E 테스트 시나리오 3~5개를 자동 생성해 주세요.

각 시나리오는 다음과 같은 JSON 형식이어야 합니다:

[
  {{
    "name": "로그인 테스트",
    "steps": [
      {{ "action": "visit", "target": "/login" }},
      {{ "action": "input", "target": "#username", "value": "testuser" }},
      {{ "action": "input", "target": "#password", "value": "123456" }},
      {{ "action": "click", "target": "button[type=submit]" }},
      {{ "action": "assert", "target": "h1", "value": "Welcome" }}
    ]
  }},
  ...
]

`steps`의 각 항목은 `action`, `target`, `value`를 포함할 수 있습니다.
- `visit`: 페이지 이동
- `input`: 입력 필드에 값 입력
- `click`: 버튼이나 요소 클릭
- `assert`: 특정 요소나 텍스트 존재 확인

응답은 반드시 위의 JSON 구조만 출력하세요. 설명이나 주석 없이 JSON만 반환하세요.
코드 요약:
{code_summary}
"""

    try:
        res = model.generate_content(prompt)
        raw = res.text

        # ```json ``` 제거
        raw_clean = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw_clean)

    except Exception as e:
        return {
            "error": str(e),
            "raw_response": raw if 'raw' in locals() else "N/A"
        }
