# MediFlow Demo Guide

## How to Experience the Demo

1. **Start the App**
   ```bash
   cd mediflow-frontend
   npm run dev
   ```
   Open http://localhost:5173 in your browser

2. **Upload Screen**
   - You'll see the MediFlow upload interface
   - Either drag-and-drop a file or click to browse
   - Upload any image/PDF (JPG, PNG, or PDF accepted)
   - A 2-second "processing" animation will display

3. **Timeline View**
   - After upload, you'll see the medical timeline
   - Most recent entry (July 15) at the top
   - Each card shows:
     * Doctor name and date
     * Diagnosis (if present)
     * Medications with confidence badges
     * Tests mentioned
     * Follow-up dates (with calendar icon)

4. **Conflict Warning**
   - At the top, you'll see an amber warning banner
   - Shows "Paracetamol overlap between Crocin and Dolo"
   - Displays both medications with their dates
   - Plain-language explanation

5. **Confidence Indicators**
   - Green badge = High confidence (reliable extraction)
   - Yellow badge = Medium confidence (partially unclear)
   - Red badge = Low confidence (needs verification)

6. **Verify Medications**
   - Click on the **yellow badge** next to "Dolo 650mg"
   - A modal opens showing:
     * Warning icon and message
     * Medication details (name, dosage, frequency)
     * Raw text extracted
     * Placeholder for original document image
     * Extraction notes: "Frequency was partially handwritten, inferred"

7. **Export Doctor Brief**
   - Click "Export Doctor Brief" button (top right)
   - Modal displays a 3-bullet summary:
     * Patient age and active medications
     * Recent activity and follow-ups
     * Flags (paracetamol overlap warning)
   - Click "Copy to Clipboard" to copy the text

## Key UI/UX Features to Notice

- **Clean, Calm Design**: Medical blue palette, not harsh clinical colors
- **Vertical Timeline**: Package-tracker style with connecting line
- **Hover Effects**: Cards lift slightly on hover
- **Color Psychology**: 
  * Amber for conflicts (caution, not emergency)
  * Green/yellow/red for confidence (traffic light pattern)
- **Information Hierarchy**: Most important info (conflicts) at top
- **Smooth Transitions**: All interactions have subtle animations

## Mock Data Details

The app displays 3 prescription entries:
1. **July 15** - Dr. Rao: Dolo 650mg (yellow confidence) + CBC test
2. **July 10** - Dr. Mehta: Atenolol 50mg (green) + follow-up July 24
3. **July 8** - Dr. Singh: Crocin 500mg (green)

Conflict detected between Crocin (July 8) and Dolo (July 15) — both contain paracetamol.

## Backend Integration Points

When ready to connect to real backend:

1. **Upload** → POST request to `/upload` or `/timeline` endpoint
2. **Doctor Brief** → POST request to `/doctor-brief` endpoint
3. Update `src/services/mockData.js` only — no component changes needed

The schema is already aligned with the backend spec.
