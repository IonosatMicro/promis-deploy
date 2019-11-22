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
        exceptions = {}
        with ftp_helper.FTPChecker("Aerosol-UA/", "ftp.promis.ikd.kiev.ua") as ftp:
            ftp.exceptions = exceptions
            # TODO: check that directory exists properly
            # TODO: any more elegant way? re-yield or smth
            for v in ftp.check():
                yield v

    def fetch(self, daydir):
        with ftp_helper.FTPChecker("Aerosol-UA/", "ftp.promis.ikd.kiev.ua") as ftp:
            sess_obj = self.get_session_obj(ftp)
            ftp.cwd(daydir)

            project_devices = model.Device.objects.language('en').filter(space_project=self.project_obj.id)
            project_channels = []
            for device in project_devices:
                project_channels.extend(model.Channel.objects.language('en').filter(device=device.id))

            for chan_obj in project_channels:
                par_obj = model.Parameter.objects.language('en').filter(channel=chan_obj.id)[0]



    def get_session_obj(self, ftp):
        with ftp.xopen("telemetry.csv") as fp:
            orbit_path = parsers.aerosol_read_csv(fp)

        path = [(pt['lon'], pt['lat'], pt['altitude'], pt['datetime']) for pt in orbit_path]
        dates = [t for _, _, _, t in path]
        line_gen = [(x, y, t) for x, y, _, t in path]
        alt_gen = [alt for _, _, alt, _ in path]

        time_start = unix_time.maketime(dates.index(min(dates)))
        time_end = unix_time.maketime(dates.index(max(dates)))

        return model.Session.objects.create(time_begin=time_start,
                                                time_end=time_end,
                                                altitude=alt_gen,
                                                geo_line=LineString(*line_gen, srid=4326),
                                                space_project=self.project_obj)
