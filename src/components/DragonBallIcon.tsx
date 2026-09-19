import React from 'react';

interface DragonBallIconProps {
  type: string; // 'ball-1' to 'ball-7' | 'akira' | string
  size?: number; // default 36
  className?: string;
  glowing?: boolean;
}

export const DragonBallIcon: React.FC<DragonBallIconProps> = ({
  type,
  size = 36,
  className = '',
  glowing = false
}) => {
  // If type is Akira Toriyama tribute icon
  if (type === 'akira' || type === 'rincon-akira') {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 border border-amber-500/40 bg-zinc-900 shadow-md ${
          glowing ? 'shadow-[0_0_12px_rgba(245,158,11,0.5)]' : ''
        } ${className}`}
      >
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <defs>
            <linearGradient id="akiraBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#4c1d95" />
            </linearGradient>
            <linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fba666" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="18" r="17" fill="url(#akiraBg)" />
          {/* Tori Bot cap & glasses silhouette */}
          {/* Cap */}
          <path d="M 10 16 Q 18 8 26 16 L 27 18 L 9 18 Z" fill="#7c3aed" />
          <path d="M 8 18 Q 18 16 28 18 Q 18 20 8 18" fill="#a78bfa" />
          <text x="18" y="15" fontSize="5" fontWeight="900" textAnchor="middle" fill="#fef08a">TORI</text>
          {/* Face */}
          <rect x="11" y="18" width="14" height="10" rx="3" fill="url(#skin)" />
          {/* Glasses */}
          <rect x="12" y="19" width="5" height="4" rx="1" fill="#18181b" stroke="#f43f5e" strokeWidth="0.8" />
          <rect x="19" y="19" width="5" height="4" rx="1" fill="#18181b" stroke="#f43f5e" strokeWidth="0.8" />
          <line x1="17" y1="21" x2="19" y2="21" stroke="#f43f5e" strokeWidth="0.8" />
          {/* White glint on glasses */}
          <circle cx="14" cy="20.5" r="0.7" fill="#ffffff" />
          <circle cx="21" cy="20.5" r="0.7" fill="#ffffff" />
          {/* Mask / mouth */}
          <path d="M 14 25 Q 18 27 22 25" stroke="#7c2d12" strokeWidth="0.8" fill="none" />
          {/* Gas mask or signature respirator */}
          <circle cx="18" cy="26" r="2.2" fill="#3f3f46" stroke="#fbbf24" strokeWidth="0.6" />
        </svg>
      </div>
    );
  }

  // Determine star count from type e.g. 'ball-1' => 1
  let starCount = 1;
  const match = type.match(/ball-(\d+)/);
  if (match) {
    starCount = Math.min(7, Math.max(1, parseInt(match[1], 10)));
  } else if (type === 'sagas') starCount = 1;
  else if (type === 'peliculas') starCount = 2;
  else if (type === 'mangas') starCount = 3;
  else if (type === 'videos') starCount = 4;
  else if (type === 'imagenes') starCount = 5;
  else if (type === 'canciones') starCount = 6;
  else if (type === 'juegos') starCount = 7;

  // Star coordinates (percentage normalized to 0-36 viewBox)
  const starPositions: Record<number, Array<{ x: number; y: number }>> = {
    1: [{ x: 18, y: 18.5 }],
    2: [
      { x: 14.5, y: 18.5 },
      { x: 21.5, y: 18.5 }
    ],
    3: [
      { x: 18, y: 15 },
      { x: 14, y: 21 },
      { x: 22, y: 21 }
    ],
    4: [
      { x: 18, y: 13.5 },
      { x: 13.5, y: 18.5 },
      { x: 22.5, y: 18.5 },
      { x: 18, y: 23.5 }
    ],
    5: [
      { x: 18, y: 13.5 },
      { x: 13.5, y: 17.5 },
      { x: 22.5, y: 17.5 },
      { x: 15, y: 23 },
      { x: 21, y: 23 }
    ],
    6: [
      { x: 14.5, y: 14 },
      { x: 21.5, y: 14 },
      { x: 13.5, y: 18.5 },
      { x: 22.5, y: 18.5 },
      { x: 14.5, y: 23 },
      { x: 21.5, y: 23 }
    ],
    7: [
      { x: 18, y: 18.5 }, // center star
      { x: 18, y: 13 },
      { x: 22.8, y: 15.5 },
      { x: 22.8, y: 21.5 },
      { x: 18, y: 24 },
      { x: 13.2, y: 21.5 },
      { x: 13.2, y: 15.5 }
    ]
  };

  const stars = starPositions[starCount] || starPositions[1];

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none ${
        glowing ? 'drop-shadow-[0_0_8px_rgba(255,140,0,0.8)]' : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]'
      } ${className}`}
    >
      <svg
        viewBox="0 0 36 36"
        className="w-full h-full transform transition-transform hover:scale-105 duration-200"
      >
        <defs>
          {/* Dragon Ball body sphere gradient */}
          <radialGradient id={`dbGrad-${starCount}`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fff275" />
            <stop offset="25%" stopColor="#ffb01f" />
            <stop offset="65%" stopColor="#ea580c" />
            <stop offset="90%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#7c2d12" />
          </radialGradient>

          {/* Specular glass reflection top */}
          <linearGradient id={`dbGlint-${starCount}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Star symbol path */}
          <path
            id="redStar"
            d="M 0 -2.1 L 0.65 -0.65 L 2.1 -0.65 L 0.95 0.25 L 1.4 1.7 L 0 0.8 L -1.4 1.7 L -0.95 0.25 L -2.1 -0.65 L -0.65 -0.65 Z"
            fill="#dc2626"
            stroke="#991b1b"
            strokeWidth="0.25"
          />
        </defs>

        {/* Outer sphere shadow/rim */}
        <circle cx="18" cy="18" r="17" fill="#431407" />

        {/* Main Crystal Dragon Ball orb */}
        <circle cx="18" cy="18" r="16.5" fill={`url(#dbGrad-${starCount})`} />

        {/* Inner ambient ring */}
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="#fed7aa"
          strokeWidth="0.6"
          strokeOpacity="0.3"
        />

        {/* The Crimson 5-pointed stars */}
        {stars.map((pos, idx) => (
          <g key={idx} transform={`translate(${pos.x}, ${pos.y})`}>
            {/* Star subtle drop shadow inside crystal */}
            <use
              href="#redStar"
              transform="translate(0.2, 0.3) scale(1.05)"
              fill="#450a0a"
              opacity="0.4"
            />
            {/* Main star */}
            <use href="#redStar" />
          </g>
        ))}

        {/* Curved upper highlight ellipse for authentic 3D sphere shine */}
        <ellipse
          cx="15"
          cy="9.5"
          rx="9"
          ry="4"
          fill={`url(#dbGlint-${starCount})`}
          transform="rotate(-20 15 9.5)"
        />

        {/* Bottom subtle bounce light */}
        <ellipse
          cx="19"
          cy="31"
          rx="8"
          ry="2"
          fill="#ffedd5"
          opacity="0.25"
        />
      </svg>
    </div>
  );
};
