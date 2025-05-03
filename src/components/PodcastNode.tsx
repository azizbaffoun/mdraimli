import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// Import necessary types from the types file
import { ContentNodeData, ContentType, notifyNode } from '@/types/workflowTypes';

// Keep plus button, remove others
// import podcastSvg from '@/assets/nodes/podcast.svg';
// import leftPodcastSvg from '@/assets/component to link the nodes/left podcast.svg';
// import rightTopicalKeywordSvg from '@/assets/component to link the nodes/right topical keyword.svg';
// import plusButtonSvg from '@/assets/component to link the nodes/plusbutton.svg';

import PopupSelect from './PopupSelect';

// Use the specific interface by extending the imported base type
interface PodcastNodeData extends ContentNodeData {
  label?: string;
  isNew?: boolean;
  isEntering?: boolean;
  onAddChildNode: (parentId: string, childType: ContentType) => void;
  canAddChild?: boolean;
  isLeftConnected?: boolean;
  isRightConnected?: boolean;
  onDelete?: (nodeId: string) => void;
  onReplaceNode?: (nodeId: string, newType: ContentType) => void;
  isLocked?: boolean;
  isLastNode?: boolean;
  setOpenMenu?: React.Dispatch<React.SetStateAction<{ type: 'add' | 'popselect'; nodeId: string; } | null>>;
}
import NodeAddMenu from './NodeAddMenu';

const PodcastNode: React.FC<NodeProps<PodcastNodeData>> = ({ id, data, selected }) => {
  const animationClass = data.isEntering ? 'node-bouncing-in' : '';
  const [menuOpen, setMenuOpen] = useState(false);
  const [replaceMenuOpen, setReplaceMenuOpen] = useState(false);
  const popupAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    data.isNew && notifyNode('podcast', id);
  }, []);



  const handleSelectOption = (parentId: string, type: ContentType) => {
    if (data.isLocked) return;
    if (data.onAddChildNode) {
      data.onAddChildNode(parentId, type);
    }
    setMenuOpen(false);
  };

  const handleReplaceNode = (nodeId: string, newType: ContentType) => {
    if (data.isLocked) return;
    if (data.onReplaceNode) {
      data.onReplaceNode(nodeId, newType);
    }
    setReplaceMenuOpen(false);
  };

  const handleSettingsClick = () => {
    if (data.isLocked) return;
    setMenuOpen(false);
    setReplaceMenuOpen(true);
    notifyNode('podcast', id);
  };

  const handleCloseReplaceMenu = () => {
    setReplaceMenuOpen(false);
  };

  const handleDeleteClick = () => {
    if (data.isLocked) return;
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const availableMenuOptions: ContentType[] = ['article', 'video', 'podcast', 'socialMedia'];

  // Define the right connector shape inline (used in two places now)
  const RightConnectorShape = (
    <path d="M0,0H4A12,12,0,0,1,16,12v0A12,12,0,0,1,4,24H0a0,0,0,0,1,0,0V0A0,0,0,0,1,0,0Z" transform="translate(0.5 0.5)" fill="#b388de" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
  );
  // Define the plus icon shape inline
  const PlusIconShape = (
    <g transform="translate(-3.3 0.7)"> 
        <path d="M15.613,12.657H7.829a.829.829,0,1,1,0-1.657h7.784a.829.829,0,1,1,0,1.657Z" transform="translate(0 -0.108)" fill="#fff"/>
        <path d="M11.829,16.442A.829.829,0,0,1,11,15.613V7.829a.829.829,0,1,1,1.657,0v7.784A.829.829,0,0,1,11.829,16.442Z" transform="translate(-0.108)" fill="#fff"/>
    </g>
  );

  return (
    <div
      className={`relative flex flex-col items-center ${animationClass}`}
    >
      {/* Only show PopupSelect if not locked */}
      {selected && !data.isLocked && (
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
        className={`relative node-wrapper group node-type-podcast w-32 h-32 transition-transform duration-200 ${selected ? 'selected' : ''} ${data.isRightConnected ? 'is-connected' : ''}`}
        onMouseEnter={() => !data.isLocked && console.log(`[${id}] Mouse ENTER node wrapper`)}
        onMouseLeave={() => !data.isLocked && console.log(`[${id}] Mouse LEAVE node wrapper`)}
        style={{ '--node-color': '#b99bd6' } as React.CSSProperties}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          const isPlusZone = target.closest('[data-type="plus-zone"]');
          const isMenu = target.closest('[data-type="menu"]');

          if (isPlusZone || isMenu) {
            console.log(`[PodcastNode ${id}] Preventing node selection - clicked ${isPlusZone ? 'plus zone' : 'menu'}`);
            e.stopPropagation();
            return;
          }
        }}
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
              <path d="M12,0h4a0,0,0,0,1,0,0V24a0,0,0,0,1,0,0H12A12,12,0,0,1,0,12v0A12,12,0,0,1,12,0Z" transform="translate(0.5 0.5)" fill="#b388de" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
            </svg>
        </div>

        {/* Right Side Elements - Only show if not locked or not last node */}
        {data.canAddChild && !data.isRightConnected && (!data.isLocked || !data.isLastNode) && (
          <>
            <div 
              className="podcast-node-connector-plus absolute right-[-16.5px] top-1/2 transform -translate-y-1/2 cursor-pointer group z-30 hover:scale-110 transition-transform"
              onClick={(e) => {
                console.log(`[PodcastNode ${id}] Plus zone clicked`);
                if (data.isLocked) return;
                e.stopPropagation();
                setMenuOpen(!menuOpen);
                setReplaceMenuOpen(false);
              }}
              data-type="plus-zone"
            >
              <svg width="17" height="25" viewBox="0 0 17 25" >
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
              positionStyle={{ left: 'calc(100% + 15px)', top: '67%', transform: 'translateY(-50%)' }}

              
              />
          </>
        )}

        {/* Right connector - Only show if right connected or if not locked/not last node */}
        {(data.isRightConnected || (!data.isLocked || !data.isLastNode)) && (
          <div 
            className={`podcast-node-connector-right-connected absolute right-[-16.5px] top-1/2 transform -translate-y-1/2 pointer-events-none z-20`}
          >
            <svg width="17" height="25" viewBox="0 0 17 25" >
              {RightConnectorShape}
            </svg>
          </div>
        )}
      </div>
      <div className="mt-[10px] text-sm text-black">Podcast</div>
    </div>
  );
};

export default PodcastNode; 