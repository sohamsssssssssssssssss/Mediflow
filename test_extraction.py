from fastapi.testclient import TestClient
import json
import sys
from main import app

client = TestClient(app)

def upload_doc(filepath, doc_name):
    print(f"Uploading {doc_name}...")
    try:
        with open(filepath, "rb") as f:
            response = client.post("/extract", files={"file": (filepath.split("/")[-1], f, "image/jpeg")})
            print(f"Response status: {response.status_code}")
            print(json.dumps(response.json(), indent=2))
            return response.json()
    except Exception as e:
        print(f"Error: {e}")
        return None

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
