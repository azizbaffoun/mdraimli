import React from 'react';

interface ZoomControlProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isLocked?: boolean;
}

const ZoomControl: React.FC<ZoomControlProps> = ({ zoomLevel, onZoomIn, onZoomOut }) => {
  return (
    <div className="fixed bottom-16 right-6 z-30" style={{ width: 99, height: 39 }}>
      {/* Overlay clickable halves */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', zIndex: 10, cursor: 'pointer' }} onClick={onZoomOut} />
      <div style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', zIndex: 10, cursor: 'pointer' }} onClick={onZoomIn} />
      <svg xmlns="http://www.w3.org/2000/svg" width="99" height="39" viewBox="0 0 99 39" style={{ position: 'relative', zIndex: 1 }}>
        <defs>
          <filter id="Rectangle_1556" x="0" y="0" width="99" height="39" filterUnits="userSpaceOnUse">
            <feOffset dy="1"/>
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feFlood floodColor="#dbe2eb" floodOpacity="0.349"/>
            <feComposite operator="in" in2="blur"/>
            <feComposite in="SourceGraphic"/>
          </filter>
          <linearGradient id="linear-gradient" y1="0.365" x2="1" y2="0.058" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor="#3799db"/>
            <stop offset="1" stopColor="#2db4a6"/>
          </linearGradient>
        </defs>
        <g id="Group_3861" data-name="Group 3861">
          <g filter="url(#Rectangle_1556)">
            <g id="Rectangle_1556-2" data-name="Rectangle 1556" transform="translate(4.5 3.5)" fill="#fff" stroke="#dbe2eb" strokeWidth="1">
              <rect width="90" height="30" rx="7" stroke="none"/>
              <rect x="0.5" y="0.5" width="89" height="29" rx="6.5" fill="none"/>
            </g>
          </g>
          <text id="_100_" data-name="100%" transform="translate(32.5 23.5)" fill="#222" fontSize="13" fontFamily="SegoeUI, Segoe UI">
            <tspan x="0" y="0">{Math.round(zoomLevel * 100)}%</tspan>
          </text>
          {/* Zoom In Button */}
          <g id="add-circle" transform="translate(67.25 5.25)">
            <path id="Path_687" d="M18.31,13.146H8.2a.948.948,0,1,1,0-1.9H18.31a.948.948,0,1,1,0,1.9Z" transform="translate(0 1.056)" fill="url(#linear-gradient)"/>
            <path id="Path_688" d="M12.2,19.258a.948.948,0,0,1-.948-.948V8.2a.948.948,0,1,1,1.9,0V18.31A.948.948,0,0,1,12.2,19.258Z" transform="translate(1.056)" fill="url(#linear-gradient)"/>
          </g>
          {/* Zoom Out Button */}
          <g id="minus-cirlce" transform="translate(5.33 6.25)">
            <path id="Path_690" d="M18.29,13.156H8.123a.953.953,0,0,1,0-1.906H18.29a.953.953,0,1,1,0,1.906Z" transform="translate(0)" fill="url(#linear-gradient)"/>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default ZoomControl;