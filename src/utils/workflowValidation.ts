import { Node, Edge } from 'reactflow';
import { 
  WorkflowNodeData, 
  WorkflowValidationResult, 
  WorkflowValidationError,
  ContentNodeData
} from '@/types/workflowTypes';

export function validateWorkflow(
  nodes: Node<WorkflowNodeData>[], 
  edges: Edge[]
): WorkflowValidationResult {
  const errors: WorkflowValidationError[] = [];

  // Check for start node
  const startNode = nodes.find(node => node.type === 'start');
  if (!startNode) {
    errors.push({
      message: 'Workflow must have a start node',
      severity: 'error'
    });
  }

  // Check for orphaned nodes (no connections)
  nodes.forEach(node => {
    if (node.type !== 'start' && !edges.some(edge => 
      edge.source === node.id || edge.target === node.id
    )) {
      errors.push({
        nodeId: node.id,
        message: `Node "${node.id}" is not connected to any other node`,
        severity: 'warning'
      });
    }
  });

  // Validate content nodes
  nodes.forEach(node => {
    if (['article', 'video', 'podcast', 'socialMedia'].includes(node.type || '')) {
      const data = node.data as ContentNodeData;
      if (!data.title?.trim()) {
        errors.push({
          nodeId: node.id,
          message: `${node.type} node "${node.id}" is missing a title`,
          severity: 'error'
        });
      }
    }
  });

  // Check for circular dependencies
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        if (hasCycle(edge.target)) {
          errors.push({
            edgeId: edge.id,
            message: 'Circular dependency detected',
            severity: 'error'
          });
          return true;
        }
      } else if (recursionStack.has(edge.target)) {
        errors.push({
          edgeId: edge.id,
          message: 'Circular dependency detected',
          severity: 'error'
        });
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  // Start cycle detection from each unvisited node
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      hasCycle(node.id);
    }
  });

  return {
    isValid: errors.filter(error => error.severity === 'error').length === 0,
    errors
  };
}

export function validateNode(node: Node<WorkflowNodeData>): WorkflowValidationError[] {
  const errors: WorkflowValidationError[] = [];

  switch (node.type) {
    case 'article':
    case 'video':
    case 'podcast':
    case 'socialMedia':
      const contentData = node.data as ContentNodeData;
      if (!contentData.title?.trim()) {
        errors.push({
          nodeId: node.id,
          message: 'Title is required',
          severity: 'error'
        });
      }
      if (!contentData.url?.trim()) {
        errors.push({
          nodeId: node.id,
          message: 'URL is required',
          severity: 'warning'
        });
      }
      break;
  }

  return errors;
} 