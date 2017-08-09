from selenium.webdriver.support.ui import Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By


class SearchWindowHelper:

    def __init__(self, app):
        self.app = app

    def select_a_project(self, project):
        wd = self.app.wd
        wait = WebDriverWait(wd, 60)
        # wait until Hello Promis is displayed to ensure the page was loaded
        element = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'div#app a > div > span')))
        select = Select(wd.find_element_by_css_selector('select#Projects'))
        select.select_by_visible_text(project)

    # to check which project is selected by its short description text
    def selected(self):
        wd = self.app.wd
        selected = wd.find_element_by_css_selector('#app > div > div > div:nth-child(1) > div:nth-child(2) >'
                                                   ' div > div > div > div.panel-collapse.collapse.in > div >'
                                                   ' div > form > div:nth-child(1) > div > div > div > p').text
        return selected

    # click the search button
    def search(self):
        wd = self.app.wd
        wd.find_element_by_css_selector('div#app div:nth-child(3) > div > button[type="button"]').click()

    # find text in 'search results' window when something was found
    def find_results(self):
        wd = self.app.wd
        self.search()
        return wd.find_element_by_css_selector('div#app div.panel-collapse.collapse.in > div > div > span').text