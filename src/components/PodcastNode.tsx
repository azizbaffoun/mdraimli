import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// Import necessary types from the types file
import { ContentNodeData, ContentType } from '@/types/workflowTypes';

// Keep plus button, remove others
// import podcastSvg from '@/assets/nodes/podcast.svg';
// import leftPodcastSvg from '@/assets/component to link the nodes/left podcast.svg';
// import rightTopicalKeywordSvg from '@/assets/component to link the nodes/right topical keyword.svg';
// import plusButtonSvg from '@/assets/component to link the nodes/plusbutton.svg';

import NodeAddMenu from './NodeAddMenu';
import PopupSelect from './PopupSelect';

// Use the specific interface by extending the imported base type
interface PodcastNodeData extends ContentNodeData {}

const PodcastNode: React.FC<NodeProps<PodcastNodeData>> = ({ id, data, selected, xPos, yPos }) => {
  const animationClass = data.isEntering ? 'node-bouncing-in' : '';
  const [menuOpen, setMenuOpen] = useState(false);

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleSelectOption = (parentId: string, type: ContentType) => {
    if (data.onAddChildNode) {
      data.onAddChildNode(parentId, type);
    }
    setMenuOpen(false);
  };

  const availableMenuOptions: ContentType[] = ['article', 'video', 'podcast', 'socialMedia'];

  // Define the right connector shape inline (used in two places now)
  const RightConnectorShape = (
    <path d="M0,0H4A12,12,0,0,1,16,12v0A12,12,0,0,1,4,24H0a0,0,0,0,1,0,0V0A0,0,0,0,1,0,0Z" transform="translate(0.5 0.5)" fill="#b99bd6" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
  );
  // Define the plus icon shape inline
  const PlusIconShape = (
    <g transform="translate(-3.3 0.7)"> 
        <path d="M15.613,12.657H7.829a.829.829,0,1,1,0-1.657h7.784a.829.829,0,1,1,0,1.657Z" transform="translate(0 -0.108)" fill="#fff"/>
        <path d="M11.829,16.442A.829.829,0,0,1,11,15.613V7.829a.829.829,0,1,1,1.657,0v7.784A.829.829,0,0,1,11.829,16.442Z" transform="translate(-0.108)" fill="#fff"/>
    </g>
  );

  const handleDocumentClick = () => {
    console.log('Document clicked');
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
  };

  const handleDeleteClick = () => {
    console.log('Delete clicked');
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  return (
    <div className={`relative flex flex-col items-center ${animationClass}`}>
      {selected && (
        <PopupSelect
          onDocumentClick={handleDocumentClick}
          onSettingsClick={handleSettingsClick}
          onDeleteClick={handleDeleteClick}
          notificationCount={9}
        />
      )}
      <div
        className={`relative node-wrapper node-type-podcast w-32 h-32`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Main SVG for Node Appearance */}
        <svg
          viewBox="0 0 116 116" // Use a slightly larger viewBox for glow
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          className="w-full h-full absolute top-0 left-0"
        >
          <defs>
             {/* Use podcast gradient from its SVG */}
            <linearGradient id="podcast-node-gradient" x1="1.336" y1="0.912" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0" stopColor="#b388de"/>
              <stop offset="1" stopColor="#8b5abc"/>
            </linearGradient>
          </defs>

          {/* Glow element */}
          <rect 
            className="podcast-node-glow" 
            width="116" height="116" rx="40" 
            transform="translate(0 0)" 
            fill="url(#podcast-node-gradient)" 
            stroke="rgba(0,0,0,0)"
            strokeWidth="1"
          />

          {/* Main background shape */}
          <rect 
            width="110.008" height="110" rx="40" 
            transform="translate(3 3)" // Centered within 116x116
            fill="url(#podcast-node-gradient)"
            stroke="rgba(0,0,0,0)"
            strokeWidth="1"
          />
          
          {/* Podcast Icon - Extracted from podcast.svg */}
          <g id="voice-cricle" transform="translate(33.004 33)">
            <path d="M6.994,22.576A1.744,1.744,0,0,1,5.25,20.832V10.854a1.744,1.744,0,0,1,3.489,0v9.978A1.744,1.744,0,0,1,6.994,22.576Z" transform="translate(4.053 9.17)" fill="#fff"/>
            <path d="M9.994,27.774A1.744,1.744,0,0,1,8.25,26.03V9.424a1.744,1.744,0,1,1,3.489,0V26.03A1.744,1.744,0,0,1,9.994,27.774Z" transform="translate(8.03 7.274)" fill="#fff"/>
            <path d="M12.994,33a1.744,1.744,0,0,1-1.744-1.744V7.994a1.744,1.744,0,1,1,3.489,0V31.252A1.744,1.744,0,0,1,12.994,33Z" transform="translate(12.007 5.379)" fill="#fff"/>
            <path d="M15.994,27.774A1.744,1.744,0,0,1,14.25,26.03V9.424a1.744,1.744,0,1,1,3.489,0V26.03A1.744,1.744,0,0,1,15.994,27.774Z" transform="translate(15.985 7.274)" fill="#fff"/>
            <path d="M18.994,22.576a1.744,1.744,0,0,1-1.744-1.744V10.854a1.744,1.744,0,0,1,3.489,0v9.978A1.744,1.744,0,0,1,18.994,22.576Z" transform="translate(19.962 9.17)" fill="#fff"/>
            <path d="M26.252,51.254A25,25,0,0,1,8.573,8.573,25,25,0,1,1,43.931,43.931,24.838,24.838,0,0,1,26.252,51.254Zm0-46.515A21.513,21.513,0,1,0,47.765,26.252,21.538,21.538,0,0,0,26.252,4.739Z" transform="translate(-1.25 -1.25)" fill="#fff"/>
          </g>
        </svg>

        {/* Handles */}
        <Handle type="target" position={Position.Left} id="left-target" style={{ opacity: 0, width: 20, height: 20, left: '-16.5px', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 50 }} />
        <Handle type="source" position={Position.Right} id="right-source" style={{ opacity: 0, width: 20, height: 20, right: '-16.5px', top: '50%', transform: 'translate(50%, -50%)', zIndex: 10 }} />

        {/* Left Connector Visual */}
        <div 
          className={`podcast-node-connector-left absolute left-[-16.5px] top-1/2 transform -translate-y-1/2 pointer-events-none z-20 ${data.isLeftConnected ? 'is-connected' : ''}`}>
            <svg width="17" height="25" viewBox="0 0 17 25">
              <path d="M12,0h4a0,0,0,0,1,0,0V24a0,0,0,0,1,0,0H12A12,12,0,0,1,0,12v0A12,12,0,0,1,12,0Z" transform="translate(0.5 0.5)" fill="#b99bd6" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
            </svg>
        </div>

        {/* Render Combined Connector/Plus Button ONLY if canAddChild is true AND NOT connected */}
        {data.canAddChild && !data.isRightConnected && (
          <>
            <div 
              className="podcast-node-connector-plus absolute right-[-16.5px] top-1/2 transform -translate-y-1/2 cursor-pointer group z-30 hover:scale-110 transition-transform"
              onClick={handlePlusClick}
              title="Add content"
            >
              <svg width="17" height="25" viewBox="0 0 17 25" >
                 {RightConnectorShape} { /* Use defined shape */ }
                 {PlusIconShape} { /* Use defined shape */ }
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

        {/* Render Connector-Only Visual ONLY if isRightConnected is true */}
        {data.isRightConnected && (
            <div 
              className={`podcast-node-connector-right-connected absolute right-[-16.5px] top-1/2 transform -translate-y-1/2 pointer-events-none z-20`}
            >
              <svg width="17" height="25" viewBox="0 0 17 25" >
                 {RightConnectorShape} { /* Use defined shape */ }
               </svg>
            </div>
        )}
      </div>
      <div className="mt-2 text-sm text-black">Podcast</div> 
    </div>
  );
};

export default PodcastNode; 