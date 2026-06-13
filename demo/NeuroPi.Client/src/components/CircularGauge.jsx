import React from 'react';

export default function CircularGauge({ value, label }) {
  const roundedValue = Math.round(value);
  const strokeDasharray = 251.2; // 2 * PI * r (r=40)
  const strokeDashoffset = strokeDasharray - (strokeDasharray * roundedValue) / 100;

  // Determine band and colors
  let band = 'Low';
  let badgeClass = 'badge badge-low';
  let progressColorClass = 'text-low';

  if (roundedValue >= 70) {
    band = 'High';
    badgeClass = 'badge badge-high';
    progressColorClass = 'text-high';
  } else if (roundedValue >= 40) {
    band = 'Moderate';
    badgeClass = 'badge badge-moderate';
    progressColorClass = 'text-moderate';
  }

  return (
    <div className="gauge-item">
      <div className="gauge-ring-container">
        <svg className="gauge-ring" viewBox="0 0 100 100">
          <circle className="gauge-ring-bg" cx="50" cy="50" r="40"></circle>
          <circle
            className={`gauge-ring-progress ${progressColorClass}`}
            cx="50"
            cy="50"
            r="40"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          ></circle>
        </svg>
        <span className="gauge-value">{roundedValue}%</span>
      </div>
      <h4>{label}</h4>
      <span className={badgeClass}>{band}</span>
    </div>
  );
}
