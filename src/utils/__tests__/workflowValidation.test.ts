import { validateWorkflow, validateNode } from '../workflowValidation';
import { Node, Edge } from 'reactflow';
import { WorkflowNodeData, ContentNodeData } from '@/types/workflowTypes';

describe('validateWorkflow', () => {
  it('should detect missing start node', () => {
    const nodes: Node<WorkflowNodeData>[] = [
      {
        id: '1',
        type: 'article',
        position: { x: 0, y: 0 },
        data: { title: 'Test Article' }
      }
    ];
    const edges: Edge[] = [];

    const result = validateWorkflow(nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        message: 'Workflow must have a start node',
        severity: 'error'
      })
    );
  });

  it('should detect orphaned nodes', () => {
    const nodes: Node<WorkflowNodeData>[] = [
      {
        id: 'start',
        type: 'start',
        position: { x: 0, y: 0 },
        data: {}
      },
      {
        id: 'orphaned',
        type: 'article',
        position: { x: 100, y: 0 },
        data: { title: 'Orphaned Article' }
      }
    ];
    const edges: Edge[] = [];

    const result = validateWorkflow(nodes, edges);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        nodeId: 'orphaned',
        severity: 'warning'
      })
    );
  });

  it('should detect circular dependencies', () => {
    const nodes: Node<WorkflowNodeData>[] = [
      {
        id: 'start',
        type: 'start',
        position: { x: 0, y: 0 },
        data: {}
      },
      {
        id: '1',
        type: 'article',
        position: { x: 100, y: 0 },
        data: { title: 'Article 1' }
      },
      {
        id: '2',
        type: 'article',
        position: { x: 200, y: 0 },
        data: { title: 'Article 2' }
      }
    ];
    const edges: Edge[] = [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '2', target: '1' }
    ];

    const result = validateWorkflow(nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        message: 'Circular dependency detected',
        severity: 'error'
      })
    );
  });
});

describe('validateNode', () => {
  it('should validate content node requirements', () => {
    const node: Node<WorkflowNodeData> = {
      id: '1',
      type: 'article',
      position: { x: 0, y: 0 },
      data: {} as ContentNodeData
    };

    const errors = validateNode(node);
    expect(errors).toContainEqual(
      expect.objectContaining({
        message: 'Title is required',
        severity: 'error'
      })
    );
    expect(errors).toContainEqual(
      expect.objectContaining({
        message: 'URL is required',
        severity: 'warning'
      })
    );
  });

  it('should pass validation for valid content node', () => {
    const node: Node<WorkflowNodeData> = {
      id: '1',
      type: 'article',
      position: { x: 0, y: 0 },
      data: {
        title: 'Test Article',
        url: 'https://example.com'
      } as ContentNodeData
    };

    const errors = validateNode(node);
    expect(errors).toHaveLength(0);
  });
}); 