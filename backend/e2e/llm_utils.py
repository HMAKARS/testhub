import google.generativeai as genai
from decouple import config
import json

genai.configure(api_key=config("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-pro")

def ask_scenario_llm(code_summary: str) -> list:
    """


    prompt =
당신은 숙련된 QA 엔지니어입니다.

아래는 웹 애플리케이션의 코드 요약입니다. 이 코드를 분석하여 사용자 관점에서 수행될 수 있는 **E2E 테스트 시나리오**를 자동 생성해 주세요.

⚠️ 특히 다음 항목을 꼭 반영해 주세요:
- form 제출 이후 redirect(페이지 이동)가 발생하면 이를 감지하고 포함해 주세요.
- redirect 흐름은 `wait_for_redirect` 액션으로 나타냅니다.
- 로그인 후 대시보드 이동, 신청 후 thank-you 페이지 이동 등도 포함해야 합니다.
- 유효성 검사나 필수 항목 누락은 테스트할 필요 없으니 생성하지 말아주세요.

각 시나리오는 다음과 같은 JSON 형식입니다:

[
  {{
    "name": "로그인 후 대시보드 이동 테스트",
    "steps": [
      {{ "action": "visit", "target": "/login" }},
      {{ "action": "input", "target": "#username", "value": "testuser" }},
      {{ "action": "input", "target": "#password", "value": "123456" }},
      {{ "action": "click", "target": "button[type=submit]" }},
      {{ "action": "wait_for_redirect", "target": "/dashboard" }},
      {{ "action": "assert_text", "target": "h1", "value": "환영합니다" }}
    ]
  }},
  ...
]

각 step에는 `action`, `target`, `value`가 포함될 수 있으며, `visit`, `input`, `click`, `assert`, `wait_for_redirect` 액션을 사용할 수 있습니다.

응답은 설명 없이 **JSON 배열만** 출력하세요.

코드 요약:
{code_summary}
     """

    try:
        res = model.generate_content(code_summary)
        raw = res.text
        raw_clean = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw_clean)

    except Exception as e:
        return {
            "error": str(e),
            "raw_response": raw if 'raw' in locals() else "N/A"
        }
