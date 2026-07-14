from dotenv import load_dotenv
import json
import logging
import os
import re
import threading

import google.genai as genai
from google.genai import types

load_dotenv()

logger = logging.getLogger("ricescan.inference")

API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GOOGLE_API_KEY missing")

client = genai.Client(api_key=API_KEY)
MODEL = "models/gemini-2.0-flash-001"

PROMPT = """Analyze this rice leaf image like an agricultural disease detection model.
Return:

1. disease_name
2. confidence
3. cause
4. precautions
5. treatment

If uncertain, still provide most probable disease.

Return strict JSON only.

Expected JSON schema:
{
  "disease_name": "string",
  "confidence": 0,
  "cause": "string",
  "precautions": "string",
  "treatment": "string"
}
"""


def _extract_json(raw: str) -> dict:
    cleaned = raw.strip()
    cleaned = re.sub(r"^```json\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"^```\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"```\s*$", "", cleaned).strip()
    match = re.search(r"\{[\s\S]*\}", cleaned)
    if not match:
        raise ValueError("Gemini response did not contain valid JSON.")
    return json.loads(match.group(0))


def predict_disease(image_bytes: bytes, mime_type: str = "image/jpeg", req_id: str | None = None) -> dict:
    # With default ThreadPoolExecutor, each /predict should log exactly ONE of these lines.
    logger.info(
        "[%s] Gemini generate_content ENTER thread=%s bytes=%s",
        req_id or "-",
        threading.current_thread().name,
        len(image_bytes),
    )
    response = client.models.generate_content(
        model=MODEL,
        contents=[
            PROMPT,
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
        ],
    )

    logger.info("[%s] Gemini generate_content EXIT", req_id or "-")
    raw = (response.text or "").strip()
    if not raw:
        raise ValueError("Gemini returned empty response.")

    parsed = _extract_json(raw)
    return {
        "disease": str(parsed.get("disease_name", "Unknown")),
        "confidence": int(float(parsed.get("confidence", 0))),
        "cause": str(parsed.get("cause", "")),
        "precautions": str(parsed.get("precautions", "")),
        "solution": str(parsed.get("treatment", "")),
    }
