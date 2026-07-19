from conflict_detection import check_conflicts

existing = [
    {
        "id": 1,
        "date": "2025-07-10",
        "doctor_name": "Dr. Mehta",
        "medications": [
            {"brand_name": "Aten", "dosage": "50mg", "frequency": "once daily"},
            {"brand_name": "Crocin", "dosage": "500mg", "frequency": "as needed"},
        ],
    }
]

new_entry = {
    "id": 2,
    "date": "2025-07-15",
    "doctor_name": "Dr. Rao",
    "medications": [
        {"brand_name": "Metoprolol", "dosage": "25mg", "frequency": "once daily"},
        {"brand_name": "Dolo 650", "dosage": "650mg", "frequency": "twice daily"},
    ],
}

conflicts = check_conflicts(new_entry, existing)
for c in conflicts:
    print(f"[{c['conflict_type']}] {c['entry_a']} <-> {c['entry_b']} | shared: {c['shared_generic']}")
