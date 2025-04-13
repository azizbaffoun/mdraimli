import React from 'react';
// Add Handle and Position imports back
import { Handle, Position, NodeProps } from 'reactflow';

import videoSvg from '@/assets/nodes/video.svg';
// Import connector SVGs
import leftVideoSvg from '@/assets/component to link the nodes/left video.svg';
import rightVideoSvg from '@/assets/component to link the nodes/right video.svg';

// Define expected data structure
interface ContentNodeData {
  label?: string;
  isEntering?: boolean; 
  onAddNextNode?: () => void; // Add callback prop
  canAddChild?: boolean; // Flag to control child creation
}

const VideoNode: React.FC<NodeProps<ContentNodeData>> = ({ data }) => {
  const animationClass = data?.isEntering ? 'node-bouncing-in' : ''; // Use bouncing animation
  const nodeColor = '#3799DB'; // Match Topical Keyword color

  const handleAddNext = () => {
    if (data.onAddNextNode) {
      data.onAddNextNode();
    }
  };

  return (
    <div 
      className={`relative flex flex-col items-center ${animationClass}`}
    >
      <div 
        className={`relative node-wrapper node-type-video`}
        style={{ '--node-color': nodeColor } as React.CSSProperties}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <img src={videoSvg} alt="Video" className="w-32 h-32" />
        
        {/* Add invisible target handle at connector center */}
        <Handle
          type="target"
          position={Position.Left} 
          id="left-target" 
          style={{ 
            opacity: 0, // Make invisible again
            width: 20,   
            height: 20,  
            left: '-16.5px', 
            top: '50%', 
            transform: 'translate(-50%, -50%)', // Revert to transform centering
            zIndex: 50 
          }} 
        />
        
        {/* Add invisible source handle at connector center */}
        <Handle
          type="source"
          position={Position.Right}
          id="right-source"
          style={{ 
            opacity: 0, // Make invisible again
            width: 20,   
            height: 20,  
            right: '-16.5px', 
            top: '50%', 
            transform: 'translate(50%, -50%)', // Revert to transform centering
            zIndex: 50 
          }}
        />

        {/* Restore Static Connectors */}
        {/* Static Left Connector */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 z-10 left-connector-container"
          style={{ left: -16.5 }} // Center visual connector
        >
          <img src={leftVideoSvg} alt="" className="h-5 w-5" />
        </div>
        {/* Static Right Connector */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 cursor-pointer group z-10 right-connector-container"
          style={{ right: -16.5 }} // Center visual connector
          onClick={handleAddNext}
          title="Add next step"
        >
          <img src={rightVideoSvg} alt="" className="h-5 w-5" />
        </div>
        
      </div>
      <div className="mt-2 text-sm text-black">Video</div>
    </div>
  );
};

export default VideoNode;