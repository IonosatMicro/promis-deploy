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
from django.core.management.base import BaseCommand
import backend_api.models as model

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("sat", nargs="*", type=str)

    def handle(self, *args, **options):
        # Forming the list of satellites to update depending on the parameters
        # TODO: pick up the language from locale
        space_projects_base = model.Space_project.objects.language('en')
        if len(options["sat"]) > 0:
            space_projects = None
            for sat in options["sat"]:
                sat_obj = space_projects_base.filter(name = sat)
                if not space_projects:
                    space_projects = sat_obj
                else:
                    space_projects |= sat_obj
        else:
            space_projects = space_projects_base

        # Updating the selection
        for sat in space_projects:
            if sat.klass:
                try:
                    print("=> Checking data for satellite: %s." % sat.name)
                    sat_obj = sat.instance()
                    sat_obj.update()

                except (ImportError, AttributeError) as e:
                    print("Error calling data fetch function for satellite %s: %s." % (sat.name, e))
                    print("Please contact the maintainer. Aborting operation")
                    # TODO: roll back the transaction or let it sink?
                    break
            else:
                print("No behaviour defined for satellite: %s." % sat.name)
                break
