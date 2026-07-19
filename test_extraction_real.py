import os
import json
from dotenv import load_dotenv
from fastapi.testclient import TestClient
import main

# Load environment variables
load_dotenv()

# We test using TestClient, but since main already has GEMINI_API_KEY initialized
# we might need to reconfigure it if it was loaded before dotenv
if not os.environ.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY") == "your-api-key-here":
    print("WARNING: GEMINI_API_KEY is not set or is still the default template!")
    # If the system injected a different key name, try to use it
    if os.environ.get("GOOGLE_API_KEY"):
        os.environ["GEMINI_API_KEY"] = os.environ.get("GOOGLE_API_KEY")

import google.generativeai as genai
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

main.MOCK_MODE = False
client = TestClient(main.app)

def upload_doc(filepath, doc_name):
    print(f"\nUploading {doc_name}...")
    with open(filepath, "rb") as f:
        response = client.post("/extract", files={"file": (filepath.split("/")[-1], f, "image/jpeg")})
        print(f"Response status: {response.status_code}")
        if response.status_code != 200:
            print("Error response:", response.text)
        else:
            print(json.dumps(response.json(), indent=2))
        return response.json()

def test_api():
    doc1 = "/Users/soham/hackatons /ai agentic hackaton v1/demo_documents/doc1_crocin_prescription.jpg"
    doc2 = "/Users/soham/hackatons /ai agentic hackaton v1/demo_documents/doc2_cbc_lab_report.jpg"
    doc3 = "/Users/soham/hackatons /ai agentic hackaton v1/demo_documents/doc3_dolo_prescription.jpg"
    
    res1 = upload_doc(doc1, "Document 1 (Crocin)")
    res2 = upload_doc(doc2, "Document 2 (Lab Report)")
    res3 = upload_doc(doc3, "Document 3 (Dolo)")
    
    print("\nFetching Timeline to verify conflict...")
    timeline_res = client.get("/timeline")
    print(json.dumps(timeline_res.json(), indent=2))

    # Save fixtures
    if res1 and res1.get("status") == "ok":
        with open("mock_responses/doc1_extraction.json", "w") as f:
            # mock_responses expect just the extracted JSON part, not the whole envelope
            # Wait, main.py does: extracted = json.loads(raw)
            # So the fixture should be the raw extracted dictionary
            # Let's reconstruct it by removing id from entry
            entry = res1["entry"].copy()
            entry.pop("id", None)
            json.dump(entry, f, indent=2)
            print("Saved mock_responses/doc1_extraction.json")
            
    if res2 and res2.get("status") == "ok":
        with open("mock_responses/doc2_extraction.json", "w") as f:
            entry = res2["entry"].copy()
            entry.pop("id", None)
            json.dump(entry, f, indent=2)
            print("Saved mock_responses/doc2_extraction.json")
            
    if res3 and res3.get("status") == "ok":
        with open("mock_responses/doc3_extraction.json", "w") as f:
            entry = res3["entry"].copy()
            entry.pop("id", None)
            json.dump(entry, f, indent=2)
            print("Saved mock_responses/doc3_extraction.json")

if __name__ == "__main__":
    test_api()
