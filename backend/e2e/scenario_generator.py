from pathlib import Path
from .llm_utils import ask_scenario_llm
from .models import E2ETestScenario
from .html_constraints import extract_input_constraints
import re
import os
import json


def collect_code_snippets(path: Path, max_files: int = 20) -> str:
    extensions = [".py", ".js", ".ts", ".jsx", ".tsx", ".html"]
    files = [p for p in path.rglob("*") if p.suffix in extensions and p.is_file()]
    files = files[:max_files]
    snippets = []
    for file in files:
        try:
            content = file.read_text(encoding="utf-8")
            snippets.append(f"--- {file} ---\n{content[:3000]}\n")
        except Exception as e:
            print(f"⚠️ {file} 읽기 실패: {e}")
    return "\n".join(snippets)


def normalize_asserts(scenarios: list, constraints: list) -> list:
    selector_to_error = {}
    for c in constraints:
        if not c.get("selector"):
            continue
        label = c.get("label") or c.get("placeholder") or c.get("title") or c.get("name")
        message = f"{label}은 필수 항목입니다." if c.get("required") else f"{label}의 입력값이 유효하지 않습니다."
        selector_to_error[c["selector"]] = message

    for scenario in scenarios:
        for step in scenario.get("steps", []):
            if step.get("action") == "assert":
                step["action"] = "assert_text"
                selector = step.get("target")
                step["value"] = selector_to_error.get(selector, "유효하지 않은 입력입니다.")
                step.pop("target", None)
    return scenarios


def normalize_radio_inputs(scenarios: list) -> list:
    for scenario in scenarios:
        for step in scenario.get("steps", []):
            if step.get("action") == "input" and "value=" in step.get("target", ""):
                step["action"] = "click"
                step.pop("value", None)
    return scenarios


def patch_failed_steps(scenarios: list) -> list:
    for scenario in scenarios:
        for step in scenario.get("steps", []):
            if step.get("action") == "assert_text" and not step.get("value"):
                step["value"] = "필수 항목입니다"
    return scenarios


def auto_repair_failed_log(scenarios: list, failure_log: str) -> list:
    for scenario in scenarios:
        for step in scenario.get("steps", []):
            if "invalid element state" in failure_log:
                if step.get("action") == "input" and "value=" in step.get("target", ""):
                    step["action"] = "click"
                    step.pop("value", None)
            if "텍스트 없음" in failure_log and step.get("action") == "assert_text":
                match = re.search(r"텍스트 없음: '(.+?)'", failure_log)
                if match:
                    step["value"] = match.group(1)
    return scenarios


def generate_test_scenarios(path: Path, failure_log: str = None, project_name: str = None) -> dict:
    source_code = collect_code_snippets(path)

    constraint_files = [
        f for f in path.rglob("*.html")
        if "MACOSX" not in str(f) and not f.name.startswith("._")
    ]
    constraints = []
    for html_file in constraint_files:
        try:
            constraints.extend(extract_input_constraints(html_file))
        except UnicodeDecodeError as e:
            print(f"⚠️ HTML 분석 실패: {html_file} - {e}")

    prompt = f"""
당신은 숙련된 QA 엔지니어입니다.

아래는 웹 애플리케이션의 코드 요약과 입력 필드의 유효성 조건(필수, 제약 조건 등) 목록입니다. 
이 정보를 바탕으로 실제 사용자 관점에서 수행될 수 있는 E2E 테스트 시나리오를 JSON 배열 형식으로 생성해 주세요.

### 주의 사항:
- 숫자, 나이, 이메일 등 형식이 제한된 필드에 잘못된 값이 입력된 경우를 고려하세요.
- form 제출 후 페이지 이동(redirect)이 있다면 `wait_for_redirect` 액션을 사용하세요.
- form 제출 후 유효성 메시지나 결과가 뜨기까지 잠깐의 지연이 있을 수 있으므로,
  `click` 후 반드시 `wait` 또는 `wait_for` 액션을 추가하세요. 
- 버튼 클릭 후 UI가 반응하기까지 잠시 기다려야 한다면 `wait` 액션을 `click` 바로 다음에 추가하세요.
- 가능한 경우 validator 또는 서버 측 검증 조건에 따른 assert도 작성하세요.
- assert_text는 HTML 또는 라벨 기반 예상 메시지를 기반으로 작성하세요.
- 메시지를 임의로 추측하지 말고, placeholder, title, label 등의 UI 텍스트를 바탕으로 유추하세요.
- 로그인 후 대시보드 이동, 신청 후 thank-you 페이지 이동 등도 반드시 포함하세요.
- 유효성 검사나 필수 항목 누락은 테스트할 필요 없으니 생성하지 말아주세요 
- 제출 성공 테스트만 생성해주세요. 

출력은 JSON 배열로만 구성하세요.

각 시나리오는 다음과 같은 JSON 형식입니다:

[
  {{
    "name": "전화번호 10자리 제출 실패",
    "steps": [
      {{ "action": "visit", "target": "/" }},
      {{  "action": "click", "target": "input[type=radio][value='남성']" }},
      {{  "action": "input", "target": "#id_age", "value": "30" }},
      {{  "action": "input", "target": "#id_job_field", "value": "개발자" }},
      {{  "action": "input", "target": "#id_name", "value": "홍길동" }},
      {{  "action": "input", "target": "#id_phone", "value": "0101234567" }},
      {{  "action": "click", "target": "input[type=checkbox][name='agree']" }},
      {{  "action": "click", "target": "button[type=submit]" }},
      {{  "action": "wait_for", "target": ".tooltip" }},
      {{  "action": "assert_text", "target": ".tooltip", "value": "이 텍스트를 11자 이상으로 늘리세요" }}
    ]
  }}
]
각 step에는 `action`, `target`, `value`가 포함될 수 있으며, 다음 액션 중 하나를 사용할 수 있습니다:
- visit
- input
- click
- wait
- wait_for_redirect
- assert
- assert_text

응답은 설명 없이 **JSON 배열만** 출력하세요.

코드 요약:
{source_code}

입력 필드 제약 목록:
{json.dumps(constraints, ensure_ascii=False, indent=2)}
"""


    raw_scenarios = ask_scenario_llm(prompt)

    if isinstance(raw_scenarios, list):
        normalized = normalize_asserts(raw_scenarios, constraints)
        normalized = normalize_radio_inputs(normalized)
        normalized = patch_failed_steps(normalized)
        if failure_log:
            normalized = auto_repair_failed_log(normalized, failure_log)

        if project_name:
            for s in normalized:
                if "name" in s and "steps" in s:
                    E2ETestScenario.objects.create(
                        project_name=project_name,
                        name=f"[재생성] {s['name']}",
                        steps=s["steps"]
                    )

        return {"scenarios": normalized}
    else:
        return {
            "error": raw_scenarios.get("error", "LLM 응답 오류"),
            "raw": raw_scenarios.get("raw_response", "")
        }
