# MediFlow - Groq API Setup & Testing

## ✅ Migration Complete

The backend has been successfully migrated from Gemini to Groq API:
- ✓ Removed `google-generativeai` dependency
- ✓ Added `groq==0.13.0` SDK
- ✓ Updated all API calls to use Groq
- ✓ Vision model: `qwen/qwen3.6-27b` (27B multimodal)
- ✓ Text model: `llama-3.3-70b-versatile` (70B text)
- ✓ JSON cleanup safeguard in place

## 🔑 Setup Your Groq API Key

1. **Get your API key** (if you don't have one):
   - Go to https://console.groq.com/keys
   - Sign in or create a free account
   - Create a new API key

2. **Add it to `.env` file**:
   ```bash
   nano .env
   ```
   Replace `YOUR_GROQ_API_KEY_HERE` with your actual key:
   ```
   GROQ_API_KEY="gsk_your_actual_key_here"
   ```

## 🧪 Test with Real Documents

### Step 1: Start the server
```bash
MOCK_MODE=false uvicorn main:app --reload
```

### Step 2: Run the test script
In a **new terminal**:
```bash
python3 test_real_extraction.py
```

This will:
1. Upload `doc1_crocin_prescription.jpg` → Extract prescription data
2. Upload `doc2_cbc_lab_report.jpg` → Extract lab report data
3. Upload `doc3_dolo_prescription.jpg` → Extract and **detect conflict** with doc1
4. Display the full timeline with conflicts
5. **Automatically save verified outputs to `mock_responses/`**

### Step 3: Verify Output

The script will show:
- ✓ Extracted fields (document_type, date, doctor_name, diagnosis, medications)
- ✓ Confidence levels (green/yellow/red)
- ✓ Conflict detection (paracetamol overlap between Crocin and Dolo)
- ✓ Real LLM-generated conflict explanations

## 📁 What Gets Updated

After running the test, these files will contain **real, verified** output:
```
mock_responses/
├── doc1_extraction.json  ← Real Crocin prescription extraction
├── doc2_extraction.json  ← Real CBC lab report extraction
├── doc3_extraction.json  ← Real Dolo prescription extraction
└── conflict_explanations.json  (unchanged - template patterns)
```

## 🔍 Manual Testing (Alternative)

If you prefer manual testing via curl:

```bash
# Test doc1
curl -X POST http://localhost:8000/extract \
  -F "file=@demo_documents/doc1_crocin_prescription.jpg"

# Test doc2
curl -X POST http://localhost:8000/extract \
  -F "file=@demo_documents/doc2_cbc_lab_report.jpg"

# Test doc3 (should show conflict)
curl -X POST http://localhost:8000/extract \
  -F "file=@demo_documents/doc3_dolo_prescription.jpg"

# Get full timeline
curl http://localhost:8000/timeline
```

## ⚙️ Switch Back to Mock Mode

After verification, you can run in mock mode for faster testing:
```bash
MOCK_MODE=true uvicorn main:app --reload
```

## 🚀 Next Steps

1. Verify all 3 documents extract correctly
2. Confirm conflict detection fires for Crocin + Dolo
3. Check the real conflict explanation is natural/helpful
4. Optionally test doctor brief generation:
   ```bash
   curl -X POST http://localhost:8000/doctor-brief
   ```

## 📊 Expected Output Schema

Each document should return:
```json
{
  "status": "ok",
  "entry": {
    "document_type": "prescription | lab_report | discharge_summary",
    "date": "YYYY-MM-DD or null",
    "doctor_name": "string or null",
    "diagnosis_mentioned": "string or null",
    "medications": [
      {
        "raw_text": "exact text from document",
        "brand_name": "cleaned name",
        "dosage": "500mg",
        "frequency": "twice daily",
        "confidence": "green | yellow | red"
      }
    ],
    "tests_mentioned": ["CBC", "etc"],
    "follow_up_date": "YYYY-MM-DD or null",
    "extraction_notes": "any illegibility notes"
  },
  "new_conflicts": [...]
}
```

## 🐛 Troubleshooting

**Error: "Please set your GROQ_API_KEY"**
- Make sure you updated the `.env` file with your real key
- Restart the server after updating `.env`

**Error: "Server is not running"**
- Start the server first: `MOCK_MODE=false uvicorn main:app --reload`
- Then run the test script in a different terminal

**Rate limit errors**
- The script includes 1-second delays between requests
- Groq free tier has generous limits (check console.groq.com/settings/limits)

**JSON parse errors**
- The `_parse_json_response` function handles markdown fences
- If errors persist, check the raw response in server logs
