from pathlib import Path
from .llm_utils import ask_scenario_llm
from .models import E2ETestScenario  # 모델 import 추가
import re
import os

def collect_code_snippets(path: Path, max_files: int = 20) -> str:
    """코드 파일들에서 내용을 수집하고 정리"""
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

def normalize_asserts(scenarios: list) -> list:
    for scenario in scenarios:
        for step in scenario.get("steps", []):
            if step.get("action") == "assert":
                if not step.get("target") or step.get("target") in [".errorlist", ".errorlist li", "form ul li"]:
                    step["action"] = "assert_text"
                    if not step.get("value"):
                        step["value"] = "필수 항목입니다"
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
    """
    실패 로그를 기반으로 시나리오 step의 target 또는 value를 자동 보정
    예: invalid element state → input → click 전환
    """
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

    prompt_prefix = """
당신은 숙련된 QA 엔지니어입니다.

아래는 웹 애플리케이션의 코드 요약입니다. 이 코드를 분석하여 사용자 관점에서 수행될 수 있는 E2E 테스트 시나리오 3~5개를 생성해 주세요.

각 시나리오는 반드시 다음과 같은 JSON 형식이어야 하며, 설명 없이 JSON만 출력하세요:

[
  {
    "name": "로그인 테스트",
    "steps": [
      { "action": "visit", "target": "/login" },
      { "action": "input", "target": "#username", "value": "testuser" },
      { "action": "input", "target": "#password", "value": "123456" },
      { "action": "click", "target": "button[type=submit]" },
      { "action": "assert_text", "value": "Welcome" }
    ]
  },
  ...
]

다음 조건을 반드시 지켜주세요:
- 실제 사용자 흐름에 따라 입력 → 제출 → 검증 순서로 구성하세요.
- 가능한 경우 `assert` 대신 `assert_text`를 사용해 텍스트 메시지를 확인하세요.
- 오류 발생 시 "필수 항목입니다", "형식이 올바르지 않습니다" 같은 메시지를 assert_text로 검증하세요.
- action은 visit, input, click, assert_text만 사용하세요.
- value가 없는 assert는 만들지 마세요.

코드 요약:
"""

    prompt = prompt_prefix + source_code
    raw_scenarios = ask_scenario_llm(prompt)

    if isinstance(raw_scenarios, list):
        normalized = normalize_asserts(raw_scenarios)
        normalized = normalize_radio_inputs(normalized)
        normalized = patch_failed_steps(normalized)
        if failure_log:
            normalized = auto_repair_failed_log(normalized, failure_log)

        # ✅ 실패한 시나리오 자동 저장
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
        return {"error": raw_scenarios.get("error", "LLM 응답 오류"), "raw": raw_scenarios.get("raw_response", "")}

