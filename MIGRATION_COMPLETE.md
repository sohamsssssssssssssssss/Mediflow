# MediFlow Groq Migration - Complete ✅

## What Was Changed

### 1. Dependencies (`requirements.txt`)
- ❌ Removed: `google-generativeai==0.8.3`
- ✅ Added: `groq==0.13.0`
- ✅ Installed successfully

### 2. Main Application (`main.py`)
- ✅ Replaced Gemini import with Groq SDK
- ✅ Updated initialization to use `GROQ_API_KEY` (from env)
- ✅ Created `_call_groq_text()` for text-only calls (conflict explanations, doctor briefs)
- ✅ Created `_call_groq_vision()` for image + text calls (document extraction)
- ✅ Updated all API call sites:
  * `/extract` endpoint → uses `qwen/qwen3.6-27b` vision model
  * `/extract-text` endpoint → uses `llama-3.3-70b-versatile` text model
  * Conflict explanations → uses text model
  * Doctor brief generation → uses text model
- ✅ JSON cleanup safeguard already in place (`_parse_json_response`)

### 3. Models Being Used

**Vision Model:** `qwen/qwen3.6-27b`
- 27B multimodal model
- Supports text + image input
- Context window: 131K tokens
- Max image size: 20MB
- Perfect for prescription/medical document OCR

**Text Model:** `llama-3.3-70b-versatile`  
- 70B parameter model
- High-quality text generation
- Used for conflict explanations and doctor briefs

### 4. Configuration (`.env`)
- ✅ Updated to use `GROQ_API_KEY` instead of `GEMINI_API_KEY`
- ⚠️  **ACTION REQUIRED:** You need to add your actual Groq API key

### 5. New Test Scripts
- ✅ `check_groq_setup.py` - Verifies API key and connection
- ✅ `test_real_extraction.py` - Comprehensive real document testing
- ✅ `GROQ_SETUP.md` - Complete setup and testing instructions

## What Stayed the Same

✅ **All system prompts** - Extraction schema, conflict explanation, doctor brief prompts unchanged  
✅ **conflict_detection.py** - 100% deterministic, no LLM involvement, untouched  
✅ **API endpoints** - Same routes, same request/response schemas  
✅ **Frontend compatibility** - JSON shapes identical, no frontend changes needed  

## Next Steps to Complete Testing

### Step 1: Add Your Groq API Key

You mentioned you have a Groq account from the LeadFund project. Add your key to `.env`:

```bash
# Edit .env file
nano .env

# Replace this line:
GROQ_API_KEY="YOUR_GROQ_API_KEY_HERE"

# With your actual key:
GROQ_API_KEY="gsk_your_actual_key_here"
```

**Don't have the key handy?**
- Go to https://console.groq.com/keys
- Sign in with your existing account
- Create a new API key (or retrieve existing one)

### Step 2: Verify Setup

```bash
python3 check_groq_setup.py
```

This will:
- ✓ Check if API key is set
- ✓ Test Groq SDK import
- ✓ Make a quick API test call
- ✓ Confirm everything is ready

### Step 3: Test Real Extraction

**Terminal 1 - Start server:**
```bash
MOCK_MODE=false uvicorn main:app --reload
```

**Terminal 2 - Run tests:**
```bash
python3 test_real_extraction.py
```

This will:
1. Extract `doc1_crocin_prescription.jpg`
2. Extract `doc2_cbc_lab_report.jpg`
3. Extract `doc3_dolo_prescription.jpg` → **triggers conflict with doc1**
4. Display full timeline with conflicts
5. **Automatically save verified output to `mock_responses/`**

### Step 4: Review Results

The test script will show you:
- ✓ Document type, date, doctor name, diagnosis
- ✓ Medications with confidence levels (green/yellow/red)
- ✓ Tests mentioned
- ✓ Follow-up dates
- ✓ **Real conflict detection** (Crocin + Dolo both contain paracetamol)
- ✓ **Real LLM-generated explanation** (plain-language, patient-friendly)

### Step 5: Verify Mock Responses Updated

After the test, check that these files contain **real verified output**:
```
mock_responses/
├── doc1_extraction.json  ← Real extraction from doc1
├── doc2_extraction.json  ← Real extraction from doc2
├── doc3_extraction.json  ← Real extraction from doc3
```

Compare with old versions to see real vs hand-typed differences.

## Testing Checklist

- [ ] Add GROQ_API_KEY to .env
- [ ] Run `python3 check_groq_setup.py` (should pass)
- [ ] Start server with `MOCK_MODE=false`
- [ ] Run `python3 test_real_extraction.py`
- [ ] Verify doc1 (Crocin) extracts correctly
- [ ] Verify doc2 (CBC lab) extracts correctly
- [ ] Verify doc3 (Dolo) extracts correctly
- [ ] Confirm conflict detected between doc1 and doc3
- [ ] Read the LLM-generated conflict explanation (should be natural/helpful)
- [ ] Confirm mock_responses/ files updated with real output
- [ ] Optional: Test doctor brief with `curl -X POST http://localhost:8000/doctor-brief`

## Expected Conflict Output

When doc3 is uploaded after doc1, you should see:

```json
{
  "new_conflicts": [
    {
      "conflict_type": "duplicate_ingredient",
      "entry_a": {
        "medication": "Crocin",
        "brand_name": "Crocin",
        "date": "2024-XX-XX",
        "doctor": "Dr. Singh"
      },
      "entry_b": {
        "medication": "Dolo",
        "brand_name": "Dolo",
        "date": "2024-XX-XX",
        "doctor": "Dr. Rao"
      },
      "shared_generic": "paracetamol",
      "explanation": "<Real LLM-generated plain-language explanation>"
    }
  ]
}
```

The `explanation` field should be a natural sentence like:
> "Dr. Singh prescribed Crocin on July 8 and Dr. Rao prescribed Dolo on July 15 — both contain paracetamol. It's worth confirming with your doctor whether you need both."

## Troubleshooting

**"Module 'groq' not found"**
```bash
pip install groq==0.13.0
```

**"GROQ_API_KEY not configured"**
- Make sure you edited `.env` with your actual key
- Restart the server after changing `.env`

**"Server is not running"**
- Start it first in Terminal 1
- Then run test script in Terminal 2

**Rate limit errors**
- Groq free tier is generous but has limits
- Test script includes 1-second delays between requests
- Check your usage at console.groq.com

**JSON parse errors**
- The cleanup function handles markdown fences: ` ```json ... ``` `
- If issues persist, check raw response in server logs
- May need to adjust system prompt to be more explicit about JSON-only output

## Code Migration Verification

Here's what changed in the codebase:

**Before (Gemini):**
```python
import google.generativeai as genai
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel("gemini-3.5-flash")

response = gemini_model.generate_content([prompt, image])
```

**After (Groq):**
```python
from groq import Groq
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# For vision:
image_b64 = base64.b64encode(image_bytes).decode("utf-8")
response = groq_client.chat.completions.create(
    model="qwen/qwen3.6-27b",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}}
        ]
    }]
)

# For text:
response = groq_client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content}
    ]
)
```

## Summary

🎉 **Migration Complete!** The backend now uses Groq instead of Gemini.

✅ **Ready to test** once you add your GROQ_API_KEY  
✅ **All prompts and logic unchanged**  
✅ **Automated test script will verify everything and update fixtures**  
✅ **Frontend requires zero changes**  

The only blocker is adding your Groq API key to `.env`, then you can run the test script to verify everything works with real documents.
