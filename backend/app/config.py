import logging
import sys

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://verazoi:verazoi@localhost:5432/verazoi"
    redis_url: str = "redis://localhost:6379/0"

    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30

    rate_limit_public: int = 100
    rate_limit_authenticated: int = 300

    anthropic_api_key: str = ""

    frontend_origin: str = "http://localhost:3000"
    cors_origins: str = "http://localhost:3000"

    env: str = "development"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def allowed_origins(self) -> list[str]:
        origins = [self.frontend_origin, *self.cors_origins.split(",")]
        return sorted({origin.strip().rstrip("/") for origin in origins if origin.strip()})

    @property
    def frontend_url(self) -> str:
        return self.frontend_origin.rstrip("/")

    def model_post_init(self, __context) -> None:
        if self.env != "production":
            return
        if self.jwt_secret == "change-me-in-production" or len(self.jwt_secret) < 32:
            raise RuntimeError("JWT_SECRET must be set to a strong value in production")
        if not self.frontend_origin.startswith("https://"):
            raise RuntimeError("FRONTEND_ORIGIN must be an HTTPS origin in production")
        if any("localhost" in origin or origin.startswith("http://") for origin in self.allowed_origins):
            raise RuntimeError("CORS origins must be HTTPS production origins")


settings = Settings()


def setup_logging():
    level = logging.DEBUG if settings.env == "development" else logging.INFO
    fmt = "%(asctime)s %(levelname)s %(name)s %(message)s"
    logging.basicConfig(level=level, format=fmt, stream=sys.stdout)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


setup_logging()
log = logging.getLogger("verazoi")
