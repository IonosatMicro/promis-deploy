import pytest


@pytest.mark.parametrize('project, description', [
    ('Potential', 'The space scientific experiment'),
    ('Roundabout', 'A satellite that does something similar'),
    ('Peace&Love', 'A satellite with exquisite orbit')
])
def test_search_by_project(app, project, description):
    app.search_helper.select_a_project(project)
    selected = app.search_helper.selected()
    assert description in selected





