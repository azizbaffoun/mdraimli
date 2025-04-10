import React from 'react';

// Import icons
import articleIcon from '@/assets/icons/article icon.svg';
import videoIcon from '@/assets/icons/video icon.svg';
import podcastIcon from '@/assets/icons/podcast icon.svg';
import socialMediaIcon from '@/assets/icons/social media icon.svg'; // Assuming this is the filename
import organizeIcon from '@/assets/icons/organize_icon.svg'; // TODO: Add an appropriate icon

// Define ContentType for mapping
import { ContentType } from './WorkflowEditor'; // Assuming type is exported there

interface ItemsBarProps {
  isVisible: boolean;
  isNodeSelected: boolean;
  selectedNodeId: string | null;
  onIconClick: (parentId: string, childType: ContentType) => void;
  onOrganizeLayout: () => void; // Add callback for organizing
}

const ItemsBar: React.FC<ItemsBarProps> = ({ isVisible, isNodeSelected, selectedNodeId, onIconClick, onOrganizeLayout }) => {

  // Define the icons and their labels/types
  const creationItems = [
    { icon: articleIcon, label: 'Article', type: 'article' as ContentType },
    { icon: videoIcon, label: 'Video', type: 'video' as ContentType },
    { icon: podcastIcon, label: 'Podcast', type: 'podcast' as ContentType },
    { icon: socialMediaIcon, label: 'Social Media', type: 'socialMedia' as ContentType },
  ];

  const handleIconClick = (type: ContentType) => {
    if (selectedNodeId) {
      onIconClick(selectedNodeId, type);
    }
  };

  // Base classes for the bar container
  const baseClasses = "fixed bottom-6 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-in-out z-30";
  // Classes for visibility
  const visibilityClasses = isVisible ? "opacity-100 scale-95" : "opacity-0 scale-95 pointer-events-none";
  // Classes for selected state scaling
  const selectedClass = isNodeSelected ? 'scale-105' : '';

  return (
    <div className={`${baseClasses} ${visibilityClasses} ${selectedClass}`}>
      {/* Inner container with background and padding */}
      <div className="flex items-center space-x-4 bg-white p-3 rounded-lg shadow-lg border border-gray-300">
        {/* Creation Icons */}
        {creationItems.map((item, index) => (
          <div 
            key={index} 
            className="relative flex flex-col items-center cursor-pointer group w-16"
            onClick={() => handleIconClick(item.type)}
            title={`Add ${item.label} Node`}
          >
            {/* Wrap icon for border */}
            <div className="p-2 border border-gray-300 rounded-md">
              <img src={item.icon} alt={item.label} className="h-7 w-7 transition-transform duration-200 group-hover:scale-110" />
            </div>
            {/* Tooltip Label */}
            <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap 
                            bg-gray-700 text-white text-xs rounded px-2 py-1 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              {item.label}
            </span>
          </div>
        ))}

        {/* Divider */}
        <div className="h-8 border-l border-gray-300 mx-2"></div>

        {/* Organize Button */}
        <div 
          className="relative flex flex-col items-center cursor-pointer group w-16"
          onClick={onOrganizeLayout} // Call the organize function
          title="Organize Layout"
        >
          {/* Wrap icon for border */}
          <div className="p-2 border border-gray-300 rounded-md">
            <img src={organizeIcon} alt="Organize" className="h-7 w-7 transition-transform duration-200 group-hover:scale-110" />
          </div>
          {/* Tooltip Label */}
          <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap 
                          bg-gray-700 text-white text-xs rounded px-2 py-1 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Organize
          </span>
        </div>

      </div>
    </div>
  );
};

export default ItemsBar; 