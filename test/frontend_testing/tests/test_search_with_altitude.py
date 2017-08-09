from models.altitude_model import Altitude
import pytest

altitude_data = [
    Altitude(start='10', end='700'),
]


@pytest.mark.parametrize('altitude', altitude_data)
def test_search_by_altitude(app, altitude):
    app.coordinates.select_altitude(altitude)
    results = app.session.find_results()
    assert results == "Found 19 result(s)"
