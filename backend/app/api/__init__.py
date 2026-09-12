from fastapi import APIRouter
from .upload import router as upload_router
from .roadmap import router as roadmap_router
from .weekly_prep import router as weekly_prep_router

router = APIRouter()
router.include_router(upload_router)
router.include_router(roadmap_router)
router.include_router(weekly_prep_router)
