# View Duplicate Test Detection in Browser

## Quick Start

### 1. Start Backend (Mock Mode)
```bash
MOCK_MODE=true uvicorn main:app --reload
```

### 2. Start Frontend
```bash
cd mediflow-frontend
npm run dev
```

### 3. Open Browser
Navigate to: http://localhost:5173

### 4. View the Feature

The frontend will show the landing page. To see the duplicate test conflict:

**Option A: Use Upload Screen** (if available)
1. Click to start uploading
2. Upload any 4 image files (they'll cycle through mock fixtures)
3. After 4 uploads, you'll see both:
   - Medication conflict (Crocin vs Dolo)
   - Test conflict (CBC duplicate)

**Option B: Direct API Test**
Open browser console (F12) and run:
```javascript
// Upload 4 documents via API
for (let i = 1; i <= 4; i++) {
  const formData = new FormData();
  formData.append('file', new Blob(['fake'], {type: 'image/jpeg'}), `doc${i}.jpg`);
  await fetch('http://localhost:8000/extract', {method: 'POST', body: formData});
}

// Navigate to timeline (or refresh page if already there)
window.location.href = '/timeline';
```

## What You'll See

### Conflict Banner
Two amber-styled conflict cards:

**Conflict 1 (Medication):**
```
⚠️ Duplicate Ingredient Detected

Crocin (2026-07-08, Dr. Anjali Mehta) and Dolo (2026-07-15, Dr. Suresh Rao) 
share the same active ingredient: paracetamol

Dr. Anjali Mehta prescribed Crocin on July 8 and Dr. Suresh Rao prescribed 
Dolo on July 15 — both contain the same active ingredient, paracetamol, 
so it's worth confirming with your doctor whether you need both.
```

**Conflict 2 (Test):**
```
⚠️ Duplicate Test Detected

CBC (2026-07-12, Dr. Anjali Mehta) and CBC (2026-07-20, Dr. Suresh Rao) 
— same diagnostic test ordered 8 days apart

Dr. Suresh Rao ordered CBC on 2026-07-20 and Dr. Anjali Mehta ordered CBC 
on 2026-07-12 (8 days apart) — since these were recent, it may be worth 
checking with your doctor whether the second test is still needed, to avoid 
unnecessary cost and a repeat procedure.
```

### Timeline Subtitle
```
4 documents · 2 conflicts flagged (1 medication, 1 test)
```

### Timeline Entries
- Entry 1: Prescription (Crocin) - Dr. Anjali Mehta
- Entry 2: Lab Report (CBC, etc.) - Dr. Anjali Mehta
- Entry 3: Prescription (Dolo) - Dr. Suresh Rao
- Entry 4: Lab Report (CBC, ESR) - Dr. Suresh Rao

## Screenshot Locations

Key UI elements to capture:
1. **Conflict banner section** - Shows both conflict types
2. **Timeline subtitle** - Shows breakdown (1 medication, 1 test)
3. **Full timeline** - All 4 entries with conflicts highlighted
4. **Individual conflict cards** - Zoomed view of test conflict explanation

## Verification Checklist

✅ Conflict banner displays both types  
✅ Test conflict shows test names (not medication names)  
✅ Test conflict shows "days apart" (8 days)  
✅ Timeline subtitle shows breakdown  
✅ Amber style consistent across both conflict types  
✅ Explanation text is patient-friendly  

## Troubleshooting

**Frontend not showing conflicts?**
- Make sure backend is running on port 8000
- Check browser console for API errors
- Verify MOCK_MODE=true in backend

**Only 3 documents shown?**
- Upload one more document to trigger doc4
- Or manually call API 4 times

**Conflicts not detected?**
- Check that you uploaded enough documents (need doc2 AND doc4)
- Verify backend logs: `tail -f /tmp/mediflow_server.log`

## Current Status

✅ Backend running: http://localhost:8000  
✅ Frontend running: http://localhost:5173  
✅ Test script verified: `python3 test_duplicate_tests.py`  
✅ Feature working correctly  

**Ready for screenshot and demo!** 📸
