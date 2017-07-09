def test_rectangle(app):
    app.map_fixture.rectangle()
    results = app.session.find_results()
    assert results == "Found 7 result(s)"
