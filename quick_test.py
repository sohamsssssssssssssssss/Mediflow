#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:8000"

# Upload 3 documents to trigger conflicts
for i in range(3):
    print(f"\nUploading document {i+1}...")
    files = {"file": (f"doc{i+1}.jpg", b"dummy", "image/jpeg")}
    response = requests.post(f"{BASE_URL}/extract", files=files)
    if response.status_code == 200:
        result = response.json()
        print(f"  Entry ID: {result['entry']['id']}")
        print(f"  New conflicts: {len(result.get('new_conflicts', []))}")
        for c in result.get('new_conflicts', []):
            print(f"    - {c['conflict_type']}: {c['entry_a'].get('entry_id')}-{c['entry_b'].get('entry_id')}")

print("\n\n=== FETCHING TIMELINE ===")
response = requests.get(f"{BASE_URL}/timeline")
timeline = response.json()

print(f"\nTotal entries: {len(timeline['entries'])}")
print(f"Total conflicts: {len(timeline['conflicts'])}\n")

for i, c in enumerate(timeline['conflicts']):
    print(f"[{i}] {c['conflict_type']}: entry {c['entry_a'].get('entry_id')}-{c['entry_b'].get('entry_id')}")
    if c.get('shared_generic'):
        print(f"    Shared: {c['shared_generic']}")
