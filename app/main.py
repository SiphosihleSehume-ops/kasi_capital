from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title="Kasi Capital API",
    description="MTN MoMo Payment API — South Africa (ZAR)",
    version="1.0.0",
)

# ── CORS for Netlify frontend ───────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Kasi Capital API", "docs": "/docs"}
