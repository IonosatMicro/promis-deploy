import pytest

@pytest.mark.parametrize('start, end', [
    (20, 80)
])
def test_search_by_latitude(app, start, end):
    app.time_position_helper.select_latitude(start, end)
    # results = app.session.find_results()
    # assert results == "Found 7 result(s)"