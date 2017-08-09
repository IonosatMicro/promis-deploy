from selenium import webdriver
from fixtures.session_helper import SessionHelper
from fixtures.map_helper import MapHelper
from fixtures.search_helper import SearchWindowHelper
from fixtures.time_position_helper import TimePositionHelper
from fixtures.url import url


class Application:

    def __init__(self):
        self.wd = webdriver.Firefox()
        self.wd.implicitly_wait(5)
        self.session_helper = SessionHelper(self)
        self.map_helper = MapHelper(self)
        self.search_helper = SearchWindowHelper(self)
        self.time_position_helper = TimePositionHelper(self)

    def is_valid(self):
        try:
            self.wd.current_url
            return True
        except:
            return False

    def open_home_page(self):
        wd = self.wd
        wd.get(url)
        wd.maximize_window()

    def kill_browser(self):
        self.wd.quit()

