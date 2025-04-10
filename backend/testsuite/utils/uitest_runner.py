# testsuite/utils/uitest_runner.py
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

def run_ui_test(scenario):
    url = scenario.url
    selector = scenario.selector

    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    driver = webdriver.Chrome(options=options)
    result_log = ""

    try:
        driver.get(url)
        time.sleep(2)

        element = driver.find_element(By.CSS_SELECTOR, selector)
        element.click()
        result_log = f"성공: {selector} 클릭됨"
        is_success = True

    except Exception as e:
        result_log = f"실패: {str(e)}"
        is_success = False

    finally:
        driver.quit()

    return {
        "is_success": is_success,
        "message": result_log
    }
