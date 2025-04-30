import React, { useState, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';

// REMOVE SVG IMPORTS
// import topicalKeywordSvg from '@/assets/nodes/topical keyword.svg';
// import plusButtonSvg from '@/assets/component to link the nodes/plusbutton.svg';
// import rightTopicalKeywordSvg from '@/assets/component to link the nodes/right topical keyword.svg';

import NodeAddMenu from './NodeAddMenu';
import PopupSelect from './PopupSelect';

// Import necessary types from the types file
import { TopicalKeywordNodeData, ContentType } from '@/types/workflowTypes'; 

// Accept nodeType via data (default: 'topicalKeyword')
import TopReplace from './topreplace';

const TopicalKeywordNode: React.FC<NodeProps<TopicalKeywordNodeData & { 
  nodeType?: 'topicalKeyword' | 'offer' | 'event';
}>> = ({ id, data, selected }) => {
  const nodeColor = '#3799DB';
  const [replaceMenuOpen, setReplaceMenuOpen] = useState(false);
  const popupAnchorRef = useRef<HTMLDivElement>(null);
  const { setNodes } = useReactFlow();

  const openMenu = data.openMenu;
  const setOpenMenu = data.setOpenMenu;

  const menuOpen = openMenu?.type === 'add' && openMenu.nodeId === id;
  const TopReplaceOpen = openMenu?.type === 'popselect' && openMenu.nodeId === id;

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenu?.(menuOpen ? null : { type: 'add', nodeId: id });
    setReplaceMenuOpen(false);
  };

  const handleSelectOption = (parentId: string, type: ContentType) => {
    if (data.onAddChildNode) {
      data.onAddChildNode(parentId, type);
    }
    setOpenMenu?.(null);
  };

  const handleReplaceNode = (newType: ContentType) => {
    data.onReplaceNode?.(id, newType);
    setReplaceMenuOpen(false);
  };

  const handleCloseReplaceMenu = () => {
    setReplaceMenuOpen(false);
  };

  const handleSettingsClick = () => {
    setOpenMenu?.(null);
    setReplaceMenuOpen(true);
  };

  const handleTopReplaceSelect = (type: 'topicalKeyword' | 'offer' | 'event') => {
    setOpenMenu?.(null);
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, nodeType: type } }
          : node
      )
    );
  };

  const handleDeleteClick = () => {
    setOpenMenu?.(null);
  };

  const animationClass = data.isEntering ? 'node-bouncing-in' : '';

  return (
    <div
      className={`relative flex flex-col items-center ${animationClass}`}
    >
      {selected && (
        <div ref={popupAnchorRef}>
          <PopupSelect
            onDocumentClick={() => console.log('Document clicked')}
            onSettingsClick={handleSettingsClick}
            onDeleteClick={handleDeleteClick}
            notificationCount={9}
            isTopicalKeywordNode={true}
            nodeId={id}
            onReplaceNode={(_, newType) => handleReplaceNode(newType as ContentType)}
            isReplaceMenuOpen={replaceMenuOpen}
            onCloseReplaceMenu={handleCloseReplaceMenu}
            setOpenMenu={setOpenMenu}
            nodeType={data.nodeType || 'topicalKeyword'}
          />
          <TopReplace
            isOpen={TopReplaceOpen}
            onSelect={handleTopReplaceSelect}
            onClose={() => setOpenMenu?.(null)}
            currentType={data.nodeType || 'topicalKeyword'}
          />
        </div>
      )}
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
          {/* Icon Group - dynamic by nodeType */}
          {(() => {
            switch (data.nodeType) {
              case 'offer':
                return (
  <g id="lineicons_offer" transform="translate(38 98)">
    <path id="Path_684" data-name="Path 684" d="M43.057,20.395,41.35,19.043a1.435,1.435,0,0,1-.5-1.352l.569-2.063a4.5,4.5,0,0,0-.711-3.77,4.731,4.731,0,0,0-3.557-1.921L34.948,9.8a1.333,1.333,0,0,1-1.28-.854l-.782-1.921A4.736,4.736,0,0,0,30.04,4.39a4.88,4.88,0,0,0-3.983.427L24.207,5.955a1.812,1.812,0,0,1-1.707,0L20.65,4.817a4.622,4.622,0,0,0-3.983-.427,4.542,4.542,0,0,0-2.845,2.632L12.9,9.013a1.405,1.405,0,0,1-1.28.854l-2.205.142A4.614,4.614,0,0,0,5.855,11.93a4.454,4.454,0,0,0-.711,3.77l.569,2.063a1.294,1.294,0,0,1-.5,1.352l-1.707,1.28A4.316,4.316,0,0,0,1.8,23.951a4.739,4.739,0,0,0,1.707,3.557L5.214,28.86a1.294,1.294,0,0,1,.5,1.352l-.569,2.063a4.5,4.5,0,0,0,.711,3.77,4.731,4.731,0,0,0,3.557,1.921l2.205.142a1.333,1.333,0,0,1,1.28.854l.782,1.921a4.736,4.736,0,0,0,2.845,2.632,4.88,4.88,0,0,0,3.983-.427l1.849-1.138a1.812,1.812,0,0,1,1.707,0l1.849,1.138a5.278,5.278,0,0,0,2.49.711,5.415,5.415,0,0,0,1.494-.213,4.542,4.542,0,0,0,2.845-2.632l.782-1.921a1.405,1.405,0,0,1,1.28-.854l2.205-.142a4.614,4.614,0,0,0,3.557-1.921,4.454,4.454,0,0,0,.711-3.77l-.569-2.063a1.294,1.294,0,0,1,.5-1.352l1.707-1.352a4.316,4.316,0,0,0,1.707-3.557A3.887,3.887,0,0,0,43.057,20.395Zm-1.992,4.553L39.358,26.3a4.453,4.453,0,0,0-1.565,4.695l.569,2.063a1.217,1.217,0,0,1-.213,1.067,1.848,1.848,0,0,1-1.138.64l-2.205.142a4.59,4.59,0,0,0-4.055,2.845L29.9,39.6a1.363,1.363,0,0,1-.925.782,1.806,1.806,0,0,1-1.352-.142L25.772,39.1a5.278,5.278,0,0,0-2.49-.711,4.576,4.576,0,0,0-2.49.711l-1.849,1.138a1.806,1.806,0,0,1-1.352.142,1.522,1.522,0,0,1-.925-.782l-.782-1.921a4.59,4.59,0,0,0-4.055-2.845l-2.205-.142a1.347,1.347,0,0,1-1.138-.64,1.217,1.217,0,0,1-.213-1.067l.569-2.063a4.453,4.453,0,0,0-1.565-4.695L5.5,24.947a1.245,1.245,0,0,1,0-1.992L7.206,21.6a4.453,4.453,0,0,0,1.565-4.695L8.2,14.846a1.217,1.217,0,0,1,.213-1.067,1.848,1.848,0,0,1,1.138-.64L11.759,13a4.59,4.59,0,0,0,4.055-2.845L16.6,8.231a1.753,1.753,0,0,1,1-.711,1.806,1.806,0,0,1,1.352.142L20.793,8.8a4.815,4.815,0,0,0,4.979,0l1.849-1.138a1.806,1.806,0,0,1,1.352-.142A1.522,1.522,0,0,1,29.9,8.3l.782,1.921a4.59,4.59,0,0,0,4.055,2.845l2.205.142a1.347,1.347,0,0,1,1.138.64,1.217,1.217,0,0,1,.213,1.067l-.569,2.063a4.453,4.453,0,0,0,1.565,4.695l1.707,1.352a1.242,1.242,0,0,1,.5,1A.77.77,0,0,1,41.066,24.947Z" transform="translate(-1.8 -63.118)" fill="#fff"/>
    <path id="Path_685" data-name="Path 685" d="M34.734,21.616a1.589,1.589,0,0,0-2.276,0L21.645,32.429a1.589,1.589,0,0,0,0,2.276,1.679,1.679,0,0,0,1.138.5,1.415,1.415,0,0,0,1.138-.5L34.734,23.893A1.589,1.589,0,0,0,34.734,21.616ZM26.2,26.1a4.294,4.294,0,0,0,0-6.117,4.427,4.427,0,0,0-3.059-1.28,4.339,4.339,0,0,0-3.059,7.4,4.427,4.427,0,0,0,3.059,1.28A4.252,4.252,0,0,0,26.2,26.1Zm-3.841-3.77a1.039,1.039,0,0,1,1.565,0,1.107,1.107,0,1,1-1.565,0Zm7.611,7.611A4.427,4.427,0,0,0,28.688,33a4.326,4.326,0,0,0,7.4,3.059A4.427,4.427,0,0,0,37.366,33a4.339,4.339,0,0,0-7.4-3.059Zm3.841,3.841a1.116,1.116,0,0,1-1.565,0,1.139,1.139,0,1,1,1.565,0Z" transform="translate(-6.707 -67.328)" fill="#fff"/>
  </g>
                );
              case 'event':
                return (
                  <g transform="translate(38 33)">
                    <path d="M21.866,1.328c1.063,0,3.074.461,4.609,3.546l3.374,6.749.005.011a2.761,2.761,0,0,0,1.668,1.228l6.118,1.016c3.315.553,4.348,2.323,4.668,3.328s.5,3.041-1.877,5.4l-4.753,4.753a2.743,2.743,0,0,0-.612,2.136l1.36,5.883c.687,2.98.012,4.633-.674,5.5a3.755,3.755,0,0,1-3.017,1.38,7.984,7.984,0,0,1-3.966-1.285l-5.736-3.4a2.4,2.4,0,0,0-1.159-.26,2.488,2.488,0,0,0-1.178.263l-5.73,3.392a7.92,7.92,0,0,1-3.951,1.282,3.77,3.77,0,0,1-3.03-1.387C7.3,40,6.623,38.345,7.309,35.379L8.669,29.5a2.743,2.743,0,0,0-.612-2.136L3.3,22.6c-2.37-2.37-2.184-4.406-1.862-5.41S2.792,14.427,6.1,13.877l6.119-1.017a2.8,2.8,0,0,0,1.648-1.228l.005-.011L17.244,4.87C18.794,1.787,20.8,1.328,21.866,1.328ZM27.273,12.9,23.9,6.157C23.291,4.933,22.531,4.2,21.866,4.2s-1.434.731-2.05,1.955L16.444,12.9A5.6,5.6,0,0,1,12.692,15.7L6.568,16.715c-1.293.215-2.186.723-2.39,1.358s.229,1.569,1.157,2.5l4.757,4.757a5.607,5.607,0,0,1,1.384,4.8l0,.01-1.362,5.888c-.48,2.075-.025,2.856.126,3.046a.869.869,0,0,0,.778.3,5.352,5.352,0,0,0,2.484-.88l5.736-3.4.009-.005a5.3,5.3,0,0,1,2.629-.655A5.219,5.219,0,0,1,24.5,35.1l5.734,3.395a5.417,5.417,0,0,0,2.5.885.855.855,0,0,0,.766-.294c.15-.189.6-.968.122-3.057l-1.362-5.887,0-.01a5.607,5.607,0,0,1,1.384-4.8L38.4,20.57c.933-.927,1.368-1.857,1.166-2.491s-1.1-1.147-2.4-1.364L31.05,15.7A5.607,5.607,0,0,1,27.273,12.9Z" fill="#fff" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
                  </g>
                );
              case 'topicalKeyword':
              default:
                // Always render the original keyhole SVG for topicalKeyword and as default
                return (
                  <g id="Group_3331" data-name="Group 3331" transform="translate(36 36)">
                  <path id="Union_42" data-name="Union 42" d="M12.11,27.1a1.377,1.377,0,0,1-1.271-.932l-.761-2.455-1.27-.51-2.2,1.186A1.422,1.422,0,0,1,5,24.136L2.964,22.1a1.43,1.43,0,0,1-.253-1.611l1.186-2.2-.509-1.271-2.371-.761A1.351,1.351,0,0,1,0,14.99v-2.88A1.377,1.377,0,0,1,.933,10.84l2.373-.761c.166-.425.338-.932.507-1.355L2.711,6.6A1.426,1.426,0,0,1,2.964,5L5,2.964A1.422,1.422,0,0,1,6.605,2.71l2.2,1.184a3.763,3.763,0,0,1,1.355-.507l.764-2.372A1.183,1.183,0,0,1,12.11,0h2.88a1.374,1.374,0,0,1,1.271.93L17.023,3.3l1.271.508,2.2-1.184A1.425,1.425,0,0,1,22.1,2.88l2.032,2.032A1.418,1.418,0,0,1,24.39,6.52l-1.184,2.2.507,1.268,2.373.763A1.45,1.45,0,0,1,27.1,12.111v2.88a1.379,1.379,0,0,1-.932,1.271l-2.458.761-.507,1.271,1.184,2.2a1.422,1.422,0,0,1-.254,1.611L22.1,24.136a1.425,1.425,0,0,1-1.609.254l-2.2-1.186-1.271.51-.762,2.455a1.373,1.373,0,0,1-1.271.932Z" transform="translate(6.882 6.881)" fill="#fff" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
                  <path id="Exclusion_4" data-name="Exclusion 4" d="M20.642,41.283A20.647,20.647,0,0,1,12.607,1.622,20.647,20.647,0,0,1,28.678,39.66,20.52,20.52,0,0,1,20.642,41.283Zm0-38.224A17.583,17.583,0,1,0,38.227,20.641,17.6,17.6,0,0,0,20.642,3.058Z" transform="translate(0 0)" fill="#fff" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
                  <g id="keyhole" transform="translate(17.209 13.774)">
                    <path id="Path_402" data-name="Path 402" d="M4.869,6.546l2,6.331a.848.848,0,0,1-.858.858H.858a.836.836,0,0,1-.6-.248A.819.819,0,0,1,0,12.877L2,6.546A3.42,3.42,0,0,1,.55,5.292,3.315,3.315,0,0,1,0,3.434,3.308,3.308,0,0,1,1.006,1.006,3.308,3.308,0,0,1,3.434,0,3.308,3.308,0,0,1,5.862,1.006,3.308,3.308,0,0,1,6.868,3.434a3.315,3.315,0,0,1-.55,1.858A3.42,3.42,0,0,1,4.869,6.546Z" transform="translate(0 0)" fill="#33a2c7"/>
                  </g>
                  <path id="Path_408" data-name="Path 408" d="M1.529,0,7.195.075A1.529,1.529,0,0,1,8.724,1.6L7.57,11.017a1.529,1.529,0,0,1-1.529,1.529l-3.508.075A1.529,1.529,0,0,1,1,11.093L0,1.529A1.529,1.529,0,0,1,1.529,0Z" transform="translate(34.765 38.044) rotate(-49)" fill="#fff" stroke="rgba(0,0,0,0)" strokeMiterlimit="10" strokeWidth="1"/>
                </g>
                );
            }
          })()}
        </svg>

        {/* --- Connector Handle and --- */}
        {/* Show left connector if connected */}
        {data.isLeftConnected && (
          <div className="absolute -left-6 top-1/2 transform -translate-y-1/2">
            {/* Your left connector SVG or visual here */}
            <svg width="16" height="16"><circle cx="8" cy="8" r="8" fill="#3799DB" /></svg>
          </div>
        )}
        {/* Show right connector if connected */}
        {data.isRightConnected && (
          <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
          {/* Your right connector SVG or visual here */}
        </div>
        )}
        {/* Show add-child button if canAddChild */}
        {data.canAddChild && (
          <button className="absolute -right-6 top-1/2 transform -translate-y-1/2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center" onClick={handlePlusClick}>
            +
          </button>
        )}
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
        {/* Show plus button only if NOT right connected */}
        {!data.isRightConnected && (
          <>
            {/* Positioned div for the clickable SVG plus button - ADD CLASS */}
            <div
              className={`absolute right-[-26px] top-1/2 transform -translate-y-1/2 cursor-pointer group z-20 hover:scale-110 transition-transform topical-keyword-plus-button ${selected ? 'opacity-100' : ''}`}
              onClick={handlePlusClick}
              title="Add content"
            >
              <svg width="31" height="35" viewBox="0 0 23 24" xmlns="http://www.w3.org/2000/svg">
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
              onClose={() => setOpenMenu?.(null)}
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

      <div className="mt-[10px] text-sm text-black">
        {data.nodeType === 'offer' ? 'Offer' : data.nodeType === 'event' ? 'Event' : 'Topical Keyword'}
      </div>
    </div>
  );
};

export default TopicalKeywordNode;