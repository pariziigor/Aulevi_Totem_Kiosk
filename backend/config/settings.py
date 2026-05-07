# backend/config/settings.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Aulevi Kiosk API"
    debug_mode: bool = False  # Obrigatório: Utilizar apenas True ou False
    database_url: str = "sqlite:///./kiosk_local.db"
    offline_mode_active: bool = True # Obrigatório: Utilizar apenas True ou False

settings = Settings()