import React from "react";

interface VtnnLogoProps {
  className?: string;
  size?: number;
}

export default function VtnnLogo({ className = "", size = 120 }: VtnnLogoProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      id="vtnn-brand-logo-svg"
    >
      <defs>
        {/* Curved Path for top text 'BẢO VỆ THỰC VẬT' (clockwise) */}
        <path
          id="topTextPath"
          d="M 28 100 A 72 72 0 0 1 172 100"
          fill="none"
        />
        
        {/* Curved Path for bottom text (clockwise path from right to left curves under bottom) */}
        <path
          id="bottomTextPath"
          d="M 174 100 A 74 74 0 0 1 26 100"
          fill="none"
        />

        {/* Soft blue-green radial gradient background */}
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0fdf4" stopOpacity="0.9" />
          <stop offset="65%" stopColor="#ecfdf5" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#f0f9ff" stopOpacity="0.4" />
        </radialGradient>

        {/* Sprout green gradient */}
        <linearGradient id="sproutGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Shield outline gradient */}
        <linearGradient id="shieldGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      {/* 1. Outer circular emblem structure */}
      <circle cx="100" cy="100" r="97" fill="#ffffff" stroke="#10b981" strokeWidth="2.8" />
      <circle cx="100" cy="100" r="92" fill="none" stroke="#047857" strokeWidth="1" opacity="0.7" />
      <circle cx="100" cy="100" r="82" fill="url(#centerGlow)" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

      {/* 2. Top Curved Text: BẢO VỆ THỰC VẬT */}
      <text 
        fontFamily='"Inter", system-ui, -apple-system, sans-serif'
        fontSize="12.5" 
        fontWeight="800" 
        fill="#115e59" 
        letterSpacing="0.8"
      >
        <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
          BẢO VỆ THỰC VẬT
        </textPath>
      </text>

      {/* 3. Bottom Curved Text: NÔNG NGHIỆP BỀN VỮNG - TƯƠNG LAI XANH */}
      <text 
        fontFamily='"Inter", system-ui, -apple-system, sans-serif'
        fontSize="8.2" 
        fontWeight="800" 
        fill="#0f766e" 
        letterSpacing="0.4"
      >
        <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle">
          NÔNG NGHIỆP BỀN VỮNG - TƯƠNG LAI XANH
        </textPath>
      </text>

      {/* 4. Fine Network Background Connections */}
      <g stroke="#a7f3d0" strokeWidth="0.6" opacity="0.8" fill="none">
        <line x1="55" y1="125" x2="100" y2="160" />
        <line x1="145" y1="128" x2="100" y2="160" />
        <line x1="100" y1="160" x2="100" y2="138" />
        <line x1="55" y1="125" x2="50" y2="90" />
        <line x1="145" y1="128" x2="150" y2="90" />
        <line x1="145" y1="110" x2="145" y2="128" />
        <line x1="55" y1="125" x2="145" y2="128" />
      </g>

      {/* 5. Center Shield / Pentagonal House Container */}
      <path 
        d="M 100,42 L 64,62 L 74,108 L 126,108 L 136,62 Z" 
        fill="#f0fdf4" 
        stroke="url(#shieldGradient)" 
        strokeWidth="4.2" 
        strokeLinejoin="round" 
      />

      {/* 6. Sprout Growing Inside the Shield */}
      {/* Stem */}
      <path d="M 100,105 C 100,88 100,82 100,74" stroke="#047857" strokeWidth="3.5" strokeLinecap="round" />
      {/* Left Leaf */}
      <path 
        d="M 100,92 C 84,92 78,80 90,75 C 100,80 100,88 100,92 Z" 
        fill="#34d399" 
        stroke="#047857" 
        strokeWidth="1.5" 
        strokeLinejoin="round"
      />
      {/* Right Leaf */}
      <path 
        d="M 100,92 C 116,92 122,80 110,75 C 100,80 100,88 100,92 Z" 
        fill="url(#sproutGradient)" 
        stroke="#047857" 
        strokeWidth="1.5" 
        strokeLinejoin="round"
      />
      {/* Top Small Leaf */}
      <path 
        d="M 100,78 C 94,68 100,61 100,61 C 100,61 106,68 100,78 Z" 
        fill="#a7f3d0" 
        stroke="#047857" 
        strokeWidth="1.2" 
        strokeLinejoin="round"
      />

      {/* 7. Large Bold Green "181" */}
      <text 
        x="100" 
        y="136" 
        fontFamily='"Inter", "Arial Black", sans-serif'
        fontSize="28" 
        fontWeight="900" 
        fill="#115e59" 
        textAnchor="middle" 
        letterSpacing="-1"
      >
        181
      </text>

      {/* 8. Surrounding High-Tech Smart Farming Icons */}
      {/* Left Icon: Cooperative/handshake circle */}
      <g transform="translate(48, 86) scale(0.65)" stroke="#059669" strokeWidth="1.2" fill="none">
        <circle cx="0" cy="0" r="8" strokeDasharray="1.5 1.5" />
        <path d="M -4,-2 C -2,-4 2,-4 4,-2 C 4,2 -4,4 -4,-2" fill="#34d399" opacity="0.35" />
        <path d="M -2,4 C 0,6 4,4 4,0" strokeWidth="1" />
      </g>

      {/* Right Icon: Cooperative/handshake circle */}
      <g transform="translate(152, 86) scale(0.65)" stroke="#059669" strokeWidth="1.2" fill="none">
        <circle cx="0" cy="0" r="8" strokeDasharray="1.5 1.5" />
        <path d="M -4,-2 C -2,-4 2,-4 4,-2 C 4,2 -4,4 -4,-2" fill="#34d399" opacity="0.35" />
        <path d="M -2,4 C 0,6 4,4 4,0" strokeWidth="1" />
      </g>

      {/* Drone Icon at Upper Right */}
      <g transform="translate(145, 108) scale(0.65)" stroke="#0f766e" strokeWidth="1.2" fill="none">
        <path d="M -10,0 L 10,0 M 0,-5 L 0,5" />
        <circle cx="-10" cy="0" r="2.5" fill="#f0fdf4" />
        <circle cx="10" cy="0" r="2.5" fill="#f0fdf4" />
        <path d="M -13,-2 L -7,-2 M 7,-2 L 13,-2" />
        <circle cx="0" cy="4" r="1.8" fill="#3b82f6" stroke="none" />
      </g>

      {/* Soil Probe/Sensor at Lower Left */}
      <g transform="translate(56, 126) scale(0.72)" stroke="#0f766e" strokeWidth="1.2" fill="none">
        <rect x="-4" y="-12" width="8" height="15" rx="1.2" fill="#ffffff" />
        <line x1="0" y1="3" x2="0" y2="12" strokeWidth="2" strokeLinecap="round" />
        <rect x="-2" y="-9" width="4" height="5" fill="#34d399" opacity="0.6" stroke="none" />
        <path d="M -8,-6 Q -11,0 -8,6" strokeWidth="0.8" strokeDasharray="1 1" />
        <path d="M 8,-6 Q 11,0 8,6" strokeWidth="0.8" strokeDasharray="1 1" />
      </g>

      {/* Microchip at Lower Right */}
      <g transform="translate(144, 128) scale(0.75)" stroke="#0f766e" strokeWidth="1.2" fill="none">
        <rect x="-7" y="-7" width="14" height="14" rx="1.5" fill="#ffffff" />
        <rect x="-4" y="-4" width="8" height="8" fill="#14b8a6" opacity="0.25" stroke="none" />
        {/* Chip Pins */}
        <line x1="-10" y1="-4" x2="-7" y2="-4" />
        <line x1="-10" y1="0" x2="-7" y2="0" />
        <line x1="-10" y1="4" x2="-7" y2="4" />
        <line x1="7" y1="-4" x2="10" y2="-4" />
        <line x1="7" y1="0" x2="10" y2="0" />
        <line x1="7" y1="4" x2="10" y2="4" />
        <line x1="-4" y1="-10" x2="-4" y2="-7" />
        <line x1="0" y1="-10" x2="0" y2="-7" />
        <line x1="4" y1="-10" x2="4" y2="-7" />
        <line x1="-4" y1="7" x2="-4" y2="10" />
        <line x1="0" y1="7" x2="0" y2="10" />
        <line x1="4" y1="7" x2="4" y2="10" />
      </g>

      {/* Cellular/Wireless Tower at Bottom Center */}
      <g transform="translate(100, 160) scale(0.8)" stroke="#0284c7" strokeWidth="1.2" fill="none">
        <path d="M -6,11 L 0,-2 L 6,11 M -3.5,6 L 3.5,6" strokeLinecap="round" />
        <circle cx="0" cy="-4" r="2.5" fill="#ef4444" stroke="none" />
        <path d="M -4,-8 A 5,5 0 0,1 4,-8" strokeWidth="0.8" />
        <path d="M -7,-11 A 9,9 0 0,1 7,-11" strokeWidth="0.8" />
      </g>
    </svg>
  );
}
