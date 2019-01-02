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
'''
sessions_channels = {
    "0597": ["Bx", "By", "Bz", "JF~", "FC1~", "FC2~", "FC2=", "Jyz~", "Jxz~", "By~", "E1=", "E2=", "E3="],
    "1056": ["Bx", "By", "Bz", "JF~", "FC1~", "FC1=", "FC2~", "FC2=", "Jyz~","Bx~", "Jxz~", "By~", "E1=", "E2~", "E2=", "E3~", "E3="],
    "1057": ["Jyz~","Bx~", "Jxz~", "By~"],
    "1071": ["JF~", "FC1~", "FC1=", "Jyz~","Bx~", "Jxz~", "E1~", "E2~", "E3~"],
    "1109": ["JF~", "FC1~", "FC1=", "FC2~", "Jyz~","Bx~", "E2~", "E3~"],
    "1139": ["Bx", "By", "Bz", "JF~", "FC1~", "FC1=", "FC2~", "FC2=", "Bx~", "Jxz~", "By~", "E1~", "E1=", "E2~", "E2=", "E3~", "E3="],
    "1278": ["Jyz~", "Jxz~", "E1~", "E2~"],
    "1363": ["JF~", "FC1~", "FC1=", "FC2~", "Jyz~","Bx~", "E3~"],
    "1394": ["JF~", "FC1~", "Jyz~","Bx~", "Jxz~", "By~", "E1~", "E2~", "E3~"]
}
'''
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

            # TODO: lots of pre-conference half-measures here
            with ftp.xopen("var{0}.tm".format(daydir)) as fp:
                orbit_path = { (t + Δ): pt for t, pt in parsers.telemetry(fp, cartesian=False) }

            # TODO: hardcode
            time_start = int(sessions_time[daydir]['time_start'])
            time_end = int(sessions_time[daydir]['time_end'])

            print("Time start: " + str(time_start) + ", time end: " + str(time_end))

            # TODO: assuming there was only one session
            path = [ (y.lon, y.lat, y.alt, t) for t, y, _ in orbit.generate_orbit(orbit_path, time_start, time_end, True) ]
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

            # Per-channel dicts of filename and JSON name
            data = {
                'ΔE1, ΔE2, ΔE3': {
                    'param': 'Ex, Ey, Ez (three components of electric field HF)',
                    'comps' : ['E1~', 'E2~', 'E3~']
                },
                'Bx~, By~ (not calibrated)': {
                    'param': 'Bx, By (two components of magnetic field HF)',
                    'comps' : ['Bx~', 'By~']
                },
                'Jxz~, Jyz~ (not calibrated)': {
                    'param': 'Jxz, Jyz (two components of current density)',
                    'comps' : ['Jxz~', 'Jyz~'] 
                },
                'ΔE1=, ΔE2=, ΔE3=': {
                    'param': 'E1=, E2=, E3= (three components of electric field LF)',
                    'comps': ['E1=', 'E2=', 'E3=']
                },
                'FC1~, FC2~': {
                    'param': 'ΔFC~',
                    'comps': ['FC1~', 'FC2~']
                },
                'JF~': {
                    'param': 'JF~ (current density)',
                    'comps': ['JF~']
                },
                'Bx, By, Bz': {
                    'param': 'Bx, By, Bz (three components of magnetic field)',
                    'comps': ['Bx', 'By', 'Bz']
                },
                'FC1=, FC2=': {
                    'param': 'ΔFC=',
                    'comps': ['FC1=', 'FC2=']
                }
            }

            def get_file(name):
                try:
                    with ftp.xopen(name) as fp:
                        return [ float(ln) for ln in fp ]
                except:
                    return []

            for chan_name, chan_files in data.items():
                chan_obj = model.Channel.objects.language('en').filter(name = chan_name)[0]
                par_obj = model.Parameter.objects.language('en').filter(name = chan_files['param'])[0]
                listOfComponents = [get_file(name) for name in chan_files['comps']]
                if (len(listOfComponents) == 0) or (sum(len(x) for x in listOfComponents) == 0):
                    #print('skipping pass for '+ chan_name)
                    continue
                #else:
                #    print('processing '+ chan_name)

                def find_sf(components):
                    max_sf = 0
                    for comp_name in components:
                        for name, sf in component_sf:
                            if name == comp_name:
                                max_sf = max(max_sf, sf)
                                break
                    #print("components: " + str(components) + " max_sf: " + str(max_sf))        
                    return max_sf

                sampling_frequency = find_sf(chan_files['comps'])
                numValues = int(time_dur.total_seconds() * sampling_frequency)

                def catchIdxError(component, idx):
                   try:
                      return component[idx]
                   except:
                      return 0

                json_data = [tuple([catchIdxError(component,idx) for component in listOfComponents]) for idx in range(numValues)]
                doc_obj = model.Document.objects.create(json_data = json_data )
                meas = model.Measurement.objects.create(session = sess_obj, parameter = par_obj, channel = chan_obj, channel_doc = doc_obj, parameter_doc = doc_obj, sampling_frequency = sampling_frequency, max_frequency = sampling_frequency, min_frequency = sampling_frequency)