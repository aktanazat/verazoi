from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://verazoi:verazoi@localhost:5432/verazoi"
    redis_url: str = "redis://localhost:6380/0"

    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    rate_limit_public: int = 100
    rate_limit_authenticated: int = 300

    anthropic_api_key: str = ""

    cors_origins: str = "http://localhost:3000,http://localhost:8000,https://aktanazat.github.io"

    env: str = "development"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
