import React, { useEffect, useState } from 'react';

const CircularProgress = ({ value = 0, size = 120, strokeWidth = 10, label = 'Score' }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  // Determine color based on value
  let strokeColor = 'var(--error)';
  if (value >= 80) strokeColor = 'var(--success)';
  else if (value >= 60) strokeColor = 'var(--warning)';

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s ease-out, stroke 1s ease',
          }}
        />
      </svg>
      {/* Content overlays */}
      <div style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: size * 0.22, fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
          {Math.round(animatedValue)}%
        </span>
        {label && (
          <span style={{ fontSize: size * 0.09, textTransform: 'uppercase', tracking: '0.05em', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

export default CircularProgress;
