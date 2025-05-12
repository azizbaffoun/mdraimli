import React from 'react';

// Import utility icons
import saveIcon from '@/assets/icons/save_icon.svg';
import pasteIcon from '@/assets/icons/paste_icon.svg';
import alignIcon from '@/assets/icons/align_icon.svg';
import undoIcon from '@/assets/icons/undo_icon.svg';
import redoIcon from '@/assets/icons/redo_icon.svg';
// Import creation icons
import articleIcon from '@/assets/icons/article icon.svg';
import videoIcon from '@/assets/icons/video icon.svg';
import podcastIcon from '@/assets/icons/podcast icon.svg';
import socialMediaIcon from '@/assets/icons/social media icon.svg';

// Import other necessary components/icons
import toolsIcon from '@/assets/icons/tools.svg'; 
import BottomMenuBackground from './BottomMenuBackground';
import IconButton from './IconButton';
// Import ContentType from the shared types file
import { ContentType } from '@/types/workflowTypes';

interface ItemsBarProps {
  isVisible: boolean;
  isNodeSelected: boolean;
  selectedNodeId: string | null;
  onIconClick: (parentId: string, childType: ContentType | "next") => void;
  onSave?: () => void;
  onAddNote?: () => void;
  onOrganizeLayout?: () => void;
  onUndo?: () => void;
 onRedo?: () => void;
}

// Define Separator component for reuse
const Separator = () => (
  <div className="w-px h-6 bg-[#ccd6df] mx-1" />
);

const ItemsBar: React.FC<ItemsBarProps> = ({
  isVisible,
  selectedNodeId,
  onIconClick,
  onSave, 
  onAddNote,
  onOrganizeLayout,
  onUndo,
 onRedo
}) => {
  // Define the utility icons and their labels/actions
  const utilityItems = [
    { icon: saveIcon, label: 'Save', action: onSave },
    { icon: pasteIcon, label: 'Add Note', action: onAddNote },
    { icon: alignIcon, label: 'Align Layout', action: onOrganizeLayout },
    { icon: undoIcon, label: 'Undo', action: onUndo },
    { icon: redoIcon, label: 'Redo', action: onRedo },
  ];

  // Define the creation icons and their labels/types
  const creationItems = [
    { icon: articleIcon, label: 'Article', type: 'article' as ContentType },
    { icon: videoIcon, label: 'Video', type: 'video' as ContentType },
    { icon: podcastIcon, label: 'Podcast', type: 'podcast' as ContentType },
    { icon: socialMediaIcon, label: 'Social Media', type: 'socialMedia' as ContentType },
  ];

  const handleCreationIconClick = (type: ContentType) => {
    if (selectedNodeId) {
      onIconClick(selectedNodeId, type);
    }
  };

  // Base classes for the main bar container
  const baseClasses = "absolute bottom-12 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-in-out z-30";
  // Classes for visibility
  const visibilityClasses = isVisible ? "opacity-100 scale-95" : "opacity-0 scale-95 pointer-events-none";

  return (
    <div className={`${baseClasses} ${visibilityClasses}`}>
      <div className="relative flex items-center justify-center p-2">
        <BottomMenuBackground />
        
        <div className="relative z-10 flex items-center space-x-2 pr-2">
          {/* Tools Icon and Text */}
          <div className="flex items-center pl-[16px] pt-[17px] pb-[18px] mr-0">
            <img src={toolsIcon} alt="Tools" className="h-[23px]" />
          </div>

          <div className="ml-[21px]"><Separator /></div>

          {/* Utility Buttons */}
          {utilityItems.map((item) => (
            <IconButton
              key={item.label}
              iconSrc={item.icon}
              altText={item.label}
              onClick={item.action}
              title={item.label}
            />
          ))}

          <Separator />

          {/* Creation Buttons */}
          {creationItems.map((item) => (
            <IconButton
              key={item.type}
              iconSrc={item.icon}
              altText={item.label}
              onClick={() => handleCreationIconClick(item.type)}
              title={`Add ${item.label} Node`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemsBar; 