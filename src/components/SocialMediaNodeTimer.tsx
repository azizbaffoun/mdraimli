import React from 'react';

interface SocialMediaNodeTimerProps {
  badgeNumber?: number | null;
  delayValue?: string | null;
  color?: string;
  nodeName: string;
}

const SocialMediaNodeTimer: React.FC<SocialMediaNodeTimerProps> = ({ badgeNumber, delayValue, nodeName }) => {
  // If both badgeNumber and delayValue are null or undefined, just render the node name
  if ((badgeNumber === null || badgeNumber === undefined) &&
    (delayValue === null || delayValue === undefined)) {
    return <div style={{ fontSize: '16px', color: '#222' }}>{nodeName}</div>;
  }

  return (
    <div className="flex flex-col items-center pointer-events-none">
      {/* Node name with badge number if provided */}
      <div className="flex items-center justify-center">
        {badgeNumber !== null && badgeNumber !== undefined && (
          <span style={{ marginRight: '4px', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#FC8500', fontWeight: 700, fontSize: '16px' }}>{badgeNumber}</span>
          </span>
        )}
        <span style={{ fontSize: '16px', color: '#222' }}>{nodeName}</span>
      </div>

      {/* Calendar icon and string if provided */}
      {delayValue !== null && delayValue !== undefined && (
        <div className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="15.951" height="18.05" viewBox="0 0 15.951 18.05">
            <defs>
              <linearGradient id="linear-gradient" x1="1.479" y1="1.12" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                <stop offset="0" stop-color="#ffbb70" />
                <stop offset="1" stop-color="#fc8500" />
              </linearGradient>
            </defs>
            <g id="timer-pause" transform="translate(-2.5 -1.25)">
              <path id="Path_694" data-name="Path 694" d="M10.476,19.7a7.976,7.976,0,1,1,7.976-7.976.63.63,0,0,1-1.259,0,6.716,6.716,0,1,0-6.716,6.716.63.63,0,0,1,0,1.259Z" transform="translate(0 -0.401)" fill="url(#linear-gradient)" />
              <path id="Path_695" data-name="Path 695" d="M11.88,12.707a.63.63,0,0,1-.63-.63V7.88a.63.63,0,1,1,1.259,0v4.2A.63.63,0,0,1,11.88,12.707Z" transform="translate(-1.404 -0.963)" fill="url(#linear-gradient)" />
              <path id="Path_696" data-name="Path 696" d="M13.917,2.509H8.88a.63.63,0,0,1,0-1.259h5.037a.63.63,0,1,1,0,1.259Z" transform="translate(-0.923)" fill="url(#linear-gradient)" />
              <path id="Path_697" data-name="Path 697" d="M18.88,20.867a.63.63,0,0,1-.63-.63V16.88a.63.63,0,0,1,1.259,0v3.358A.63.63,0,0,1,18.88,20.867Z" transform="translate(-2.527 -2.407)" fill="url(#linear-gradient)" />
              <path id="Path_698" data-name="Path 698" d="M15.88,20.867a.63.63,0,0,1-.63-.63V16.88a.63.63,0,1,1,1.259,0v3.358A.63.63,0,0,1,15.88,20.867Z" transform="translate(-2.046 -2.407)" fill="url(#linear-gradient)" />
            </g>
          </svg>

          <span style={{ fontSize: '16px', color: '#222', display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
            {delayValue}
          </span>
        </div>
      )}
    </div>
  );
};

export default SocialMediaNodeTimer;
