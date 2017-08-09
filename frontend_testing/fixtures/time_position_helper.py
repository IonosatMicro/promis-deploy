from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By


class TimePositionHelper:

    def __init__(self, app):
        self.app = app

    def select_time(self, start='None', end='None'):
        wd = self.app.wd
        wait = WebDriverWait(wd, 60)
        # wait until Hello Promis is displayed to ensure the page was loaded
        element = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'div#app a > div > span')))
        # enter interval start date/time
        wd.find_element_by_css_selector('div#app div:nth-child(2) > div >'
                                        ' div.input-group.date > input').click()
        wd.find_element_by_css_selector('div#app div:nth-child(2) > div >'
                                        ' div.input-group.date > input').clear()
        wd.find_element_by_css_selector('div#app div:nth-child(2) > div >'
                                        ' div.input-group.date > input').send_keys(start)
        # enter interval end date/time
        wd.find_element_by_css_selector('div#app div:nth-child(3) > div >'
                                        ' div.input-group.date > input').click()
        wd.find_element_by_css_selector('div#app div:nth-child(3) > div >'
                                        ' div.input-group.date > input').clear()
        wd.find_element_by_css_selector('div#app div:nth-child(3) > div >'
                                        ' div.input-group.date > input').send_keys(end)

    def select_latitude(self, start='None', end='None'):
        wd = self.app.wd
        wait = WebDriverWait(wd, 60)
        # wait until Hello Promis is displayed to ensure the page was loaded
        element = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'div#app a > div > span')))
        # enter latitude from
        wd.find_element_by_css_selector('div#app div:nth-child(2) > span >'
                                        ' span:nth-child(2) > input#Latitude').click()
        wd.find_element_by_css_selector('div#app div:nth-child(2) > span >'
                                        ' span:nth-child(2) > input#Latitude').clear()
        wd.find_element_by_css_selector('div#app div:nth-child(2) > span >'
                                        ' span:nth-child(2) > input#Latitude').send_keys(start)
        # enter latitude to
        wd.find_element_by_css_selector('div#app div:nth-child(3) > span >'
                                        ' span:nth-child(2) > input#Latitude').click()
        wd.find_element_by_css_selector('div#app div:nth-child(3) > span >'
                                        ' span:nth-child(2) > input#Latitude').clear()
        wd.find_element_by_css_selector(
            'div#app div:nth-child(3) > span > span:nth-child(2) > input#Latitude').send_keys(end)

    def select_longitude(self, start='None', end='None'):
        wd = self.app.wd
        wait = WebDriverWait(wd, 60)
        # wait until Hello Promis is displayed to ensure the page was loaded
        element = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'div#app a > div > span')))
        # enter longitude from
        wd.find_element_by_css_selector('div#app div:nth-child(2) > span >'
                                        ' span:nth-child(2) > input#Longitude').click()
        wd.find_element_by_css_selector('div#app div:nth-child(2) > span >'
                                        ' span:nth-child(2) > input#Longitude').clear()
        wd.find_element_by_css_selector(
            'div#app div:nth-child(2) > span > span:nth-child(2) > input#Longitude').send_keys(start)
        # enter longitude to
        wd.find_element_by_css_selector('div#app div:nth-child(3) > span >'
                                        ' span:nth-child(2) > input#Longitude').click()
        wd.find_element_by_css_selector('div#app div:nth-child(3) > span >'
                                        ' span:nth-child(2) > input#Longitude').clear()
        wd.find_element_by_css_selector(
            'div#app div:nth-child(3) > span > span:nth-child(2) > input#Longitude').send_keys(end)