import React from 'react';

const HoistCraneLogo = ({ size = 40, showText = false, textColor, fontSize }) => {
    const svgSize = size;

    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: showText ? 12 : 0 }}>
            <svg
                width={svgSize}
                height={svgSize}
                viewBox="0 0 512 512"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block' }}
            >
                <defs>
                    <linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                    <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#15803d" />
                    </linearGradient>
                    <linearGradient id="logoGrad3" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#86efac" />
                        <stop offset="100%" stopColor="#4ade80" />
                    </linearGradient>
                    <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#16a34a" floodOpacity="0.3" />
                    </filter>
                </defs>

                {/* Background circle */}
                <circle cx="256" cy="256" r="240" fill="url(#logoGrad1)" filter="url(#logoShadow)" />

                {/* Inner circle highlight */}
                <circle cx="256" cy="256" r="210" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />

                {/* Crane tower (vertical beam) */}
                <rect x="220" y="80" width="36" height="320" rx="6" fill="url(#logoGrad2)" opacity="0.95" />
                <rect x="220" y="80" width="36" height="320" rx="6" fill="white" opacity="0.85" />

                {/* Crane tower cross braces */}
                <line x1="224" y1="120" x2="252" y2="160" stroke="url(#logoGrad2)" strokeWidth="5" strokeLinecap="round" />
                <line x1="252" y1="120" x2="224" y2="160" stroke="url(#logoGrad2)" strokeWidth="5" strokeLinecap="round" />
                <line x1="224" y1="170" x2="252" y2="210" stroke="url(#logoGrad2)" strokeWidth="5" strokeLinecap="round" />
                <line x1="252" y1="170" x2="224" y2="210" stroke="url(#logoGrad2)" strokeWidth="5" strokeLinecap="round" />
                <line x1="224" y1="220" x2="252" y2="260" stroke="url(#logoGrad2)" strokeWidth="5" strokeLinecap="round" />
                <line x1="252" y1="220" x2="224" y2="260" stroke="url(#logoGrad2)" strokeWidth="5" strokeLinecap="round" />

                {/* Crane boom (horizontal arm) */}
                <rect x="130" y="85" width="220" height="28" rx="6" fill="white" opacity="0.9" />

                {/* Boom diagonal braces */}
                <line x1="250" y1="113" x2="290" y2="85" stroke="url(#logoGrad2)" strokeWidth="5" strokeLinecap="round" />
                <line x1="290" y1="113" x2="330" y2="85" stroke="url(#logoGrad2)" strokeWidth="5" strokeLinecap="round" />
                <line x1="175" y1="113" x2="210" y2="85" stroke="url(#logoGrad2)" strokeWidth="5" strokeLinecap="round" />

                {/* Counter-jib support cable */}
                <line x1="238" y1="85" x2="350" y2="85" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
                <line x1="250" y1="85" x2="310" y2="56" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
                <line x1="310" y1="56" x2="350" y2="85" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.7" />

                {/* Main cable (from boom tip) */}
                <line x1="150" y1="113" x2="150" y2="260" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.8" />

                {/* Hook assembly */}
                <circle cx="150" cy="270" r="12" fill="none" stroke="white" strokeWidth="5" opacity="0.9" />
                <path d="M 150 258 L 150 248" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
                <path d="M 138 275 Q 135 295 150 300 Q 165 295 162 275" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.9" />

                {/* Load block (attached to hook) */}
                <rect x="125" y="310" width="50" height="40" rx="8" fill="white" opacity="0.25" />
                <rect x="130" y="315" width="40" height="30" rx="5" fill="white" opacity="0.3" />

                {/* Base / platform */}
                <rect x="185" y="390" width="106" height="20" rx="4" fill="white" opacity="0.7" />
                <rect x="170" y="400" width="136" height="14" rx="4" fill="white" opacity="0.5" />

                {/* Small decorative gear */}
                <circle cx="380" cy="380" r="35" fill="none" stroke="white" strokeWidth="6" opacity="0.2" />
                <circle cx="380" cy="380" r="15" fill="white" opacity="0.15" />
                {/* Gear teeth */}
                <rect x="375" y="340" width="10" height="16" rx="3" fill="white" opacity="0.15" />
                <rect x="375" y="404" width="10" height="16" rx="3" fill="white" opacity="0.15" />
                <rect x="340" y="375" width="16" height="10" rx="3" fill="white" opacity="0.15" />
                <rect x="404" y="375" width="16" height="10" rx="3" fill="white" opacity="0.15" />

                {/* Accent lines */}
                <line x1="80" y1="420" x2="160" y2="420" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.15" />
                <line x1="350" y1="160" x2="410" y2="160" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.15" />
            </svg>
            {showText && (
                <span style={{
                    fontWeight: 800,
                    fontSize: fontSize || '1.4rem',
                    background: textColor || 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    fontFamily: '"Inter", "Segoe UI", sans-serif',
                }}>
                    Hoist<br />&amp; Crane
                </span>
            )}
        </span>
    );
};

export default HoistCraneLogo;
