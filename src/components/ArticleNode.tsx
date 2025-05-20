import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// Import necessary types from the types file
import { ContentNodeData, ContentType, notifyNode } from '@/types/workflowTypes';

// Keep plus button, remove others
// import articleSvg from '@/assets/nodes/article.svg';
// import leftArticleSvg from '@/assets/component to link the nodes/left article.svg';
// import rightTopicalKeywordSvg from '@/assets/component to link the nodes/right topical keyword.svg';
// import plusButtonSvg from '@/assets/component to link the nodes/plusbutton.svg';

import PopupSelect from './PopupSelect';
import NodeTimer from './NodeTimer';

// Use the specific interface by extending the imported base type
interface ArticleNodeData extends ContentNodeData {
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
  badgeNumber?: number;
  timeString?: string;
}

import NodeAddMenu from './NodeAddMenu';

const ArticleNode: React.FC<NodeProps<ArticleNodeData>> = ({ id, data, selected }) => {
  const animationClass = data.isEntering ? 'node-bouncing-in' : '';
  const [menuOpen, setMenuOpen] = useState(false);
  const [replaceMenuOpen, setReplaceMenuOpen] = useState(false);
  const popupAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    data.isNew && notifyNode('article', id);
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
    notifyNode('article', id);
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
      <path d="M0,0H4A12,12,0,0,1,16,12v0A12,12,0,0,1,4,24H0a0,0,0,0,1,0,0V0A0,0,0,0,1,0,0Z" transform="translate(0.5 0.5)" fill="#8fa8f1" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
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
      className={`${animationClass} relative`}
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
        className={`node-wrapper group node-type-article w-32 h-32 transition-transform duration-200 ${selected ? 'selected' : ''} ${data.isRightConnected ? 'is-connected' : ''}`}
        onMouseEnter={() => !data.isLocked && console.log(`[ArticleNode ${id}] Mouse ENTER node wrapper`)}
        onMouseLeave={() => !data.isLocked && console.log(`[ArticleNode ${id}] Mouse LEAVE node wrapper`)}
        style={{ '--node-color': '#8fa8f1', position: 'relative' } as React.CSSProperties}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          const isPlusZone = target.closest('[data-type="plus-zone"]');
          const isMenu = target.closest('[data-type="menu"]');

          if (isPlusZone || isMenu) {
            console.log(`[ArticleNode ${id}] Preventing node selection - clicked ${isPlusZone ? 'plus zone' : 'menu'}`);
            e.stopPropagation();
            return;
          }
        }}
      >
        {/* Main SVG for Node Appearance */}
        <svg
          viewBox="0 0 116 116" // Adjusted for glow
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          className="w-full h-full absolute top-0 left-0"
        >
          <defs>
            {/* Use article gradient */}
            <linearGradient id="article-node-gradient" x1="0.878" y1="0.172" x2="0.239" y2="0.934" gradientUnits="objectBoundingBox">
              <stop offset="0" stopColor="#2c93ea"/>
              <stop offset="1" stopColor="#456fe8"/>
            </linearGradient>
          </defs>

          {/* Glow element */}
          <rect
            className="article-node-glow"
            width="116" height="116" rx="40"
            transform="translate(0 0)"
            fill="url(#article-node-gradient)"
            stroke="rgba(0,0,0,0)"
            strokeWidth="1"
          />

          {/* Main background shape */}
          <rect
            width="110.492" height="110" rx="40"
            transform="translate(2.754 3)" // Center 110.5 in 116
            fill="url(#article-node-gradient)"
            stroke="rgba(0,0,0,0)"
            strokeWidth="1"
          />

          {/* Article Icon - Extracted from article.svg */}
          <g transform="translate(38.245 33)">
            <path d="M35.411,50.07H4.627a4.6,4.6,0,0,1-2.587-.79A4.64,4.64,0,0,1,.364,47.244,4.6,4.6,0,0,1,0,45.443V32.413H3.619v7.03a4.632,4.632,0,0,0,4.627,4.627h23.5a4.632,4.632,0,0,0,4.627-4.627V8.75a4.632,4.632,0,0,0-4.627-4.627H8.246A4.632,4.632,0,0,0,3.619,8.75v7.472H0V4.627A4.6,4.6,0,0,1,.79,2.04,4.641,4.641,0,0,1,2.826.364,4.6,4.6,0,0,1,4.627,0H35.411A4.6,4.6,0,0,1,38,.79a4.641,4.641,0,0,1,1.676,2.036,4.6,4.6,0,0,1,.364,1.8V45.443a4.605,4.605,0,0,1-.79,2.587,4.641,4.641,0,0,1-2.036,1.676A4.6,4.6,0,0,1,35.411,50.07ZM20.019,45.718a1.42,1.42,0,1,0,1.42,1.42A1.422,1.422,0,0,0,20.019,45.718Z" fill="#fff" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
            <path d="M31.336,29.79H21.711v-13.3h9.625v13.3Zm-12.82-2.251H10.531V16.493h7.984V27.539Zm-11.18-7.3H0V9.911H7.336V20.238Zm24-6.941H21.711V0h9.625V13.3Zm-12.82,0H10.531V2.251h7.984V13.3Z" transform="translate(0 9.246)" fill="#fff" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
          </g>
        </svg>

        {/* Handles - Ensure exact positioning for perfect alignment */}
        <Handle type="target" position={Position.Left} id="left-target" style={{ opacity: 0, width: 20, height: 20, left: '-16.5px', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 50 }} />
        <Handle type="source" position={Position.Right} id="right-source" style={{ opacity: 0, width: 20, height: 20, right: '-16.5px', top: '50%', transform: 'translate(50%, -50%)', zIndex: 10 }} />

        {/* Left Connector Visual - Ensure exact positioning for perfect alignment */}
        <div
          className={`article-node-connector-left absolute left-[-16.5px] top-[50%] transform -translate-y-1/2 pointer-events-none z-20 ${data.isLeftConnected ? 'is-connected' : ''}`}
          style={{ marginTop: 0 }} // Ensure no additional margin affects alignment
        >
            <svg width="17" height="25" viewBox="0 0 17 25">
              <path d="M12,0h4a0,0,0,0,1,0,0V24a0,0,0,0,1,0,0H12A12,12,0,0,1,0,12v0A12,12,0,0,1,12,0Z" transform="translate(0.5 0.5)" fill="#8fa8f1" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
            </svg>
        </div>

        {/* Right Side Elements - Only show if not locked or not last node */}
        {(data.canAddChild && (!data.isLocked || !data.isLastNode) && !(data.isLocked && !data.isRightConnected) || (selected && !data.isLocked)) && (
          <>
            <div
              className="article-node-connector-plus absolute right-[-16.5px] top-[50%] transform -translate-y-1/2 cursor-pointer group z-30 hover:scale-110 transition-transform"
              onClick={(e) => {
                console.log(`[ArticleNode ${id}] Plus zone clicked`);
                if (data.isLocked) return;
                e.stopPropagation();
                setMenuOpen(!menuOpen);
                setReplaceMenuOpen(false);
              }}
              data-type="plus-zone"
              style={{ marginTop: 0 }} // Ensure no additional margin affects alignment
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
        {(data.isRightConnected || (!data.isLocked || !data.isLastNode)) && !(data.isLocked && !data.isRightConnected) && (
          <div
            className={`article-node-connector-right-connected absolute right-[-16.5px] top-[50%] transform -translate-y-1/2 pointer-events-none z-20`}
            style={{ marginTop: 0 }} // Ensure no additional margin affects alignment
          >
            <svg width="17" height="25" viewBox="0 0 17 25" >
              {RightConnectorShape}
            </svg>
          </div>
        )}
      </div>
      <div className="absolute w-full text-center" style={{ top: 'calc(100% + 10px)' }}>
        <NodeTimer
          badgeNumber={data.badgeNumber}
          delayValue={data.delayValue}
          color="#456fe8"
          nodeName="Article"
          gradientId="article-node-gradient"
        />
      </div>
    </div>
  );
};

export default ArticleNode;