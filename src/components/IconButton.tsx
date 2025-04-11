import React, { useState } from 'react';

interface IconButtonProps {
  iconSrc: string;
  altText: string;
  onClick?: () => void;
  title?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ iconSrc, altText, onClick, title }) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = "relative w-[39px] h-[40px] flex items-center justify-center cursor-pointer group focus:outline-none";
  const filterId = `rect_filter_${altText.replace(/\s+/g, '_')}`;
  const gradientId = `button_gradient_${altText.replace(/\s+/g, '_')}`;

  // Determine if the button should show the active gradient state based ONLY on hover
  const showActiveState = isHovered;

  return (
    <div 
      className={`${baseClasses}`}
      onClick={onClick} 
      role="button"
      tabIndex={0} 
      onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* SVG Background */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 39 40" 
        className="absolute inset-0 w-full h-full overflow-visible" // Allow filter to spread
        preserveAspectRatio="none"
      >
        <defs>
          {/* Gradient Definition */}
          <linearGradient id={gradientId} y1="0.365" x2="1" y2="0.058" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor="#3799db"/>
            <stop offset="1" stopColor="#2db4a6"/>
          </linearGradient>
          {/* Filter Definition */}
          <filter id={filterId} x="-5%" y="-5%" width="110%" height="110%" filterUnits="userSpaceOnUse">
            <feOffset dy="1" in="SourceAlpha"/>
            <feGaussianBlur result="blur" stdDeviation="1"/> {/* Adjusted blur slightly */}
            <feFlood floodOpacity="0.059"/>
            <feComposite operator="in" in2="blur"/>
            <feComposite in="SourceGraphic"/>
          </filter>
        </defs>
        {/* Apply filter to the group */}
        <g filter={`url(#${filterId})`}>
          <rect 
            x="0.5" 
            y="0.5"
            width="38" 
            height="38" 
            rx="12" 
            // Apply fill and stroke directly based on state
            fill={showActiveState ? `url(#${gradientId})` : '#fff'}
            stroke={showActiveState ? 'transparent' : '#ccd6df'}
            // Add class for transition if desired (might not work well with SVG fill)
            className="transition-colors duration-150 ease-in-out" 
            strokeMiterlimit="10" 
            strokeWidth="1"
          />
        </g>
      </svg>
      
      {/* Foreground Icon */}
      <img 
        src={iconSrc} 
        alt={altText} 
        // Apply white icon style based on the same state
        className={`relative z-10 h-5 w-5 transition-all duration-150 ease-in-out ${showActiveState ? 'scale-110 brightness-0 invert' : ''}`}
      />

      {/* Custom Tooltip - visibility tied ONLY to hover state */}
      {title && (
         <div className={`absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap 
                         px-3 py-2 text-white text-sm rounded-lg shadow-md 
                         bg-gradient-to-r from-[#3799db] to-[#2db4a6] 
                         transition-opacity duration-200 pointer-events-none z-50 
                         ${isHovered ? 'opacity-100' : 'opacity-0'} /* Only use isHovered */
                         after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 
                         after:border-8 after:border-transparent after:border-t-[#2db4a6]`}>
            {title}
         </div>
      )}
    </div>
  );
};

export default IconButton; 