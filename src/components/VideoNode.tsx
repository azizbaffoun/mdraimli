import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';


import NodeAddMenu from './NodeAddMenu';
import PopupSelect from './PopupSelect';


import { ContentNodeData, ContentType, notifyNode } from '@/types/workflowTypes';

// Add back the interface definition
interface VideoNodeData extends ContentNodeData {
  onReplaceNode?: (nodeId: string, newType: ContentType) => void;
  isLocked?: boolean;
  isLastNode?: boolean;
}

// Remove connector config usage
// const connectors = nodeConnectors.video;

// Define the right connector shape inline (used in two places now)
const RightConnectorShape = (
  <svg width="17" height="25" viewBox="0 0 17 25">
    <path d="M0,0H4A12,12,0,0,1,16,12v0A12,12,0,0,1,4,24H0a0,0,0,0,1,0,0V0A0,0,0,0,1,0,0Z" transform="translate(0.5 0.5)" fill="#82ced1" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
  </svg>
);

// Define the plus icon shape inline
const PlusIconShape = (
  <g transform="translate(-3.3 0.7)"> 
    <path d="M15.613,12.657H7.829a.829.829,0,1,1,0-1.657h7.784a.829.829,0,1,1,0,1.657Z" transform="translate(0 -0.108)" fill="#fff"/>
    <path d="M11.829,16.442A.829.829,0,0,1,11,15.613V7.829a.829.829,0,1,1,1.657,0v7.784A.829.829,0,0,1,11.829,16.442Z" transform="translate(-0.108)" fill="#fff"/>
  </g>
);

const VideoNode: React.FC<NodeProps<VideoNodeData>> = ({ id, data, selected }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [replaceMenuOpen, setReplaceMenuOpen] = useState(false);
  const popupAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    data.isNew && notifyNode('viralVids', id);
  }, []);

  const handleSettingsClick = () => {
    if (data.isLocked) return;
    setReplaceMenuOpen(true);
    notifyNode('viralVids', id);
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

  const animationClass = data.isEntering ? 'node-bouncing-in' : ''; // Use bouncing animation

  // Handle click on the plus button - now toggles menu

  // This function is passed directly to NodeAddMenu
  const handleSelectOption = (parentId: string, type: ContentType) => {
    if (data.isLocked) return;
    if (data.onAddChildNode) {
      data.onAddChildNode(parentId, type); 
      // No longer need to manage internal state: setShowPlusButton(false); 
    }
    setMenuOpen(false);
  };

  // Define options available from Video node - Show all
  const availableMenuOptions: ContentType[] = ['article', 'video', 'podcast', 'socialMedia'];

  const handleDeleteClick = () => {
    if (data.isLocked) return;
    console.log('Delete clicked');
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  return (
    <div className={`relative flex flex-col items-center ${animationClass}`}>
      {selected && !data.isLocked && (
        <div ref={popupAnchorRef}>
          <PopupSelect
            onSettingsClick={handleSettingsClick}
            onDeleteClick={handleDeleteClick}
            isTopicalKeywordNode={false}
            nodeId={id}
            onReplaceNode={handleReplaceNode}
            isReplaceMenuOpen={replaceMenuOpen}
            onCloseReplaceMenu={handleCloseReplaceMenu}
          />
        </div>
      )}
      <div
        className={`relative node-wrapper node-type-video w-32 h-32`}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          const isPlusZone = target.closest('[data-type="plus-zone"]');
          const isMenu = target.closest('[data-type="menu"]');

          if (isPlusZone || isMenu) {
            console.log(`[VideoNode ${id}] Preventing node selection - clicked ${isPlusZone ? 'plus zone' : 'menu'}`);
            e.stopPropagation();
            return;
          }
        }}
      >
        {/* Main SVG for Node Appearance */}
        <svg
          viewBox="0 0 116 116" // Adjusted viewBox based on glow rect size
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          className="w-full h-full absolute top-0 left-0" // Position SVG within wrapper
          // style={{ overflow: 'visible' }} // Allow connectors outside viewbox if needed
        >
          <defs>
            <linearGradient id="video-node-gradient" y1="0.365" x2="1" y2="0.058" gradientUnits="objectBoundingBox">
              <stop offset="0" stopColor="#3799db"/>
              <stop offset="1" stopColor="#2db4a6"/>
            </linearGradient>
          </defs>

          {/* Glow element - Initially hidden via CSS */}
          <rect 
            className="video-node-glow" 
            width="116" 
            height="116" 
            rx="40" 
            transform="translate(0 0)" // Positioned at top-left of SVG viewport
            stroke="rgba(0,0,0,0)" 
            strokeMiterlimit="10" 
            strokeWidth="1" 
            fill="url(#video-node-gradient)" 
          />

          {/* Main background shape */}
          <rect 
            id="Rectangle_1647" 
            data-name="Rectangle 1647" 
            width="110" 
            height="110" 
            rx="40" 
            transform="translate(3 3)" // Center relative to the 116x116 glow
            stroke="rgba(0,0,0,0)" 
            strokeMiterlimit="10" 
            strokeWidth="1" 
            fill="url(#video-node-gradient)"
          />
          
          {/* Central 'V' Icon - Adjust transform for centering */}
          <g id="Untitled-1" transform="translate(33 33)"> 
            <g id="Group_2583" data-name="Group 2583">
              <path id="Path_47" data-name="Path 47" d="M237.4,127.105a9.161,9.161,0,0,1,13.084,4.842,8.783,8.783,0,0,1-.135,6.756q-.507,1.216-13.827,28.015l-.068.113a9.278,9.278,0,0,1-3.4,3.851,9.22,9.22,0,0,1-13.129-3.716l-.113-.225q-13.309-26.788-13.85-28.037a9.187,9.187,0,0,1,12.949-11.6,9.1,9.1,0,0,1,3.356,3.175c.112.2,2.094,4.144,5.9,11.823l5.878-11.823a9.27,9.27,0,0,1,3.356-3.175Zm-16.237,28.736c-1.847.856-3.378.878-4.571.045q5.054,10.208,5.067,10.2h0a7.327,7.327,0,0,0,2.77,3.018,7.2,7.2,0,0,0,3.716,1.013,7.309,7.309,0,0,0,6.576-4.144q13.343-26.855,13.849-28.037a7.007,7.007,0,0,0,.113-5.315,6.933,6.933,0,0,0-3.581-3.986,7.28,7.28,0,0,0-9.391,2.657c-.112.18-2.612,5.247-7.544,15.2l-2.59,5.022A9.229,9.229,0,0,1,221.167,155.841Z" transform="translate(-205.238 -125.934)" fill="#fff" fillRule="evenodd"/>
            </g>
          </g>
        </svg>

        {/* Handles (Invisible interaction points) */}
        <Handle
          type="target"
          position={Position.Left}
          id="left-target"
          style={{ opacity: 0, width: 20, height: 20, left: '-16.5px', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 50 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right-source"
          style={{ opacity: 0, width: 20, height: 20, right: '-16.5px', top: '50%', transform: 'translate(50%, -50%)', zIndex: 10 }}
        />

        {/* Left Connector Visual */}
        <div 
          className={`video-node-connector-left absolute left-[-16.5px] top-1/2 transform -translate-y-1/2 pointer-events-none z-20 ${data.isLeftConnected ? 'is-connected' : ''}`}>
          <svg width="17" height="25" viewBox="0 0 17 25">
            <path d="M12,0h4a0,0,0,0,1,0,0V24a0,0,0,0,1,0,0H12A12,12,0,0,1,0,12v0A12,12,0,0,1,12,0Z" transform="translate(0.5 0.5)" fill="#86c1e9" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
          </svg>
        </div>

        {/* Right Side Elements - Only show if not locked or not last node */}
        {data.canAddChild && !data.isRightConnected && (!data.isLocked || !data.isLastNode) && (
          <>
            <div 
              className="video-node-connector-plus absolute right-[-16.5px] top-1/2 transform -translate-y-1/2 cursor-pointer group z-30 hover:scale-110 transition-transform"
              onClick={(e) => {
                console.log(`[VideoNode ${id}] Plus zone clicked`);
                if (data.isLocked) return;
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              data-type="plus-zone"
            >
              <svg width="17" height="25" viewBox="0 0 17 25">
                {RightConnectorShape}
                {PlusIconShape}
              </svg>
            </div>

            <NodeAddMenu
              parentId={id}
              isOpen={menuOpen}
              onClose={() => setMenuOpen(false)}
              onSelectOption={handleSelectOption}
              availableOptions={availableMenuOptions}
              positionStyle={{ left: 'calc(100% + 32px)', top: '50%', transform: 'translateY(-50%)' }}
            />
          </>
        )}

        {/* Right connector - Only show if right connected or if not locked/not last node */}
        {(data.isRightConnected || (!data.isLocked || !data.isLastNode)) && (
          <div 
            className={`video-node-connector-right-connected absolute right-[-16.5px] top-1/2 transform -translate-y-1/2 pointer-events-none z-20`}
          >
            {RightConnectorShape}
          </div>
        )}
      </div>
      <div className="mt-[10px] text-sm text-black">Video</div>
    </div>
  );
};

export default VideoNode;