import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// Import required SVGs using path alias
import articleSvg from '@/assets/nodes/article.svg';
import videoSvg from '@/assets/nodes/video.svg';
import podcastSvg from '@/assets/nodes/podcast.svg';
import socialMediaSvg from '@/assets/nodes/social media.svg';

import leftArticleSvg from '@/assets/component to link the nodes/left article.svg';
import rightArticleSvg from '@/assets/component to link the nodes/right article.svg';
import leftVideoSvg from '@/assets/component to link the nodes/left video.svg';
import rightVideoSvg from '@/assets/component to link the nodes/right video.svg';
import leftPodcastSvg from '@/assets/component to link the nodes/left podcast.svg';
import rightPodcastSvg from '@/assets/component to link the nodes/right podcast.svg';
import leftSocialMediaSvg from '@/assets/component to link the nodes/left social media.svg';
// Social Media doesn't have a right connector in the original assets

// Cache the asset maps outside component to prevent recreation
const nodeImages = {
  article: articleSvg,
  video: videoSvg,
  podcast: podcastSvg,
  socialMedia: socialMediaSvg
};

const nodeLabels = {
  article: 'Article',
  video: 'Video',
  podcast: 'Podcast',
  socialMedia: 'Social Media'
};

const leftConnectors = {
  article: leftArticleSvg,
  video: leftVideoSvg,
  podcast: leftPodcastSvg,
  socialMedia: leftSocialMediaSvg
};

const rightConnectors = {
  article: rightArticleSvg,
  video: rightVideoSvg,
  podcast: rightPodcastSvg,
  socialMedia: null
};

// Define type for content nodes
type ContentNodeType = 'article' | 'video' | 'podcast' | 'socialMedia';

interface ContentNodeData {
  isLocked?: boolean;
  isLastNode?: boolean;
  isLeftConnected?: boolean;
  isRightConnected?: boolean;
}

// Base styles for handles
const baseHandleStyle = {
  opacity: 0,
  width: 40,
  height: 40,
  zIndex: 50,
  top: '50%',
  transform: 'translateY(-50%)'
};

const leftHandleStyle = {
  ...baseHandleStyle,
  left: -20
};

const rightHandleStyle = {
  ...baseHandleStyle,
  right: -20,
  transform: 'translate(50%, -50%)'
};

const ContentTypeNode: React.FC<NodeProps<ContentNodeData>> = ({ data, type: nodeType }) => {
  const type = nodeType as ContentNodeType || 'article';
  const showRightConnector = type !== 'socialMedia' && rightConnectors[type] && (!data.isLocked || !data.isLastNode);

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        <img 
          src={nodeImages[type]} 
          alt={nodeLabels[type]} 
          className="w-32 h-32" 
          draggable={false}
        />
        
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          style={leftHandleStyle}
          isConnectable={!data.isLocked}
        />
        
        {type !== 'socialMedia' && (!data.isLocked || !data.isLastNode) && (
          <Handle
            type="source"
            position={Position.Right}
            id="right"
            style={rightHandleStyle}
            isConnectable={!data.isLocked}
          />
        )}
        
        {data.isLeftConnected && (
          <div className="absolute -left-20 top-1/2 transform -translate-y-1/2">
            <img 
              src={leftConnectors[type]} 
              alt="Left Connector" 
              className="h-6 pointer-events-none" 
              draggable={false}
            />
          </div>
        )}

        {showRightConnector && (
          <div className="absolute -right-20 top-1/2 transform -translate-y-1/2">
            <img 
              src={rightConnectors[type]} 
              alt="Right Connector" 
              className="h-6 pointer-events-none" 
              draggable={false}
            />
          </div>
        )}
      </div>

      <div className="mt-2 text-sm text-black select-none">
        {nodeLabels[type]}
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(ContentTypeNode, (prev, next) => {
  return (
    prev.type === next.type &&
    prev.data.isLocked === next.data.isLocked &&
    prev.data.isLastNode === next.data.isLastNode &&
    prev.data.isLeftConnected === next.data.isLeftConnected &&
    prev.data.isRightConnected === next.data.isRightConnected
  );
}); 