import React from 'react';
import { ContentType } from '@/types/workflowTypes';

interface PopupSelectProps {
  onSettingsClick?: () => void;
  onDeleteClick?: () => void;
  isTopicalKeywordNode?: boolean;
  nodeId?: string;
  onReplaceNode?: (nodeId: string, newType: ContentType) => void;
  isReplaceMenuOpen?: boolean;
  onCloseReplaceMenu?: () => void;
  setOpenMenu?: React.Dispatch<React.SetStateAction<{ type: 'add' | 'popselect', nodeId: string } | null>>;
  style?: React.CSSProperties;
  arrowPosition?: 'up' | 'down' | 'left' | 'right';
}

const PopupSelect: React.FC<PopupSelectProps> = ({
  onSettingsClick,
  onDeleteClick,
  isTopicalKeywordNode = false,
  nodeId,
  setOpenMenu,
}) => {
  const handleSettingsClick = () => {
    onSettingsClick?.();
    setOpenMenu?.({ type: 'popselect', nodeId: nodeId || '' });
  };

  // Adjusted dimensions for 1 icon (topicalKeyword) vs 2 icons (settings, delete)
  const svgWidth = isTopicalKeywordNode ? 56 : 96;
  const svgViewBox = isTopicalKeywordNode ? "0 0 56 56.207" : "0 0 96 56.207";
  const rectWidth = isTopicalKeywordNode ? 47 : 87;

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-full -mt-70 z-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={svgWidth}
        height="56.207"
        viewBox={svgViewBox}
      >
        <defs>
          <filter id="Rounded_Rectangle_5320" x="-4.5" y="-0.293" width={isTopicalKeywordNode ? "65" : "106"} height="61" filterUnits="userSpaceOnUse">
            <feOffset dy="2"/>
            <feGaussianBlur stdDeviation="1" result="blur"/>
            <feFlood floodOpacity="0.071"/>
            <feComposite operator="in" in2="blur"/>
            <feComposite in="SourceGraphic"/>
          </filter>
          <filter id="Rounded_Rectangle_5320-2" x="0" y="4.207" width={isTopicalKeywordNode ? "56" : "96"} height="52" filterUnits="userSpaceOnUse">
            <feOffset dy="3"/>
            <feGaussianBlur stdDeviation="1.5" result="blur-2"/>
            <feFlood floodOpacity="0.09"/>
            <feComposite operator="in" in2="blur-2"/>
            <feComposite in="SourceGraphic"/>
          </filter>
          <clipPath id="clip-path">
            <rect width={rectWidth} height="43" rx="10" fill="#fff"/>
          </clipPath>
          <linearGradient id="linear-gradient" y1="0.365" x2="1" y2="0.058" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor="#3799db"/>
            <stop offset="1" stopColor="#2db4a6"/>
          </linearGradient>
        </defs>
        <g 
          transform="translate(-389.5 -535.293)"
        >
          {/* Background Rect and Top Gradient */}
          <g>
            <g transform="matrix(1, 0, 0, 1, 389.5, 535.29)" filter="url(#Rounded_Rectangle_5320-2)">
              <rect width={rectWidth} height="43" rx="10" transform="translate(4.5 5.71)" fill="#fff"/>
            </g>
            <g transform={`translate(${isTopicalKeywordNode ? 394 : 394} 541)`} clipPath="url(#clip-path)">
              <path id="Rectangle_5323" data-name="Rectangle_5323" d={`M0,0H${rectWidth}V2.9H0Z`} transform="translate(0.5 0.5)" stroke="rgba(0,0,0,0)" strokeWidth="1" fill="url(#linear-gradient)"/>
            </g>
          </g>

          {/* Separator */} 
          {!isTopicalKeywordNode && (
            <rect width="1" height="40" transform="translate(437 544)" fill="#ecf0f3"/>
          )}

          {/* --- Clickable Areas --- */}
          {isTopicalKeywordNode ? (
            // Clickable area for single icon (Settings)
            <rect 
              transform="translate(394 541)" 
              width={rectWidth} 
              height="43" 
              fill="transparent" 
              onClick={handleSettingsClick} 
              className="cursor-pointer"
            />
          ) : (
            // Clickable areas for two icons (Settings, Delete)
            <>
              <rect 
                transform="translate(395 541)" 
                width="43" // Width of Settings section
                height="43" 
                fill="transparent" 
                onClick={handleSettingsClick} 
                className="cursor-pointer"
              />
              <rect 
                transform="translate(437 541)" // Starts after separator
                width="44" // Width of Delete section
                height="43" 
                fill="transparent" 
                onClick={onDeleteClick} 
                className="cursor-pointer"
              />
            </>
          )}

          {/* --- Visual Icons (No Click Handlers Here) --- */}
          {/* Settings Icon (Visual Only) - Adjusted position */}
          <g 
            transform={`translate(${isTopicalKeywordNode ? 406.5 : 405} 552)`} 
            style={{ pointerEvents: 'none' }} // Prevent icon itself from capturing events
          >
            <g transform="translate(1.5 2)">
              <path d="M10.217,0a2.152,2.152,0,0,1,1.819,1.04,1.778,1.778,0,0,1,.276,1.06,1.546,1.546,0,0,0,.235.88,1.973,1.973,0,0,0,2.575.69,2.112,2.112,0,0,1,2.872.76h0l.685,1.18a2.027,2.027,0,0,1-.756,2.83,1.822,1.822,0,0,0-.654,2.5,1.547,1.547,0,0,0,.634.64,2.3,2.3,0,0,1,.828.79,2.018,2.018,0,0,1-.02,2.05h0l-.715,1.2a2.1,2.1,0,0,1-2.892.74,1.63,1.63,0,0,0-.9-.23,1.909,1.909,0,0,0-1.891,1.82A2.068,2.068,0,0,1,10.2,20H8.807a2.07,2.07,0,0,1-2.126-2.05A1.892,1.892,0,0,0,4.8,16.13a1.586,1.586,0,0,0-.9.23,2.161,2.161,0,0,1-1.083.3A2.134,2.134,0,0,1,1,15.62H1l-.705-1.2a2,2,0,0,1-.02-2.05,2.118,2.118,0,0,1,.818-.79,1.634,1.634,0,0,0,.644-.64,1.834,1.834,0,0,0-.664-2.5A2.044,2.044,0,0,1,.314,5.61h0L1,4.43a2.124,2.124,0,0,1,2.882-.76,1.963,1.963,0,0,0,2.565-.69,1.546,1.546,0,0,0,.235-.88,1.785,1.785,0,0,1,.286-1.06A2.195,2.195,0,0,1,8.776,0h1.441ZM9.512,7.18a2.826,2.826,0,1,0,0,5.65,2.825,2.825,0,1,0,0-5.65Z" fill="url(#linear-gradient)"/>
            </g>
          </g>
          
          {/* Arrow */}
          <path
            d="M2,0H9c1.1,0-9,9-9,9V2A2,2,0,0,1,2,0Z"
            transform={
              isTopicalKeywordNode
                ? "translate(417.5 535.1) rotate(45)"
                : "translate(437.5 535) rotate(45)"
            }
            fill="#31a8bc"
          />

          {/* Delete Icon (Visual Only) - Adjusted position */}
          {!isTopicalKeywordNode && (
            <g 
              transform="translate(447 552)" 
              style={{ pointerEvents: 'none' }} // Prevent icon itself from capturing events
            >
              <g transform="translate(3 2)">
                <path d="M15.939,6.7a.726.726,0,0,1,.523.234.746.746,0,0,1,.181.558c0,.068-.533,6.808-.837,9.645a2.917,2.917,0,0,1-3,2.827C11.515,19.99,10.25,20,9,20c-1.323,0-2.616-.01-3.872-.039A2.917,2.917,0,0,1,2.2,17.134c-.313-2.847-.836-9.577-.846-9.645a.791.791,0,0,1,.191-.558A.706.706,0,0,1,2.069,6.7ZM11.065,0a1.986,1.986,0,0,1,1.9,1.5h0l.163.73a1.281,1.281,0,0,0,1.241,1.016h2.916A.723.723,0,0,1,18,3.977h0v.38a.73.73,0,0,1-.713.734H.714A.73.73,0,0,1,0,4.357H0v-.38a.723.723,0,0,1,.714-.734H3.63A1.282,1.282,0,0,0,4.871,2.228h0l.153-.682A1.988,1.988,0,0,1,6.935,0h4.129Z" fill="#b0bcc8"/>
              </g>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};

export default PopupSelect; 