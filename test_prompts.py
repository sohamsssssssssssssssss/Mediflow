#!/usr/bin/env python3
"""
Standalone prompt-testing script for MediFlow.

Tests two prompts in isolation:
  1. Conflict Explanation prompt (3 sample pairs)
  2. Doctor Brief prompt (1 sample timeline)

Usage:
  python test_prompts.py              # Live API calls (requires GROQ_API_KEY in .env)
  python test_prompts.py --mock       # Use mock responses (no API key needed)
"""

import json
import os
import re
import sys
import time
from functools import wraps

# ── Load .env file (optional convenience for local dev) ────────
_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if os.path.isfile(_env_path):
    with open(_env_path) as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _v = _line.split("=", 1)
                _v = _v.strip().strip('"').strip("'")
                os.environ.setdefault(_k.strip(), _v)

# ── Mock mode ─────────────────────────────────────────────────
MOCK_MODE = "--mock" in sys.argv
if MOCK_MODE:
    sys.argv.remove("--mock")

if not MOCK_MODE:
    from groq import Groq

    API_KEY = os.environ.get("GROQ_API_KEY")
    if not API_KEY:
        print("ERROR: GROQ_API_KEY environment variable not set.")
        print("Set it in .env file or export GROQ_API_KEY='your-key'")
        print("Or run with --mock to use mock responses instead.")
        sys.exit(1)

    groq_client = Groq(api_key=API_KEY)
    GROQ_MODEL = "llama-3.3-70b-versatile"
else:
    # Load mock responses for reference
    _mock_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mock_responses")
    _conflict_fixture = os.path.join(_mock_dir, "conflict_explanations.json")
    _brief_fixture = os.path.join(_mock_dir, "doctor_brief.txt")
    if os.path.isfile(_conflict_fixture):
        with open(_conflict_fixture) as _f:
            MOCK_CONFLICT_EXPLANATIONS = json.load(_f)
    else:
        MOCK_CONFLICT_EXPLANATIONS = {}
    if os.path.isfile(_brief_fixture):
        with open(_brief_fixture) as _f:
            MOCK_DOCTOR_BRIEF = _f.read().strip()
    else:
        MOCK_DOCTOR_BRIEF = ""
    groq_client = None


# ── Retry decorator for live API calls ─────────────────────────
def _retry_on_quota(max_retries: int = 5, base_delay: float = 4.0):
    """Decorator to retry on GROQ quota errors with exponential backoff."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exc = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exc = e
                    err_str = str(e)
                    # GROQ raises RateLimitError or returns 429 status
                    if "429" in err_str or "rate_limit" in err_str.lower() or "RateLimitError" in type(e).__name__:
                        delay = base_delay * (2 ** attempt)
                        print(f"  ⏳ Rate limited — retrying in {delay:.0f}s (attempt {attempt + 1}/{max_retries})...")
                        time.sleep(delay)
                    else:
                        raise
            raise last_exc
        return wrapper
    return decorator


# ── Helper ─────────────────────────────────────────────────────
@_retry_on_quota()
def call_llm(system_prompt: str, user_content: str) -> str:
    """Send a system + user message to GROQ and return the response text."""
    if MOCK_MODE:
        return _mock_call(system_prompt, user_content)
    response = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        temperature=0.7,
        max_tokens=4096,
    )
    return response.choices[0].message.content.strip()


def _mock_call(system_prompt: str, user_content: str) -> str:
    """Return pre-written mock responses for testing prompt validation.

    Uses system_prompt context to disambiguate between conflict explanation
    and doctor brief requests — both can contain similar medication names
    in the user content.
    """
    lower = user_content.lower()
    prompt_lower = system_prompt.lower()

    # ── Identify request type from system prompt ──────────
    is_conflict_request = "explaining a medication overlap" in prompt_lower or "conflict" in prompt_lower
    is_brief_request = "clinical scribe" in prompt_lower or "timeline data" in prompt_lower or "bullet points" in prompt_lower

    # ── Doctor Brief ──────────────────────────────────────
    if is_brief_request and not is_conflict_request:
        return MOCK_DOCTOR_BRIEF

    # ── Conflict: Pair 1 — Crocin / Dolo (paracetamol) ───
    if "crocin" in lower and "dolo" in lower:
        return MOCK_CONFLICT_EXPLANATIONS.get(
            "duplicate_ingredient_paracetamol",
            "Both Crocin and Dolo contain paracetamol, so it's a good idea to check with your doctor to confirm you need both."
        )

    # ── Conflict: Pair 2 — Atenolol / Metoprolol (beta-blocker) ─
    if "atenolol" in lower and "metoprolol" in lower:
        return MOCK_CONFLICT_EXPLANATIONS.get(
            "same_drug_class_beta_blocker",
            "Both Atenolol and Metoprolol are beta-blockers used for similar purposes, so it's worth confirming with your doctor whether you need both."
        )

    # ── Conflict: Pair 3 — Augmentin / Amoxil (amoxicillin) ─
    if "augmentin" in lower and "amoxil" in lower:
        return (
            "Both Augmentin and Amoxil contain amoxicillin, so it's worth confirming with your doctor whether you need both."
        )

    # ── Fallback ──────────────────────────────────────────
    return "Please check with your doctor about these medications."


def _sleeper(seconds: float = 3.0):
    """Helper to add delay between API calls."""
    if not MOCK_MODE:
        print(f"  💤 Cooling down for {seconds}s to respect free-tier limits...")
        time.sleep(seconds)


def separator(title: str) -> None:
    print("=" * 70)
    print(f"  {title}")
    print("=" * 70)


# ══════════════════════════════════════════════════════════════
#  PROMPT VERSIONS
# ══════════════════════════════════════════════════════════════

CONFLICT_EXPLANATION_V1 = """You are explaining a medication overlap to a patient in plain, calm language. You are not diagnosing or recommending treatment changes. Given two medication entries that share the same active ingredient, write ONE sentence explaining the overlap and advising the patient to verify with their physician. Do not use alarming language. Do not suggest stopping or changing any medication yourself."""

CONFLICT_EXPLANATION_V2 = None  # Populated after V1 test if needed
CONFLICT_EXPLANATION_V3 = None  # Populated after V2 test if needed

DOCTOR_BRIEF_V1 = """Act as a clinical scribe preparing a brief for a busy physician. Given this patient timeline data, summarize it into exactly 3 bullet points using standard medical shorthand. Be concise and factual — no interpretation, no diagnostic suggestions."""

DOCTOR_BRIEF_V2 = None  # Populated after V1 test if needed
DOCTOR_BRIEF_V3 = None  # Populated after V2 test if needed


# ══════════════════════════════════════════════════════════════
#  TASK 1 — Conflict Explanation Tests
# ══════════════════════════════════════════════════════════════

CONFLICT_TEST_CASES = [
    {
        "name": "Pair 1 — Same generic (paracetamol)",
        "entry_a": {"brand": "Crocin", "doctor": "Dr. Mehta", "date": "July 8, 2026"},
        "entry_b": {"brand": "Dolo", "doctor": "Dr. Rao", "date": "July 15, 2026"},
        "shared": "paracetamol",
        "context": "Both contain the same active ingredient (paracetamol).",
    },
    {
        "name": "Pair 2 — Same drug class (beta-blocker)",
        "entry_a": {"brand": "Atenolol", "doctor": "Dr. Mehta", "date": "July 10, 2026"},
        "entry_b": {"brand": "Metoprolol", "doctor": "Dr. Rao", "date": "July 15, 2026"},
        "shared": "same drug class: beta-blocker",
        "context": "Different generics but same drug class (beta-blocker).",
    },
    {
        "name": "Pair 3 — Same generic (amoxicillin)",
        "entry_a": {"brand": "Augmentin", "doctor": "Dr. Iyer", "date": "July 5, 2026"},
        "entry_b": {"brand": "Amoxil", "doctor": "Dr. Sharma", "date": "July 20, 2026"},
        "shared": "amoxicillin",
        "context": "Both contain amoxicillin (Augmentin also has clavulanic acid).",
    },
]


def build_conflict_prompt_input(pair: dict) -> str:
    return (
        f"Entry A: {pair['entry_a']['brand']}, prescribed by {pair['entry_a']['doctor']}, {pair['entry_a']['date']}\n"
        f"Entry B: {pair['entry_b']['brand']}, prescribed by {pair['entry_b']['doctor']}, {pair['entry_b']['date']}\n"
        f"Conflict: {pair['shared']}\n\n"
        f"Context: {pair['context']}"
    )


def _count_sentences(text: str) -> int:
    """Count sentences robustly.
    Strips periods from common abbreviations before splitting,
    then splits on [.!?] followed by space + capital letter.
    """
    # Strip periods from common abbreviations so they don't create false boundaries
    _abbrevs = r'\b(Dr|Mr|Mrs|Ms|Jr|Sr|St|vs|etc|dept|est|govt|inc|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.'
    cleaned = re.sub(_abbrevs, r'\1', text, flags=re.IGNORECASE)
    # Normalize em dashes and other punctuation that is NOT a sentence boundary
    cleaned = cleaned.replace("—", " ").replace("–", " ").replace(":", ";")
    # Split on sentence-ending punctuation + space + capital letter, or end-of-string
    sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z"\'(\[{])|(?<=[.!?])$', cleaned.strip())
    return len([s for s in sentences if s.strip()])


def check_conflict_output(output: str) -> list[str]:
    """Return a list of issues found, empty = passes all checks."""
    issues = []
    lower = output.lower()

    # Check 1: Is it exactly one sentence?
    sentence_count = _count_sentences(output)
    if sentence_count != 1:
        issues.append(f"NOT exactly 1 sentence ({sentence_count} sentences detected)")

    # Check 2: Tone — no alarming language
    alarming_words = ["dangerous", "harmful", "stop immediately", "life-threatening", "unsafe", "poisoning", "overdose"]
    for word in alarming_words:
        if word in lower:
            issues.append(f"Contains alarming language: '{word}'")

    # Check 3: No diagnostic suggestions
    directive_phrases = [
        "you should stop", "you should not take", "discontinue",
        "stop taking", "you need to stop", "do not take",
    ]
    for phrase in directive_phrases:
        if phrase in lower:
            issues.append(f"Contains diagnostic/directive language: '{phrase}'")

    # Check 4: Advises to verify with physician
    verify_phrases = ["physician", "doctor", "healthcare provider", "verify", "confirm", "check with"]
    has_verify = any(p in lower for p in verify_phrases)
    if not has_verify:
        issues.append("Does NOT advise patient to verify with physician/doctor")

    return issues


def test_conflict_prompt(version_name: str, prompt: str, pairs: list) -> list[dict]:
    """Test a conflict explanation prompt against all pairs. Returns results."""
    results = []
    print(f"\n{'─' * 70}")
    print(f"  Testing {version_name}")
    print(f"{'─' * 70}")

    for i, pair in enumerate(pairs):
        print(f"\n  >>> {pair['name']}")
        user_input = build_conflict_prompt_input(pair)
        output = call_llm(prompt, user_input)
        issues = check_conflict_output(output)

        result = {
            "pair": pair["name"],
            "output": output,
            "issues": issues,
            "passed": len(issues) == 0,
        }
        results.append(result)

        print(f"  Output: {output}")
        if issues:
            print(f"  ❌ ISSUES:")
            for issue in issues:
                print(f"     - {issue}")
        else:
            print(f"  ✅ All checks passed")
        print()

        if i < len(pairs) - 1:
            _sleeper(3.0)

    return results


# ══════════════════════════════════════════════════════════════
#  TASK 2 — Doctor Brief Tests
# ══════════════════════════════════════════════════════════════

SAMPLE_TIMELINE = {
    "entries": [
        {
            "date": "2026-07-08",
            "medications": [{"brand_name": "Crocin", "dosage": "650mg"}],
            "diagnosis_mentioned": "Fever",
            "doctor_name": "Dr. Mehta",
        },
        {
            "date": "2026-07-15",
            "medications": [{"brand_name": "Dolo", "dosage": "650mg"}],
            "diagnosis_mentioned": "Headache",
            "doctor_name": "Dr. Rao",
            "follow_up_date": "2026-07-29",
        },
    ],
    "conflicts": [
        {
            "shared_generic": "paracetamol",
            "entry_a_brand": "Crocin",
            "entry_b_brand": "Dolo",
        }
    ],
}


def check_brief_output(output: str) -> list[str]:
    """Return a list of issues found."""
    issues = []

    # Check 1: EXACTLY 3 bullet points
    lines = [l.strip() for l in output.split("\n") if l.strip()]
    bullet_lines = [l for l in lines if l.startswith("-") or l.startswith("*")]
    if len(bullet_lines) != 3:
        issues.append(f"NOT exactly 3 bullet points (found {len(bullet_lines)} bullets)")

    # Check 2: Uses medical shorthand (abbreviations that wouldn't be in raw data)
    has_shorthand = False
    shorthand_patterns = ["yo", "bid", "tid", "prn", "PO", "d/c", "hx", "dx", "tx", "rx", "s/p", "qty", "NKA", "SOB", "c/o", "s/s"]
    for pattern in shorthand_patterns:
        if pattern in output.lower():
            has_shorthand = True
            break
    if not has_shorthand:
        issues.append("May not use medical shorthand (no common abbreviations like yo/bid/tid detected)")

    # Check 3: Mentions the paracetamol overlap as a flag
    if "paracetamol" not in output.lower() and "overlap" not in output.lower() and "conflict" not in output.lower() and "flag" not in output.lower():
        issues.append("Does NOT mention the paracetamol overlap/conflict")

    # Check 4: No diagnostic interpretation
    diagnostic_phrases = [
        "patient should", "recommend", "suggest",
        "likely caused by", "probably due to", "this indicates",
    ]
    for phrase in diagnostic_phrases:
        if phrase in output.lower():
            issues.append(f"Contains diagnostic interpretation: '{phrase}'")

    # Check 5: No preamble (LLM quirk)
    preamble_indicators = [
        "here's the summary", "here is the summary", "here's a brief",
        "here is a brief", "here's the bullet", "here are the bullet",
        "here's a bullet", "here are the bullet points", "certainly",
        "sure,", "here's a concise",
    ]
    output_start = output[:100].lower()
    for indicator in preamble_indicators:
        if indicator in output_start:
            issues.append(f"Contains preamble text: '{indicator}'")
            break

    return issues


def test_doctor_brief(version_name: str, prompt: str) -> dict:
    """Test a doctor brief prompt against the sample timeline."""
    print(f"\n{'─' * 70}")
    print(f"  Testing {version_name}")
    print(f"{'─' * 70}")

    _sleeper(3.0)

    user_input = json.dumps(SAMPLE_TIMELINE, indent=2)
    output = call_llm(prompt, user_input)
    issues = check_brief_output(output)

    result = {
        "version": version_name,
        "output": output,
        "issues": issues,
        "passed": len(issues) == 0,
    }

    print(f"\n  Output:\n{output}\n")
    if issues:
        print(f"  ❌ ISSUES:")
        for issue in issues:
            print(f"     - {issue}")
    else:
        print(f"  ✅ All checks passed")

    return result


# ══════════════════════════════════════════════════════════════
#  PREAMBLE CHECK
# ══════════════════════════════════════════════════════════════

# ══════════════════════════════════════════════════════════════
#  TUNED PROMPT VARIANTS
# ══════════════════════════════════════════════════════════════

CONFLICT_V2_TEXT = CONFLICT_EXPLANATION_V1 + """

CRITICAL: Output ONLY one sentence — no preamble, no elaboration, no extra text. The sentence must begin directly with the content."""

CONFLICT_V3_TEXT = """You are explaining a medication overlap to a patient in plain, calm language. You are not diagnosing or recommending treatment changes.

Given two medication entries that share the same active ingredient or drug class, write EXACTLY ONE sentence explaining the overlap and advising the patient to verify with their physician.

Rules:
- Exactly one sentence. No more.
- No preamble, no greeting, no closing.
- Start directly with the content.
- Do not use alarming language like "dangerous", "harmful", or "stop immediately".
- Do not suggest stopping or changing any medication.
- End the sentence by advising the patient to check with their doctor."""

DOCTOR_BRIEF_V2_TEXT = """Act as a clinical scribe preparing a brief for a busy physician.

Output EXACTLY 3 bullet points using standard medical shorthand. Be concise and factual — no interpretation, no diagnostic suggestions.

Rules:
- Exactly 3 bullet points starting with "- "
- No preamble text, no headings, no closing remarks
- The first line must be a bullet point
- Use medical abbreviations (yo, mg, bid, prn, etc.)
- Mention any medication conflicts or flags in the third bullet
- Be concise — each bullet should be a single line or short phrase"""

DOCTOR_BRIEF_V3_TEXT = """You are a clinical scribe. Given patient timeline data, output EXACTLY 3 bullet points in standard medical shorthand.

Format:
- [Findings / current status in shorthand]
- [Recent activity in shorthand]
- [Flags: describe any medication conflicts or "None"]

Rules — STRICTLY FOLLOW:
1. Start directly with the first bullet — NO preamble, NO "Here's the summary" or similar.
2. EXACTLY 3 bullet points, each starting with "- ".
3. Use medical abbreviations (yo, mg, bid, PO, etc.).
4. Be factual — no diagnostic suggestions, no recommendations.
5. If there's a medication conflict (e.g. duplicate generics), mention it in the Flags bullet.
6. No closing remarks after the third bullet."""


# ══════════════════════════════════════════════════════════════
#  MAIN TEST RUNNER
# ══════════════════════════════════════════════════════════════

def run_all_tests() -> None:
    mode_label = "MOCK" if MOCK_MODE else "LIVE"
    print(f"🚀 Running in {mode_label} mode")

    results_log = {}

    # ── TASK 1: Test Conflict Explanation V1 ──────────────
    separator("TASK 1: CONFLICT EXPLANATION — V1 (ORIGINAL)")
    conf_v1 = test_conflict_prompt("V1 (Original)", CONFLICT_EXPLANATION_V1, CONFLICT_TEST_CASES)
    results_log["conflict_v1"] = {"prompt": CONFLICT_EXPLANATION_V1, "results": conf_v1}
    v1_passed = all(r["passed"] for r in conf_v1)

    if not v1_passed:
        print("\n⚠️  V1 has issues — testing V2...")
        results_log["conflict_v2"] = {"prompt": CONFLICT_V2_TEXT, "results": []}
        conf_v2 = test_conflict_prompt("V2 (Tuned)", CONFLICT_V2_TEXT, CONFLICT_TEST_CASES)
        results_log["conflict_v2"]["results"] = conf_v2
        v2_passed = all(r["passed"] for r in conf_v2)

        if not v2_passed:
            print("\n⚠️  V2 still has issues — testing V3...")
            results_log["conflict_v3"] = {"prompt": CONFLICT_V3_TEXT, "results": []}
            conf_v3 = test_conflict_prompt("V3 (Final Tuned)", CONFLICT_V3_TEXT, CONFLICT_TEST_CASES)
            results_log["conflict_v3"]["results"] = conf_v3

    # ── TASK 2: Test Doctor Brief V1 ──────────────────────
    separator("TASK 2: DOCTOR BRIEF — V1 (ORIGINAL)")
    brief_v1 = test_doctor_brief("V1 (Original)", DOCTOR_BRIEF_V1)
    results_log["doctor_brief_v1"] = {"prompt": DOCTOR_BRIEF_V1, "result": brief_v1}

    if not brief_v1["passed"]:
        print("\n⚠️  V1 has issues — testing V2...")
        brief_v2 = test_doctor_brief("V2 (Tuned)", DOCTOR_BRIEF_V2_TEXT)
        results_log["doctor_brief_v2"] = {"prompt": DOCTOR_BRIEF_V2_TEXT, "result": brief_v2}

        if not brief_v2["passed"]:
            print("\n⚠️  V2 still has issues — testing V3...")
            brief_v3 = test_doctor_brief("V3 (Final Tuned)", DOCTOR_BRIEF_V3_TEXT)
            results_log["doctor_brief_v3"] = {"prompt": DOCTOR_BRIEF_V3_TEXT, "result": brief_v3}

    # ── Print summary ────────────────────────────────────
    print("\n\n")
    separator("SUMMARY OF RESULTS")
    print(f"\n{'Test':<45} {'Status':<10}")
    print("-" * 55)
    for key, data in results_log.items():
        if "result" in data:
            r = data["result"]
            status = "✅ PASS" if r["passed"] else "❌ FAIL"
            print(f"{key:<45} {status:<10}")
        elif "results" in data:
            for r in data["results"]:
                short_name = r["pair"].split("—")[-1].strip()[:25]
                status = "✅ PASS" if r["passed"] else "❌ FAIL"
                print(f"{key} — {short_name:<25} {status:<10}")

    print("\n\n")
    separator("FINAL PROMPTS (best version used)")
    for key, data in results_log.items():
        print(f"\n\033[1m{key}:\033[0m")
        print(data.get("prompt", "N/A"))
        print()

    print("\n")
    separator("ALL OUTPUTS")
    for key, data in results_log.items():
        if "results" in data:
            for r in data["results"]:
                print(f"\n\033[1m{key} — {r['pair']}\033[0m")
                print(f"  Output: {r['output']}")
                if r["issues"]:
                    print(f"  Issues: {r['issues']}")
        elif "result" in data:
            print(f"\n\033[1m{key}\033[0m")
            print(f"  Output:\n{data['result']['output']}")
            if data['result']['issues']:
                print(f"  Issues: {data['result']['issues']}")


if __name__ == "__main__":
    run_all_tests()
