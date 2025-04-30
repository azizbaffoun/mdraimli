import React from 'react';
import NodeReplaceMenu from './nodereplacemenu';
import { ContentType } from '@/types/workflowTypes';

interface PopupSelectProps {
  onDocumentClick?: () => void;
  onSettingsClick?: () => void;
  onDeleteClick?: () => void;
  notificationCount?: number;
  isTopicalKeywordNode?: boolean;
  nodeId?: string;
  onReplaceNode?: (nodeId: string, newType: ContentType) => void;
  isReplaceMenuOpen?: boolean;
  onCloseReplaceMenu?: () => void;
  setOpenMenu?: React.Dispatch<React.SetStateAction<{ type: 'add' | 'popselect', nodeId: string } | null>>;
}

const PopupSelect: React.FC<PopupSelectProps> = ({
  onDocumentClick,
  onSettingsClick,
  onDeleteClick,
  notificationCount = 9,
  isTopicalKeywordNode = false,
  nodeId,
  onReplaceNode,
  isReplaceMenuOpen = false,
  onCloseReplaceMenu = () => {},
  setOpenMenu,
}) => {
  const handleSettingsClick = () => {
    if (isTopicalKeywordNode) {
      onSettingsClick?.();
      setOpenMenu?.({ type: 'popselect', nodeId: nodeId || '' });
    } else {
      console.log('Settings clicked for node:', nodeId);
    }
  };

  return (
    <div 
      className="absolute left-1/2 -translate-x-1/2 top-full -mt-70 z-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={isTopicalKeywordNode ? "96" : "143"}
        height="56.207"
        viewBox={isTopicalKeywordNode ? "0 0 96 56.207" : "0 0 143 56.207"}
      >
        <defs>
          <filter id="Rounded_Rectangle_5320" x="-4.5" y="-0.293" width="152" height="61" filterUnits="userSpaceOnUse">
            <feOffset dy="3"/>
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feFlood floodOpacity="0.188"/>
            <feComposite operator="in" in2="blur"/>
            <feComposite in="SourceGraphic"/>
          </filter>
          <filter id="Rounded_Rectangle_5320-2" x="0" y="4.207" width="143" height="52" filterUnits="userSpaceOnUse">
            <feOffset dy="3"/>
            <feGaussianBlur stdDeviation="1.5" result="blur-2"/>
            <feFlood floodOpacity="0.09"/>
            <feComposite operator="in" in2="blur-2"/>
            <feComposite in="SourceGraphic"/>
          </filter>
          <clipPath id="clip-path">
            <rect width={isTopicalKeywordNode ? "87" : "134"} height="43" rx="10" fill="#fff"/>
          </clipPath>
          <linearGradient id="linear-gradient" y1="0.365" x2="1" y2="0.058" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor="#3799db"/>
            <stop offset="1" stopColor="#2db4a6"/>
          </linearGradient>
          <filter id="Ellipse_5367_copy_2" x="7.5" y="23.707" width="22" height="22" filterUnits="userSpaceOnUse">
            <feOffset dy="-2"/>
            <feGaussianBlur stdDeviation="1" result="blur-3"/>
            <feFlood floodOpacity="0.161"/>
            <feComposite operator="in" in2="blur-3"/>
            <feComposite in="SourceGraphic"/>
          </filter>
        </defs>
        <g transform="translate(-389.5 -535.293)">
          <g>
            <g transform="matrix(1, 0, 0, 1, 389.5, 535.29)" filter="url(#Rounded_Rectangle_5320-2)">
              <rect width={isTopicalKeywordNode ? "87" : "134"} height="43" rx="10" transform="translate(4.5 5.71)" fill="#fff"/>
            </g>
            <g transform="translate(394 541)" clipPath="url(#clip-path)">
              <path id="Rectangle_5323" data-name="Rectangle_5323" d={`M0,0H${isTopicalKeywordNode ? "87" : "134"}V2.9H0Z`} transform="translate(0.5 0.5)" stroke="rgba(0,0,0,0)" strokeWidth="1" fill="url(#linear-gradient)"/>
            </g>
            {/* Document Icon */}
            <g transform="translate(407 553.591)" onClick={onDocumentClick} className="cursor-pointer">
              <path d="M9.752,0a.457.457,0,0,1,.455.46h0V3.68a3.349,3.349,0,0,0,3.307,3.34c.752,0,1.346.01,1.8.01h.169c.3,0,.714-.009,1.069-.009A.446.446,0,0,1,17,7.47h0v8.04A4.468,4.468,0,0,1,12.554,20H4.673A4.7,4.7,0,0,1,0,15.29H0V4.51A4.5,4.5,0,0,1,4.465,0H9.752Zm1.059,12.9H5.426a.743.743,0,0,0-.743.74.752.752,0,0,0,.743.75h5.386a.752.752,0,0,0,.743-.75.743.743,0,0,0-.743-.74Zm-2.04-5H5.426a.752.752,0,0,0-.743.75.743.743,0,0,0,.743.74H8.772a.743.743,0,0,0,.743-.74.752.752,0,0,0-.743-.75ZM11.651.906a.473.473,0,0,1,.814-.334l3.986,4.187a.477.477,0,0,1-.34.807c-.814,0-1.773,0-2.463-.007a2.017,2.017,0,0,1-2-2.017h0Z" fill="url(#linear-gradient)"/>
            </g>
          </g>
          {/* Vertical Separators */}
          <rect width="1" height="40" transform="translate(437 544)" fill="#ecf0f3"/>
          {!isTopicalKeywordNode && (
            <rect width="1" height="40" transform="translate(481 544)" fill="#ecf0f3"/>
          )}
          {/* Notification Badge */}
          <g transform="matrix(1, 0, 0, 1, 389.5, 535.29)" filter="url(#Ellipse_5367_copy_2)">
            <circle cx="8" cy="8" r="8" transform="translate(10.5 28.71)" fill="#b0bcc8"/>
          </g>
          <text transform="translate(408.915 576.073)" fill="#fff" fontSize="11" fontFamily="SegoeUI, Segoe UI">
            <tspan x="-6.727" y="0">{notificationCount}+</tspan>
          </text>
          {/* Settings Icon */}
          <g transform="translate(447.5 552)" onClick={handleSettingsClick} className="cursor-pointer">
            <g transform="translate(2.5 2)">
              <path d="M10.217,0a2.152,2.152,0,0,1,1.819,1.04,1.778,1.778,0,0,1,.276,1.06,1.546,1.546,0,0,0,.235.88,1.973,1.973,0,0,0,2.575.69,2.112,2.112,0,0,1,2.872.76h0l.685,1.18a2.027,2.027,0,0,1-.756,2.83,1.822,1.822,0,0,0-.654,2.5,1.547,1.547,0,0,0,.634.64,2.3,2.3,0,0,1,.828.79,2.018,2.018,0,0,1-.02,2.05h0l-.715,1.2a2.1,2.1,0,0,1-2.892.74,1.63,1.63,0,0,0-.9-.23,1.909,1.909,0,0,0-1.891,1.82A2.068,2.068,0,0,1,10.2,20H8.807a2.07,2.07,0,0,1-2.126-2.05A1.892,1.892,0,0,0,4.8,16.13a1.586,1.586,0,0,0-.9.23,2.161,2.161,0,0,1-1.083.3A2.134,2.134,0,0,1,1,15.62H1l-.705-1.2a2,2,0,0,1-.02-2.05,2.118,2.118,0,0,1,.818-.79,1.634,1.634,0,0,0,.644-.64,1.834,1.834,0,0,0-.664-2.5A2.044,2.044,0,0,1,.314,5.61h0L1,4.43a2.124,2.124,0,0,1,2.882-.76,1.963,1.963,0,0,0,2.565-.69,1.546,1.546,0,0,0,.235-.88,1.785,1.785,0,0,1,.286-1.06A2.195,2.195,0,0,1,8.776,0h1.441ZM9.512,7.18a2.826,2.826,0,1,0,0,5.65,2.825,2.825,0,1,0,0-5.65Z" fill="url(#linear-gradient)"/>
            </g>
          </g>
          {/* Arrow */}
          <path
            d="M2,0H9c1.1,0-9,9-9,9V2A2,2,0,0,1,2,0Z"
            transform={
              isTopicalKeywordNode
                ? "translate(438 535) rotate(45)"
                : "translate(461 535) rotate(45)"
            }
            fill="#31a8bc"
          />
          {/* Delete Icon */}
          {!isTopicalKeywordNode && (
            <g transform="translate(491 552)" onClick={onDeleteClick} className="cursor-pointer">
              <g transform="translate(3 2)">
                <path d="M15.939,6.7a.726.726,0,0,1,.523.234.746.746,0,0,1,.181.558c0,.068-.533,6.808-.837,9.645a2.917,2.917,0,0,1-3,2.827C11.515,19.99,10.25,20,9,20c-1.323,0-2.616-.01-3.872-.039A2.917,2.917,0,0,1,2.2,17.134c-.313-2.847-.836-9.577-.846-9.645a.791.791,0,0,1,.191-.558A.706.706,0,0,1,2.069,6.7ZM11.065,0a1.986,1.986,0,0,1,1.9,1.5h0l.163.73a1.281,1.281,0,0,0,1.241,1.016h2.916A.723.723,0,0,1,18,3.977h0v.38a.73.73,0,0,1-.713.734H.714A.73.73,0,0,1,0,4.357H0v-.38a.723.723,0,0,1,.714-.734H3.63A1.282,1.282,0,0,0,4.871,2.228h0l.153-.682A1.988,1.988,0,0,1,6.935,0h4.129Z" fill="#b0bcc8"/>
              </g>
            </g>
          )}
        </g>
      </svg>
      {!isTopicalKeywordNode && nodeId && onReplaceNode && (
        <NodeReplaceMenu
          nodeId={nodeId}
          isOpen={isReplaceMenuOpen}
          onClose={onCloseReplaceMenu}
          onReplaceNode={onReplaceNode}
          availableOptions={['article', 'video', 'podcast', 'socialMedia']}
          positionStyle={{ left: '110%', top: '50%', transform: 'translateY(-50%)', zIndex: 50 }}
        />
      )}
    </div>
  );
};

export default PopupSelect; 