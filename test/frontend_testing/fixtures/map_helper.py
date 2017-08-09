from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By


class MapHelper:

    def __init__(self, app):
        self.app = app
    # select rectangular area
    def rectangle(self):
        wd = self.app.wd
        wait = WebDriverWait(wd, 60)
        # wait until Hello Promis is displayed to ensure the page was loaded
        element = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'div#app a > div > span')))
        map = wd.find_element_by_id("leaflet")
        # place the whole map into the view
        wd.execute_script("return arguments[0].scrollIntoView();", map)
        wait = WebDriverWait(wd, 60)
        # wait until 'select rectangle' button is clickable
        element = wait.until(EC.element_to_be_clickable(
            (By.CSS_SELECTOR, "div#app div.mapToolBox > div > button[type='button']:nth-child(2) > span")))
        # click 'select rectangle' button
        wd.find_element_by_css_selector(
            "div#app div.mapToolBox > div > button[type='button']:nth-child(2) > span").click()
        map_size = map.size
        wid = map_size['width']
        hei = map_size['height']
        xoff_from = wid * 0.25
        yoff_from = hei * 0.25
        xoff_to = wid * 0.5
        yoff_to = hei * 0.5
        ActionChains(wd).move_to_element_with_offset(map, xoff_from, yoff_from). \
            click_and_hold().move_to_element_with_offset(map, xoff_to, yoff_to).release().perform()