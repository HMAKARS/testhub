# backend/e2e/executor.py
import time
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException, InvalidElementStateException

SCREENSHOT_DIR = "media/screenshots"

def execute_scenario(steps):
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=chrome_options)
    driver.set_window_size(1920, 1080)

    log = []
    success = True
    screenshot_path = None
    start_time = time.time()

    try:
        for step in steps:
            action = step.get("action")
            target = step.get("target", "")
            value = step.get("value", "")

            if action == "visit":
                driver.get(target)
                log.append(f"🌐 visit: {target}")

            elif action == "input":
                try:
                    element = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.CSS_SELECTOR, target)))
                    element.clear()
                    element.send_keys(value)
                    log.append(f"⌨️ 입력: {target} ← '{value}'")
                except InvalidElementStateException as e:
                    log.append(f"❌ 입력 실패: {target} - Message: {str(e)}")
                    success = False

            elif action == "click":
                try:
                    element = WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.CSS_SELECTOR, target)))
                    element.click()
                    log.append(f"🖱 클릭: {target}")
                except Exception as e:
                    log.append(f"❌ 클릭 실패: {target} - Message: {str(e)}")
                    success = False

            elif action == "select":
                try:
                    select_elem = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.CSS_SELECTOR, target)))
                    select = Select(select_elem)
                    select.select_by_visible_text(value)
                    log.append(f"✅ 셀렉트: {target} → '{value}'")
                except Exception as e:
                    log.append(f"❌ 셀렉트 실패: {target} - Message: {str(e)}")
                    success = False

            elif action == "hover":
                try:
                    element = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.CSS_SELECTOR, target)))
                    ActionChains(driver).move_to_element(element).perform()
                    log.append(f"🖱 Hover: {target}")
                except Exception as e:
                    log.append(f"❌ Hover 실패: {target} - Message: {str(e)}")
                    success = False

            elif action == "wait":
                try:
                    wait_time = float(value)
                    time.sleep(wait_time)
                    log.append(f"⏱ wait: {wait_time}초")
                except ValueError:
                    log.append(f"❌ 잘못된 대기 시간: '{value}'")
                    success = False

            elif action == "assert":
                try:
                    element = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.CSS_SELECTOR, target)))
                    if value in element.text:
                        log.append(f"✅ 검증 성공: '{value}' 포함됨")
                    else:
                        log.append(f"❌ 검증 실패: '{value}' 포함되지 않음")
                        success = False
                except TimeoutException:
                    log.append(f"❌ 검증 실패: {target} 요소를 찾을 수 없음")
                    success = False

            elif action == "assert_text":
                try:
                    if value in driver.page_source:
                        log.append(f"✅ 텍스트 포함됨: '{value}'")
                    else:
                        log.append(f"❌ 텍스트 없음: '{value}'")
                        success = False
                except Exception as e:
                    log.append(f"❌ assert_text 오류: {str(e)}")
                    success = False

            else:
                log.append(f"⚠️ 알 수 없는 동작: {action}")
                success = False

    except Exception as e:
        log.append(f"🚫 시스템 오류 발생: {str(e)}")
        success = False
    finally:
        if not success:
            try:
                os.makedirs(SCREENSHOT_DIR, exist_ok=True)
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                screenshot_path = os.path.join(SCREENSHOT_DIR, f"{timestamp}.png")
                driver.save_screenshot(screenshot_path)
                log.append(f"📸 스크린샷 저장됨: {screenshot_path}")
            except Exception as e:
                log.append(f"⚠️ 스크린샷 저장 실패: {str(e)}")

        driver.quit()

    time_taken = round(time.time() - start_time, 2)
    return {
        "success": success,
        "log": "\n".join(log),
        "time_taken": time_taken,
        "screenshot": f"/media/screenshots/{os.path.basename(screenshot_path)}" if screenshot_path else None
    }
