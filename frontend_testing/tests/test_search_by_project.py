import pytest


@pytest.mark.parametrize('project', [
    ('Potential')
])
def test_search_by_project(app, project):
    app.project.select_a_project(project)
    selected = app.project.selected()
    assert 'The space scientific experiment' in selected


