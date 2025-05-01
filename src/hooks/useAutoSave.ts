import { useEffect } from 'react';
import { useWorkflowStore } from '../store/workflowStore';

const AUTOSAVE_INTERVAL = 30000; // 30 seconds

export const useAutoSave = () => {
  const { nodes, edges } = useWorkflowStore();

  useEffect(() => {
    const saveToLocalStorage = () => {
      try {
        localStorage.setItem('workflow-nodes', JSON.stringify(nodes));
        localStorage.setItem('workflow-edges', JSON.stringify(edges));
      } catch (error) {
        console.error('Error saving workflow state:', error);
      }
    };

    const intervalId = setInterval(saveToLocalStorage, AUTOSAVE_INTERVAL);
    return () => clearInterval(intervalId);
  }, [nodes, edges]);
}; 