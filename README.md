# MediFlow — AI-Powered Patient Care Coordination

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Groq](https://img.shields.io/badge/Groq-Qwen%20%7C%20Llama-F97316?logo=groq)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-blue)](#)

**MediFlow** unifies a patient's care journey across multiple doctors into a single, intelligent timeline. Upload prescriptions and lab reports — MediFlow extracts the data, detects conflicting medications and duplicate tests, and generates a clinical "Doctor Brief" you can take to your next appointment.

Built for the **Codebenders AI Hackathon — PS6: Patient Care Coordination**.

---

## Features

- **AI-Powered Document Extraction** — Upload prescription or lab report images; Groq vision extracts medications, dosages, diagnoses, and test results.
- **Medication Conflict Detection** — Automatically flags when two doctors prescribe different brands of the same drug (e.g., Crocin and Dolo both = paracetamol).
- **Duplicate Test Detection** — Flags when the same diagnostic test is ordered by different doctors within 30 days.
- **Confidence-Aware Data** — Every extracted field is tagged green (clear), yellow (inferred), or red (unclear). Click to see the raw extraction text.
- **Doctor Brief Export** — One-click generates a clinical summary of the patient timeline — copy to clipboard or download as `.txt`.
- **Continuity of Care Score** — Algorithmic score (0–100) reflecting care coordination quality based on conflicts, doctor count, and overdue follow-ups.
- **Dashboard** — Central overview of active medications, upcoming appointments, pending follow-ups, conflict alerts, and your Continuity Score.
- **Care Timeline** — Chronological view of all uploaded documents with medications, tests, diagnoses, and follow-up dates.
- **Appointment Scheduler** — Browse and book appointments by specialty and time slot.
- **Medication Reminders** — Track pending and completed medication and follow-up tasks.
- **Explain My Prescription** — Get plain-language explanations for common medications in English or Hindi.
- **Nearby Facilities** — Find diagnostic centers, pharmacies, and hospitals with one-tap call, copy, or text actions.
- **Provider View** — Clinical summary of the patient with active medications and flagged conflicts — ready for a physician's review.
- **Hospital Analytics** — Static dashboard of operational metrics (missed follow-up rate, compliance, satisfaction, etc.).

---

## Tech Stack

| Layer | Technology | Role |
|---|---|---|
| **Frontend** | React 19, Vite 8, react-router-dom 7 | SPA with client-side routing |
| **Styling** | Pure CSS (glassmorphism design system) | No CSS frameworks |
| **Backend** | Python 3, FastAPI, Uvicorn | REST API server |
| **AI Inference** | Groq SDK | Vision (Qwen 3.6-27B) + Text (Llama 3.3-70B) |
| **Conflict Engine** | Deterministic rule-based (Python) | Drug database + test normalization maps |

### Why a Deterministic Conflict Engine?

Medication conflict detection is safety-critical. Rather than relying on an LLM (which can hallucinate drug interactions), MediFlow uses a hardcoded lookup table mapping brand names → generic ingredients, drug classes, and test name synonyms. The LLM is only used for *explaining* and *contextualizing* conflicts after they are deterministically detected.

---

## Project Structure

```
MediFlow/
├── .env                          # Groq API key
├── .gitignore
│
├── main.py                       # FastAPI server — routes, Groq calls, prompts
├── conflict_detection.py         # Deterministic conflict detection engine
├── requirements.txt              # Python dependencies
│
├── check_groq_setup.py           # Verify Groq API connectivity
├── list_models.py                # List available Groq models
├── generate_demo_docs.py         # Generate demo document images
│
├── test_real_extraction.py       # End-to-end test with real documents
├── test_conflicts.py             # Conflict detection unit tests
├── test_duplicate_tests.py       # Duplicate test detection tests
├── test_extraction.py / test_extraction_mocked.py / test_extraction_real.py
├── test_mock_conflicts.py / test_prompts.py / quick_test.py
│
├── demo_documents/               # Sample medical document images
├── mock_responses/               # Verified extraction JSON responses
│
├── mediflow-frontend/            # React application
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js            # Dev proxy → localhost:8000
│   │
│   └── src/
│       ├── App.jsx               # Routes + auth gate
│       ├── AuthContext.jsx       # Demo auth (no real backend auth)
│       ├── Sidebar.jsx           # Persistent navigation sidebar
│       │
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── Upload.jsx        # Drag-drop file upload
│       │   ├── DoctorBriefModal.jsx
│       │   └── ContinuityScoreBadge.jsx
│       │
│       ├── pages/
│       │   ├── LoginPage.jsx         # Demo login / guest access
│       │   ├── LandingPage.jsx       # Marketing hero (route: /welcome)
│       │   ├── DashboardPage.jsx     # Central overview (route: /)
│       │   ├── UploadPage.jsx        # Document upload (route: /upload)
│       │   ├── TimelinePage.jsx      # Care timeline (route: /timeline)
│       │   ├── AppointmentsPage.jsx  # Schedule (route: /appointments)
│       │   ├── RemindersPage.jsx     # Task list (route: /reminders)
│       │   ├── ExplainPrescriptionPage.jsx  # Drug explainer
│       │   ├── NearbyFacilitiesPage.jsx     # Healthcare finder
│       │   ├── ProviderViewPage.jsx         # Clinical summary
│       │   └── AnalyticsPage.jsx            # Hospital metrics
│       │
│       ├── services/api.js        # API client
│       └── utils/calculateContinuityScore.js
│
└── docs/                          # Feature documentation
    ├── START_HERE.md
    ├── GROQ_SETUP.md
    ├── MIGRATION_COMPLETE.md
    ├── DUPLICATE_TEST_FEATURE.md
    ├── VIEW_FEATURE.md
    └── VERIFICATION_REPORT.md
```

---

## Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **A Groq API key** — [Get one free at console.groq.com](https://console.groq.com/keys)

### 1. Clone & Environment

```bash
git clone https://github.com/sohamsssssssssssssssss/Mediflow.git
cd Mediflow

# (Recommended) Create a virtual environment
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Configure API Key

Create a `.env` file in the project root:

```env
GROQ_API_KEY="gsk_your_api_key_here"
```

Verify the key works:

```bash
python3 check_groq_setup.py
```

### 3. Start the Backend

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API is now live at `http://localhost:8000`.

### 4. Start the Frontend

```bash
cd mediflow-frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### 5. Run an Automated Test

With the backend running, open a second terminal:

```bash
python3 test_real_extraction.py
```

This uploads 3 demo documents — including a Crocin and a Dolo prescription from different doctors — which triggers a paracetamol conflict on the timeline.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/extract` | Upload a document image (multipart form). Returns extracted entry + new conflicts. |
| `POST` | `/extract-text` | Extract from raw text body. Same response schema. |
| `GET` | `/timeline` | Returns all extracted entries and deduplicated conflicts. |
| `POST` | `/doctor-brief` | Generates a clinical summary from the timeline. Returns plain-text brief. |
| `GET` | `/health` | Health check — returns entry/conflict counts. |

The frontend Vite dev server proxies `/extract`, `/extract-text`, `/timeline`, `/doctor-brief`, and `/health` to `http://localhost:8000` (configured in `vite.config.js`).

---

## Design Highlights

### Liquid Glass UI

The interface uses a glassmorphism design system — every card, sidebar, header, and modal has a semi-transparent background with `backdrop-filter: blur()` and soft borders. Hover interactions include subtle lifts (`translateY(-2px)`) and enhanced shadows for tactile feedback.

### Conflict Deduplication

Conflicts are deduplicated globally using a content-based `stable_id` derived from medication/test names and conflict type. The same conflict is never shown twice, even if detected from multiple overlapping sources.

### Proactive Architecture

The frontend checks for new conflicts on every timeline fetch and displays them at the top of the timeline and on the Dashboard. The Doctor Brief is always available as a one-click export.

---

## Notes

- **In-memory storage** — All timeline data and conflicts are stored in Python module-level variables. Data is lost on server restart. No database is required.
- **Demo auth** — The login page is a mock gate. Any email/password or "Continue as Guest" will work. There is no backend authentication.
- **Seeded data** — The Dashboard, Appointments, Reminders, Explain Prescription, Provider View, and Analytics pages include hardcoded demo data alongside real uploaded data.
- **Log files** — `server.log`, `backend.log`, and `frontend.log` capture runtime output for debugging.

---

## License

MIT
