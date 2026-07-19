# MediFlow Frontend

A patient care-coordination app with a visual timeline-based UI for tracking medical prescriptions, medications, and doctor visits.

## Features

- **Upload Interface**: Drag-and-drop or file picker for medical documents (images/PDFs)
- **Timeline View**: Chronological vertical timeline showing medical history
- **Confidence Indicators**: Color-coded badges (green/yellow/red) for extraction confidence
- **Verification Modal**: Click yellow/red badges to verify medication details
- **Conflict Detection**: Amber-styled warnings for duplicate medication ingredients
- **Doctor Brief Export**: Generate and copy a summary for physician visits

## Tech Stack

- React 18
- Vite
- Pure CSS (no external CSS frameworks)

## Getting Started

### Installation

```bash
cd mediflow-frontend
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Upload.jsx              # Upload screen with drag/drop
│   ├── Upload.css
│   ├── Timeline.jsx            # Main timeline container
│   ├── Timeline.css
│   ├── TimelineEntry.jsx       # Individual timeline card
│   ├── TimelineEntry.css
│   ├── ConflictBanner.jsx      # Medication conflict warning
│   └── ConflictBanner.css
├── services/
│   └── mockData.js             # Mock API responses
├── App.jsx                      # Main app component
├── App.css
├── main.jsx                     # Entry point
└── index.css                    # Global styles
```

## Mock Data

The app currently uses mock data matching the backend schema from `/timeline` endpoint. The data structure is:

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
      "explanation": "Both Crocin and Dolo contain paracetamol — worth checking with your doctor if you need both."
    }
  ]
}
```

## Connecting to Real Backend

To connect to the real backend API:

1. Update `src/services/mockData.js`:
   - Replace `simulateUpload()` with a real API call to `POST /upload`
   - Replace `generateDoctorBrief()` with a real API call to `POST /doctor-brief`

2. Example:
```javascript
export const simulateUpload = async (file) => {
  const formData = new FormData();
  formData.append('document', file);
  
  const response = await fetch('http://your-backend/timeline', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};
```

No component changes needed — the UI is built to accept the backend schema directly.

## Design Notes

- Clean, medical-but-not-clinical color palette
- Amber (not red) for conflict warnings to avoid alarm
- Most recent entries at the top
- Timeline dot connected by vertical line for visual continuity
- Hover effects and smooth transitions for better UX
