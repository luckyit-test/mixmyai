from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.workflows.orchestrator import router as orchestrator_router

app = FastAPI(
    title="MixMyAI Orchestration Service",
    description="Multi-agent orchestration and AI integration",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(orchestrator_router, prefix="/api/orchestration", tags=["orchestration"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "orchestration"}

@app.get("/")
async def root():
    return {
        "service": "MixMyAI Orchestration",
        "version": "1.0.0",
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
