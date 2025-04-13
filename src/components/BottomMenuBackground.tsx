import React from 'react';

const BottomMenuBackground: React.FC = () => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      // Use viewBox to allow scaling, remove fixed width/height for flexibility
      viewBox="0 0 529 75" 
      // Preserve aspect ratio and let the parent container define size
      preserveAspectRatio="none" 
      // Apply styles for positioning and sizing within the parent
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1, // Place it behind the content
      }}
      // Add a class for potential future styling
      className="bottom-menu-background-svg" 
    >
      <defs>
        <filter id="Rectangle_1164_Filter" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse">
        <feOffset dy="3" in="SourceAlpha"/>          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feFlood floodOpacity="0.071"/>
          <feComposite operator="in" in2="blur"/>
          <feComposite in="SourceGraphic"/>
        </filter>
      </defs>
      {/* Apply the filter to the group */}
      <g filter="url(#Rectangle_1164_Filter)"> 
        {/* 
          Adjust rect positioning/size slightly if needed to account for filter effects 
          Using width/height 100% to fill the viewBox
          Using rx/ry for rounded corners based on viewBox proportions
        */}
        <rect 
          x="9" // Adjust based on viewBox if needed, relative to filter start
          y="6" // Adjust based on viewBox if needed, relative to filter start
          width="511" // Slightly less than viewBox width to account for filter blur/offset
          height="58" // Slightly less than viewBox height to account for filter blur/offset
          rx="12" // Keep original rounded corner value
          ry="12"
          fill="#ecf0f3" 
          stroke="rgba(205,222,233,0.66)" 
          strokeMiterlimit="10" 
          strokeWidth="1"
        />
      </g>
    </svg>
  );
};

export default BottomMenuBackground; 