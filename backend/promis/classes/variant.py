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

import ftp_helper, parsers, unix_time, orbit
import backend_api.models as model


class Variant(BaseProject):
    '''
    [en]: VARIANT satellite experiment
    [uk]: Супутниковий експеримент ВАРІАНТ
    '''

    def check(*args, **kwargs):
        return [ "1394" ] # TODO: properly check the FTP

    def fetch(self, daydir):
        with ftp_helper.FTPChecker("Variant/", "ftp.promis.ikd.kiev.ua") as ftp: 
            ftp.cwd("telemetry")
            # TODO: timezone hack
            Δ = 1111714367 - 1111703568

            # TODO: lots of pre-conference half-measures here
            with ftp.xopen("var{0}.tm".format(daydir)) as fp:
                orbit_path = { (t + Δ): pt for t, pt in parsers.telemetry(fp, cartesian=False) }

            # TODO: hardcode
            time_start = 1111714367 # 25-03-2005 01:32:47
            time_end = time_start + 56

            # TODO: assuming there was only one session
            path = [ (y.lon, y.lat, y.alt, t) for t, y, _ in orbit.generate_orbit(orbit_path, time_start, time_end) ]
            line_gen = [ (x, y, t) for x, y, _, t in path ]
            alt_gen = [ alt for _, _, alt, _ in path ]

            time_start = unix_time.maketime(time_start)
            time_end = unix_time.maketime(time_end)
            time_dur = time_end - time_start
            print("\tSession: [ %s, %s ] (%s)." % (time_start.isoformat(), time_end.isoformat(), str(time_dur)) )

            sess_obj = model.Session.objects.create(time_begin = time_start, time_end = time_end, altitude = alt_gen,
                geo_line = LineString(*line_gen, srid = 4326), space_project = self.project_obj )

            ftp.cwd("..")
            ftp.cwd("Data_Release1/{0}".format(daydir))
            # Per-channel dicts of filename and JSON name
            data = {
                'ΔE1, ΔE2, ΔE3': {
                    'param': 'Ex, Ey, Ez (three components of electric field HF Fs = 31.25 kHz)',
                    'file': 'E1~'
                    #'comps' : {
                    #    'E1~': 'e1',
                    #    'E2~': 'e2',
                    #    'E3~': 'e3'
                    #}
                },
                'Bx~, By~ (not calibrated)': {
                    'param': 'Bx, By (two components of magnetic field HF Fs = 31,25 kHz)',
                    'file': 'Bx~'
                    #'comps': {
                    #    'Bx~': 'bx',
                    #    'By~': 'by'
                    #}
                },
                'Jxz~, Jyz~ (not calibrated)': {
                    'param': 'Jxz, Jyz (two components of current density Fs = 31.25 kHz)',
                    'file': 'Jxz~'
                    #'comps': {
                    #    'Jxz~': 'jxz',
                    #    'Jyz~': 'jyz'
                    #}
                }
            }

            def get_file(name):
                with ftp.xopen(name) as fp:
                    return [ float(ln) for ln in fp ]

            for chan_name, chan_files in data.items():
                chan_obj = model.Channel.objects.language('en').filter(name = chan_name)[0]
                par_obj = model.Parameter.objects.language('en').filter(name = chan_files['param'])[0]
                # json_data = { key: get_file(name) for name, key in chan_files['comps'].items() }
                json_data = get_file(chan_files['file'])
                doc_obj = model.Document.objects.create(json_data = json_data )
                meas = model.Measurement.objects.create(session = sess_obj, parameter = par_obj, channel = chan_obj, channel_doc = doc_obj, parameter_doc = doc_obj, sampling_frequency = 31250, max_frequency = 31250, min_frequency = 31250)
            



