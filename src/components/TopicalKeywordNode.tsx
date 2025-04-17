import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// REMOVE SVG IMPORTS
// import topicalKeywordSvg from '@/assets/nodes/topical keyword.svg';
// import plusButtonSvg from '@/assets/component to link the nodes/plusbutton.svg';
// import rightTopicalKeywordSvg from '@/assets/component to link the nodes/right topical keyword.svg';

import NodeAddMenu from './NodeAddMenu';

type ContentType = 'article' | 'video' | 'podcast' | 'socialMedia';

interface TopicalKeywordNodeData {
  onAddChildNode: (parentId: string, childType: ContentType) => void;
  isEntering?: boolean;
  isRightConnected?: boolean;
  isSelected?: boolean;
}

const TopicalKeywordNode: React.FC<NodeProps<TopicalKeywordNodeData>> = ({ id, data, selected }) => {
  const nodeColor = '#3799DB';
  const [menuOpen, setMenuOpen] = useState(false);
  // RESTORE showPlusButton state
  const [showPlusButton, setShowPlusButton] = useState(true);

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen); // Just toggle the menu state
  };

  const handleSelectOption = (parentId: string, type: ContentType) => {
    if (data.onAddChildNode) {
      data.onAddChildNode(parentId, type);
      // RESTORE setting showPlusButton to false
      setShowPlusButton(false);
    }
    setMenuOpen(false);
  };

  const animationClass = data.isEntering ? 'node-bouncing-in' : '';

  return (
    <div
      className={`relative flex flex-col items-center ${animationClass}`}
    >
      <div
        className={`relative node-wrapper node-type-topicalKeyword w-32 h-32 transition-transform duration-200 ${selected ? 'selected' : ''} ${data.isRightConnected ? 'is-connected' : ''}`}
        style={{ '--node-color': nodeColor } as React.CSSProperties}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <svg
            viewBox="0 0 116.5 116.5"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            className="w-full h-full"
        >
          <defs>
            <linearGradient id="linear-gradient" y1="0.365" x2="1" y2="0.058" gradientUnits="objectBoundingBox">
              <stop offset="0" stopColor="#3799db"/>
              <stop offset="1" stopColor="#2db4a6"/>
            </linearGradient>
          </defs>
          {/* Background/Shadow Rect - ADD CLASS & REMOVE HARDCODED OPACITY */}
          <rect id="Rectangle_1774" data-name="Rectangle 1774" width="116" height="116" rx="40" transform="translate(0.5 0.5)" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1" fill="url(#linear-gradient)" className={`topical-keyword-background ${selected ? 'opacity-30' : ''}`}/>
          {/* Main Shape Rect */}
          <rect id="Rectangle_1635" data-name="Rectangle 1635" width="110" height="110" rx="40" transform="translate(3.5 3.5)" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1" fill="url(#linear-gradient)"/>
          {/* Icon Group - Adjust transform for centering */}
          <g id="Group_3331" data-name="Group 3331" transform="translate(37.75 37.75)">
            <path id="Union_42" data-name="Union 42" d="M12.11,27.1a1.377,1.377,0,0,1-1.271-.932l-.761-2.455-1.27-.51-2.2,1.186A1.422,1.422,0,0,1,5,24.136L2.964,22.1a1.43,1.43,0,0,1-.253-1.611l1.186-2.2-.509-1.271-2.371-.761A1.351,1.351,0,0,1,0,14.99v-2.88A1.377,1.377,0,0,1,.933,10.84l2.373-.761c.166-.425.338-.932.507-1.355L2.711,6.6A1.426,1.426,0,0,1,2.964,5L5,2.964A1.422,1.422,0,0,1,6.605,2.71l2.2,1.184a3.763,3.763,0,0,1,1.355-.507l.764-2.372A1.183,1.183,0,0,1,12.11,0h2.88a1.374,1.374,0,0,1,1.271.93L17.023,3.3l1.271.508,2.2-1.184A1.425,1.425,0,0,1,22.1,2.88l2.032,2.032A1.418,1.418,0,0,1,24.39,6.52l-1.184,2.2.507,1.268,2.373.763A1.45,1.45,0,0,1,27.1,12.111v2.88a1.379,1.379,0,0,1-.932,1.271l-2.458.761-.507,1.271,1.184,2.2a1.422,1.422,0,0,1-.254,1.611L22.1,24.136a1.425,1.425,0,0,1-1.609.254l-2.2-1.186-1.271.51-.762,2.455a1.373,1.373,0,0,1-1.271.932Z" transform="translate(6.882 6.881)" fill="#fff" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
            <path id="Exclusion_4" data-name="Exclusion 4" d="M20.642,41.283A20.647,20.647,0,0,1,12.607,1.622,20.647,20.647,0,0,1,28.678,39.66,20.52,20.52,0,0,1,20.642,41.283Zm0-38.224A17.583,17.583,0,1,0,38.227,20.641,17.6,17.6,0,0,0,20.642,3.058Z" transform="translate(0 0)" fill="#fff" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
            <g id="keyhole" transform="translate(17.209 13.774)">
              <path id="Path_402" data-name="Path 402" d="M4.869,6.546l2,6.331a.848.848,0,0,1-.858.858H.858a.836.836,0,0,1-.6-.248A.819.819,0,0,1,0,12.877L2,6.546A3.42,3.42,0,0,1,.55,5.292,3.315,3.315,0,0,1,0,3.434,3.308,3.308,0,0,1,1.006,1.006,3.308,3.308,0,0,1,3.434,0,3.308,3.308,0,0,1,5.862,1.006,3.308,3.308,0,0,1,6.868,3.434a3.315,3.315,0,0,1-.55,1.858A3.42,3.42,0,0,1,4.869,6.546Z" transform="translate(0 0)" fill="#33a2c7"/>
            </g>
            <path id="Path_408" data-name="Path 408" d="M1.529,0,7.195.075A1.529,1.529,0,0,1,8.724,1.6L7.57,11.017a1.529,1.529,0,0,1-1.529,1.529l-3.508.075A1.529,1.529,0,0,1,1,11.093L0,1.529A1.529,1.529,0,0,1,1.529,0Z" transform="translate(34.765 38.044) rotate(-49)" fill="#fff" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
          </g>
        </svg>

        {/* --- Connector Handle and Visual --- */}
        <Handle
          type="source"
          position={Position.Right}
          id="right-source"
          style={{
            opacity: 0,
            width: 20,
            height: 20,
            right: '-16.5px',
            top: '50%',
            transform: 'translate(50%, -50%)',
            zIndex: 10,
          }}
        />
        {/* Container for the connector visual - Update class */}
        <div className="absolute right-[-16.5px] top-1/2 transform -translate-y-1/2 pointer-events-none z-0 topical-keyword-connector">
          <svg width="17" height="25" viewBox="0 0 17 25" xmlns="http://www.w3.org/2000/svg">
            <path id="Rectangle_1636" data-name="Rectangle 1636" d="M0,0H4A12,12,0,0,1,16,12v0A12,12,0,0,1,4,24H0a0,0,0,0,1,0,0V0A0,0,0,0,1,0,0Z" transform="translate(0.5 0.5)" fill="#81cfce" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
          </svg>
        </div>
        {/* --- End Connector Handle --- */}

        {/* --- Interactive Plus Button (using SVG shape) --- */}
        {/* WRAP plus button and menu in showPlusButton condition */}
        {showPlusButton && (
          <>
            {/* Positioned div for the clickable SVG plus button - ADD CLASS */}
            <div
              className={`absolute right-[-26px] top-1/2 transform -translate-y-1/2 cursor-pointer group z-20 hover:scale-110 transition-transform topical-keyword-plus-button ${selected ? 'opacity-100' : ''}`}
              onClick={handlePlusClick}
              title="Add content"
            >
              <svg width="32" height="32" viewBox="0 0 23 24" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(3.5 0)">
                  <path id="Rectangle_1636" data-name="Rectangle 1636" d="M0,0H4A12,12,0,0,1,16,12v0A12,12,0,0,1,4,24H0a0,0,0,0,1,0,0V0A0,0,0,0,1,0,0Z" fill="#86c1e9" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
                  <g id="add-circle" transform="translate(-3.721 0.279)">
                    <path id="Path_687" data-name="Path 687" d="M15.613,12.657H7.829a.829.829,0,1,1,0-1.657h7.784a.829.829,0,1,1,0,1.657Z" transform="translate(0 -0.108)" fill="#fff"/>
                    <path id="Path_688" data-name="Path 688" d="M11.829,16.442A.829.829,0,0,1,11,15.613V7.829a.829.829,0,1,1,1.657,0v7.784A.829.829,0,0,1,11.829,16.442Z" transform="translate(-0.108)" fill="#fff"/>
                  </g>
                </g>
              </svg>
            </div>

            <NodeAddMenu
              parentId={id}
              isOpen={menuOpen}
              onClose={() => setMenuOpen(false)}
              onSelectOption={handleSelectOption}
              availableOptions={['article', 'video', 'podcast', 'socialMedia']}
              positionStyle={{
                left: 'calc(100% + 32px)',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
          </>
        )}
        {/* --- End Interactive Plus Button --- */}

      </div>

      <div className="mt-2 text-sm text-black">
        Topical Keyword
      </div>
    </div>
  );
};

export default TopicalKeywordNode;