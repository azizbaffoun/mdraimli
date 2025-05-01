import { Node, Edge, Viewport } from 'reactflow';

export type ContentType = 'article' | 'video' | 'podcast' | 'socialMedia';

// Base data common to potentially all custom nodes
export interface BaseNodeData {
  isEntering?: boolean; 
  isExiting?: boolean;
  isNew?: boolean;
}

// Data for the initial start node
export interface StartNodeData extends BaseNodeData {
  onInitiateWorkflow: (type: string) => void;
  onDelete?: (nodeId: string) => void;
  onAddChildNode?: (parentId: string, childType: ContentType) => void;
}


// Data for the topical keyword node
export interface TopicalKeywordNodeData extends BaseNodeData {
  onAddChildNode: (parentId: string, childType: ContentType) => void;
  isRightConnected?: boolean;
  isLeftConnected?: boolean;
  canAddChild?: boolean;
  onDelete?: (nodeId: string) => void;
  onInitiateWorkflow?: (type: string) => void;
  openMenu?: { type: 'add' | 'popselect', nodeId: string } | null;
  setOpenMenu?: React.Dispatch<React.SetStateAction<{ type: 'add' | 'popselect', nodeId: string } | null>>;
  onReplaceNode?: (nodeId: string, newType: ContentType) => void;
}

export interface OfferNodeData extends BaseNodeData {
  onAddChildNode: (parentId: string, childType: ContentType) => void;
  isRightConnected?: boolean;
  isLeftConnected?: boolean;
  canAddChild?: boolean;
  onDelete?: (nodeId: string) => void;
  onInitiateWorkflow?: (type: string) => void;
  onReplaceNode?: (nodeId: string, newType: ContentType) => void;
}

export interface EventNodeData extends BaseNodeData {
  isRightConnected?: boolean;
  isLeftConnected?: boolean;
  canAddChild?: boolean;
  onDelete?: (nodeId: string) => void;
  onAddChildNode?: (parentId: string, childType: ContentType) => void;
  onInitiateWorkflow?: (type: string) => void;
  onReplaceNode?: (nodeId: string, newType: ContentType) => void;
}



export interface EventNodeData extends BaseNodeData {
  isRightConnected?: boolean;
  isLeftConnected?: boolean;
  canAddChild?: boolean;
}

// Data specific to content nodes (Article, Video, Podcast, SocialMedia)
export interface ContentNodeData extends BaseNodeData {
  canAddChild?: boolean; 
  isLeftConnected?: boolean;
  isRightConnected?: boolean;
  onDelete?: (nodeId: string) => void;
  onAddChildNode?: (parentId: string, childType: ContentType) => void;
  onInitiateWorkflow?: (type: string) => void;
  onReplaceNode?: (nodeId: string, newType: ContentType) => void;
}


// Data for the note node
export interface NoteNodeFlowData extends BaseNodeData { 
  title?: string;
  content?: string;
  onDelete?: (nodeId: string) => void;
  onAddChildNode?: (parentId: string, childType: ContentType) => void;
  onInitiateWorkflow?: (type: string) => void;
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


declare global {
  interface Window {
    notifyNodeAdded?: (type: string, nodeId?: string) => void;
    getWorkflowData?: () => void; // Add this line,
    saveWorkFlowToMVC?: () => void; // Add this line
    saveWorkflow?: () => void; // Add this line
  }
}

// Safely call notifyNodeAdded
export function notifyNode(type: string, nodeId?: string) {
  if (typeof window.notifyNodeAdded === 'function') {
    window.notifyNodeAdded(type, nodeId);
  }
}

// Safely call getWorkflowData
export function getWorkflowData() {
  if (typeof window.getWorkflowData === 'function') {
    return window.getWorkflowData();
  }
  return null; // or handle the case when the function is not available
}

export function saveWorkFlowToMVC() {
  if (typeof window.saveWorkflow === 'function') {
    window.saveWorkflow();
  }
  return null; // or handle the case when the function is not available
}
