class SessionHelper:

    def __init__(self, app):
        self.app = app

    def login(self, username, password):
        wd = self.app.wd
        self.app.open_home_page()
        wd.find_element_by_css_selector("div#app button.btn.btn-success").click()
        wd.find_element_by_id("username-group").click()
        wd.find_element_by_id("username-group").clear()
        wd.find_element_by_id("username-group").send_keys(username)
        wd.find_element_by_id("password-group").click()
        wd.find_element_by_id("password-group").clear()
        wd.find_element_by_id("password-group").send_keys(password)
        wd.find_element_by_xpath("//div[@class='modal-body']//button[.='Sign in']").click()

    def logout(self):
        wd = self.app.wd
        wd.find_element_by_css_selector('div#app a > div > button[type="button"]').click()

    def ensure_logout(self):
        wd = self.app.wd
        if self.is_logged_in():
            self.logout()

    def is_logged_in(self):
        wd = self.app.wd
        return len(wd.find_elements_by_css_selector(
            "div#app a > div > button")) > 0

    def is_logged_in_as(self, username):
        wd = self.app.wd
        return wd.find_element_by_css_selector("div#app a > div > span").text == "Hello, promis"

    def ensure_login(self, username, password):
        wd = self.app.wd
        if self.is_logged_in():
            if self.is_logged_in_as(username):
                return
            else:
                self.logout()
        self.login(username, password)





