import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Position,
  Connection,
  ReactFlowProvider,
  ReactFlowInstance,
  NodeProps,
  ConnectionMode,
  OnConnect,
  XYPosition,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
  NodeChange,
  getOutgoers,
  getIncomers,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

// Import Node Components using alias
import StartNode from '@/components/StartNode';
import TopicalKeywordNode from '@/components/TopicalKeywordNode';
import ArticleNode from '@/components/ArticleNode';
import VideoNode from '@/components/VideoNode';
import PodcastNode from '@/components/PodcastNode';
import SocialMediaNode from '@/components/SocialMediaNode';

// Import ItemsBar
import ItemsBar from '@/components/ItemsBar';

// Import Info Panel
import WorkflowInfoPanel from '@/components/WorkflowInfoPanel';

// Import Custom Edge and its types definition
import CustomEdge, { edgeTypes } from '@/components/CustomEdge';

// Define ContentType again for use here
export type ContentType = 'article' | 'video' | 'podcast' | 'socialMedia';

// Re-add interfaces for node data to include animation flags
interface BaseNodeData {
  isEntering?: boolean;
  isExiting?: boolean;
}

interface StartNodeData extends BaseNodeData {
  onInitiateWorkflow: (type: string) => void; 
}

interface TopicalKeywordNodeData extends BaseNodeData {
  onAddChildNode: (parentId: string, childType: ContentType) => void; 
}

interface ContentNodeData extends BaseNodeData {
  canAddChild?: boolean; // Flag to control child creation
}

// Define nodeTypes map
const nodeTypes = {
  start: StartNode,
  topicalKeyword: TopicalKeywordNode,
  article: ArticleNode,
  video: VideoNode,
  podcast: PodcastNode,
  socialMedia: SocialMediaNode,
};

const initialNodeId = 'start-node'; // Consistent ID for the initial node

// Main logic component
const WorkflowEditorContent: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<BaseNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { getNode, getNodes, getEdges } = useReactFlow();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [isInfoPanelExiting, setIsInfoPanelExiting] = useState(false);

  const onNodesChangeHandler: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      changes.forEach((change) => {
        if (change.type === 'select') {
          setSelectedNodeId(change.selected ? change.id : null);
        }
      });
    },
    [setNodes]
  );

  const onEdgesChangeHandler: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  // Function to organize the layout
  const organizeLayout = useCallback(() => {
    console.log("Organizing layout...");
    const allNodes = getNodes(); // Use hook to get current nodes
    const allEdges = getEdges(); // Get edges too

    const topicalKeywordNode = allNodes.find(n => n.type === 'topicalKeyword');
    if (!topicalKeywordNode) {
      console.warn("Cannot organize layout: Topical Keyword node not found.");
      return;
    }

    // --- Layout Constants ---
    const nodeWidth = 128;
    const nodeHeight = 128;
    const horizontalGap = 120;
    const verticalGap = 50; // Gap between rows
    const rootX = 100; // X position for the root node
    const firstColX = rootX + nodeWidth + horizontalGap; // X position for the first node in each row

    // --- Build Row Structure --- 
    const rows: Node[][] = []; // Array to hold nodes for each row
    const processedNodes = new Set<string>();
    processedNodes.add(topicalKeywordNode.id); // Mark root as processed

    const directChildren = getOutgoers(topicalKeywordNode, allNodes, allEdges);

    directChildren.forEach(rowStartNode => {
        if (processedNodes.has(rowStartNode.id)) return; 
        const currentRow: Node[] = [];
        let currentNode: Node | undefined = rowStartNode;
        
        while(currentNode) {
            if (processedNodes.has(currentNode.id)) break; // Avoid cycles / already processed
            currentRow.push(currentNode);
            processedNodes.add(currentNode.id);
            // Find the next node in the sequence *within this potential row*
            const children: Node[] = getOutgoers(currentNode, allNodes, allEdges);
            currentNode = children.find((n: Node) => !processedNodes.has(n.id)); 
        }
        if (currentRow.length > 0) {
            rows.push(currentRow);
        }
    });

    // --- Calculate Positions --- 
    const numRows = rows.length;
    const totalLayoutHeight = numRows * nodeHeight + Math.max(0, numRows - 1) * verticalGap;
    const startY = 100; // Starting Y coordinate for the layout block
    const rootY = startY + totalLayoutHeight / 2 - nodeHeight / 2; // Center the root vertically

    const layoutNodes: Node[] = [];

    // Position root
    layoutNodes.push({ ...topicalKeywordNode, position: { x: rootX, y: rootY } });

    // Position rows and columns
    rows.forEach((row, rowIndex) => {
        const currentRowY = startY + rowIndex * (nodeHeight + verticalGap);
        row.forEach((node: Node, colIndex: number) => {
            const nodeX = firstColX + colIndex * (nodeWidth + horizontalGap);
            layoutNodes.push({ ...node, position: { x: nodeX, y: currentRowY } });
        });
    });

    // Add back any nodes not part of the main layout (e.g., StartNode if still present)
    allNodes.forEach((node: Node) => {
        if (!processedNodes.has(node.id)) {
            layoutNodes.push(node); // Keep original position
        }
    });

    console.log("Applying full layout:", layoutNodes);
    setNodes(layoutNodes); // Apply the updated positions

  }, [getNodes, getEdges, setNodes]);

  // Callback for adding child nodes (passed to TopicalKeywordNode or Content Nodes)
  const onAddChildNode = useCallback((parentId: string, childTypeOrNext: ContentType | 'next') => {
    const parentNode = getNode(parentId);
    if (!parentNode) return;

    // Rule: Check if parent (non-TopicalKeyword) can add more children
    if (parentNode.type !== 'topicalKeyword' && parentNode.data?.canAddChild === false) {
        console.log(`[Workflow Rule] Node ${parentId} (${parentNode.type}) cannot add more children.`);
        return;
    }

    let requestedChildType: ContentType;
    let nextNodeTypeAfterChild: ContentType | null = null; 

    // --- Determine requested child type and the type that would come *after* it ---
    if (childTypeOrNext === 'next') {
      // Determine strictly next node based on parent type
      switch (parentNode.type) {
        case 'article': requestedChildType = 'video'; nextNodeTypeAfterChild = 'podcast'; break;
        case 'video': requestedChildType = 'podcast'; nextNodeTypeAfterChild = 'socialMedia'; break;
        case 'podcast': requestedChildType = 'socialMedia'; nextNodeTypeAfterChild = null; break; 
        default: 
          console.error('[onAddChildNode - next] Invalid parent type for sequential add:', parentNode.type);
          return;
      }
    } else {
      // Specific type requested (from TopicalKeyword or ItemsBar)
      requestedChildType = childTypeOrNext;
      switch (requestedChildType) {
        case 'article': nextNodeTypeAfterChild = 'video'; break;
        case 'video': nextNodeTypeAfterChild = 'podcast'; break;
        case 'podcast': nextNodeTypeAfterChild = 'socialMedia'; break;
        case 'socialMedia': nextNodeTypeAfterChild = null; break; 
      }
    }

    // --- Apply Workflow Rules --- 
    // Rule: Cannot create Social Media directly from Topical Keyword
    if (parentNode.type === 'topicalKeyword' && requestedChildType === 'socialMedia') {
        console.log('[Workflow Rule] Social Media cannot be created directly from Topical Keyword.');
        // TODO: Consider showing a user-facing message (e.g., toast notification)
        return;
    }

    // Keep rules preventing adding from Social Media and duplicates

    // Prevent adding children from social media node 
    if (parentNode.type === 'socialMedia') {
        console.log('[Workflow Rule] Cannot add children to Social Media node.');
        return;
    }

    // Rule: Prevent duplicate direct connections *unless* parent is Topical Keyword
    if (parentNode.type !== 'topicalKeyword') {
        const childExists = edges.some(edge => 
            (edge.source === parentId && nodes.find(n => n.id === edge.target)?.type === requestedChildType) ||
            (edge.target === parentId && nodes.find(n => n.id === edge.source)?.type === requestedChildType)
        );
        if (childExists) {
            console.log(`[Workflow Rule] Node of type ${requestedChildType} already exists directly connected to ${parentId}.`);
            return;
        }
    }

    // Hide info panel after first node is added from Topical Keyword
    if (parentNode?.type === 'topicalKeyword') {
        // Start exit animation if panel is currently shown
        if (showInfoPanel) {
            setIsInfoPanelExiting(true);
        }
    }

    // --- Create Node and Edge --- 
    const childNodeId = `${requestedChildType}-${uuidv4()}`;

    // Calculate position based on parent type
    let newNodePosition: XYPosition;
    const horizontalOffset = (parentNode.width ?? 128) + 120;
    const verticalOffset = (parentNode.height ?? 128) + 50; // Spacing between rows

    if (parentNode.type === 'topicalKeyword') {
        // Calculate how many direct children this TopicalKeyword node already has
        const directChildrenCount = edges.filter(e => e.source === parentId).length;
        newNodePosition = {
            x: parentNode.position.x + horizontalOffset, 
            y: parentNode.position.y + (directChildrenCount * verticalOffset) // Stack vertically
        };
    } else {
        // Content node: Add sequentially to the right
        newNodePosition = {
            x: parentNode.position.x + horizontalOffset,
            y: parentNode.position.y, // Keep same row
        };
    }

    const childNode: Node<ContentNodeData> = {
        id: childNodeId,
        type: requestedChildType,
        position: newNodePosition,
        width: 128, 
        height: 128, 
        selectable: requestedChildType !== 'socialMedia',
        data: { 
            isEntering: true,
            canAddChild: requestedChildType !== 'socialMedia',
        },
    };
    const newEdge: Edge = {
        id: `e-${parentId}-${childNodeId}`,
        source: parentId,
        target: childNodeId,
        sourceHandle: 'right-source', 
        targetHandle: 'left-target',  
        type: 'customGradientEdge',
        data: {}, 
    };

    setNodes((nds) => nds.concat(childNode));
    setEdges((eds) => addEdge(newEdge, eds));
    
    // If the parent wasn't Topical Keyword, mark it as unable to add more children
    if (parentNode.type !== 'topicalKeyword') {
        setNodes((nds) => 
            nds.map(node => 
                node.id === parentId 
                    ? { ...node, data: { ...node.data, canAddChild: false } } 
                    : node
            )
        );
    }
  }, [getNode, setNodes, setEdges, nodes, edges, showInfoPanel, setIsInfoPanelExiting]); // Updated dependencies

  // Effect to hide panel after exit animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isInfoPanelExiting) {
      // Wait for animation duration (300ms) then hide
      timer = setTimeout(() => {
        setShowInfoPanel(false);
      }, 300); 
    }
    return () => clearTimeout(timer); // Cleanup timer
  }, [isInfoPanelExiting, setShowInfoPanel]);

  // Callback for StartNode to initiate the workflow
  const handleInitiateWorkflow = useCallback((type: string) => {
    setShowInfoPanel(true);
    setIsInfoPanelExiting(false); // Reset exit state too
    if (type !== 'topical') {
      console.log(`Workflow type "${type}" initiation not implemented yet.`);
      return;
    }
    const startNode = getNode(initialNodeId);
    if (!startNode) return;

    const position = startNode.position; 
    const newNodeId = 'tk-' + uuidv4();

    const topicalKeywordNode: Node<TopicalKeywordNodeData> = {
      id: newNodeId,
      type: 'topicalKeyword',
      position: position, 
      data: {
        isEntering: true, 
        onAddChildNode: (childType: string) => { 
            onAddChildNode(newNodeId, childType as ContentType);
        },
      },
    };

    // Set fade-out animation directly on the StartNode data
    setNodes((nds) => 
        nds.map(n => n.id === initialNodeId ? { ...n, data: { ...n.data, isExiting: true } } : n)
    );
    // Add new node shortly after animation starts
    setTimeout(() => {
      setNodes((nds) => nds.concat(topicalKeywordNode));
    }, 10); 
    // Remove old node after animation duration
    setTimeout(() => {
        setNodes((nds) => nds.filter((node) => node.id !== initialNodeId));
    }, 150); // Ensure this matches node-fade-scale-out duration

  }, [getNode, setNodes, setEdges, onAddChildNode, setShowInfoPanel, setIsInfoPanelExiting]); // Updated dependencies

  // Effect to set the initial StartNode
  useEffect(() => {
    if (nodes.length === 0 && reactFlowWrapper.current) { 
      const centerX = reactFlowWrapper.current.clientWidth / 2 - 64; 
      const centerY = reactFlowWrapper.current.clientHeight / 2 - 64;
      const initialNode: Node<StartNodeData> = {
        id: initialNodeId,
        type: 'start',
        position: { x: centerX, y: centerY },
        data: { onInitiateWorkflow: handleInitiateWorkflow }, 
      };
      setNodes([initialNode]);
    }
  }, [nodes, setNodes, handleInitiateWorkflow]);

  // Determine ItemsBar visibility
  const isItemsBarVisible = !nodes.some(node => node.id === initialNodeId);
  const isNodeSelected = !!selectedNodeId;

  return (
    <>
      {showInfoPanel && <WorkflowInfoPanel isExiting={isInfoPanelExiting} />} {/* Pass exiting state */}
      <div ref={reactFlowWrapper} className="w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeHandler}
          onEdgesChange={onEdgesChangeHandler}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes} // Register custom edge types
          defaultEdgeOptions={{ type: 'customGradientEdge' }} // Set default edge type
          connectionMode={ConnectionMode.Loose}
          fitView 
          fitViewOptions={{ padding: 2.0 }}
          nodesConnectable={false}
          nodesDraggable={true}
          selectNodesOnDrag={false}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      {/* Render ItemsBar outside the ReactFlow container */}
      {nodes.length > 0 && <ItemsBar 
        isVisible={isItemsBarVisible} 
        isNodeSelected={isNodeSelected} 
        selectedNodeId={selectedNodeId}
        onIconClick={onAddChildNode}
        onOrganizeLayout={organizeLayout}
      />}
    </>
  );
};

// Main wrapper component for the editor
const WorkflowEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <WorkflowEditorContent />
    </ReactFlowProvider>
  );
};

export default WorkflowEditor; 