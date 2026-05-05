from app.config import settings


def frontend_redirect(path: str) -> str:
    if not path.startswith("/"):
        path = f"/{path}"
    return f"{settings.frontend_url}{path}"
