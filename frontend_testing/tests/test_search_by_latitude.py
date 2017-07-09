from models.latitutde_model import Latitude
import pytest

latitude_data = [
    Latitude(start='-80', end='80')
]


@pytest.mark.parametrize('latitude', latitude_data)
def test_search_by_latitude(app, latitude):
    app.coordinates.select_latitude(latitude)
    results = app.session.find_results()
    assert results == "Found 7 result(s)"