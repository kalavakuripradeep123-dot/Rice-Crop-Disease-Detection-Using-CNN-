from dotenv import load_dotenv

# Load env vars FIRST — before any module that reads them at import time
load_dotenv()

import asyncio
import logging
import os
import uuid

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from inference_engine import predict_disease

logger = logging.getLogger("ricescan.predict")

# Set INFERENCE_TRACE=1 to log one line per /predict and per external API invocation (verify 1:1).
if os.getenv("INFERENCE_TRACE", "").strip() in ("1", "true", "yes"):
    if not logging.root.handlers:
        logging.basicConfig(level=logging.INFO)
    logger.setLevel(logging.INFO)
    logging.getLogger("ricescan.inference").setLevel(logging.INFO)

app = FastAPI(
    title="RiceScan AI — Disease Classification API",
    description="CNN + Faster R-CNN hybrid disease prediction pipeline",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"service": "RiceScan AI Classification API", "version": "1.0.0", "status": "operational"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Run disease classification inference on an uploaded rice leaf image."""
    req_id = str(uuid.uuid4())
    logger.info("[%s] /predict started bytes_pending=stream", req_id)

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file received.")

    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image too large. Maximum size is 10 MB.")

    mime = file.content_type or "image/jpeg"

    logger.info("[%s] /predict run_in_executor submit len=%s mime=%s", req_id, len(image_bytes), mime)

    loop = asyncio.get_running_loop()
    try:
        result = await loop.run_in_executor(None, predict_disease, image_bytes, mime, req_id)
        logger.info("[%s] /predict OK", req_id)
        return result
    except Exception as e:
        logger.exception("[%s] /predict failed", req_id)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
