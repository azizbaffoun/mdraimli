import React, { useState, useRef, useEffect } from 'react';
// Add Handle and Position imports back
import { Handle, Position, NodeProps } from 'reactflow';

// Import required SVGs using path alias
import topicalKeywordSvg from '@/assets/nodes/topical keyword.svg';
import plusButtonSvg from '@/assets/component to link the nodes/plusbutton.svg';
// Import connector SVGs
// Remove left connector import as it doesn't exist for this node
// import leftTopicalKeywordSvg from '@/assets/component to link the nodes/left topical keyword.svg';
import rightTopicalKeywordSvg from '@/assets/component to link the nodes/right topical keyword.svg';
// Import menu icons
import articleIcon from '@/assets/icons/article icon.svg'; 
import videoIcon from '@/assets/icons/video icon.svg';
import podcastIcon from '@/assets/icons/podcast icon.svg';

// Update node data interface (onAddChildNode expects only childType now)
interface TopicalKeywordNodeData {
  onAddChildNode: (childType: ContentType) => void; 
  isEntering?: boolean; 
}

// Define ContentType locally if not imported
type ContentType = 'article' | 'video' | 'podcast';

const TopicalKeywordNode: React.FC<NodeProps<TopicalKeywordNodeData>> = ({ data, id }) => {
  const nodeColor = '#3799DB'; // Keep color if needed elsewhere, otherwise remove
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showPlusButton, setShowPlusButton] = useState(true);

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleSelectOption = (type: string) => {
    // Prevent creating Social Media directly from Topical Keyword
    if (type === 'socialMedia') {
      console.log("Social Media node cannot be created directly from Topical Keyword.");
      setMenuOpen(false);
      return;
    }
    if (data.onAddChildNode) {
      data.onAddChildNode(type as ContentType); 
      setShowPlusButton(false); 
    }
    setMenuOpen(false);
  };

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
  
  const animationClass = data.isEntering ? 'node-bouncing-in' : ''; 

  return (
    <div 
      className={`relative flex flex-col items-center ${animationClass}`} // Keep outer relative positioning
    >
      {/* Node Body Visual - Apply wrapper and style here */} 
      <div 
        className={`relative node-wrapper node-type-topicalKeyword`}
        style={{ '--node-color': nodeColor } as React.CSSProperties} 
        onMouseDown={(e) => e.stopPropagation()} // Prevent drag interfering with clicks
      >
        {/* Use the imported Icon Component */}
        <img src={topicalKeywordSvg} alt="Topical Keyword" className="w-32 h-32" />

        {/* Add invisible source handle at connector center */}
        <Handle
          type="source"
          position={Position.Right} 
          id="right-source" 
          style={{ 
            opacity: 0, // Make invisible again
            width: 20,   
            height: 20,  
            right: '-16.5px', 
            top: '50%', 
            transform: 'translate(50%, -50%)',
            zIndex: 10, // Lower z-index to be BEHIND the plus button
            // cursor: 'crosshair' // REMOVE this or set to 'default'
          }} 
        />

        {/* Static Right Connector (Visual Only) */}
        <div className="absolute right-[-16.5px] top-1/2 transform -translate-y-1/2 pointer-events-none z-0">
            <img src={rightTopicalKeywordSvg} alt="" className="h-5 w-5" /> { /* Adjust size if needed */}
        </div>

        {/* Conditionally render Plus Button and Menu */}
        {showPlusButton && (
          <>
            {/* Plus Button - Revert to previous correct position */}
            <div 
                className="absolute right-[-26px] top-1/2 transform -translate-y-2/4 cursor-pointer group z-20"
                onClick={handlePlusClick}
                title="Add content"
            >
                <img src={plusButtonSvg} alt="Add" className="h-8 w-8 hover:scale-110 transition-transform" /> 
            </div>

            {/* Dropdown Menu (Position is relative to button/node edge, should be okay) */}
            {menuOpen && (
              <div 
                ref={menuRef}
                className="absolute left-[calc(100%+24px)] top-1/2 -translate-y-1/2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50"
              >
                <ul className="space-y-1">
                  {/* Article Option */}
                  <li 
                    className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors text-sm"
                    onClick={() => handleSelectOption('article')}
                  >
                    <img src={articleIcon} alt="" className="w-5 h-5 mr-3" />
                    <span className="text-black">Article</span>
                  </li>
                  {/* Video Option */}
                  <li 
                    className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors text-sm"
                    onClick={() => handleSelectOption('video')}
                  >
                    <img src={videoIcon} alt="" className="w-5 h-5 mr-3" />
                    <span className="text-black">Video</span>
                  </li>
                  {/* Podcast Option */}
                  <li 
                    className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors text-sm"
                    onClick={() => handleSelectOption('podcast')}
                  >
                    <img src={podcastIcon} alt="" className="w-5 h-5 mr-3" />
                    <span className="text-black">Podcast</span>
                  </li>
                </ul>
              </div>
            )}
          </>
        )}
      </div> 

      {/* Label */}
      <div className="mt-2 text-sm text-black">
        Topical Keyword
      </div>
    </div>
  );
};

export default TopicalKeywordNode; 