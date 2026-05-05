from app.main import app


def test_expected_public_api_routes_are_registered():
    paths = set(app.openapi()["paths"])

    expected = {
        "/health",
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/glucose",
        "/api/v1/meals",
        "/api/v1/timeline",
        "/api/v1/stability/score",
        "/api/v1/insights/weekly/preview",
        "/api/v1/cgm/status",
    }

    assert expected <= paths
