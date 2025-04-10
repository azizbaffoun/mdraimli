import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// Import required SVGs (Adjust paths if necessary)
import socialMediaSvg from '@/assets/nodes/social media.svg';
import leftSocialMediaSvg from '@/assets/component to link the nodes/left social media.svg';

// Define expected data structure (might only need isEntering)
interface ContentNodeData {
  label?: string;
  isEntering?: boolean;
}

// Node component
const SocialMediaNode: React.FC<NodeProps<ContentNodeData>> = ({ data }) => {
  const animationClass = data.isEntering ? 'node-bouncing-in' : '';
  const nodeColor = '#FC8500'; // Define color directly (Orange)

  return (
    <div
      className={`relative flex flex-col items-center ${animationClass}`} // Keep outer relative positioning
    >
      {/* Main Visual - Apply wrapper and style here */}
      <div
        className={`relative node-wrapper node-type-socialMedia`}
        style={{ '--node-color': nodeColor } as React.CSSProperties}
        onMouseDown={(e) => e.stopPropagation()} // Prevent drag interfering with clicks
      >
        {/* Use direct SVG import */}
        <img src={socialMediaSvg} alt="Social Media" className="w-32 h-32" />

        {/* Invisible Target Handle ONLY */}
        <Handle
          type="target"
          position={Position.Left}
          id="left-target"
          style={{
            opacity: 0,
            width: 20,
            height: 20,
            left: '-16.5px',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50
          }}
        />

        {/* Visible Left Connector ONLY */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 z-10 left-connector-container"
          style={{ left: -16.5 }} // Center visual connector
        >
          {/* Use direct SVG import - adjust size if needed */}
          <img src={leftSocialMediaSvg} alt="" className="h-5 w-5" />
        </div>

        {/* NO Right Connector or Source Handle for the end node */}

      </div>
      <div className="mt-2 text-sm text-black">Social Media</div>
    </div>
  );
};

export default SocialMediaNode;