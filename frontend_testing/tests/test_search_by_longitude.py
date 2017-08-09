import pytest


@pytest.mark.parametrize('start, end', [
    (20, 80)
])
def test_search_by_longitude(app, start, end):
    app.time_position_helper.select_longitude(start, end)
    # results = app.session.find_results()
    # assert results == "Found 19 result(s)"
