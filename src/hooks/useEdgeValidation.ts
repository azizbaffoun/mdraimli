import { useCallback } from 'react';
import { Connection } from 'reactflow';
import { useWorkflowStore } from '../store/workflowStore';

export const useEdgeValidation = () => {
  const { nodes, edges } = useWorkflowStore();

  const validateConnection = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) {
        return false;
      }

      // Prevent self-connections
      if (connection.source === connection.target) {
        return false;
      }

      // Prevent duplicate connections
      const isDuplicate = edges.some(
        (edge) =>
          (edge.source === connection.source && edge.target === connection.target) ||
          (edge.source === connection.target && edge.target === connection.source)
      );

      if (isDuplicate) {
        return false;
      }

      // Get source and target nodes
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (!sourceNode || !targetNode) {
        return false;
      }

      // Add any additional validation rules here
      // For example, you might want to prevent certain node types from connecting

      return true;
    },
    [nodes, edges]
  );

  return { validateConnection };
}; 