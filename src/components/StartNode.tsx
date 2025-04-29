import React, { useState, useRef, useEffect } from 'react';
import { NodeProps } from 'reactflow';
import StartMenu from './StartMenu';


// Data interface for this node type
interface StartNodeData {
  // Callback to trigger replacement with TopicalKeywordNode
  // We'll pass the node's position from the editor later
  onInitiateWorkflow: (type: string) => void;
  isExiting?: boolean;
}

const StartNode: React.FC<NodeProps<StartNodeData>> = ({ data }) => {
  const nodeColor = '#3799DB';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false); // State for hover effect

  // Handler for the plus button itself
  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  // Handler for selecting an option from the menu
  const handleSelectOption = (type: string) => {
    if (data.onInitiateWorkflow) {
      data.onInitiateWorkflow(type);
    }
    setMenuOpen(false);
  };

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setIsHovered(false);
      }
    };
    if (menuOpen) { // Only listen when menu is open
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]); // Dependency on menuOpen

  // Animation class (will be uncommented later)
  const animationClass = data.isExiting ? 'node-fade-scale-out' : '';

  return (
    <div
      className={`relative flex flex-col items-center ${animationClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Base SVG structure (init state) */}
      <div className="relative w-[190px] overflow-visible">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 165.5 141.017" className="w-full h-auto transition-all duration-200 ease-in-out">
          <g transform="translate(-680 -313)">
            {/* Hover overlays */}
            {(isHovered || menuOpen) && (
              <>
                {/* Plus Button Group */}
                <g id="Group_3855" data-name="Group 3855" transform="translate(411.54 -16)" onClick={handlePlusClick} style={{ cursor: 'pointer', outline: 'none' }} tabIndex={0} role="button" aria-label="Add" className="outline-none">
                  <path id="Rectangle_1636" data-name="Rectangle 1636" d="M0,0H4A12,12,0,0,1,16,12v0A12,12,0,0,1,4,24H0a0,0,0,0,1,0,0V0A0,0,0,0,1,0,0Z" transform="translate(384.46 372)" fill="#86c1e9" stroke="none"/>
                  <g id="add-circle" transform="translate(380.741 372.281)">
                    <path id="Path_687" data-name="Path 687" d="M15.609,12.656H7.828a.828.828,0,0,1,0-1.656h7.781a.828.828,0,0,1,0,1.656Z" transform="translate(0 -0.11)" fill="#fff"/>
                    <path id="Path_688" data-name="Path 688" d="M11.828,16.437A.828.828,0,0,1,11,15.609V7.828a.828.828,0,1,1,1.656,0v7.781A.828.828,0,0,1,11.828,16.437Z" transform="translate(-0.11)" fill="#fff"/>
                  </g>
                </g>
              </>
            )}
            {/* Base elements */}
            <rect id="Rectangle_1635" data-name="Rectangle 1635" width="110" height="110" rx="40" transform="translate(683 316)" fill="#3799db" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1" />
            <text id="Start" transform="translate(719.001 450.017)" fill="#3799db" fontSize="16" fontFamily="SegoeUI, Segoe UI"><tspan x="0" y="0">Start</tspan></text>
            <path id="si_play-fill" d="M7.475,3.779,35.641,19.625a1.661,1.661,0,0,1,0,2.894L7.475,38.364A1.661,1.661,0,0,1,5,36.915V5.228A1.664,1.664,0,0,1,7.475,3.779Z" transform="translate(719.999 350.432)" fill="#fff" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1" />
          </g>
        </svg>
      </div>
      {/* StartMenu appears when plus is clicked */}
      <StartMenu
        isOpen={menuOpen && !data.isExiting}
        onSelect={(type: 'topicalKeyword' | 'offer' | 'event') => handleSelectOption(type)}
        onClose={() => setMenuOpen(false)}
        className="absolute left-[75%] top-[40%] -translate-y-1/2 z-50"
      />
      {/* Base SVG structure ends */}
    </div>
  );
};

export default StartNode; 