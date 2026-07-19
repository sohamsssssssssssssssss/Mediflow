#!/usr/bin/env python3
"""
Test script for MediFlow real document extraction with Groq API
Run with MOCK_MODE=false after adding GROQ_API_KEY to .env
"""
import os
import json
import sys
from pathlib import Path

# Load .env
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                v = v.strip().strip('"').strip("'")
                os.environ.setdefault(k.strip(), v)

# Set MOCK_MODE to false to test real API
os.environ["MOCK_MODE"] = "false"

# Check for API key
if not os.environ.get("GROQ_API_KEY") or os.environ.get("GROQ_API_KEY") == "YOUR_GROQ_API_KEY_HERE":
    print("ERROR: Please set your GROQ_API_KEY in .env file")
    print("Get your key at: https://console.groq.com/keys")
    sys.exit(1)

import requests
import time

BASE_URL = "http://localhost:8000"

def test_document(doc_path: str, doc_name: str):
    """Test extraction for a single document"""
    print(f"\n{'='*70}")
    print(f"Testing: {doc_name}")
    print(f"{'='*70}\n")
    
    with open(doc_path, "rb") as f:
        files = {"file": (doc_name, f, "image/jpeg")}
        response = requests.post(f"{BASE_URL}/extract", files=files)
    
    if response.status_code != 200:
        print(f"ERROR: {response.status_code}")
        print(response.text)
        return None
    
    result = response.json()
    entry = result["entry"]
    
    print(f"Document Type: {entry.get('document_type', 'N/A')}")
    print(f"Date: {entry.get('date', 'N/A')}")
    print(f"Doctor: {entry.get('doctor_name', 'N/A')}")
    print(f"Diagnosis: {entry.get('diagnosis_mentioned', 'N/A')}")
    print(f"\nMedications:")
    for med in entry.get("medications", []):
        print(f"  - {med.get('brand_name')} {med.get('dosage')} ({med.get('frequency')})")
        print(f"    Raw: {med.get('raw_text')}")
        print(f"    Confidence: {med.get('confidence')}")
    
    if entry.get("tests_mentioned"):
        print(f"\nTests: {', '.join(entry.get('tests_mentioned', []))}")
    
    if entry.get("follow_up_date"):
        print(f"Follow-up: {entry['follow_up_date']}")
    
    if entry.get("extraction_notes") and entry.get("extraction_notes") != "None":
        print(f"\nNotes: {entry['extraction_notes']}")
    
    if result.get("new_conflicts"):
        print(f"\n⚠️  NEW CONFLICTS DETECTED:")
        for conflict in result["new_conflicts"]:
            print(f"  - {conflict.get('conflict_type')}")
            print(f"    {conflict.get('explanation', 'No explanation')}")
    
    print(f"\n{'='*70}\n")
    return entry

def test_timeline():
    """Get the full timeline with conflicts"""
    print(f"\n{'='*70}")
    print(f"FULL TIMELINE")
    print(f"{'='*70}\n")
    
    response = requests.get(f"{BASE_URL}/timeline")
    if response.status_code != 200:
        print(f"ERROR: {response.status_code}")
        print(response.text)
        return None
    
    timeline = response.json()
    print(f"Total entries: {len(timeline['entries'])}")
    print(f"Total conflicts: {len(timeline['conflicts'])}")
    
    if timeline['conflicts']:
        print(f"\nAll Conflicts:")
        for conflict in timeline['conflicts']:
            print(f"\n  Type: {conflict.get('conflict_type')}")
            print(f"  Entry A: {conflict['entry_a'].get('brand_name')} ({conflict['entry_a'].get('date')})")
            print(f"  Entry B: {conflict['entry_b'].get('brand_name')} ({conflict['entry_b'].get('date')})")
            print(f"  Shared: {conflict.get('shared_generic', 'N/A')}")
            print(f"  Explanation: {conflict.get('explanation', 'N/A')}")
    
    print(f"\n{'='*70}\n")
    return timeline

def save_to_mock_responses(entry: dict, filename: str):
    """Save extracted entry to mock_responses directory"""
    mock_dir = Path(__file__).parent / "mock_responses"
    mock_dir.mkdir(exist_ok=True)
    
    # Remove the 'id' field for fixture
    fixture = {k: v for k, v in entry.items() if k != "id"}
    
    filepath = mock_dir / filename
    with open(filepath, "w") as f:
        json.dump(fixture, f, indent=2)
    print(f"✓ Saved to {filepath}")

def main():
    """Run all tests"""
    print("\nMediFlow Real Document Extraction Test")
    print("="*70)
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/health")
        health = response.json()
        print(f"\n✓ Server is running")
        print(f"  Mock mode: {health.get('mock_mode')}")
        print(f"  Current entries: {health.get('entries')}")
    except requests.exceptions.ConnectionError:
        print("\n✗ ERROR: Server is not running!")
        print("  Start it with: uvicorn main:app --reload")
        sys.exit(1)
    
    demo_dir = Path(__file__).parent / "demo_documents"
    
    # Test doc1 - Crocin prescription
    doc1 = test_document(
        demo_dir / "doc1_crocin_prescription.jpg",
        "doc1_crocin_prescription.jpg"
    )
    if doc1:
        save_to_mock_responses(doc1, "doc1_extraction.json")
        time.sleep(1)  # Rate limit
    
    # Test doc2 - CBC lab report
    doc2 = test_document(
        demo_dir / "doc2_cbc_lab_report.jpg",
        "doc2_cbc_lab_report.jpg"
    )
    if doc2:
        save_to_mock_responses(doc2, "doc2_extraction.json")
        time.sleep(1)
    
    # Test doc3 - Dolo prescription (should trigger conflict with doc1)
    doc3 = test_document(
        demo_dir / "doc3_dolo_prescription.jpg",
        "doc3_dolo_prescription.jpg"
    )
    if doc3:
        save_to_mock_responses(doc3, "doc3_extraction.json")
        time.sleep(1)
    
    # Get full timeline
    timeline = test_timeline()
    
    print("\n" + "="*70)
    print("TEST COMPLETE")
    print("="*70)
    print("\nAll real extractions have been saved to mock_responses/")
    print("These verified outputs will now be used as fixtures for mock mode.")

if __name__ == "__main__":
    main()
