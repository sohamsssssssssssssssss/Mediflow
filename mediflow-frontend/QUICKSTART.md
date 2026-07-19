# MediFlow - Quick Start

## Get Running in 30 Seconds

```bash
cd mediflow-frontend
npm install
npm run dev
```

Open http://localhost:5173

## The Flow

1. **Upload any image/PDF** (simulates document processing for 2 seconds)
2. **View timeline** of prescriptions ordered by date
3. **Click yellow badges** on medications to verify low-confidence extractions
4. **See conflict warnings** for duplicate medication ingredients
5. **Click "Export Doctor Brief"** to generate a physician summary

## What You'll See

- 3 prescription entries (July 8, 10, 15)
- Conflict warning for Crocin + Dolo (both contain paracetamol)
- Green/yellow/red confidence badges on medications
- Follow-up dates and test mentions
- Clean medical-style design (blue palette, not clinical)

## Demo for Judges

This showcases:
- Visual timeline (not a chatbot)
- Confidence tracking with verification flow
- Conflict detection for medication safety
- Ready-to-integrate with backend (schema-aligned)

The UI is production-ready — just swap mock data for real API calls.

## Files Modified from Template

✅ Complete rewrite of App.jsx  
✅ 4 new components with CSS  
✅ Mock data service  
✅ Clean design system  
✅ All specs implemented

## Technical Details

- **Stack**: React 18 + Vite 8
- **No dependencies** beyond React/Vite
- **Build size**: ~203 KB (gzipped: 63 KB)
- **Build time**: ~300ms

Zero external UI libraries — pure CSS for full control and lightweight bundle.
