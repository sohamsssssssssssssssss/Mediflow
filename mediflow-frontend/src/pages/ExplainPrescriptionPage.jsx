import { useState } from 'react';
import Header from '../components/Header';
import './ExplainPrescriptionPage.css';

const SEEDED_PRESCRIPTIONS = [
  { id: 1, name: 'Crocin (Paracetamol 500mg)', brand: 'Crocin', generic: 'Paracetamol' },
  { id: 2, name: 'Dolo (Paracetamol 650mg)', brand: 'Dolo', generic: 'Paracetamol' },
  { id: 3, name: 'Metformin 500mg', brand: 'Metformin', generic: 'Metformin' },
  { id: 4, name: 'Amlodipine 5mg', brand: 'Amlodipine', generic: 'Amlodipine' },
];

const explanations = {
  en: {
    'Paracetamol': 'Paracetamol is a common pain reliever and fever reducer. It works by blocking pain signals in the brain. Take it as needed, but do not exceed 3000mg in 24 hours. Avoid alcohol while taking this medication.',
    'Metformin': 'Metformin is an oral diabetes medicine that helps control blood sugar levels. It works by improving how your body uses insulin. Take it with meals to reduce stomach upset. Common side effects include nausea and diarrhea.',
    'Amlodipine': 'Amlodipine is a blood pressure medication that relaxes blood vessels to improve blood flow. Take it once daily, usually in the morning. It may cause swelling in the ankles or feet. Do not stop taking it without consulting your doctor.',
  },
  hi: {
    'Paracetamol': 'पैरासिटामोल एक सामान्य दर्द निवारक और बुखार कम करने वाली दवा है। यह मस्तिष्क में दर्द के संकेतों को रोककर काम करता है। इसे आवश्यकतानुसार लें, लेकिन 24 घंटे में 3000mg से अधिक न लें। इस दवा को लेते समय शराब से बचें।',
    'Metformin': 'मेटफॉर्मिन एक मधुमेह की दवा है जो रक्त शर्करा के स्तर को नियंत्रित करने में मदद करती है। यह आपके शरीर द्वारा इंसुलिन के उपयोग में सुधार करके काम करता है। पेट की खराबी को कम करने के लिए इसे भोजन के साथ लें। सामान्य दुष्प्रभावों में मतली और दस्त शामिल हैं।',
    'Amlodipine': 'एम्लोडिपिन एक रक्तचाप की दवा है जो रक्त प्रवाह में सुधार करने के लिए रक्त वाहिकाओं को आराम देती है। इसे आमतौर पर सुबह में, दिन में एक बार लें। इससे टखनों या पैरों में सूजन हो सकती है। डॉक्टर से परामर्श किए बिना इसे लेना बंद न करें।',
  },
};

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
];

export default function ExplainPrescriptionPage() {
  const [selectedRx, setSelectedRx] = useState('');
  const [language, setLanguage] = useState('en');
  const [explanation, setExplanation] = useState(null);

  const handleExplain = () => {
    if (!selectedRx) return;
    const rx = SEEDED_PRESCRIPTIONS.find(p => p.name === selectedRx);
    if (!rx) return;
    const langData = explanations[language] || explanations.en;
    const text = langData[rx.generic] || 'Explanation not available for this medication.';
    setExplanation({ drug: rx.brand, generic: rx.generic, text, lang: language });
  };

  const changeLanguage = (code) => {
    setLanguage(code);
    if (explanation) {
      const langData = explanations[code] || explanations.en;
      const text = langData[explanation.generic] || 'Explanation not available for this medication.';
      setExplanation({ ...explanation, text, lang: code });
    }
  };

  return (
    <div className="page explain-page">
      <Header />
      <main className="page-main">
        <div className="container">
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Explain My Prescription</h1>
              <p className="page-subtitle">Get a plain-language explanation of your medications</p>
            </div>
          </div>

          <div className="explain-controls card">
            <div className="explain-fields">
              <label>
                <span>Prescription</span>
                <select value={selectedRx} onChange={e => setSelectedRx(e.target.value)}>
                  <option value="">Select a medication</option>
                  {SEEDED_PRESCRIPTIONS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </label>
              <label>
                <span>Language</span>
                <div className="explain-lang-tabs">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      className={`btn ${language === l.code ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      onClick={() => changeLanguage(l.code)}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </label>
              <button className="btn btn-primary" onClick={handleExplain} disabled={!selectedRx}>
                Explain
              </button>
            </div>
          </div>

          {explanation && (
            <div className="explain-result card">
              <div className="explain-result-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20, color: 'var(--accent-blue)' }}>
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div>
                  <h3>{explanation.drug}</h3>
                  <span className="explain-generic">Generic: {explanation.generic}</span>
                </div>
                <span className="badge badge-blue">{LANGUAGES.find(l => l.code === explanation.lang)?.label}</span>
              </div>
              <p className="explain-text">{explanation.text}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
