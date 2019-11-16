from django.contrib.gis.geos import LineString
from classes.base_project import BaseProject

import orbit, ftp_helper, parsers, export, unix_time
import backend_api.models as model


class Aerosol(BaseProject):
    '''
    [en]: Space mission Aerosol-UA.  Aerosol remote sensing in the terrestrial atmosphere
    [uk]: Орбітальна місія Аерозоль-UA дистанційного зондування аерозолів в атмосфері Землі
    '''

    def check(self):
        pass

    def fetch(self, daydir):
        pass