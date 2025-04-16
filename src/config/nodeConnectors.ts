// import leftVideoSvg from '@/assets/component to link the nodes/left video.svg';
// import rightVideoSvg from '@/assets/component to link the nodes/right topical keyword.svg'; // Keeping current path, assuming it's intended for video now

export type NodeType = 'article' | 'podcast' | 'socialMedia' | 'topicalKeyword'; // Add other types as needed

interface ConnectorConfig {
  leftConnector: string;
  rightConnector: string;
}

export const nodeConnectors: Record<NodeType, ConnectorConfig> = {
  // REMOVE video entry
  // video: {
  //   leftConnector: leftVideoSvg,
  //   rightConnector: rightVideoSvg, 
  // },
  article: {
    // Placeholder - replace with actual article connector paths
    leftConnector: '', 
    rightConnector: '',
  },
  podcast: {
    // Placeholder
    leftConnector: '',
    rightConnector: '',
  },
  socialMedia: {
    // Placeholder
    leftConnector: '',
    rightConnector: '',
  },
  topicalKeyword: {
      // Placeholder
      leftConnector: '',
      rightConnector: '',
  }
}; 