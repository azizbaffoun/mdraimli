import { useCallback } from 'react';
import { useWorkflowStore } from '../store/workflowStore';

interface UndoRedoState {
  past: { nodes: any[]; edges: any[] }[];
  future: { nodes: any[]; edges: any[] }[];
}

const undoRedoState: UndoRedoState = {
  past: [],
  future: [],
};

export const useUndoRedo = () => {
  const { nodes, edges, setNodes, setEdges } = useWorkflowStore();

  const handleUndo = useCallback(() => {
    const previous = undoRedoState.past[undoRedoState.past.length - 1];
    if (previous) {
      undoRedoState.past.pop();
      undoRedoState.future.push({ nodes, edges });
      setNodes(previous.nodes);
      setEdges(previous.edges);
    }
  }, [nodes, edges, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    const next = undoRedoState.future[undoRedoState.future.length - 1];
    if (next) {
      undoRedoState.future.pop();
      undoRedoState.past.push({ nodes, edges });
      setNodes(next.nodes);
      setEdges(next.edges);
    }
  }, [nodes, edges, setNodes, setEdges]);

  return { handleUndo, handleRedo };
}; 