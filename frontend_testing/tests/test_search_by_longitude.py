from models.longitude_model import Longitude
import pytest

longitude_data = [
    Longitude(start='-170', end='170'),
]


@pytest.mark.parametrize('longitude', longitude_data)
def test_search_by_longitude(app, longitude):
    app.coordinates.select_longitude(longitude)
    # results = app.session.find_results()
    # assert results == "Found 19 result(s)"