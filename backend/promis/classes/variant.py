#
# Copyright 2016 Space Research Institute of NASU and SSAU (Ukraine)
#
# Licensed under the EUPL, Version 1.1 or – as soon they
# will be approved by the European Commission - subsequent
# versions of the EUPL (the "Licence");
# You may not use this work except in compliance with the
# Licence.
# You may obtain a copy of the Licence at:
#
# https://joinup.ec.europa.eu/software/page/eupl
#
# Unless required by applicable law or agreed to in
# writing, software distributed under the Licence is
# distributed on an "AS IS" basis,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
# express or implied.
# See the Licence for the specific language governing
# permissions and limitations under the Licence.
#

from django.contrib.gis.geos import LineString
from classes.base_project import BaseProject

import datetime
import ftp_helper, parsers, unix_time, orbit
import backend_api.models as model

sessions_time = {
    "597": {
      'time_start': datetime.datetime(2005, 2, 1, 8, 22, 59).timestamp(),
      'time_end': datetime.datetime(2005, 2, 1, 8, 43, 29).timestamp()
    },
    "1056": {
      'time_start': datetime.datetime(2005, 3, 2, 17, 23, 10).timestamp(),
      'time_end': datetime.datetime(2005, 3, 2, 17, 27, 37).timestamp()
    },
    "1057": {
      'time_start': datetime.datetime(2005, 3, 3, 5, 42, 57).timestamp(),
      'time_end': datetime.datetime(2005, 3, 3, 5, 44, 37).timestamp()
    },
    "1071": {
      'time_start': datetime.datetime(2005, 3, 3, 16, 48, 14).timestamp(),
      'time_end': datetime.datetime(2005, 3, 3, 16, 52, 41).timestamp()
    },
    "1109": {
      'time_start': datetime.datetime(2005, 3, 6, 11, 3, 13).timestamp(),
      'time_end': datetime.datetime(2005, 3, 6, 11, 7, 40).timestamp()
    },
    "1139": {
      'time_start': datetime.datetime(2005, 3, 8, 1, 53, 5).timestamp(),
      'time_end': datetime.datetime(2005, 3, 8, 1, 57, 32).timestamp()
    },
    "1278": {
      'time_start': datetime.datetime(2005, 3, 17, 13, 52, 49).timestamp(),
      'time_end': datetime.datetime(2005, 3, 17, 13, 57, 16).timestamp()
    },
    "1363": {
      'time_start': datetime.datetime(2005, 3, 23, 1, 13, 6).timestamp(),
      'time_end': datetime.datetime(2005, 3, 23, 1, 14, 2).timestamp()
    },
    "1394": {
      'time_start': datetime.datetime(2005, 3, 25, 1, 32, 47).timestamp(),
      'time_end': datetime.datetime(2005, 3, 25, 1, 33, 43).timestamp()
    }
}

class Variant(BaseProject):
    '''
    [en]: VARIANT satellite experiment
    [uk]: Супутниковий експеримент ВАРІАНТ
    '''

    def check(*args, **kwargs):
        exceptions = {"1363",     # too few anchor points unfortunately
                      "Read_me.doc",
                      "Tabl_2.doc",
                      "Tabl_3.doc"}
        with ftp_helper.FTPChecker("Variant/Data_Release1/", "ftp.promis.ikd.kiev.ua") as ftp:
            ftp.exceptions = exceptions
            # TODO: check that directory exists properly
            # TODO: any more elegant way? re-yield or smth
            for v in ftp.check():
                yield v
        
    def fetch(self, daydir):
        with ftp_helper.FTPChecker("Variant/", "ftp.promis.ikd.kiev.ua") as ftp: 
            ftp.cwd("telemetry")
            # TODO: timezone hack
            Δ = 1111714367 - 1111703568

            with ftp.xopen("var{0}.tm".format(daydir)) as fp:
                orbit_path = { (t + Δ): pt for t, pt in parsers.telemetry(fp, cartesian=False) }

            time_start = int(sessions_time[daydir]['time_start'])
            time_end = int(sessions_time[daydir]['time_end'])

            path = [ (y.lon, y.lat, y.alt, t) for t, y, _ in orbit.generate_orbit(orbit_path, time_start, time_end, time_delta = 20) ]
            line_gen = [ (x, y, t) for x, y, _, t in path ]
            alt_gen = [ alt for _, _, alt, _ in path ]

            time_start = unix_time.maketime(time_start)
            time_end = unix_time.maketime(time_end)
            time_dur = time_end - time_start
            print("\tSession: [ %s, %s ] (%s)." % (time_start.isoformat(), time_end.isoformat(), str(time_dur)) )

            sess_obj = model.Session.objects.create(time_begin = time_start, time_end = time_end, altitude = alt_gen,
                geo_line = LineString(*line_gen, srid = 4326), space_project = self.project_obj )

            # read per-channel sampling frequencies
            component_sf = [['Bx', 0], ['By',0], ['Bz',0], ['Ts',0], ['Te',0], 
                           ['JF~',0], 
                           ['FC1~',0], ['FC1=',0], ['FC2~',0], ['FC2=',0], 
                           ['Jyz~',0], ['Bx~',0], ['Jxz~',0], ['By~',0], 
                           ['E1~',0], ['E1=',0], ['E2~',0], ['E2=',0], ['E3~',0], ['E3=',0]]
            ftp.cwd("..")
            ftp.cwd("Data_Release1/{0}".format(daydir))
            
            with ftp.xopen("{0}.txt".format(daydir)) as fp:
                for line in fp:
                    if line.rstrip() == "Sampling frequency, Hz":
                        break
                idx = 0
                for line in fp:
                    if idx >= len(component_sf):
                        break
                    if daydir in ["1057", "1071", "1109", "1278", "1394"] and idx == 3:
                        idx += 2
                    if len(line.rstrip()) != 0:
                        component_sf[idx][1] = float(line)
                    idx += 1

            def get_file(name):
                try:
                    with ftp.xopen(name) as fp:
                        return [ float(ln) for ln in fp ]
                except:
                    return []

            project_devices = model.Device.objects.language('en').filter(space_project = self.project_obj.id)
            project_channels = []
            for device in project_devices:
                project_channels.extend(model.Channel.objects.language('en').filter(device = device.id))

            for chan_obj in project_channels:
                par_obj = model.Parameter.objects.language('en').filter(channel = chan_obj.id)[0]
                list_of_components = [get_file(name) for name in chan_obj.labels]
                if (len(list_of_components) == 0) or (sum(len(x) for x in list_of_components) == 0):
                    continue

                # All the components of the single channel are suuposed to have the same sampling frequecny
                # In fact sometimes some fo them appeared to be 0, that is why max is needed here
                def find_sf(components):
                    max_sf = 0
                    for comp_name in components:
                        for name, sf in component_sf:
                            if name == comp_name:
                                max_sf = max(max_sf, sf)
                                break
                    #print("components: " + str(components) + " max_sf: " + str(max_sf))        
                    return max_sf

                sampling_frequency = find_sf(chan_obj.labels)
                numValues = int(time_dur.total_seconds() * sampling_frequency)

                def catch_idx_error(component, idx):
                   try:
                      return component[idx]
                   except IndexError:
                      return 0.0

                # We should better not covert a single component into a tuple. Handling this here
                if len(list_of_components) > 1:
                    json_data = [tuple([catch_idx_error(component,idx) for component in list_of_components]) for idx in range(numValues)]
                else:
                    json_data = [catch_idx_error(list_of_components[0],idx) for idx in range(numValues)]

                doc_obj = model.Document.objects.create(json_data = json_data )

                
                # calibration of channels. Convertng them into prameters data
                # calibration coefficients exlanation:
                # coef for Bx~, By~: 100 mB/nT = 0.1 B/nT = 1/0.1 nT/B = 10 nT/B
                # coef for Jyz~, Jxz~: 7.7 * 10^-2 B*cm^2/nA = 7.7 * 10^-2 * 10^-4 * 10^3 B*m^2/mkA = 7.7 * 10^-3 B*m^2/mkA = 129.87 mkA/(m^2*B)
                # coef for FC1=, FC2=: 470 mB*cm^2/mkA = 0.47 * 10^-4 B*m^2/mkA = 21276 mkA/(m^2*B)
                # coef for FC1~, FC2~: 4780 mB*cm^2/mkA = 4.78 * 10^-4 B*m^2/mkA = 2092 mkA/(m^2*B)
                # coef for JF~: 8.5*10^-2 B*cm^2/nA = 8.5 * 10^-4 * 10^3 B*m^2/mkA = 1.17647 mkA/(m^2*B)
                calibration_method = chan_obj.get_calibration()
                if calibration_method:
                    calibrated_json_data = [calibration_method.calculate(x) for x in json_data]
                    calibrated_doc_obj = model.Document.objects.create(json_data = calibrated_json_data )

                 #   if len(list_of_components) > 1:
                 #     print("original value: " + str(json_data[100][0]) + ", calibrated value: " + str(calibrated_json_data[100][0]) )
                else:
                    calibrated_doc_obj = doc_obj
                
                meas = model.Measurement.objects.create(session = sess_obj, parameter = par_obj, channel = chan_obj, channel_doc = doc_obj, parameter_doc = calibrated_doc_obj, sampling_frequency = sampling_frequency, max_frequency = sampling_frequency, min_frequency = sampling_frequency)
