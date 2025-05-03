import create from 'zustand';
import { Node, Edge } from 'reactflow';
import { WorkflowNodeData } from '@/types/workflowTypes';

interface WorkflowState {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  history: {
    past: { nodes: Node<WorkflowNodeData>[]; edges: Edge[] }[];
    future: { nodes: Node<WorkflowNodeData>[]; edges: Edge[] }[];
  };
  setNodes: (nodes: Node<WorkflowNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (nodeId: string | null) => void;
  addToHistory: () => void;
  undo: () => void;
  redo: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  history: {
    past: [],
    future: []
  },

  setNodes: (nodes) => {
    set({ nodes });
  },

  setEdges: (edges) => {
    set({ edges });
  },

  setSelectedNode: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },

  addToHistory: () => {
    const { nodes, edges, history } = get();
    set({
      history: {
        past: [...history.past, { nodes: [...nodes], edges: [...edges] }],
        future: []
      }
    });
  },

  undo: () => {
    const { history } = get();
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);

    set((state) => ({
      nodes: previous.nodes,
      edges: previous.edges,
      history: {
        past: newPast,
        future: [{ nodes: state.nodes, edges: state.edges }, ...state.history.future]
      }
    }));
  },

  redo: () => {
    const { history } = get();
    if (history.future.length === 0) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);

    set((state) => ({
      nodes: next.nodes,
      edges: next.edges,
      history: {
        past: [...state.history.past, { nodes: state.nodes, edges: state.edges }],
        future: newFuture
      }
    }));
  }
})); 