from selenium import webdriver
from fixtures.session import SessionHelper
from fixtures.coordinates import CoordinatesHelper
from fixtures.map_fixture import MapHelper
from fixtures.interval_fixture import IntervalHelper
from fixtures.project import MeasurementsHelper


class Application:

    def __init__(self):
        self.wd = webdriver.Chrome("/usr/lib/chromium-browser/chromedriver")
        self.wd.implicitly_wait(5)
        self.session = SessionHelper(self)
        self.map_fixture = MapHelper(self)
        self.interval_fixture = IntervalHelper(self)
        self.coordinates = CoordinatesHelper(self)
        self.project = MeasurementsHelper(self)

    def is_valid(self):
        try:
            self.wd.current_url
            return True
        except:
            return False

    def open_home_page(self):
        wd = self.wd
        wd.get("http://www.promis.erint.io/")
        wd.maximize_window()

    def kill_browser(self):
        self.wd.close()
