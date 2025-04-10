import React, { useState, useRef, useEffect } from 'react';
import { NodeProps } from 'reactflow';

// Import SVGs needed for the *button* within the node later
import plusButtonSvg from '@/assets/component to link the nodes/plusbutton.svg';
import topicalKeywordIcon from '@/assets/icons/topical keyword icon.svg';
import offerIcon from '@/assets/icons/offer.svg';
import starIcon from '@/assets/icons/star.svg';

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
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Animation class (will be uncommented later)
  const animationClass = data.isExiting ? 'node-fade-scale-out' : '';

  return (
    <div className={`relative flex flex-col items-center ${animationClass}`}>
      {/* Main Visual - Inline SVG */}
      <div className="relative group transition-transform duration-200 ease-in-out hover:scale-105">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-32 h-32 transition-all duration-200 ease-in-out group-hover:drop-shadow-[0px_4px_8px_#3799DB]"
          viewBox="0 0 132.5 141.017"
        >
          <g transform="translate(-680 -313)">
            <rect 
              width="110" 
              height="110" 
              rx="40" 
              transform="translate(683 316)" 
              fill={nodeColor}
            />
            <path 
              d="M7.475,3.779,35.641,19.625a1.661,1.661,0,0,1,0,2.894L7.475,38.364A1.661,1.661,0,0,1,5,36.915V5.228A1.664,1.664,0,0,1,7.475,3.779Z" 
              transform="translate(719.999 350.432)" 
              fill="#fff"
            />
          </g>
        </svg>
        
        {/* Plus Button - Using imported SVG */}
        {!data.isExiting && (
          <div 
            className="absolute right-[-4px] top-1/2 transform -translate-y-2/3 cursor-pointer group 
            transition-transform duration-200 ease-in-out"
            onClick={handlePlusClick}
            title="Add starting element"
          >
             <img src={plusButtonSvg} alt="Add" className="h-8 w-8 hover:scale-110 transition-transform" /> 
          </div>
        )}

        {/* Dropdown Menu */}
        {menuOpen && !data.isExiting && (
          <div 
            ref={menuRef}
            className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50"
          >
            <ul className="space-y-1">
              {/* Topical Keyword Option */}
              <li 
                className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors text-sm"
                onClick={() => handleSelectOption('topical')}
              >
                <img src={topicalKeywordIcon} alt="" className="w-5 h-5 mr-3" />
                <span className="text-black">Topical Keyword</span>
              </li>
              {/* Offer Option */}
              <li 
                className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors text-sm"
                onClick={() => handleSelectOption('offer')}
              >
                <img src={offerIcon} alt="" className="w-5 h-5 mr-3" />
                <span className="text-black">Offer</span>
              </li>
              {/* Event Option */}
              <li 
                className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors text-sm"
                onClick={() => handleSelectOption('event')}
              >
                <img src={starIcon} alt="" className="w-5 h-5 mr-3" />
                <span className="text-black">Event</span>
              </li>
            </ul>
          </div>
        )}
      </div> 

      {/* Label */}
      <div className="mt-2 text-sm text-black">
        Start
      </div>

      {/* No Handles needed for this initial node */}
    </div>
  );
};

export default StartNode; 