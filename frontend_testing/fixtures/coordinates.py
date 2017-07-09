from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By


class CoordinatesHelper:

    def __init__(self, app):
        self.app = app

    def select_altitude(self, interval):
        wd = self.app.wd
        wait = WebDriverWait(wd, 60)
        element = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'div#app a > div > span')))
        wd.find_element_by_css_selector('div#app div:nth-child(2) > span > input#Altitude').click()
        wd.find_element_by_css_selector('div#app div:nth-child(2) > span > input#Altitude').clear()
        wd.find_element_by_css_selector('div#app div:nth-child(2) > span > input#Altitude').send_keys(interval.start)
        wd.find_element_by_css_selector('div#app div:nth-child(3) > span > input#Altitude').click()
        wd.find_element_by_css_selector('div#app div:nth-child(3) > span > input#Altitude').clear()
        wd.find_element_by_css_selector('div#app div:nth-child(3) > span > input#Altitude').send_keys(interval.end)

    def select_latitude(self, latitude):
        wd = self.app.wd
        wait = WebDriverWait(wd, 60)
        element = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'div#app a > div > span')))
        wd.find_element_by_css_selector('div#app div:nth-child(2) > span > span:nth-child(2) > input#Latitude').click()
        wd.find_element_by_css_selector('div#app div:nth-child(2) > span > span:nth-child(2) > input#Latitude').clear()
        wd.find_element_by_css_selector('div#app div:nth-child(2) > span > span:nth-child(2) > input#Latitude').send_keys(latitude.start)
        wd.find_element_by_css_selector('div#app div:nth-child(3) > span > span:nth-child(2) > input#Latitude').click()
        wd.find_element_by_css_selector('div#app div:nth-child(3) > span > span:nth-child(2) > input#Latitude').clear()
        wd.find_element_by_css_selector(
            'div#app div:nth-child(3) > span > span:nth-child(2) > input#Latitude').send_keys(latitude.end)

    def select_longitude(self, longitude):
        wd = self.app.wd
        wait = WebDriverWait(wd, 60)
        element = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'div#app a > div > span')))
        wd.find_element_by_css_selector('div#app div:nth-child(2) > span > span:nth-child(2) > input#Longitude').click()
        wd.find_element_by_css_selector('div#app div:nth-child(2) > span > span:nth-child(2) > input#Longitude').clear()
        wd.find_element_by_css_selector(
            'div#app div:nth-child(2) > span > span:nth-child(2) > input#Longitude').send_keys(longitude.start)
        wd.find_element_by_css_selector('div#app div:nth-child(3) > span > span:nth-child(2) > input#Longitude').click()
        wd.find_element_by_css_selector('div#app div:nth-child(3) > span > span:nth-child(2) > input#Longitude').clear()
        wd.find_element_by_css_selector(
            'div#app div:nth-child(3) > span > span:nth-child(2) > input#Longitude').send_keys(longitude.end)