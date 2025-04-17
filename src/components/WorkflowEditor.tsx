import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  ReactFlowProvider,
  ConnectionMode,
  XYPosition,
  useReactFlow,

  OnNodesChange,
  OnEdgesChange,
  getOutgoers,
  Connection,
  ReactFlowInstance,
  Viewport
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

// Import Node Components
import StartNode from '@/components/StartNode';
import TopicalKeywordNode from '@/components/TopicalKeywordNode';
import ArticleNode from '@/components/ArticleNode';
import VideoNode from '@/components/VideoNode';
import PodcastNode from '@/components/PodcastNode';
import SocialMediaNode from '@/components/SocialMediaNode';
import NoteNode from '@/components/NoteNode';

// Import ItemsBar
import ItemsBar from '@/components/ItemsBar';

// Import Info Panel
import WorkflowInfoPanel from '@/components/WorkflowInfoPanel';

// Import Custom Edge types
import { edgeTypes as customEdgeTypesImport } from '@/components/CustomEdge';

// Import ZoomControl
import ZoomControl from './ZoomControl';

// --- Define Types and Constants OUTSIDE the component --- 

// Extend the global Window interface to include passData AND loadDataIntoReact
declare global {
  interface Window {
    passData?: (data: string) => void;
    loadDataIntoReact?: (workflowData: WorkflowData) => void;
  }
}

// --- Add WorkflowData Interface ---
interface WorkflowData {
  nodes: Node[]; // Uses the imported Node type
  edges: Edge[]; // Uses the imported Edge type
  viewport?: Viewport; // Optional viewport
}
// --- End WorkflowData Interface ---

export type ContentType = 'article' | 'video' | 'podcast' | 'socialMedia';

interface BaseNodeData {
  isEntering?: boolean; 
  isExiting?: boolean;
}
interface StartNodeData extends BaseNodeData {
  onInitiateWorkflow: (type: string) => void;
}
interface TopicalKeywordNodeData extends BaseNodeData {
  onAddChildNode: (parentId: string, childType: ContentType) => void; 
  isRightConnected?: boolean;
}
interface ContentNodeData extends BaseNodeData {
  canAddChild?: boolean; 
  onAddChildNode?: (parentId: string, childType: ContentType) => void; 
  isLeftConnected?: boolean;
  isRightConnected?: boolean;
}
interface NoteNodeFlowData extends BaseNodeData { 
  title?: string;
  content?: string;
}
type WorkflowNodeData = StartNodeData | TopicalKeywordNodeData | ContentNodeData | NoteNodeFlowData;

// Define nodeTypes map OUTSIDE the component
const nodeTypes = {
  start: StartNode,
  topicalKeyword: TopicalKeywordNode,
  article: ArticleNode,
  video: VideoNode,
  podcast: PodcastNode,
  socialMedia: SocialMediaNode,
  note: NoteNode, 
};

// Define edgeTypes OUTSIDE the component
const edgeTypes = {
  ...customEdgeTypesImport, // Rely on the spread from CustomEdge.tsx
};

const initialNodeId = 'start-node';
// --- End Definitions OUTSIDE the component --- 

const WorkflowEditorContent: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { getNode, getNodes, getEdges, project, setViewport, zoomIn, zoomOut } = useReactFlow();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [isInfoPanelExiting, setIsInfoPanelExiting] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  // Add state for undo/redo history
  const [history, setHistory] = useState<{nodes: Node[]; edges: Edge[]}[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  
  // We need to use refs to store the function references to avoid circular dependencies
  const onAddChildNodeRef = useRef<Function | null>(null);
  const handleInitiateWorkflowRef = useRef<Function | null>(null);
  
  // Record history function
  const recordHistory = useCallback((nodes: Node[], edges: Edge[]) => {
    setHistory(prev => {
      // If we're not at the end of the history, remove future states
      const newHistory = prev.slice(0, currentHistoryIndex + 1);
      // Add new state
      return [...newHistory, {nodes: [...nodes], edges: [...edges]}];
    });
    setCurrentHistoryIndex(prev => prev + 1);
  }, [currentHistoryIndex]);

  // Handle undo
  const handleUndo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const previousState = history[currentHistoryIndex - 1];
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      setCurrentHistoryIndex(prev => prev - 1);
    }
  }, [currentHistoryIndex, history, setNodes, setEdges]);

  // Handle redo
  const handleRedo = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      const nextState = history[currentHistoryIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setCurrentHistoryIndex(prev => prev + 1);
    }
  }, [currentHistoryIndex, history, setNodes, setEdges]);

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        if (event.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleUndo, handleRedo]);

  // Custom nodes change handler that records history
  const onNodesChangeHandler: OnNodesChange = useCallback(
    (changes) => {
      // Only record history for non-selection changes
      if (changes.some(change => change.type !== 'select')) {
        const currentNodes = getNodes();
        const currentEdges = getEdges();
        onNodesChange(changes);
        recordHistory(currentNodes, currentEdges);
      } else {
        onNodesChange(changes);
      }
      
      changes.forEach((change) => {
        if (change.type === 'select') {
          setSelectedNodeId(change.selected ? change.id : null);
        }
      });
    },
    [onNodesChange, recordHistory, getNodes, getEdges]
  );

  // Custom edges change handler that records history
  const onEdgesChangeHandler: OnEdgesChange = useCallback(
    (changes) => {
      const currentNodes = getNodes();
      const currentEdges = getEdges();
      onEdgesChange(changes);
      recordHistory(currentNodes, currentEdges);
    },
    [onEdgesChange, recordHistory, getNodes, getEdges]
  );

  // Add Note function creates a React Flow node
  const handleAddNote = useCallback(() => {
    if (!reactFlowWrapper.current) return;
    
    // Record current state before adding a note
    const currentNodes = getNodes();
    const currentEdges = getEdges();
    
    // Count existing notes to calculate offset
    const existingNoteCount = currentNodes.filter(n => n.type === 'note').length;
    const yOffset = existingNoteCount * 40; // Offset each new note vertically

    const position = project({
      x: 50, // Keep X offset relatively fixed 
      y: 50 + yOffset, // Add vertical offset based on note count
    });

    const newNoteId = `note-${uuidv4()}`;
    const newNode: Node<NoteNodeFlowData> = { 
      id: newNoteId,
      type: 'note',
      position,
      data: { 
        title: "New Note", 
        content: "",
      },
      width: 295, 
      height: 235,
      dragHandle: `#note-header-${newNoteId}`, 
    };

    // Create a new state that includes the new node
    const newNodes = [...currentNodes, newNode];
    
    // Update the state
    setNodes(newNodes);
    
    // Record the state change as a single history entry
    recordHistory(currentNodes, currentEdges);
  }, [project, setNodes, getNodes, getEdges, recordHistory]);

  // organizeLayout function
  const organizeLayout = useCallback(() => {
    console.log("Organizing layout...");
    
    // Record current state before organizing layout
    recordHistory(getNodes(), getEdges());
    
    const allNodes = getNodes();
    const allEdges = getEdges();
    const layoutableNodes = allNodes.filter(n => n.type !== 'note');
    const noteNodes = allNodes.filter(n => n.type === 'note');
    const topicalKeywordNode = layoutableNodes.find(n => n.type === 'topicalKeyword');
    if (!topicalKeywordNode) {
      console.warn("Cannot organize layout: Topical Keyword node not found.");
      return;
    }
    const nodeWidth = 128;
    const nodeHeight = 128;
    const horizontalGap = 120;
    const verticalGap = 50; 
    const rootX = 100;
    const firstColX = rootX + nodeWidth + horizontalGap;
    const rows: Node[][] = [];
    const processedNodes = new Set<string>();
    processedNodes.add(topicalKeywordNode.id);
    const directChildren = getOutgoers(topicalKeywordNode, layoutableNodes, allEdges);
    directChildren.forEach(rowStartNode => {
        if (processedNodes.has(rowStartNode.id)) return; 
        const currentRow: Node[] = [];
        let currentNode: Node | undefined = rowStartNode;
        while(currentNode) {
            if (processedNodes.has(currentNode.id)) break;
            currentRow.push(currentNode);
            processedNodes.add(currentNode.id);
            const children: Node[] = getOutgoers(currentNode, layoutableNodes, allEdges);
            currentNode = children.find((n: Node) => !processedNodes.has(n.id)); 
        }
        if (currentRow.length > 0) {
            rows.push(currentRow);
        }
    });
    const numRows = rows.length;
    const totalLayoutHeight = numRows * nodeHeight + Math.max(0, numRows - 1) * verticalGap;
    const startY = 100; 
    const rootY = startY + totalLayoutHeight / 2 - nodeHeight / 2;
    const finalNodes: Node[] = [];
    finalNodes.push({ ...topicalKeywordNode, position: { x: rootX, y: rootY } });
    rows.forEach((row, rowIndex) => {
        const currentRowY = startY + rowIndex * (nodeHeight + verticalGap);
        row.forEach((node: Node, colIndex: number) => {
            const nodeX = firstColX + colIndex * (nodeWidth + horizontalGap);
            finalNodes.push({ ...node, position: { x: nodeX, y: currentRowY } });
        });
    });
    layoutableNodes.forEach((node: Node) => {
        if (!processedNodes.has(node.id)) {
            finalNodes.push(node); 
        }
    });
    finalNodes.push(...noteNodes);
    console.log("Applying full layout:", finalNodes);
    setNodes(finalNodes);

  }, [getNodes, getEdges, setNodes, recordHistory]);

  // onAddChildNode function 
  const onAddChildNode = useCallback((parentId: string, childTypeOrNext: ContentType | 'next') => {
    // Record current state before adding a child node
    recordHistory(getNodes(), getEdges());
    
    const parentNode = getNode(parentId);
    if (!parentNode || parentNode.type === 'note') return; 
    if (parentNode.type !== 'topicalKeyword' && parentNode.data?.canAddChild === false) {
        console.log(`[Workflow Rule] Node ${parentId} (${parentNode.type}) cannot add more children.`);
        return;
    }
    let requestedChildType: ContentType;
    if (childTypeOrNext === 'next') {
      switch (parentNode.type) {
        case 'article': requestedChildType = 'video'; break;
        case 'video': requestedChildType = 'podcast'; break;
        case 'podcast': requestedChildType = 'socialMedia'; break; 
        default: 
          console.error('[onAddChildNode - next] Invalid parent type for sequential add:', parentNode.type);
          return;
      }
    } else {
      requestedChildType = childTypeOrNext;
    }
    
    // Comment out the check preventing Social Media node creation from Topical Keyword
    /*
    if (parentNode.type === 'topicalKeyword' && requestedChildType === 'socialMedia') {
        console.log('[Workflow Rule] Social Media cannot be created directly from Topical Keyword.');
        return;
    }
    */

    if (parentNode.type === 'socialMedia') {
        console.log('[Workflow Rule] Cannot add children to Social Media node.');
        return;
    }
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
    if (parentNode?.type === 'topicalKeyword') {
        if (showInfoPanel) {
            setIsInfoPanelExiting(true);
        }
    }
    const childNodeId = `${requestedChildType}-${uuidv4()}`;
    let newNodePosition: XYPosition;
    const horizontalOffset = (parentNode.width ?? 128) + 120;
    const verticalOffset = (parentNode.height ?? 128) + 50;
    if (parentNode.type === 'topicalKeyword') {
        const directChildrenCount = edges.filter(e => e.source === parentId).length;
        newNodePosition = {
            x: parentNode.position.x + horizontalOffset, 
            y: parentNode.position.y + (directChildrenCount * verticalOffset)
        };
    } else {
        newNodePosition = {
            x: parentNode.position.x + horizontalOffset,
            y: parentNode.position.y,
        };
    }
    const childNode: Node<ContentNodeData> = {
        id: childNodeId,
        type: requestedChildType,
        position: newNodePosition,
        width: 128, 
        height: 128, 
        selectable: true,
        data: { 
            isEntering: true,
            canAddChild: requestedChildType !== 'socialMedia',
            onAddChildNode: (parentId: string, childType: ContentType) => {
              onAddChildNode(parentId, childType);
            },
            ...(requestedChildType === 'video' && { isLeftConnected: true, isRightConnected: false })
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
    if (parentNode.type !== 'topicalKeyword') {
        setNodes((nds) => 
            nds.map(node => 
                node.id === parentId 
                    ? { ...node, data: { ...node.data, canAddChild: false } } 
                    : node
            )
        );
    }
  }, [getNode, getNodes, getEdges, nodes, edges, setNodes, setEdges, showInfoPanel, setIsInfoPanelExiting, recordHistory]);

  // Store the latest version of onAddChildNode in the ref
  useEffect(() => {
    onAddChildNodeRef.current = onAddChildNode;
  }, [onAddChildNode]);

  // Add onConnect handler
  const onConnect = useCallback((connection: Connection) => {
    // Record current state before adding connection
    recordHistory(getNodes(), getEdges());
    
    setEdges((eds) => addEdge({
      ...connection,
      type: 'customGradientEdge'
    }, eds));
  }, [setEdges, recordHistory, getNodes, getEdges]);

  // ... useEffect for hiding info panel ...
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isInfoPanelExiting) {
      timer = setTimeout(() => {
        setShowInfoPanel(false);
      }, 300); 
    }
    return () => clearTimeout(timer);
  }, [isInfoPanelExiting, setShowInfoPanel]);

  // handleInitiateWorkflow function
  const handleInitiateWorkflow = useCallback((type: string) => {
    // Record current state before initiating workflow
    recordHistory(getNodes(), getEdges());
    
    setShowInfoPanel(true);
    setIsInfoPanelExiting(false);
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
        isRightConnected: false,
        onAddChildNode: (parentId: string, childType: ContentType) => { 
            onAddChildNode(parentId, childType); 
        },
      },
    };
    setNodes((nds) => 
        nds.map(n => n.id === initialNodeId ? { ...n, data: { ...n.data, isExiting: true } } : n)
    );
    setTimeout(() => {
      setNodes((nds) => nds.concat(topicalKeywordNode));
    }, 10); 
    setTimeout(() => {
        setNodes((nds) => nds.filter((node) => node.id !== initialNodeId));
    }, 150);

  }, [getNode, setNodes, getEdges, onAddChildNode, setShowInfoPanel, setIsInfoPanelExiting, recordHistory, getNodes]);

  // Store the latest version of handleInitiateWorkflow in the ref
  useEffect(() => {
    handleInitiateWorkflowRef.current = handleInitiateWorkflow;
  }, [handleInitiateWorkflow]);

  // useEffect for initial StartNode
  useEffect(() => {
    if (nodes.length === 0 && reactFlowWrapper.current) { 
      const centerX = reactFlowWrapper.current.clientWidth / 2 - 64; 
      const centerY = reactFlowWrapper.current.clientHeight / 2 - 64;
      const initialNode: Node<StartNodeData> = {
        id: initialNodeId,
        type: 'start',
        position: { x: centerX, y: centerY },
        // Pass the actual function for the data prop
        data: { onInitiateWorkflow: handleInitiateWorkflow }, 
      };
      setNodes([initialNode]);
    }
  }, [nodes, setNodes, handleInitiateWorkflow]);

  // Set initial nodes and edges on mount
  useEffect(() => {
    // Define initial nodes here, including the StartNode
    const initialNodes: Node<WorkflowNodeData>[] = [
      {
        id: initialNodeId,
        type: 'start',
        position: { x: 100, y: 100 },
        data: {
          onInitiateWorkflow: handleInitiateWorkflow,
        },
      },
    ];

    // Restore function references - MUST be done AFTER setting initial nodes
    const restoredNodes = initialNodes.map(node => {
      if (node.type === 'start') {
        return {
          ...node,
          data: {
            ...node.data,
            onInitiateWorkflow: (type: string) => {
              if (handleInitiateWorkflowRef.current) {
                (handleInitiateWorkflowRef.current as Function)(type);
              }
            }
          }
        };
      }
      return node;
    });
    
    setNodes(restoredNodes as Node<WorkflowNodeData>[]);
    setEdges([]); // Start with no edges initially
    // Don't record initial state in history
  }, [setNodes, setEdges]);

  // Update refs for functions when they change
  useEffect(() => {
    onAddChildNodeRef.current = onAddChildNode;
  }, [onAddChildNode]);
  
  useEffect(() => {
    handleInitiateWorkflowRef.current = handleInitiateWorkflow;
  }, [handleInitiateWorkflow]);
  
  // Callback to handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    // Close info panel on node click
    if (showInfoPanel) {
      setIsInfoPanelExiting(true);
      setTimeout(() => setShowInfoPanel(false), 300); // Match animation duration
    }
  }, [showInfoPanel]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    // Potentially show info panel again when clicking the background?
    // Or keep it closed until explicitly opened. For now, keep it closed.
  }, []);

  // --- Save Workflow Logic ---
  const saveWorkflow = useCallback(() => {
    if (!reactFlowInstance) {
      console.error("ReactFlow instance not available for saving.");
      return;
    }

    // 1. Generate the workflow state JSON
    const flowState = reactFlowInstance.toObject(); 
    // Note: toObject() conveniently gives nodes, edges, and viewport

    // 2. Serialize the JSON (compact)
    const jsonString = JSON.stringify(flowState); 

    // 3. Call the global function defined in the HTML
    if (window.passData && typeof window.passData === 'function') {
      window.passData(jsonString);
      console.log("Workflow data passed to window.passData");
    } else {
      console.error("window.passData function not found or not a function.");
      // Log the JSON to console as a fallback if needed during development
      console.log("Workflow JSON (not passed):", jsonString); 
    }
  }, [reactFlowInstance]);

  const isNodeSelected = !!selectedNodeId; 

  // --- Add useEffect for loading data ---
  useEffect(() => {
    // Define the function globally on the window object
    window.loadDataIntoReact = (workflowData: WorkflowData) => {
      console.log("React App: Received data via loadDataIntoReact", workflowData);

      if (workflowData && workflowData.nodes && workflowData.edges) {
        // Restore function references just like in handleUndo (important if you save/load complex data)
        const restoredNodes = workflowData.nodes.map(node => {
          let nodeData = { ...node.data };
          if (node.type === 'topicalKeyword' && handleInitiateWorkflowRef.current) {
             nodeData = {
               ...nodeData,
               onAddChildNode: (childType: string) => {
                 if (onAddChildNodeRef.current) {
                   (onAddChildNodeRef.current as Function)(node.id, childType);
                 }
               }
             };
          }
          if (node.type === 'start' && handleInitiateWorkflowRef.current) {
             nodeData = {
               ...nodeData,
               onInitiateWorkflow: (type: string) => {
                 if (handleInitiateWorkflowRef.current) {
                   (handleInitiateWorkflowRef.current as Function)(type);
                 }
               }
             };
          }
          return { ...node, data: nodeData };
        });

        // Update the state using the setters
        setNodes(restoredNodes as Node<WorkflowNodeData>[]); // Cast back to specific type if needed
        setEdges(workflowData.edges);

        // Optional: Update viewport if you save/load it
        if (workflowData.viewport) {
           setViewport(workflowData.viewport);
        }

        // Clear history after loading, as it represents a new starting point
        setHistory([]);
        console.log('Workflow loaded into React!'); // Log instead of alert
      } else {
        console.error("React App: Invalid data received", workflowData);
        // alert('Error: Invalid workflow data received.'); // Avoid alerts
      }
    };

    // Cleanup function to remove the global function when the component unmounts
    return () => {
      delete window.loadDataIntoReact;
    };
    // Add setters and setViewport to dependency array
  }, [setNodes, setEdges, setViewport, setHistory]);
  // --- End of useEffect for loading data ---

  // useEffect to update connection status on nodes when edges change
  useEffect(() => {
    if (!nodes || nodes.length === 0 || !edges) return; // Guard clause

    const connectedTargets = new Set(
      edges.map(edge => `${edge.target}-${edge.targetHandle}`)
    );
    const connectedSources = new Set(
      edges.map(edge => `${edge.source}-${edge.sourceHandle}`)
    );

    let nodesChanged = false;
    const updatedNodes = nodes.map(node => {
      let dataChanged = false;
      let newData = { ...node.data };

      // Handle Video, Article, Podcast, SocialMedia left connection status
      if (node.type === 'video' || node.type === 'article' || node.type === 'podcast' || node.type === 'socialMedia') {
        const targetHandleId = `${node.id}-left-target`;
        const currentIsLeftConnected = (newData as ContentNodeData).isLeftConnected ?? false;
        const newIsLeftConnected = connectedTargets.has(targetHandleId);
        
        // Handle Right connection only for relevant types
        let currentIsRightConnected = false;
        let newIsRightConnected = false;
        let rightStatusChanged = false;
        if (node.type !== 'socialMedia') { // Only check right for non-social media
            const sourceHandleId = `${node.id}-right-source`;
            currentIsRightConnected = (newData as ContentNodeData).isRightConnected ?? false;
            newIsRightConnected = connectedSources.has(sourceHandleId);
            rightStatusChanged = newIsRightConnected !== currentIsRightConnected;
        }

        if (newIsLeftConnected !== currentIsLeftConnected || rightStatusChanged) {
          newData = {
            ...newData,
            isLeftConnected: newIsLeftConnected,
            // Only set isRightConnected if it's not social media
            ...(node.type !== 'socialMedia' && { isRightConnected: newIsRightConnected }), 
          };
          dataChanged = true;
        }
      } else if (node.type === 'topicalKeyword') {
        // Keep existing logic for topicalKeyword right connection
        const sourceHandleId = `${node.id}-right-source`;
        const currentIsRightConnected = (newData as TopicalKeywordNodeData).isRightConnected ?? false;
        const newIsRightConnected = connectedSources.has(sourceHandleId);

        if (newIsRightConnected !== currentIsRightConnected) {
          newData = {
            ...newData,
            isRightConnected: newIsRightConnected,
          };
          dataChanged = true;
        }
      }

      if (dataChanged) {
        nodesChanged = true;
        return { ...node, data: newData };
      }
      return node;
    });

    // Only update state if connection status actually changed for any relevant node
    if (nodesChanged) {
      setNodes(updatedNodes); 
    }
  }, [edges, nodes, setNodes]); // Rerun when edges or nodes change

  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = useCallback(() => {
    zoomIn();
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut();
  }, [zoomOut]);

  // Update zoom level when viewport changes
  const handleViewportChange = useCallback((_: any, viewport: Viewport) => {
    setZoomLevel(viewport.zoom);
  }, []);

  return (
    <>
      {showInfoPanel && <WorkflowInfoPanel isExiting={isInfoPanelExiting} />}
      
      <div ref={reactFlowWrapper} className="w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeHandler}
          onEdgesChange={onEdgesChangeHandler}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{ type: 'customGradientEdge' }} 
          connectionMode={ConnectionMode.Loose}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          fitView 
          fitViewOptions={{ padding: 2.0, maxZoom: 1 }}
          nodesConnectable={true} 
          nodesDraggable={true}
          selectNodesOnDrag={false}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onInit={setReactFlowInstance}
          onMove={handleViewportChange}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      
      {nodes.length > 0 && <ItemsBar 
        isVisible={true} 
        isNodeSelected={isNodeSelected} 
        selectedNodeId={selectedNodeId}
        onIconClick={onAddChildNode}
        onOrganizeLayout={organizeLayout}
        onAddNote={handleAddNote}
        onUndo={handleUndo}
        onSave={saveWorkflow}
      />}

      <ZoomControl
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
    </>
  );
};

// Wrap the content component with ReactFlowProvider
const WorkflowEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <WorkflowEditorContent />
    </ReactFlowProvider>
  );
};

export default WorkflowEditor;