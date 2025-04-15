from pathlib import Path
from bs4 import BeautifulSoup


def extract_input_constraints(html_path: Path) -> list:
    constraints = []

    try:
        soup = BeautifulSoup(html_path.read_text(encoding="utf-8"), "html.parser")
        form = soup.find("form")
        if not form:
            return []

        for input_tag in form.find_all(["input", "textarea", "select"]):
            if input_tag.has_attr("disabled") or input_tag.has_attr("readonly"):
                continue

            constraint = {}
            input_type = input_tag.get("type", "text")
            input_id = input_tag.get("id")
            name = input_tag.get("name") or input_id

            # selector 우선순위: id > name > 없음
            if input_id:
                selector = f"#{input_id}"
            elif name:
                selector = f"[name='{name}']"
            else:
                selector = None

            constraint["name"] = name
            constraint["selector"] = selector
            constraint["required"] = input_tag.has_attr("required")
            constraint["type"] = input_type

            # ✅ label 추출
            label_tag = None
            if input_id:
                label_tag = soup.find("label", {"for": input_id})
            if not label_tag and input_tag.find_parent("label"):
                label_tag = input_tag.find_parent("label")

            label_text = label_tag.get_text(strip=True) if label_tag else None

            # ✅ UX 힌트 속성
            for attr in ["min", "max", "maxlength", "pattern", "placeholder", "title", "autocomplete"]:
                if input_tag.has_attr(attr):
                    constraint[attr] = input_tag[attr]

            # ✅ expected_error 생성
            if constraint["required"]:
                if label_text:
                    constraint["expected_error"] = f"{label_text}은 필수 항목입니다."
                elif constraint.get("placeholder"):
                    constraint["expected_error"] = f"{constraint['placeholder']}은 필수 항목입니다."
                elif name:
                    constraint["expected_error"] = f"{name}은 필수 입력입니다."
                else:
                    constraint["expected_error"] = "필수 항목입니다."

            # ✅ options 추출 (radio, select만 해당)
            if input_tag.name == "select":
                options = [
                    opt.get("value") or opt.text.strip()
                    for opt in input_tag.find_all("option")
                    if (opt.get("value") or opt.text.strip())
                ]
                constraint["options"] = options

            elif input_tag.name == "input" and input_type == "radio":
                # 같은 name을 가진 radio group 전체 수집
                radio_group = form.find_all("input", {"type": "radio", "name": name})
                options = [
                    radio.get("value") or radio.get("id") or radio.get("name")
                    for radio in radio_group
                    if (radio.get("value") or radio.get("id") or radio.get("name"))
                ]
                constraint["options"] = list(set(options))  # 중복 제거

            constraints.append(constraint)

    except Exception as e:
        print(f"⚠️ HTML 분석 실패: {html_path} - {e}")

    return constraints
