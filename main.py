import base64
import json
import os
import re
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from conflict_detection import check_conflicts, check_duplicate_tests

load_dotenv()

api_key = os.environ.get("GROQ_API_KEY", "")
if not api_key:
    print("ERROR: GROQ_API_KEY environment variable not set.")
    print("Create a .env file or export GROQ_API_KEY in your shell.")
from groq import Groq
groq_client = Groq(api_key=api_key) if api_key else None

app = FastAPI(title="MediFlow — Document Extraction & Conflict Detection")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VISION_MODEL = "qwen/qwen3.6-27b"
TEXT_MODEL = "llama-3.3-70b-versatile"

EXTRACTION_SYSTEM_PROMPT = """You are a medical document data-extraction assistant. Your only job is to extract structured administrative data from medical documents (prescriptions, lab reports, discharge summaries). You do NOT diagnose, interpret clinical significance, or recommend any action.

For each document, extract and return ONLY valid JSON in this exact schema, with no preamble, no markdown fences, no extra text:

{
  "document_type": "prescription | lab_report | discharge_summary",
  "date": "YYYY-MM-DD or null if not found",
  "doctor_name": "string or null",
  "diagnosis_mentioned": "string or null, verbatim from document",
  "medications": [
    {
      "raw_text": "exact text as it appears on the document",
      "brand_name": "cleaned brand/product name only, no dosage",
      "dosage": "string, e.g. '500mg' or null",
      "frequency": "string, e.g. 'twice daily' or null",
      "confidence": "green | yellow | red"
    }
  ],
  "tests_mentioned": ["array of test names, empty array if none"],
  "follow_up_date": "YYYY-MM-DD or null if not mentioned",
  "extraction_notes": "one sentence noting anything illegible or unclear"
}

Confidence rules:
- green: text is clearly legible and unambiguous
- yellow: text is legible but you made a reasonable inference (e.g. expanding an abbreviation)
- red: text is unclear, handwriting is ambiguous, or you are guessing

If a field cannot be determined, use null (or empty array for arrays). Never omit a key. Return ONLY the JSON object, nothing else."""

CONFLICT_EXPLANATION_PROMPT = """You are explaining a medication overlap to a patient in plain, calm language. You are not diagnosing or recommending treatment changes. Given two medication entries that share the same active ingredient, write ONE sentence explaining the overlap and advising the patient to verify with their physician. Do not use alarming language. Do not suggest stopping or changing any medication yourself. Output ONLY the sentence, no preamble."""

DOCTOR_QUESTIONS_PROMPT = """You are generating 2-3 specific questions a patient can ask their doctor about a medication overlap. You are NOT diagnosing, NOT recommending treatment changes, and NOT giving medical advice.

Given a conflict between two medications that share the same active ingredient (or belong to the same drug class), generate exactly 2-3 neutral, patient-facing questions the patient can bring to their next appointment. Each question must:
- Be specific to the actual drugs/doctors/dates in the conflict
- Use neutral, non-alarming language
- NOT imply any clinical recommendation (never say "should I stop", "is it safe to stop", "you should switch", etc.)
- Be phrased as something the patient can literally ask their doctor
- End with a question mark

Output ONLY a JSON array of strings, e.g.:
["Question 1?", "Question 2?", "Question 3?"]"""

DUPLICATE_TEST_EXPLANATION_PROMPT = """You are explaining a duplicate diagnostic test order to a patient in plain, calm language. You are not diagnosing or recommending any action. Given two entries where different doctors ordered the same test within a short time window, write ONE sentence explaining the duplication and gently suggesting the patient check with their doctor whether the second test is still needed to avoid unnecessary cost and repeated procedures. Do not use alarming language. Output ONLY the sentence, no preamble."""

DOCTOR_BRIEF_PROMPT = """Act as a clinical scribe preparing a brief for a busy physician. Given this patient timeline data, summarize it into exactly 3 bullet points using standard medical shorthand (e.g. "45yo" not "45 years old"). Be concise and factual — no interpretation, no diagnostic suggestions. Output ONLY the 3 bullets, no preamble, no closing remarks."""

timeline: list[dict[str, Any]] = []
all_conflicts: list[dict[str, Any]] = []


def _parse_json_response(text: str) -> dict:
    # Strip <think>...</think> block if present
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()
    
    # Strip code block fences
    cleaned = re.sub(r"^```json\s*|\s*```$", "", text.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"^```\s*|\s*```$", "", cleaned.strip())
    cleaned = cleaned.strip()
    
    # Extract outer JSON braces substring
    start_idx = cleaned.find("{")
    end_idx = cleaned.rfind("}")
    if start_idx != -1 and end_idx != -1:
        cleaned = cleaned[start_idx:end_idx+1]
        
    return json.loads(cleaned)


def _call_groq(system_prompt: str, user_content: str) -> str:
    response = groq_client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
        temperature=0,
        max_tokens=4096,
    )
    return response.choices[0].message.content


_call_groq_text = _call_groq


def _call_groq_vision(system_prompt: str, image_bytes: bytes, media_type: str) -> str:
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    data_uri = f"data:{media_type};base64,{b64}"

    response = groq_client.chat.completions.create(
        model=VISION_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Extract the structured data from this medical document. Return ONLY valid JSON."},
                    {"type": "image_url", "image_url": {"url": data_uri}},
                ],
            },
        ],
        temperature=0,
        max_tokens=4096,
    )
    return response.choices[0].message.content


class TextExtractionRequest(BaseModel):
    document_text: str


class DoctorBriefRequest(BaseModel):
    patient_info: dict[str, Any] | None = None


def _generate_conflict_explanation(conflict: dict) -> str:
    return _call_groq_text(CONFLICT_EXPLANATION_PROMPT, str(conflict))


def _generate_doctor_questions(conflict: dict) -> list[str]:
    try:
        return _parse_json_response(_call_groq_text(DOCTOR_QUESTIONS_PROMPT, str(conflict)))
    except json.JSONDecodeError:
        return ["What should I ask my doctor about this medication overlap?"]


def _process_conflicts(new_entry: dict, existing_entries: list[dict], seen_stable_ids: set) -> list[dict]:
    """Process both medication and duplicate-test conflicts for a new entry."""
    added = []

    # Medication conflicts
    for conflict in check_conflicts(new_entry, existing_entries):
        if conflict.get("stable_id") in seen_stable_ids:
            continue
        conflict["explanation"] = _generate_conflict_explanation(conflict)
        conflict["suggested_questions"] = _generate_doctor_questions(conflict)
        seen_stable_ids.add(conflict.get("stable_id"))
        all_conflicts.append(conflict)
        added.append(conflict)

    # Duplicate test conflicts
    for conflict in check_duplicate_tests(new_entry, existing_entries):
        if conflict.get("stable_id") in seen_stable_ids:
            continue
        conflict["explanation"] = _call_groq_text(DUPLICATE_TEST_EXPLANATION_PROMPT, str(conflict))
        conflict["suggested_questions"] = _generate_doctor_questions(conflict)
        seen_stable_ids.add(conflict.get("stable_id"))
        all_conflicts.append(conflict)
        added.append(conflict)

    return added


@app.post("/extract")
async def extract_document(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported.")

    contents = await file.read()

    raw_response = _call_groq_vision(EXTRACTION_SYSTEM_PROMPT, contents, file.content_type)
    try:
        extracted = _parse_json_response(raw_response)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse LLM response as JSON: {raw_response[:200]}",
        )

    entry = {**extracted, "id": len(timeline) + 1}
    timeline.append(entry)

    seen_stable_ids = {c.get("stable_id") for c in all_conflicts if c.get("stable_id")}
    added_this_batch = _process_conflicts(entry, timeline[:-1], seen_stable_ids)

    return {
        "status": "ok",
        "entry": entry,
        "new_conflicts": added_this_batch,
    }


@app.post("/extract-text")
async def extract_from_text(request: TextExtractionRequest):
    raw_response = _call_groq(EXTRACTION_SYSTEM_PROMPT, request.document_text)
    try:
        extracted = _parse_json_response(raw_response)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse LLM response as JSON: {raw_response[:200]}",
        )

    entry = {**extracted, "id": len(timeline) + 1}
    timeline.append(entry)

    seen_stable_ids = {c.get("stable_id") for c in all_conflicts if c.get("stable_id")}
    added_this_batch = _process_conflicts(entry, timeline[:-1], seen_stable_ids)

    return {
        "status": "ok",
        "entry": entry,
        "new_conflicts": added_this_batch,
    }


@app.post("/doctor-brief")
async def doctor_brief(request: DoctorBriefRequest | None = None):
    if not timeline:
        return {
            "status": "ok",
            "brief": "No timeline data available. Upload medical documents first.",
        }

    context = {
        "timeline": timeline,
        "conflicts": all_conflicts,
    }
    if request and request.patient_info:
        context["patient_info"] = request.patient_info
    brief = _call_groq(DOCTOR_BRIEF_PROMPT, str(context))

    return {
        "status": "ok",
        "brief": brief,
    }


@app.get("/timeline")
async def get_timeline():
    """
    Returns timeline entries and a deduplicated conflicts list.
    
    Deduplication is applied globally:
    - Conflicts are identified by a content-based unique ID (medication/test names + conflict type + shared ingredient)
    - Only the first occurrence of each unique real-world conflict is returned
    """
    seen_conflicts: dict[str, dict] = {}
    for conflict in all_conflicts:
        stable_id = conflict.get("stable_id")
        if stable_id:
            if stable_id not in seen_conflicts:
                conflict["conflict_id"] = stable_id
                seen_conflicts[stable_id] = conflict
        else:
            conflict_type = conflict.get("conflict_type", "")
            if conflict_type == "duplicate_test":
                shared = conflict.get("shared_test", "unknown")
                cid = f"test-fallback-{shared}"
            else:
                shared = conflict.get("shared_generic", "unknown")
                cid = f"med-fallback-{shared}"
            if cid not in seen_conflicts:
                conflict["conflict_id"] = cid
                seen_conflicts[cid] = conflict
    
    deduplicated_conflicts = list(seen_conflicts.values())
    
    return {
        "entries": sorted(timeline, key=lambda e: e.get("date") or ""),
        "conflicts": deduplicated_conflicts,
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "entries": len(timeline),
        "conflicts": len(all_conflicts),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
