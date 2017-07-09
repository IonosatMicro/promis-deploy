from models.interval_model import Interval
import pytest

interval_data = [
    Interval(start='30/08/2000 03:08:00', end='01/11/2011 02:11:00'),
]


@pytest.mark.parametrize('interval', interval_data)
def test_search_by_interval(app, interval):
    app.interval_fixture.select(interval)
    results = app.session.find_results()
    assert results == "Found 11 result(s)"
