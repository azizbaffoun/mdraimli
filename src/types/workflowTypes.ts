import { Node, Edge, Viewport, Connection } from 'reactflow';

export type ContentType = 'article' | 'video' | 'podcast' | 'socialMedia';

// Base data common to potentially all custom nodes
export interface BaseNodeData {
  isEntering?: boolean; 
  isExiting?: boolean;
}

// Data for the initial start node
export interface StartNodeData extends BaseNodeData {
  onInitiateWorkflow: (type: string) => void;
}

// Data for the topical keyword node
export interface TopicalKeywordNodeData extends BaseNodeData {
  onAddChildNode: (parentId: string, childType: ContentType) => void;
  isRightConnected?: boolean;
  isLeftConnected?: boolean;
  canAddChild?: boolean;
}
export interface OfferNodeData extends BaseNodeData {
  onAddChildNode: (parentId: string, childType: ContentType) => void;
  isRightConnected?: boolean;
  isLeftConnected?: boolean;
  canAddChild?: boolean;
}export interface EventNodeData extends BaseNodeData {
  onAddChildNode: (parentId: string, childType: ContentType) => void;
  isRightConnected?: boolean;
  isLeftConnected?: boolean;
  canAddChild?: boolean;
}
// Data specific to content nodes (Article, Video, Podcast, SocialMedia)
export interface ContentNodeData extends BaseNodeData {
  canAddChild?: boolean; 
  onAddChildNode?: (parentId: string, childType: ContentType) => void; 
  isLeftConnected?: boolean;
  isRightConnected?: boolean;
  onDelete?: (nodeId: string) => void;
}

// Data for the note node
export interface NoteNodeFlowData extends BaseNodeData { 
  title?: string;
  content?: string;
}

// Union type for any possible node data in our workflow
export type WorkflowNodeData = StartNodeData | TopicalKeywordNodeData | ContentNodeData | NoteNodeFlowData;

// You might also want a type for the overall workflow structure if saving/loading
export interface WorkflowData {
  nodes: Node<WorkflowNodeData>[]; // Use the specific data type
  edges: Edge[]; // Use the imported Edge type
  viewport?: Viewport; // Use the imported Viewport type
}

// Re-export necessary types from reactflow if needed elsewhere
// Removed re-export as they are imported directly now
// export type { Node, Edge, Viewport, Connection } from 'reactflow'; 