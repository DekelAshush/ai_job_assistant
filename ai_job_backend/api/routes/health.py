from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check():
    """Simple health check endpoint."""
    return {"status": "online", "service": "ai-job-assistant"}
