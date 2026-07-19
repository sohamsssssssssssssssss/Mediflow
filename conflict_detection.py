from typing import Any
from datetime import datetime, timedelta

BRAND_TO_GENERIC: dict[str, str] = {
    "crocin": "paracetamol",
    "calpol": "paracetamol",
    "dolo": "paracetamol",
    "dolo 650": "paracetamol",
    "combiflam": "ibuprofen+paracetamol",
    "brufen": "ibuprofen",
    "ibugesic": "ibuprofen",
    "augmentin": "amoxicillin+clavulanic acid",
    "amoxicillin": "amoxicillin",
    "azithral": "azithromycin",
    "azee": "azithromycin",
    "pantop": "pantoprazole",
    "pan 40": "pantoprazole",
    "pan 20": "pantoprazole",
    "metrogyl": "metronidazole",
    "glycomet": "metformin",
    "glycomet-g": "metformin+glimepiride",
    "glimepiride": "glimepiride",
    "atenolol": "atenolol",
    "aten": "atenolol",
    "metoprolol": "metoprolol",
    "met XL": "metoprolol",
    "metolar": "metoprolol",
    "ecosprin": "aspirin",
    "shelcal": "calcium carbonate",
    "shelcal-500": "calcium carbonate",
    "thyronorm": "levothyroxine",
    "thyrox": "levothyroxine",
    "eltroxin": "levothyroxine",
    "monocef": "ceftriaxone",
    "taxim": "cefixime",
    "cef": "cefixime",
    "sinarest": "paracetamol+chlorpheniramine+phenylephrine",
    "cetirizine": "cetirizine",
    "zyrtec": "cetirizine",
    "allegra": "fexofenadine",
    "dezac": "omeprazole",
    "omaprez": "omeprazole",
    "losartan": "losartan",
    "losar": "losartan",
    "amlodipine": "amlodipine",
    "amlo": "amlodipine",
    "telma": "telmisartan",
    "telmisartan": "telmisartan",
    "glimy": "glimepiride",
    "glimipire": "glimepiride",
    "januvia": "sitagliptin",
    "empagliflozin": "empagliflozin",
    "jardiance": "empagliflozin",
}

DRUG_CLASS_MAP: dict[str, str] = {
    "paracetamol": "analgesic-antipyretic",
    "ibuprofen": "nsaid",
    "aspirin": "nsaid",
    "amoxicillin": "antibiotic-penicillin",
    "amoxicillin+clavulanic acid": "antibiotic-penicillin",
    "azithromycin": "antibiotic-macrolide",
    "ceftriaxone": "antibiotic-cephalosporin",
    "cefixime": "antibiotic-cephalosporin",
    "metronidazole": "antibiotic-nitroimidazole",
    "pantoprazole": "proton-pump-inhibitor",
    "omeprazole": "proton-pump-inhibitor",
    "metformin": "antidiabetic-biguanide",
    "metformin+glimepiride": "antidiabetic-combination",
    "glimepiride": "antidiabetic-sulfonylurea",
    "sitagliptin": "antidiabetic-dpp4-inhibitor",
    "empagliflozin": "antidiabetic-sglt2-inhibitor",
    "atenolol": "beta-blocker",
    "metoprolol": "beta-blocker",
    "losartan": "arb",
    "telmisartan": "arb",
    "amlodipine": "calcium-channel-blocker",
    "levothyroxine": "thyroid-hormone",
    "calcium carbonate": "calcium-supplement",
    "cetirizine": "antihistamine",
    "fexofenadine": "antihistamine",
    "ibuprofen+paracetamol": "nsaid+analgesic",
    "paracetamol+chlorpheniramine+phenylephrine": "cold-combination",
}

# Test name normalization dictionary (demo-scale, not full LOINC ontology)
TEST_NAME_NORMALIZATION: dict[str, str] = {
    # Complete Blood Count variants
    "cbc": "complete_blood_count",
    "complete blood count": "complete_blood_count",
    "hemogram": "complete_blood_count",
    "cbc with differential": "complete_blood_count",
    "blood count": "complete_blood_count",
    # CBC sub-components (common when LLM extracts individual values instead of panel name)
    "hemoglobin": "complete_blood_count",
    "hgb": "complete_blood_count",
    "hb": "complete_blood_count",
    "wbc count": "complete_blood_count",
    "white blood cell count": "complete_blood_count",
    "white cell count": "complete_blood_count",
    "platelet count": "complete_blood_count",
    "platelets": "complete_blood_count",
    "wbc differential": "complete_blood_count",
    "differential count": "complete_blood_count",
    "rbc count": "complete_blood_count",
    "red blood cell count": "complete_blood_count",
    "hematocrit": "complete_blood_count",
    "packed cell volume": "complete_blood_count",
    "pcv": "complete_blood_count",
    "mcv": "complete_blood_count",
    "mch": "complete_blood_count",
    "mchc": "complete_blood_count",
    "rdw": "complete_blood_count",
    
    # Lipid Panel variants
    "lipid profile": "lipid_panel",
    "lipid panel": "lipid_panel",
    "cholesterol test": "lipid_panel",
    "lipid test": "lipid_panel",
    "fasting lipid profile": "lipid_panel",
    
    # Liver Function Test variants
    "lft": "liver_function_test",
    "liver function test": "liver_function_test",
    "liver function tests": "liver_function_test",
    "hepatic panel": "liver_function_test",
    
    # Kidney Function Test variants
    "rft": "renal_function_test",
    "kft": "renal_function_test",
    "renal function test": "renal_function_test",
    "kidney function test": "renal_function_test",
    "renal panel": "renal_function_test",
    
    # Thyroid Function Test variants
    "tft": "thyroid_function_test",
    "thyroid function test": "thyroid_function_test",
    "thyroid profile": "thyroid_function_test",
    "tsh": "thyroid_function_test",
    "thyroid panel": "thyroid_function_test",
    
    # Blood Glucose variants
    "fbs": "fasting_blood_sugar",
    "fasting blood sugar": "fasting_blood_sugar",
    "fasting glucose": "fasting_blood_sugar",
    "blood sugar fasting": "fasting_blood_sugar",
    "blood glucose": "blood_glucose",
    "random blood sugar": "random_blood_sugar",
    "rbs": "random_blood_sugar",
    
    # HbA1c variants
    "hba1c": "glycated_hemoglobin",
    "glycated hemoglobin": "glycated_hemoglobin",
    "glycosylated hemoglobin": "glycated_hemoglobin",
    "a1c": "glycated_hemoglobin",
    
    # Urine tests
    "urine routine": "urine_routine_microscopy",
    "urine r/m": "urine_routine_microscopy",
    "urine rm": "urine_routine_microscopy",
    "urine analysis": "urine_routine_microscopy",
    "urinalysis": "urine_routine_microscopy",
    
    # X-ray variants
    "chest x-ray": "chest_xray",
    "chest xray": "chest_xray",
    "cxr": "chest_xray",
    "x-ray chest": "chest_xray",
    
    # ECG/EKG variants
    "ecg": "electrocardiogram",
    "ekg": "electrocardiogram",
    "electrocardiogram": "electrocardiogram",
    "electrocardiography": "electrocardiogram",
    
    # Ultrasound variants
    "usg abdomen": "ultrasound_abdomen",
    "ultrasound abdomen": "ultrasound_abdomen",
    "abdominal ultrasound": "ultrasound_abdomen",
    "abdomen ultrasound": "ultrasound_abdomen",
}


def _normalize_test_name(test_name: str) -> str | None:
    """Normalize test name to canonical form."""
    normalized = test_name.lower().strip()
    
    # Exact match
    if normalized in TEST_NAME_NORMALIZATION:
        return TEST_NAME_NORMALIZATION[normalized]
    
    # Partial match (fuzzy)
    for key in TEST_NAME_NORMALIZATION:
        if key in normalized or normalized in key:
            return TEST_NAME_NORMALIZATION[key]
    
    return None


def _lookup_generic(brand_name: str) -> str | None:
    normalized = brand_name.lower().strip()
    if normalized in BRAND_TO_GENERIC:
        return BRAND_TO_GENERIC[normalized]
    for key in BRAND_TO_GENERIC:
        if key in normalized or normalized in key:
            return BRAND_TO_GENERIC[key]
    return None


def _get_class(generic: str) -> str | None:
    return DRUG_CLASS_MAP.get(generic)


def check_conflicts(
    new_entry: dict[str, Any],
    existing_timeline: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    conflicts: list[dict[str, Any]] = []
    seen_conflict_keys: set[str] = set()
    new_meds = new_entry.get("medications", [])

    for new_med in new_meds:
        new_generic = _lookup_generic(new_med.get("brand_name", ""))
        if not new_generic:
            continue
        new_drug_class = _get_class(new_generic)

        for existing_entry in existing_timeline:
            # Skip self-comparison (same entry ID)
            if existing_entry.get("id") == new_entry.get("id"):
                continue

            for existing_med in existing_entry.get("medications", []):
                existing_generic = _lookup_generic(existing_med.get("brand_name", ""))
                if not existing_generic:
                    continue
                existing_drug_class = _get_class(existing_generic)

                # Create a stable conflict key to dedupe
                # Sort by entry ID to ensure A-B and B-A produce same key
                entry_a_id = new_entry.get("id")
                entry_b_id = existing_entry.get("id")
                if entry_a_id is None or entry_b_id is None:
                    continue
                sorted_ids = tuple(sorted([entry_a_id, entry_b_id]))
                conflict_key = f"{sorted_ids[0]}-{sorted_ids[1]}-{new_generic}"

                if conflict_key in seen_conflict_keys:
                    continue

                if new_generic == existing_generic:
                    stable_id = f"duplicate_ingredient:{new_generic}"
                    conflicts.append({
                        "conflict_type": "duplicate_ingredient",
                        "stable_id": stable_id,
                        "entry_a": {
                            "date": new_entry.get("date"),
                            "medication": new_med.get("brand_name"),
                            "doctor": new_entry.get("doctor_name"),
                            "entry_id": entry_a_id,
                        },
                        "entry_b": {
                            "date": existing_entry.get("date"),
                            "medication": existing_med.get("brand_name"),
                            "doctor": existing_entry.get("doctor_name"),
                            "entry_id": entry_b_id,
                        },
                        "shared_generic": new_generic,
                    })
                    seen_conflict_keys.add(conflict_key)
                elif (
                    new_drug_class
                    and existing_drug_class
                    and new_drug_class == existing_drug_class
                    and new_generic != existing_generic
                ):
                    class_key = f"{sorted_ids[0]}-{sorted_ids[1]}-class-{new_drug_class}"
                    if class_key not in seen_conflict_keys:
                        stable_id = f"same_drug_class:{new_drug_class}"
                        conflicts.append({
                            "conflict_type": "same_drug_class",
                            "stable_id": stable_id,
                            "entry_a": {
                                "date": new_entry.get("date"),
                                "medication": new_med.get("brand_name"),
                                "doctor": new_entry.get("doctor_name"),
                                "entry_id": entry_a_id,
                            },
                            "entry_b": {
                                "date": existing_entry.get("date"),
                                "medication": existing_med.get("brand_name"),
                                "doctor": existing_entry.get("doctor_name"),
                                "entry_id": entry_b_id,
                            },
                            "shared_generic": f"same class: {new_drug_class}",
                            "drug_class": new_drug_class,
                        })
                        seen_conflict_keys.add(class_key)

    return conflicts


def check_duplicate_tests(
    new_entry: dict[str, Any],
    existing_timeline: list[dict[str, Any]],
    window_days: int = 30,
) -> list[dict[str, Any]]:
    """
    Check for duplicate diagnostic test orders within a time window.
    
    Args:
        new_entry: The newly added entry
        existing_timeline: List of existing timeline entries
        window_days: Time window in days to check for duplicates (default: 30)
    
    Returns:
        List of duplicate test conflicts
    """
    conflicts: list[dict[str, Any]] = []
    seen_conflict_keys: set[str] = set()
    
    new_tests = new_entry.get("tests_mentioned", [])
    new_date_str = new_entry.get("date")
    new_doctor = new_entry.get("doctor_name")
    new_entry_id = new_entry.get("id")
    
    if not new_tests or not new_date_str or not new_entry_id:
        return conflicts
    
    # Parse new entry date
    try:
        new_date = datetime.strptime(new_date_str, "%Y-%m-%d")
    except (ValueError, TypeError):
        return conflicts
    
    # Check each test in the new entry
    for new_test in new_tests:
        new_normalized = _normalize_test_name(new_test)
        if not new_normalized:
            continue
        
        # Compare against existing entries
        for existing_entry in existing_timeline:
            # Skip self-comparison
            if existing_entry.get("id") == new_entry_id:
                continue
            
            existing_tests = existing_entry.get("tests_mentioned", [])
            existing_date_str = existing_entry.get("date")
            existing_doctor = existing_entry.get("doctor_name")
            existing_entry_id = existing_entry.get("id")
            
            if not existing_tests or not existing_date_str or not existing_entry_id:
                continue
            
            # Parse existing entry date
            try:
                existing_date = datetime.strptime(existing_date_str, "%Y-%m-%d")
            except (ValueError, TypeError):
                continue
            
            # Check if within time window
            days_diff = abs((new_date - existing_date).days)
            if days_diff > window_days:
                continue
            
            # Check each test in existing entry
            for existing_test in existing_tests:
                existing_normalized = _normalize_test_name(existing_test)
                if not existing_normalized:
                    continue
                
                # Match found: same test, different doctors, within window
                if existing_normalized == new_normalized and new_doctor != existing_doctor:
                    # Create stable deduplication key
                    sorted_ids = tuple(sorted([new_entry_id, existing_entry_id]))
                    conflict_key = f"test-{sorted_ids[0]}-{sorted_ids[1]}-{new_normalized}"
                    
                    if conflict_key in seen_conflict_keys:
                        continue
                    
                    stable_id = f"duplicate_test:{new_normalized}"
                    conflicts.append({
                        "conflict_type": "duplicate_test",
                        "stable_id": stable_id,
                        "entry_a": {
                            "date": new_date_str,
                            "test_name": new_test,
                            "doctor": new_doctor,
                            "entry_id": new_entry_id,
                        },
                        "entry_b": {
                            "date": existing_date_str,
                            "test_name": existing_test,
                            "doctor": existing_doctor,
                            "entry_id": existing_entry_id,
                        },
                        "shared_test": new_normalized,
                        "days_apart": days_diff,
                    })
                    seen_conflict_keys.add(conflict_key)
    
    return conflicts