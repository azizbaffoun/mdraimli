import React from 'react';
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

// Define type for content nodes
type ContentNodeType = 'article' | 'video' | 'podcast' | 'socialMedia';

interface ContentNodeData {
  isLocked?: boolean;
  isLastNode?: boolean;
  isLeftConnected?: boolean;
  isRightConnected?: boolean;
}

const ContentTypeNode: React.FC<NodeProps<ContentNodeData>> = (props) => {
  // Prefix unused props with underscore to satisfy linter
  const { data: _data, id: _id } = props;
  const type = props.type as ContentNodeType || 'article'; 

  // Map node types to their assets
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
    socialMedia: null // Explicitly null for social media
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Main Visual */}
      <div className="relative">
        <img 
          src={nodeImages[type]} 
          alt={nodeLabels[type]} 
          className="w-32 h-32" 
        />
        
        {/* Placeholder Handles (invisible but connectable) */}
        {/* Target handle (Left) - All content nodes have this */}
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          style={{ opacity: 0, width: 40, height: 40, zIndex: 50, left: -20, top: '50%', transform: 'translateY(-50%)' }}
          isConnectable={!_data.isLocked}
        />
        {/* Source handle (Right) - Only if not social media and not locked/last node */}
        {type !== 'socialMedia' && (!_data.isLocked || !_data.isLastNode) && (
           <Handle
            type="source"
            position={Position.Right}
            id="right"
            style={{ opacity: 0, width: 40, height: 40, zIndex: 50, right: -20, top: '50%', transform: 'translate(50%, -50%)' }}
            isConnectable={!_data.isLocked}
          />
        )}
        
        {/* Static Connectors (Visual only) */}
        {/* Left Connector - Show only if connected */}
        {_data.isLeftConnected && (
          <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 group">
             <img 
              src={leftConnectors[type]} 
              alt="Left Connector" 
              className="h-6 group-hover:opacity-70 pointer-events-none" 
            />
          </div>
        )}
        {/* Right Connector - Show only if not social media and not locked/last node */}
        {type !== 'socialMedia' && rightConnectors[type] && (!_data.isLocked || !_data.isLastNode) && (
          <div className="absolute -right-20 top-1/2 transform -translate-y-1/2 group">
             <img 
              src={rightConnectors[type]} 
              alt="Right Connector" 
              className="h-6 group-hover:opacity-70 pointer-events-none" 
            />
          </div>
        )}
      </div> 

      {/* Label */}
      <div className="mt-2 text-sm text-black">
        {nodeLabels[type]}
      </div>
    </div>
  );
};

export default ContentTypeNode; 