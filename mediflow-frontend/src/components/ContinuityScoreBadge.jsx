import { useMemo } from 'react';
import calculateContinuityScore from '../utils/calculateContinuityScore';
import './ContinuityScoreBadge.css';

export default function ContinuityScoreBadge({ entries, conflicts }) {
  const { score, label, factors } = useMemo(
    () => calculateContinuityScore(entries, conflicts),
    [entries, conflicts]
  );

  if (score === null) return null;

  const colorClass = score >= 80 ? 'cs-green' : score >= 50 ? 'cs-amber' : 'cs-red';

  return (
    <div className={`continuity-score ${colorClass}`}>
      <div className="cs-main">
        <span className="cs-score">{score}<span className="cs-total">/100</span></span>
        <span className="cs-label">{label}</span>
      </div>
      {factors.length > 0 && (
        <p className="cs-factors">{factors.join(', ')}</p>
      )}
    </div>
  );
}
