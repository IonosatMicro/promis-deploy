import pytest


@pytest.mark.parametrize('start, end', [
    ('01/01/1970 02:01:00', '02/01/1970 02:01:00')
])
def test_search_by_interval(app, start, end):
    app.time_position_helper.select_time(start, end)
    results = app.search_helper.find_results()
    assert 'Found' in results
