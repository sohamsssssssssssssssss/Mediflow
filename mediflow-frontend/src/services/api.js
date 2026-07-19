// Use relative URLs when hosted via vite proxy, direct URL as fallback
const API_BASE_URL = '';

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/extract`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed: ${err}`);
  }

  return res.json();
}

export async function fetchTimeline() {
  const res = await fetch(`${API_BASE_URL}/timeline`);
  if (!res.ok) {
    throw new Error('Failed to fetch timeline');
  }
  return res.json();
}

export async function fetchDoctorBrief() {
  const res = await fetch(`${API_BASE_URL}/doctor-brief`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    throw new Error('Failed to generate doctor brief');
  }

  const data = await res.json();
  return data.brief;
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) {
    throw new Error('Backend not available');
  }
  return res.json();
}
