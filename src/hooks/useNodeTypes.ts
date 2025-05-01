import { useCallback } from 'react';

interface NodeType {
  type: string;
  label: string;
  description: string;
  icon: string;
}

const nodeTypes: NodeType[] = [
  {
    type: 'contentType',
    label: 'Content Type',
    description: 'A node representing a content type',
    icon: '📄',
  },
  {
    type: 'note',
    label: 'Note',
    description: 'A node for adding notes',
    icon: '📝',
  },
  // Add more node types as needed
];

export const useNodeTypes = () => {
  const getNodeTypes = useCallback(() => nodeTypes, []);

  return { getNodeTypes };
}; 