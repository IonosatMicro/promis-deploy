from selenium.webdriver.support.ui import Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By


class MeasurementsHelper:

    def __init__(self, app):
        self.app = app

    def select(self):
        self.select_a_project()
        self.select_measurements_level_1()
        self.select_measurements_first_check_box()

    def select_a_project(self, project):
        wd = self.app.wd
        wait = WebDriverWait(wd, 60)
        element = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'div#app a > div > span')))
        select = Select(wd.find_element_by_css_selector('select#Projects'))
        select.select_by_visible_text(project)

    def selected(self):
        wd = self.app.wd
        selected = wd.find_element_by_css_selector('#app > div > div > div:nth-child(1) > div:nth-child(2) >'
                                                   ' div > div > div > div.panel-collapse.collapse.in > div >'
                                                   ' div > form > div:nth-child(1) > div > div > div > p').text
        return selected

    def select_measurements_level_1(self):
        wd = self.app.wd
        wd.find_element_by_css_selector('div#app span.btn.toggle-off.btn-md.btn-default > span').click()

    def select_measurements_first_check_box(self):
        wd = self.app.wd
        wd.find_element_by_css_selector('div#app div:nth-child(1) > div > label > input[type="checkbox"]').click()