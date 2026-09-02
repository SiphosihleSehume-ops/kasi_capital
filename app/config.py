from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    mtn_api_user: str = ""
    mtn_api_key: str = ""
    mtn_base_url: str = "https://sandbox.momodeveloper.mtn.com"
    mtn_callback_host: str = ""
    mtn_environment: str = "sandbox"
    ocp_apim_subscription_key: str = ""
    kasi_collections_primary_key: str = ""
    kasi_remittances_primary_key: str = ""
    kasi_kasi_disbursements_primary_key: str = ""
    user_1_uuid: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
