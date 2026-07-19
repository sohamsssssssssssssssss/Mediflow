#!/usr/bin/env python3
"""
Test script to diagnose conflict duplication issue in MOCK_MODE
"""
import os
import json
import sys
from pathlib import Path

# Set MOCK_MODE to true
os.environ["MOCK_MODE"] = "true"

import requests
import time

BASE_URL = "http://localhost:8000"

def test_document(doc_name: str):
    """Test extraction for a document in mock mode"""
    print(f"\n{'='*70}")
    print(f"Testing: {doc_name}")
    print(f"{'='*70}\n")
    
    # In mock mode, we just send a dummy file
    files = {"file": (doc_name, b"dummy", "image/jpeg")}
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
    
    print(f"\nMedications:")
    for med in entry.get("medications", []):
        print(f"  - {med.get('brand_name')} {med.get('dosage')} ({med.get('frequency')})")
    
    print(f"\nNew conflicts returned in /extract response:")
    print(f"  Count: {len(result.get('new_conflicts', []))}")
    for i, conflict in enumerate(result.get('new_conflicts', [])):
        conflict_id = f"{conflict['entry_a'].get('entry_id')}-{conflict['entry_b'].get('entry_id')}"
        print(f"  [{i}] {conflict['conflict_type']}: {conflict_id}")
        if conflict.get('shared_generic'):
            print(f"       Shared: {conflict['shared_generic']}")
    
    print(f"\n{'='*70}\n")
    return entry

def test_timeline():
    """Get the full timeline with conflicts"""
    print(f"\n{'='*70}")
    print(f"FULL TIMELINE FROM /timeline ENDPOINT")
    print(f"{'='*70}\n")
    
    response = requests.get(f"{BASE_URL}/timeline")
    if response.status_code != 200:
        print(f"ERROR: {response.status_code}")
        print(response.text)
        return None
    
    timeline = response.json()
    print(f"Total entries: {len(timeline['entries'])}")
    print(f"Total conflicts in all_conflicts array: {len(timeline['conflicts'])}")
    
    if timeline['conflicts']:
        print(f"\nAll Conflicts (with detailed breakdown):")
        for i, conflict in enumerate(timeline['conflicts']):
            conflict_id = f"{conflict['entry_a'].get('entry_id')}-{conflict['entry_b'].get('entry_id')}"
            print(f"  [{i}] {conflict['conflict_type']}: {conflict_id}")
            if conflict.get('shared_generic'):
                print(f"       Shared ingredient: {conflict['shared_generic']}")
            elif conflict.get('shared_test'):
                print(f"       Shared test: {conflict['shared_test']}")
    
    print(f"\n{'='*70}\n")
    return timeline

def main():
    """Run all tests"""
    print("\nMediFlow Conflict Duplication Diagnostic Test (MOCK MODE)")
    print("="*70)
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/health")
        health = response.json()
        print(f"\n✓ Server is running")
        print(f"  Mock mode: {health.get('mock_mode')}")
        print(f"  Current entries: {health.get('entries')}")
        print(f"  Current conflicts: {health.get('conflicts')}")
    except requests.exceptions.ConnectionError:
        print("\n✗ ERROR: Server is not running!")
        print("  Start it with: MOCK_MODE=true uvicorn main:app --reload")
        sys.exit(1)
    
    # Upload 4 documents in order
    print("\n>>> Step 1: Upload doc1 (Crocin prescription)")
    test_document("doc1_crocin_prescription.jpg")
    time.sleep(0.5)
    
    print("\n>>> Step 2: Upload doc2 (CBC lab report)")
    test_document("doc2_cbc_lab_report.jpg")
    time.sleep(0.5)
    
    print("\n>>> Step 3: Upload doc3 (Dolo prescription) - SHOULD CONFLICT WITH DOC1")
    test_document("doc3_dolo_prescription.jpg")
    time.sleep(0.5)
    
    print("\n>>> Step 4: Upload doc4 (second CBC lab report) - SHOULD CONFLICT WITH DOC2")
    test_document("doc4_extraction.json")
    time.sleep(0.5)
    
    # Get full timeline and show all conflicts
    print("\n>>> Step 5: Fetch full timeline to see all accumulated conflicts")
    timeline = test_timeline()
    
    # Diagnostic analysis
    print("\n" + "="*70)
    print("DIAGNOSTIC ANALYSIS")
    print("="*70)
    
    if timeline:
        conflicts = timeline['conflicts']
        print(f"\nTotal conflicts returned: {len(conflicts)}")
        
        # Count by type
        med_conflicts = [c for c in conflicts if c['conflict_type'] != 'duplicate_test']
        test_conflicts = [c for c in conflicts if c['conflict_type'] == 'duplicate_test']
        print(f"  Medication conflicts: {len(med_conflicts)}")
        print(f"  Test conflicts: {len(test_conflicts)}")
        
        # Group by conflict identity
        conflict_ids = {}
        for i, conflict in enumerate(conflicts):
            conflict_id = f"{conflict['entry_a'].get('entry_id')}-{conflict['entry_b'].get('entry_id')}"
            shared = conflict.get('shared_generic') or conflict.get('shared_test', 'unknown')
            key = f"{conflict_id}:{shared}"
            if key not in conflict_ids:
                conflict_ids[key] = []
            conflict_ids[key].append(i)
        
        print(f"\nUnique conflict identities: {len(conflict_ids)}")
        for key, indices in conflict_ids.items():
            if len(indices) > 1:
                print(f"  ⚠️  DUPLICATE: {key} appears {len(indices)} times (indices: {indices})")
            else:
                print(f"  ✓ {key}")
    
    print("\n" + "="*70)

if __name__ == "__main__":
    main()
