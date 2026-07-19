# Backend Integration Guide

## Current State: Mock Data

The frontend is fully functional with mock data. All UI components are complete and working.

## What Needs to Change

Only **ONE FILE** needs modification: `src/services/mockData.js`

## Step-by-Step Integration

### 1. Update Upload Function

**Current (Mock):**
```javascript
export const simulateUpload = (file) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTimelineData);
    }, 2000);
  });
};
```

**Replace with Real API:**
```javascript
export const simulateUpload = async (file) => {
  const formData = new FormData();
  formData.append('document', file);
  
  const response = await fetch('http://your-backend-url/timeline', {
    method: 'POST',
    body: formData,
    headers: {
      // Add auth headers if needed
      // 'Authorization': 'Bearer ' + token
    }
  });
  
  if (!response.ok) {
    throw new Error('Upload failed');
  }
  
  return response.json();
};
```

### 2. Update Doctor Brief Function

**Current (Mock):**
```javascript
export const generateDoctorBrief = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDoctorBrief);
    }, 500);
  });
};
```

**Replace with Real API:**
```javascript
export const generateDoctorBrief = async () => {
  const response = await fetch('http://your-backend-url/doctor-brief', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      // Include any required payload, e.g., patient_id
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate brief');
  }
  
  const data = await response.json();
  return data.brief; // Adjust based on actual response structure
};
```

## Expected Backend Response Schemas

### POST /timeline Response

```json
{
  "entries": [
    {
      "document_type": "prescription",
      "date": "2026-07-15",
      "doctor_name": "Dr. Rao",
      "diagnosis_mentioned": "Fever",
      "medications": [
        {
          "raw_text": "Dolo 650mg",
          "brand_name": "Dolo",
          "dosage": "650mg",
          "frequency": "as needed",
          "confidence": "yellow"
        }
      ],
      "tests_mentioned": ["CBC"],
      "follow_up_date": null,
      "extraction_notes": "Frequency was partially handwritten, inferred"
    }
  ],
  "conflicts": [
    {
      "conflict_type": "duplicate_ingredient",
      "entry_a": { "brand_name": "Crocin", "date": "2026-07-08" },
      "entry_b": { "brand_name": "Dolo", "date": "2026-07-15" },
      "shared_generic": "paracetamol",
      "explanation": "Both Crocin and Dolo contain paracetamol..."
    }
  ]
}
```

### POST /doctor-brief Response

```json
{
  "brief": "• 45yo. Active meds: Atenolol 50mg, Dolo 650mg...\n• Recent activity:...\n• Flags:..."
}
```

Or just return plain text if that's what the backend sends.

## Error Handling Enhancement

Add error handling to components:

### Upload.jsx
```javascript
const handleFile = async (file) => {
  setIsProcessing(true);
  try {
    const data = await simulateUpload(file);
    onUploadComplete(data);
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Upload failed: ' + error.message);
  } finally {
    setIsProcessing(false);
  }
};
```

(Already implemented ✓)

### Timeline.jsx
```javascript
const handleExportBrief = async () => {
  setIsLoadingBrief(true);
  try {
    const brief = await generateDoctorBrief();
    setDoctorBrief(brief);
    setShowBriefModal(true);
  } catch (error) {
    console.error('Failed to generate brief:', error);
    alert('Failed to generate brief: ' + error.message);
  } finally {
    setIsLoadingBrief(false);
  }
};
```

(Already implemented ✓)

## CORS Configuration

If backend is on a different domain, ensure CORS headers are set:

```python
# Flask example
from flask_cors import CORS
CORS(app)

# Or specific origins
CORS(app, origins=['http://localhost:5173'])
```

## Environment Variables (Optional)

For cleaner config, use Vite env variables:

**Create `.env` file:**
```
VITE_API_BASE_URL=http://localhost:5000
```

**Update mockData.js:**
```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const simulateUpload = async (file) => {
  const formData = new FormData();
  formData.append('document', file);
  
  const response = await fetch(`${API_BASE}/timeline`, {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
};
```

## Testing the Integration

1. **Start backend** on specified port
2. **Update API URLs** in `mockData.js`
3. **Restart dev server**: `npm run dev`
4. **Upload a real document**
5. **Verify data flows correctly**

## Checklist

- [ ] Backend running and accessible
- [ ] CORS configured
- [ ] API endpoints match: `/timeline`, `/doctor-brief`
- [ ] Response schemas match expected format
- [ ] Updated `simulateUpload()` function
- [ ] Updated `generateDoctorBrief()` function
- [ ] Tested with real document upload
- [ ] Error messages display correctly
- [ ] Loading states work properly

## Zero Component Changes

✅ **Upload.jsx** - no changes needed  
✅ **Timeline.jsx** - no changes needed  
✅ **TimelineEntry.jsx** - no changes needed  
✅ **ConflictBanner.jsx** - no changes needed

The components already handle the data correctly. Only the data source changes.

## Build for Production

Once integrated and tested:

```bash
npm run build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, S3, etc.)

Configure the production API URL via environment variables.
