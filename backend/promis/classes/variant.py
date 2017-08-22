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


from classes.base_project import BaseProject

import ftp_helper, parsers, unix_time
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
            # TODO: lots of pre-conference half-measures here
            with ftp.xopen("var{0}.tm".format(daydir)) as fp:
                orbit_path = { t: pt for t, pt in parsers.telemetry(fp, cartesian=False) }

            # TODO: hardcode
            time_start = unix_time.maketime(1111714367) # 25-03-2005 01:32:47
            time_end = unix_time.maketime(1111714367 + 56)
            time_dur = time_end - time_start
            print("\tSession: [ %s, %s ] (%s)." % (time_start.isoformat(), time_end.isoformat(), str(time_dur)))

            # TODO: assuming there was only one session


            ftp.cwd("..")
            ftp.cwd("Data_Release1/{0}".format(daydir))
            # Per-channel dicts of filename and JSON name
            data = {
                'ΔE1, ΔE2, ΔE3': {
                    'E1~': 'e1',
                    'E2~': 'e2',
                    'E3~': 'e3'
                },
                'Bx~, By~ (not calibrated)': {
                    'Bx~': 'bx',
                    'By~': 'by'
                },
                'Jxz~, Jyz~ (not calibrated)': {
                    'Jxz~': 'jxz',
                    'Jyz~': 'jyz'
                }
            }

            def get_file(name):
                with ftp.xopen(name) as fp:
                    return [ float(ln) for ln in fp ]

            for chan_name, chan_files in data.items():
                chan_obj = model.Channel.objects.language('en').filter(name = chan_name)[0]
                json_data = { key: get_file(name) for name, key in chan_files.items() }


