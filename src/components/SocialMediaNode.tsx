import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import PopupSelect from './PopupSelect';
import { ContentType, ContentNodeData } from '../types/workflowTypes';
import SocialMediaNodeTimer from './SocialMediaNodeTimer';

// Remove SVG imports
// import socialMediaSvg from '@/assets/nodes/social media.svg';
// import leftSocialMediaSvg from '@/assets/component to link the nodes/left social media.svg';

// Define expected data structure (Add isLeftConnected)
interface SocialMediaNodeData extends ContentNodeData {
  nodeType: ContentType;
  setOpenMenu?: React.Dispatch<React.SetStateAction<{ type: 'add' | 'popselect'; nodeId: string; } | null>>;
  label?: string;
  isEntering?: boolean;
  isNew?: boolean;
  onAddChildNode?: (parentId: string, childType: ContentType) => void;
  canAddChild?: boolean;
  isLeftConnected?: boolean;
  isRightConnected?: boolean;
  onDelete?: (nodeId: string) => void;
  onReplaceNode?: (nodeId: string, newType: ContentType) => void;
  isLocked?: boolean;
  isLastNode?: boolean;
  badgeNumber?: number;
  timeString?: string;
  showNavigation?: boolean;
}

// Node component
import { notifyNode } from '@/types/workflowTypes';
import NavigationMenu from './NavigationMenu/NavigationMenu';

const SocialMediaNode: React.FC<NodeProps<SocialMediaNodeData>> = ({ id, data, selected }) => {
  const animationClass = data.isEntering ? 'node-bouncing-in' : '';
  const nodeColor = '#4A5568'; // Social media node color
  const [replaceMenuOpen, setReplaceMenuOpen] = useState(false);
  const popupAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    data.isNew && notifyNode('socialMedia', id);
  }, []);

  const handleDeleteClick = () => {
    if (data.isLocked) return;
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const handleSettingsClick = () => {
    if (data.isLocked) return;
    setReplaceMenuOpen(true);
    notifyNode('socialMedia', id);
  };

  const handleReplaceNode = (nodeId: string, newType: ContentType) => {
    if (data.isLocked) return;
    if (data.onReplaceNode) {
      data.onReplaceNode(nodeId, newType);
    }
    setReplaceMenuOpen(false);
  };

  const handleCloseReplaceMenu = () => {
    setReplaceMenuOpen(false);
  };

  return (
    <div
      className={`relative ${animationClass}`}
    >
      {data.showNavigation && data.isSelected && (
        <NavigationMenu nodeId={id} isOpen={data.isSelected} />
      )}
      {/* Only show PopupSelect if not locked */}
      {selected && !data.isLocked && !data.showNavigation && (
        <div ref={popupAnchorRef}>
          <PopupSelect
            onSettingsClick={handleSettingsClick}
            onDeleteClick={handleDeleteClick}
            nodeId={id}
            onReplaceNode={handleReplaceNode}
            isReplaceMenuOpen={replaceMenuOpen}
            onCloseReplaceMenu={handleCloseReplaceMenu}
            setOpenMenu={data.setOpenMenu}
          />
        </div>
      )}
      <div
        className={`relative node-wrapper group node-type-${data.nodeType || 'socialMedia'} w-[126px] h-[126px] transition-transform duration-200 ${selected ? 'selected' : ''} ${data.isRightConnected ? 'is-connected' : ''}`}
        onMouseEnter={() => !data.isLocked && console.log(`[${id}] Mouse ENTER node wrapper`)}
        onMouseLeave={() => !data.isLocked && console.log(`[${id}] Mouse LEAVE node wrapper`)}
        style={{ '--node-color': nodeColor } as React.CSSProperties}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Inline SVG for Main Appearance */}
        <svg
          viewBox="0 0 116 116" // Use slightly larger viewbox for glow
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          className="w-full h-full absolute top-0 left-0"
        >
          <defs>
            <linearGradient id="social-media-node-gradient" x1="1.479" y1="1.12" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0" stopColor="#ffbb70" />
              <stop offset="1" stopColor="#fc8500" />
            </linearGradient>
          </defs>
          {/* Glow element */}
          <rect
            className="socialMedia-node-glow"
            width="116" height="116" rx="40"
            transform="translate(0 0)"
            fill="url(#social-media-node-gradient)"
            stroke="rgba(0,0,0,0)" strokeWidth="1"
          />
          {/* Main background shape (extracted from user SVG Rectangle_1648) */}
          <rect
            width="110" height="110" rx="40"
            transform="translate(3 3)" // Centered in 116x116 glow
            fill="url(#social-media-node-gradient)"
            stroke="rgba(0,0,0,0)" strokeWidth="1"
          />
          {/* Icon (extracted from user SVG Path_724) - Correctly Centered */}
          <g transform="translate(41 95)">
            <path d="M6.408-17.183a20.124,20.124,0,0,1-5.153-2.381l-6.11,1.154,1.119-5.725A20.31,20.31,0,0,1-5.53-26.864a20.167,20.167,0,0,1-1.34-3.012A20.179,20.179,0,0,1-8-36.558c0-.663.032-1.331.1-1.987s.158-1.3.283-1.932.278-1.256.461-1.868.392-1.21.629-1.8A20.215,20.215,0,0,1-4.8-47.478a20.357,20.357,0,0,1,2.3-2.938,20.385,20.385,0,0,1,2.79-2.467A20.269,20.269,0,0,1,3.5-54.807a20.131,20.131,0,0,1,3.564-1.309c.62-.163,1.257-.3,1.891-.4s1.3-.179,1.952-.221A20.857,20.857,0,0,0-1.421-37.533,20.6,20.6,0,0,0,16.565-16.8a20.275,20.275,0,0,1-2.137.348,20.535,20.535,0,0,1-2.205.119A20.242,20.242,0,0,1,6.408-17.183Zm13.3-.474a20.276,20.276,0,0,1-2.008-.306c-.652-.133-1.3-.3-1.938-.5s-1.252-.424-1.858-.68a20.221,20.221,0,0,1-3.435-1.865,20.367,20.367,0,0,1-2.993-2.469,20.364,20.364,0,0,1-2.469-2.993A20.224,20.224,0,0,1,3.14-29.9c-.256-.606-.485-1.231-.68-1.858s-.365-1.287-.5-1.938a20.276,20.276,0,0,1-.306-2.008,20.558,20.558,0,0,1-.1-2.068,20.557,20.557,0,0,1,.1-2.068,20.279,20.279,0,0,1,.306-2.008c.133-.652.3-1.3.5-1.938s.424-1.252.68-1.858a20.224,20.224,0,0,1,1.865-3.435,20.365,20.365,0,0,1,2.469-2.993,20.365,20.365,0,0,1,2.993-2.469A20.222,20.222,0,0,1,13.9-56.41c.606-.256,1.231-.485,1.858-.68s1.287-.365,1.938-.5a20.283,20.283,0,0,1,2.008-.306,20.558,20.558,0,0,1,2.068-.1,20.559,20.559,0,0,1,2.068.1,20.284,20.284,0,0,1,2.008.306c.652.133,1.3.3,1.938.5s1.253.424,1.858.68a20.222,20.222,0,0,1,3.435,1.865,20.365,20.365,0,0,1,2.993,2.469,20.365,20.365,0,0,1,2.469,2.993,20.224,20.224,0,0,1,1.865,3.435c.256.606.485,1.231.68,1.858s.365,1.287.5,1.938a20.277,20.277,0,0,1,.306,2.008,20.557,20.557,0,0,1,.1,2.068,20.208,20.208,0,0,1-.993,6.277,20.135,20.135,0,0,1-2.769,5.474l2.128,7.859L32.1-20.382a20.119,20.119,0,0,1-4.88,2.089,20.268,20.268,0,0,1-5.442.741A20.547,20.547,0,0,1,19.707-17.657ZM19.38-27.13h0l.086.018,2.254,4.645L23.994-27.1l.076-.016,4.04,3.284.1-5.12.125-.091,4.874,1.408-1.9-4.727.072-.125,5.074-.7-3.7-3.59,0-.034,4.39-2.756-4.865-1.76,0-.009-.011-.033,2.9-4.32-5.182.372-.05-.055.891-5.12-4.584,2.449-.014-.006h0l-.006,0-1.263-5.02L21.789-49h-.077l-3.174-4.045-1.23,4.975-.087.039-4.526-2.418.881,5.062-.1.108-5.125-.368,2.878,4.286v0l-.01.03L6.376-39.572l4.371,2.745.006.055v.008L7.019-33.143l5.138.712.045.077-1.935,4.819,4.987-1.44.191,5.159L19.38-27.13ZM13-37.752A8.757,8.757,0,0,1,21.75-46.5,8.757,8.757,0,0,1,30.5-37.752,8.757,8.757,0,0,1,21.75-29,8.757,8.757,0,0,1,13-37.752Zm2.875,0A5.879,5.879,0,0,0,21.75-31.88a5.879,5.879,0,0,0,5.872-5.872,5.879,5.879,0,0,0-5.872-5.872A5.879,5.879,0,0,0,15.878-37.752Z"
              fill="#fff" stroke="rgba(0,0,0,0)" strokeWidth="1"
            />
          </g>
        </svg>

        {/* Invisible Target Handle ONLY */}
        <Handle
          type="target"
          position={Position.Left}
          id="left-target"
          style={{ opacity: 0, width: 20, height: 20, left: '-16.5px', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 50 }}
        />

        {/* Visible Left Connector ONLY - Conditionally Rendered */}
        <div
          className={`socialMedia-node-connector-left absolute left-[-16.5px] top-[50%] transform -translate-y-1/2 pointer-events-none z-20 ${data.isLeftConnected ? 'is-connected' : ''}`}
        >
          <svg width="17" height="25" viewBox="0 0 17 25">
            {/* Use path from user SVG Rectangle_1649 */}
            <path d="M12,0h4a0,0,0,0,1,0,0V24a0,0,0,0,1,0,0H12A12,12,0,0,1,0,12v0A12,12,0,0,1,12,0Z" transform="translate(0.5 0.5)" fill="#ffbd66" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1" />
          </svg>
        </div>

      </div>
      <div className="absolute w-full text-center" style={{ top: 'calc(100% + 10px)' }}>
        <SocialMediaNodeTimer
          badgeNumber={data.badgeNumber}
          delayValue={data.delayValue}
          color="#fc8500"
          nodeName="Social Post"
        />
      </div>
    </div>
  );
};

export default SocialMediaNode;