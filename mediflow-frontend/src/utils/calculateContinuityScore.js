export default function calculateContinuityScore(entries, conflicts) {
  if (!entries || entries.length === 0) {
    return { score: null, label: 'No Data', factors: [] };
  }

  let score = 100;
  const factors = [];

  const conflictCount = conflicts ? conflicts.length : 0;
  if (conflictCount > 0) {
    const deduction = conflictCount * 15;
    score -= deduction;
    factors.push(`${conflictCount} unresolved conflict${conflictCount > 1 ? 's' : ''}`);
  }

  const doctorNames = new Set();
  entries.forEach(e => {
    if (e.doctor_name) doctorNames.add(e.doctor_name);
  });
  const doctorCount = doctorNames.size;
  if (doctorCount > 1) {
    const deduction = (doctorCount - 1) * 10;
    score -= deduction;
    factors.push(`${doctorCount} doctors involved`);
  }

  const today = new Date();
  let hasOverdueFollowUp = false;
  for (const entry of entries) {
    if (!entry.follow_up_date) continue;
    const followUpDate = new Date(entry.follow_up_date);
    if (isNaN(followUpDate.getTime())) continue;
    if (followUpDate >= today) continue;
    const hasLaterDoc = entries.some(other => {
      if (other === entry) return false;
      return other.date && new Date(other.date) > followUpDate;
    });
    if (!hasLaterDoc) {
      hasOverdueFollowUp = true;
      break;
    }
  }
  if (hasOverdueFollowUp) {
    score -= 10;
    factors.push('1 overdue follow-up');
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label;
  if (score >= 80) label = 'Well Coordinated';
  else if (score >= 50) label = 'Fragmented';
  else label = 'High Risk — Fragmented Care';

  return { score, label, factors };
}
