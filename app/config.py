from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    # MTN MoMo API credentials
    mtn_api_user: str = ""
    mtn_api_key: str = ""

    # MTN MoMo API endpoints
    mtn_base_url: str = "https://proxy.momoapi.mtn.com"
    mtn_callback_host: str = ""

    # Target environment: mtnsouthafrica for production South Africa
    mtn_environment: str = "mtnsouthafrica"

    # Currency: ZAR for South African Rand
    mtn_currency: str = "ZAR"

    # Subscription keys per product area
    kasi_collections_primary_key: str = ""
    kasi_kasi_disbursements_primary_key: str = ""
    kasi_remittances_primary_key: str = ""

    # Legacy key — kept for backward compat but not used for product-specific calls
    ocp_apim_subscription_key: str = ""

    user_1_uuid: str = ""

    # CORS — comma-separated list of allowed origins
    cors_origins: str = "https://kasicapital.netlify.app,http://localhost:3000,http://localhost:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        origins = [o.strip() for o in self.cors_origins.split(",") if o.strip()]
        if not origins:
            origins = ["https://kasicapital.netlify.app"]
        return origins


@lru_cache
def get_settings() -> Settings:
    return Settings()
