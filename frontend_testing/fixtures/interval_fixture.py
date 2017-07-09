from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By

class IntervalHelper:

    def __init__(self, app):
        self.app = app

    def select(self, interval):
        wd = self.app.wd
        wait = WebDriverWait(wd, 60)
        element = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'div#app a > div > span')))
        wd.find_element_by_css_selector('div#app div:nth-child(2) > div > div.input-group.date > input').click()
        wd.find_element_by_css_selector('div#app div:nth-child(2) > div > div.input-group.date > input').clear()
        wd.find_element_by_css_selector('div#app div:nth-child(2) > div > div.input-group.date > input').send_keys(
            interval.start)
        wd.find_element_by_css_selector('div#app div:nth-child(3) > div > div.input-group.date > input').click()
        wd.find_element_by_css_selector('div#app div:nth-child(3) > div > div.input-group.date > input').clear()
        wd.find_element_by_css_selector('div#app div:nth-child(3) > div > div.input-group.date > input').send_keys(
            interval.end)
        self.select_with_mouse()

    def select_with_mouse(self):
        wd = self.app.wd
        self.select_interval_start_button()
        self.select_start_time_picker()
        self.start_hours_down()
        self.start_hours_down()
        self.start_hours_up()
        self.start_minutes_down()
        self.start_minutes_down()
        self.start_minutes_up()
        self.select_start_date_picker()
        self.press_interval_start_back_button()
        self.press_interval_start_back_button()
        self.press_interval_start_forward_button()
        wd.find_element_by_css_selector(
            'div#app div.bootstrap-datetimepicker-widget.dropdown-menu.bottom.pull-right > ul >'
            ' li:nth-child(1) > div > div > table > tbody > tr:nth-child(2) > td:nth-child(4)').click()
        self.select_interval_end_button()
        self.select_end_time_picker()
        self.end_hours_up()
        self.end_minutes_up()
        self.select_end_date_picker()
        self.press_interval_end_forward_button()
        self.press_interval_end_forward_button()
        self.press_interval_end_back_button()
        wd.find_element_by_css_selector(
            'div#app div:nth-child(3) > div > div.bootstrap-datetimepicker-widget.dropdown-menu.'
            'bottom.pull-right > ul >'
            ' li:nth-child(1) > div > div > table > tbody > tr:nth-child(2) > td:nth-child(5)').click()

    def select_interval_end_button(self):
        wd = self.app.wd
        wd.find_element_by_css_selector('div#app div:nth-child(3) > div > div.input-group.date > span > span').click()

    def select_interval_start_button(self):
        wd = self.app.wd
        wd.find_element_by_css_selector('div#app div:nth-child(2) > div > div.input-group.date > span > span').click()

    def press_interval_start_forward_button(self):
        wd = self.app.wd
        wd.find_element_by_css_selector('div#app div:nth-child(2) > div > div.bootstrap-datetimepicker-widget.dropdown-'
                                        'menu.bottom.pull-right > ul > li:nth-child(1) > div > div > table > thead >'
                                        'tr:nth-child(1) > th.next > span').click()

    def press_interval_start_back_button(self):
        wd = self.app.wd
        wd.find_element_by_css_selector('div#app div:nth-child(2) > div > div.bootstrap-datetimepicker-widget.dropdown'
                                        '-menu.bottom.pull-right > ul > li:nth-child(1) > div > div > table > thead > '
                                        'tr:nth-child(1) > th.prev > span').click()

    def press_interval_end_forward_button(self):
        wd = self.app.wd
        wd.find_element_by_css_selector('div#app div:nth-child(3) > div > div.bootstrap-datetimepicker-widget.dropdown-'
                                        'menu.bottom.pull-right > ul > li:nth-child(1) > div > div > table > thead >'
                                        ' tr:nth-child(1) > th.next > span').click()

    def press_interval_end_back_button(self):
        wd = self.app.wd
        wd.find_element_by_css_selector(
            'div#app div:nth-child(3) > div > div.bootstrap-datetimepicker-widget.dropdown-menu'
            '.bottom.pull-right > ul > li:nth-child(1) > div > div > table > thead > '
            'tr:nth-child(1) > th.prev > span').click()

    def select_start_time_picker(self):
        wd = self.app.wd
        wd.find_element_by_css_selector('div#app div.bootstrap-datetimepicker-widget.dropdown-menu.bottom.pull-right'
                                        ' > ul > li:nth-child(2) > span > span').click()

    def select_end_time_picker(self):
        wd = self.app.wd
        wd.find_element_by_css_selector(
            'div#app div:nth-child(3) > div > div.bootstrap-datetimepicker-widget.dropdown-menu.'
            'bottom.pull-right > ul > li:nth-child(2) > span > span').click()

    def select_start_date_picker(self):
        wd = self.app.wd
        wd.find_element_by_css_selector(
            'div#app div:nth-child(2) > div > div.bootstrap-datetimepicker-widget.dropdown-menu.'
            'bottom.pull-right > ul > li:nth-child(1) > span > span').click()

    def select_end_date_picker(self):
        wd = self.app.wd
        wd.find_element_by_css_selector(
            'div#app div:nth-child(3) > div > div.bootstrap-datetimepicker-widget.dropdown-menu.'
            'bottom.pull-right > ul > li:nth-child(1) > span').click()

    def start_hours_down(self):
        wd = self.app.wd
        wd.find_element_by_css_selector('div#app div:nth-child(2) > div > div.bootstrap-datetimepicker-widget.'
                                        'dropdown-menu.bottom.pull-right > ul > li:nth-child(2) > div > div >'
                                        ' table > tbody > tr:nth-child(3) > td:nth-child(1) > a > span').click()

    def start_hours_up(self):
        wd = self.app.wd
        wd.find_element_by_css_selector('div#app div:nth-child(2) > div > div.bootstrap-datetimepicker-widget.'
                                        'dropdown-menu.bottom.pull-right > ul > li:nth-child(2) > div > div >'
                                        ' table > tbody > tr:nth-child(1) > td:nth-child(1) > a > span').click()

    def end_hours_down(self):
        wd = self.app.wd
        wd.find_element_by_css_selector('div#app div:nth-child(3) > div > div.bootstrap-datetimepicker-widget.'
                                        'dropdown-menu.bottom.pull-right > ul > li:nth-child(2) > div > div >'
                                        ' table > tbody > tr:nth-child(3) > td:nth-child(1) > a > span').click()

    def end_hours_up(self):
        wd = self.app.wd
        wd.find_element_by_css_selector('div#app div:nth-child(3) > div > div.bootstrap-datetimepicker-widget.'
                                        'dropdown-menu.bottom.pull-right > ul > li:nth-child(2) > div > div >'
                                        ' table > tbody > tr:nth-child(1) > td:nth-child(1) > a > span').click()

    def start_minutes_down(self):
        wd = self.app.wd
        wd.find_element_by_css_selector('div#app div:nth-child(2) > div > div.bootstrap-datetimepicker-widget.'
                                        'dropdown-menu.bottom.pull-right > ul > li:nth-child(2) > div > div >'
                                        ' table > tbody > tr:nth-child(3) > td:nth-child(3) > a > span').click()

    def start_minutes_up(self):
        wd = self.app.wd
        wd.find_element_by_css_selector('div#app div:nth-child(2) > div > div.bootstrap-datetimepicker-widget.'
                                        'dropdown-menu.bottom.pull-right > ul > li:nth-child(2) > div > div >'
                                        ' table > tbody > tr:nth-child(1) > td:nth-child(3) > a > span').click()

    def end_minutes_down(self):
        wd = self.app.wd
        wd.find_element_by_css_selector('div#app div:nth-child(3) > div > div.bootstrap-datetimepicker-widget.'
                                        'dropdown-menu.bottom.pull-right > ul > li:nth-child(2) > div > div >'
                                        ' table > tbody > tr:nth-child(3) > td:nth-child(3) > a > span').click()

    def end_minutes_up(self):
        wd = self.app.wd
        wd.find_element_by_css_selector('div#app div:nth-child(3) > div > div.bootstrap-datetimepicker-widget.'
                                        'dropdown-menu.bottom.pull-right > ul > li:nth-child(2) > div > div >'
                                        ' table > tbody > tr:nth-child(1) > td:nth-child(3) > a > span').click()


