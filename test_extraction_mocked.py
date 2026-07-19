from fastapi.testclient import TestClient
import json
import main

# Mock LLM responses
def mock_gemini_vision(system_prompt, image_bytes, media_type):
    # Depending on which document it is, we return different JSON
    if len(main.timeline) == 0:
        # Doc 1: Crocin
        return """{
  "document_type": "prescription",
  "date": "2026-07-08",
  "doctor_name": "Dr. Anjali Mehta",
  "diagnosis_mentioned": "Fever",
  "medications": [
    {
      "raw_text": "Tab. Crocin 650mg Twice Daily As needed",
      "brand_name": "Crocin",
      "dosage": "650mg",
      "frequency": "twice daily",
      "confidence": "green"
    }
  ],
  "tests_mentioned": [],
  "follow_up_date": null,
  "extraction_notes": "All text is clearly legible."
}"""
    elif len(main.timeline) == 1:
        # Doc 2: Lab report
        return """{
  "document_type": "lab_report",
  "date": "2026-07-12",
  "doctor_name": "Dr. Anjali Mehta",
  "diagnosis_mentioned": null,
  "medications": [],
  "tests_mentioned": ["Complete Blood Count", "Hemoglobin", "WBC count", "Platelet count"],
  "follow_up_date": null,
  "extraction_notes": "All text is clearly legible."
}"""
    else:
        # Doc 3: Dolo
        return """{
  "document_type": "prescription",
  "date": "2026-07-15",
  "doctor_name": "Dr. Suresh Rao",
  "diagnosis_mentioned": "Headache",
  "medications": [
    {
      "raw_text": "Dolo 650mg once daily as needed",
      "brand_name": "Dolo",
      "dosage": "650mg",
      "frequency": "once daily",
      "confidence": "green"
    }
  ],
  "tests_mentioned": [],
  "follow_up_date": "2026-07-29",
  "extraction_notes": "All text is clearly legible."
}"""

def mock_gemini(system_prompt, user_content):
    return "Dr. Mehta prescribed Crocin on July 08 and Dr. Rao prescribed Dolo on July 15 — both contain paracetamol, so it's worth confirming with your doctor whether you need both."

main._call_gemini_vision = mock_gemini_vision
main._call_gemini = mock_gemini

client = TestClient(main.app)

def upload_doc(filepath, doc_name):
    print(f"Uploading {doc_name}...")
    with open(filepath, "rb") as f:
        response = client.post("/extract", files={"file": (filepath.split("/")[-1], f, "image/jpeg")})
        print(f"Response status: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.json()

def test_api():
    doc1 = "/Users/soham/.gemini/antigravity-cli/brain/00a99f78-97bd-42a4-b964-920e3af6e72b/doc1_crocin_prescription_1784392845572.jpg"
    doc2 = "/Users/soham/.gemini/antigravity-cli/brain/00a99f78-97bd-42a4-b964-920e3af6e72b/doc2_cbc_lab_report_1784392856460.jpg"
    doc3 = "/Users/soham/.gemini/antigravity-cli/brain/00a99f78-97bd-42a4-b964-920e3af6e72b/doc3_dolo_prescription_1784392867532.jpg"
    
    upload_doc(doc1, "Document 1 (Crocin)")
    upload_doc(doc2, "Document 2 (Lab Report)")
    upload_doc(doc3, "Document 3 (Dolo)")
    
    print("\nFetching Timeline to verify conflict...")
    timeline_res = client.get("/timeline")
    print(json.dumps(timeline_res.json(), indent=2))

if __name__ == "__main__":
    test_api()
