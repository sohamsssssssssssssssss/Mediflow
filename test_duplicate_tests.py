#!/usr/bin/env python3
"""
Test script for duplicate test detection
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_duplicate_test_detection():
    """Test that duplicate test detection works correctly"""
    print("\n" + "="*70)
    print("Testing Duplicate Test Detection")
    print("="*70 + "\n")
    
    # First, upload doc2 (has CBC-related tests from Dr. Anjali Mehta on 2026-07-12)
    print("Step 1: Upload doc2 (CBC from Dr. Anjali Mehta on 2026-07-12)")
    response = requests.post(
        f"{BASE_URL}/extract",
        files={"file": ("doc2.jpg", b"fake_image_data", "image/jpeg")}
    )
    
    if response.status_code != 200:
        print(f"ERROR: {response.status_code}")
        print(response.text)
        return
    
    result = response.json()
    entry = result["entry"]
    print(f"  ✓ Document uploaded: {entry['document_type']}")
    print(f"  ✓ Tests: {', '.join(entry.get('tests_mentioned', []))}")
    print(f"  ✓ Doctor: {entry.get('doctor_name')}")
    print(f"  ✓ New conflicts: {len(result['new_conflicts'])}")
    
    # Now upload doc4 (has CBC from Dr. Suresh Rao on 2026-07-20 - 8 days later)
    print("\nStep 2: Upload doc4 (CBC from Dr. Suresh Rao on 2026-07-20)")
    response = requests.post(
        f"{BASE_URL}/extract",
        files={"file": ("doc4.jpg", b"fake_image_data", "image/jpeg")}
    )
    
    if response.status_code != 200:
        print(f"ERROR: {response.status_code}")
        print(response.text)
        return
    
    result = response.json()
    entry = result["entry"]
    print(f"  ✓ Document uploaded: {entry['document_type']}")
    print(f"  ✓ Tests: {', '.join(entry.get('tests_mentioned', []))}")
    print(f"  ✓ Doctor: {entry.get('doctor_name')}")
    print(f"  ✓ New conflicts: {len(result['new_conflicts'])}")
    
    # Check if duplicate test conflict was detected
    test_conflicts = [c for c in result['new_conflicts'] if c['conflict_type'] == 'duplicate_test']
    
    if test_conflicts:
        print("\n" + "="*70)
        print("✅ SUCCESS! Duplicate test conflict detected!")
        print("="*70)
        for conflict in test_conflicts:
            print(f"\nConflict Type: {conflict['conflict_type']}")
            print(f"Test A: {conflict['entry_a']['test_name']} ({conflict['entry_a']['date']}, {conflict['entry_a']['doctor']})")
            print(f"Test B: {conflict['entry_b']['test_name']} ({conflict['entry_b']['date']}, {conflict['entry_b']['doctor']})")
            print(f"Days apart: {conflict['days_apart']}")
            print(f"Explanation: {conflict.get('explanation', 'N/A')}")
    else:
        print("\n" + "="*70)
        print("❌ FAILED: No duplicate test conflict detected")
        print("="*70)
        print(f"New conflicts: {json.dumps(result['new_conflicts'], indent=2)}")
    
    # Get full timeline to verify
    print("\n" + "="*70)
    print("Full Timeline")
    print("="*70)
    response = requests.get(f"{BASE_URL}/timeline")
    if response.status_code == 200:
        timeline = response.json()
        print(f"\nTotal entries: {len(timeline['entries'])}")
        print(f"Total conflicts: {len(timeline['conflicts'])}")
        
        test_conflicts_total = [c for c in timeline['conflicts'] if c['conflict_type'] == 'duplicate_test']
        med_conflicts_total = [c for c in timeline['conflicts'] if c['conflict_type'] != 'duplicate_test']
        
        print(f"  - Medication conflicts: {len(med_conflicts_total)}")
        print(f"  - Test conflicts: {len(test_conflicts_total)}")
        
        if test_conflicts_total:
            print("\nTest Conflicts:")
            for conflict in test_conflicts_total:
                print(f"  • {conflict['entry_a']['test_name']} vs {conflict['entry_b']['test_name']}")
                print(f"    ({conflict['entry_a']['doctor']} vs {conflict['entry_b']['doctor']})")
                print(f"    {conflict['days_apart']} days apart")

if __name__ == "__main__":
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/health")
        health = response.json()
        print(f"\n✓ Server is running (mock_mode: {health.get('mock_mode')})")
    except requests.exceptions.ConnectionError:
        print("\n✗ ERROR: Server is not running!")
        print("  Start it with: MOCK_MODE=true uvicorn main:app --reload")
        exit(1)
    
    test_duplicate_test_detection()
