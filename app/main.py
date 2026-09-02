from fastapi import FastAPI
from app.routes import router

app = FastAPI(
    title="Kasi Capital API",
    description="MTN MoMo Payment API",
    version="1.0.0",
)

app.include_router(router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Kasi Capital API", "docs": "/docs"}
