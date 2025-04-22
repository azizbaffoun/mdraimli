import React, { useEffect } from 'react';
// Add Handle and Position imports back
import { Handle, Position, NodeProps } from 'reactflow';

import articleSvg from '@/assets/nodes/article.svg';
// Import connector SVGs
import leftArticleSvg from '@/assets/component to link the nodes/left article.svg';
import rightArticleSvg from '@/assets/component to link the nodes/right article.svg';

declare global {
  interface Window {
    notifyNodeAdded?: (type: string) => void;
  }
}

// Define expected data structure
interface ContentNodeData {
  label?: string;
  isEntering?: boolean; 
  onAddNextNode?: () => void;
  canAddChild?: boolean;
}

// Node component
const ArticleNode: React.FC<NodeProps<ContentNodeData>> = ({ data }) => {
  const animationClass = data.isEntering ? 'node-bouncing-in' : '';
  const nodeColor = '#2C93EA'; // Define color directly

  const handleAddNext = () => {
    if (data.onAddNextNode) {
      data.onAddNextNode();
    }
  };

        useEffect(() => {
          if (typeof window.notifyNodeAdded === 'function') {
            window.notifyNodeAdded("article");
          }
        }, []);

  return (
    <div 
      className={`relative flex flex-col items-center ${animationClass}`}
    > 
      {/* Main Visual - Apply wrapper and style here */} 
      <div 
        className={`relative node-wrapper node-type-article`}
        style={{ '--node-color': nodeColor } as React.CSSProperties}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Use direct SVG import */}
        <img src={articleSvg} alt="Article" className="w-32 h-32" />

        {/* Invisible Target Handle */}
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
           transform: 'translate(-50%, -50%)', 
           zIndex: 50 
         }} 
       />
       
       {/* Invisible Source Handle */}
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
          transform: 'translate(50%, -50%)', 
          zIndex: 50 
         }}
       />

       {/* Visible Left Connector */}
       <div
         className="absolute top-1/2 transform -translate-y-1/2 z-10 left-connector-container"
         style={{ left: -16.5 }} // Center visual connector
       >
         {/* Use direct SVG import - adjust size if needed */}
         <img src={leftArticleSvg} alt="" className="h-5 w-5" /> 
       </div>

       {/* Visible Right Connector */}
       <div
         className="absolute top-1/2 transform -translate-y-1/2 cursor-pointer group z-10 right-connector-container"
         style={{ right: -16.5 }} // Center visual connector
         onClick={handleAddNext}
         title="Add next step"
       >
         {/* Use direct SVG import - adjust size if needed */}
         <img src={rightArticleSvg} alt="" className="h-5 w-5" />
       </div>
      </div>
      <div className="mt-2 text-sm text-black">Article</div>
    </div>
  );
};

export default ArticleNode; 