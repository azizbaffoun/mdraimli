import React, { useRef, useEffect } from 'react';

// Import menu icons (adjust paths if needed and add social icon)
import articleIcon from '@/assets/icons/article icon.svg'; 
import videoIcon from '@/assets/icons/video icon.svg';
import podcastIcon from '@/assets/icons/podcast icon.svg';
import socialIcon from '@/assets/icons/social media icon.svg'; 

// Define ContentType here or import from a shared location
type ContentType = 'article' | 'video' | 'podcast' | 'socialMedia';

// Define props for the menu component
interface NodeAddMenuProps {
  parentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (parentId: string, childType: ContentType) => void;
  // Specify available options - respecting the new SVG order
  availableOptions: ContentType[];
  // Positioning relative to the plus button
  positionStyle: React.CSSProperties;
}

const NodeAddMenu: React.FC<NodeAddMenuProps> = ({
  parentId,
  isOpen,
  onClose,
  onSelectOption,
  availableOptions,
  positionStyle,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // Map content types to icons and labels in the desired SVG order
  const menuItems: Record<ContentType, { icon: string; label: string }> = {
    video: { icon: videoIcon, label: 'Video' },
    article: { icon: articleIcon, label: 'Article' },
    socialMedia: { icon: socialIcon, label: 'Social Post' },
    podcast: { icon: podcastIcon, label: 'Podcast' },
  };

  // Define the desired order explicitly
  const orderedTypes: ContentType[] = ['video', 'article', 'socialMedia', 'podcast'];

  // Filter and order menu items based on availableOptions and desired order
  const itemsToShow = orderedTypes
    .filter(type => availableOptions.includes(type)) // Only show available options
    .map(type => ({ type, ...menuItems[type] }))
    .filter(item => item.icon && item.label); // Ensure item is valid

  const handleSelect = (type: ContentType) => {
    onSelectOption(parentId, type);
    onClose(); // Close menu after selection
  };

  return (
    <>
      <style>
        {`
          .node-add-menu::before {
            content: '';
            position: absolute;
            width: 18px; /* Adjusted size */
            height: 18px; /* Adjusted size */
            background-color: white;
            border-left: 1px solid #e4e9ee; /* Match SVG border */
            border-bottom: 1px solid #e4e9ee; /* Match SVG border */
            transform: translate(-50%, -50%) rotate(45deg);
            top: 50%; /* Centered vertically */
            left: 0px;
            z-index: -1;
          }
        `}
      </style>
      <div
        ref={menuRef}
        // Remove fixed height, let container resize based on content. Keep fixed width.
        className="node-add-menu absolute flex flex-col w-[145px] bg-white rounded-[10px] border border-[#e4e9ee] shadow-[0_2px_3px_rgba(0,0,0,0.07)] z-50"
        style={positionStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Remove flex-grow and justify-between, keep padding */}
        <ul className="py-2">
          {itemsToShow.map((item, index) => (
            <li key={item.type}>
              {/* Adjusted divider margin to match SVG x=27.139 */}
              {index > 0 && <div className="border-t border-[#ecf0f3] mx-[27px] my-1"></div>}
              <button
                /* Padding adjusted for consistency, text size from SVG */
                className="flex items-center w-full px-[29px] py-1 hover:bg-gray-100 rounded-md cursor-pointer transition-colors text-[15px] text-left"
                onClick={() => handleSelect(item.type)}
              >
                {/* Adjusted icon margin to match SVG spacing */}
                <img src={item.icon} alt="" className="w-[18px] h-[18px] mr-1.5 flex-shrink-0" />
                {/* Adjusted text color to match SVG */}
                <span className="text-[#222] whitespace-nowrap">{item.label}</span>
              </button>
            </li>
          ))}
          {itemsToShow.length === 0 && (
             /* Adjusted text size */
             <li className="p-2 text-[15px] text-gray-500">No options available</li>
          )}
        </ul>
      </div>
    </>
  );
};

export default NodeAddMenu; 