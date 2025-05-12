import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  useReactFlow,
  ReactFlowInstance,
  ReactFlowProvider,
  ConnectionMode,
  XYPosition,
  Viewport,
  OnNodesChange,
  OnEdgesChange,
  getOutgoers,
  NodeChange,
  EdgeChange
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

// Import shared types (WITHOUT reactflow core types)
import {
  WorkflowData,
  ContentType,
  TopicalKeywordNodeData,
  ContentNodeData,
  NoteNodeData,
  WorkflowNodeData,
  getWorkflowData,
  saveWorkFlowToMVC
} from '@/types/workflowTypes';

// Extend the global Window interface (Moved back here from types file)
declare global {
  interface Window {
    passData?: (data: string) => void;
    loadDataIntoReact?: (workflowData: WorkflowData) => void;
    __REACTFLOW_INSTANCE?: {
      getNodes: () => Node[];
      setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
      getEdges: () => Edge[];
      setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
      getViewport: () => Viewport;
      setViewport: (viewport: Viewport) => void;
      zoomIn: (options?: { duration?: number }) => void;
      zoomOut: (options?: { duration?: number }) => void;
      fitView: (options?: { padding?: number; includeHiddenNodes?: boolean; duration?: number; }) => void;
    };
  }
}

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

  // Undo/Redo history state
  const [history, setHistory] = useState<{ nodes: Node<WorkflowNodeData>[]; edges: Edge[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: Node<WorkflowNodeData>[]; edges: Edge[] }[]>([]);

  const [openMenu, setOpenMenu] = useState<{ type: 'add' | 'popselect', nodeId: string } | null>(null);

  // ... (rest of the code remains the same)

  useEffect(() => {
    // Expose the ReactFlow instance to the window object for external access
    if (reactFlowInstance) {
      window.__REACTFLOW_INSTANCE = {
        getNodes: reactFlowInstance.getNodes,
        setNodes: reactFlowInstance.setNodes,
        getEdges: reactFlowInstance.getEdges,
        setEdges: reactFlowInstance.setEdges,
        getViewport: reactFlowInstance.getViewport,
        setViewport: reactFlowInstance.setViewport,
        zoomIn: reactFlowInstance.zoomIn,
        zoomOut: reactFlowInstance.zoomOut,
        fitView: reactFlowInstance.fitView
      };
    }

    window.getWorkflowData = () => {
      console.log("Getting workflow data...");
      if (!reactFlowInstance) {
        console.error("ReactFlow instance not available for getting workflow data.");
        return null;
      }

      // 1. Get the full flow state
      const flowState = reactFlowInstance.toObject();

      // 2. Clone nodes and set all isEntering = false
      const updatedNodes = flowState.nodes.map(node => {
        if (node.data && typeof node.data === 'object') {
          return {
            ...node,
            data: {
              ...node.data,
              isNew: false, // Force isEntering to false
            }
          };
        }
        return node;
      });

      // 3. Create a new flow state object
      const updatedFlowState = {
        ...flowState,
        nodes: updatedNodes,
      };

      // 4. Serialize updated JSON
      const jsonString = JSON.stringify(updatedFlowState);

      return jsonString;
    };

    return () => {
      delete window.getWorkflowData;
      delete window.__REACTFLOW_INSTANCE;
    };
  }, [reactFlowInstance]);


  // We need to use refs to store the function references to avoid circular dependencies
  const onAddChildNodeRef = useRef<Function | null>(null);
  const handleInitiateWorkflowRef = useRef<Function | null>(null);

  // Memoize nodeTypes and edgeTypes INSIDE the component
  const nodeTypes = useMemo(() => ({
    start: StartNode,
    topicalKeyword: TopicalKeywordNode,
    article: ArticleNode,
    video: VideoNode,
    podcast: PodcastNode,
    socialMedia: SocialMediaNode,
    note: NoteNode,
  }), []);
  const edgeTypes = useMemo(() => ({
    ...customEdgeTypesImport,
  }), []);

  // Function to handle node deletion safely - split into two separate functions
  const handleDeleteNode = useCallback((nodeId: string) => {
    // Push current state to history before change
    setHistory(prev => [...prev, { nodes: getNodes(), edges: getEdges() }]);
    setFuture([]);

    console.log('📍 Node to delete:', getNode(nodeId));

    const currentNodes = getNodes();
    const nodeToDelete = currentNodes.find((n) => n.id === nodeId);

    if (!nodeToDelete) {
      console.error('❌ Node not found for deletion:', nodeId);
      return;
    }

    // Don't allow deletion of the topical keyword node
    if (nodeToDelete.type === 'topicalKeyword') {
      console.warn('⚠️ Cannot delete topical keyword node');
      return;
    }

    // Route to separate handlers for different node types
    if (nodeToDelete.type === 'note') {
      handleDeleteNoteNode(nodeId);
    } else {
      handleDeleteContentNode(nodeId);
    }
  }, [getNodes, getEdges, setHistory, setFuture]);

  // Separate handler for note nodes which need special cleanup
  const handleDeleteNoteNode = useCallback((nodeId: string) => {
    const currentNodes = getNodes();

    // Check if node still exists before trying to update it
    const nodeToDelete = currentNodes.find(n => n.id === nodeId);
    if (!nodeToDelete) {
      console.warn(`[WorkflowEditor] Note node ${nodeId} not found for deletion, may have been deleted already`);
      return;
    }

    // Flag to prevent duplicate deletions
    let deletionInProgress = false;

    // First update the node to mark it as exiting - this triggers cleanup
    setNodes(currentNodes.map(node =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, isExiting: true } }
        : node
    ));

    // Allow cleanup to complete before actually removing the node
    setTimeout(() => {
      if (deletionInProgress) return;
      deletionInProgress = true;

      try {
        // Now remove the node after cleanup has time to finish
        setNodes(nodes => {
          // Double check the node still exists
          if (nodes.some(n => n.id === nodeId)) {
            console.log('✅ Note node deletion completed', nodeId);
            return nodes.filter(n => n.id !== nodeId);
          }
          return nodes;
        });
        setSelectedNodeId(null);
      } catch (e) {
        console.error('[WorkflowEditor] Error while removing note node:', e);
      }
    }, 200); // Give it more time for cleanup
  }, [getNodes, setNodes]);

  // Separate handler for regular content nodes
  const handleDeleteContentNode = useCallback((nodeId: string) => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    // Find edges connected to the node being deleted
    const incomingEdge = currentEdges.find(edge => edge.target === nodeId);
    const outgoingEdge = currentEdges.find(edge => edge.source === nodeId);

    console.log('🔗 Connected edges:', {
      incoming: incomingEdge ? {
        id: incomingEdge.id,
        source: incomingEdge.source,
        target: incomingEdge.target,
        type: incomingEdge.type
      } : null,
      outgoing: outgoingEdge ? {
        id: outgoingEdge.id,
        source: outgoingEdge.source,
        target: outgoingEdge.target,
        type: outgoingEdge.type
      } : null
    });

    // Create a new edge connecting the nodes before and after if they exist
    let newEdges = currentEdges.filter(
      edge => edge.source !== nodeId && edge.target !== nodeId
    );

    if (incomingEdge && outgoingEdge) {
      const newEdge = {
        id: `e-${incomingEdge.source}-${outgoingEdge.target}`,
        source: incomingEdge.source,
        target: outgoingEdge.target,
        sourceHandle: 'right-source',
        targetHandle: 'left-target',
        type: 'customGradientEdge',
        data: {},
      };
      console.log('➕ Creating new connecting edge:', newEdge);
      newEdges.push(newEdge);
    }

    // First, remove edges connected to the node
    setEdges(newEdges);

    // For non-note nodes, proceed with immediate removal
    const finalNodes = currentNodes.map(node => {
      if (node.id === nodeId) return node; // Keep the node temporarily for filter later

      // If this is the node that was connected TO the deleted node (e.g., B when deleting C)
      if (incomingEdge?.source === node.id) {
        console.log('🔄 [Unified] Processing previous node:', node.id);

        // Restore the plus button if the node is of a type that can have children
        // (Article, Video, Podcast) because its outgoing connection is being removed.
        if (node.type !== 'socialMedia' && node.type !== 'topicalKeyword' && node.type !== 'note') {
          console.log('✨ [Unified] Restoring plus button to previous node:', node.id);
          return {
            ...node,
            data: {
              ...node.data,
              canAddChild: true, // Explicitly allow adding child again
              isRightConnected: false // It's no longer connected on the right
            }
          };
        }
      }
      return node;
    }).filter(n => n.id !== nodeId); // Filter out the deleted node

    // Log state changes
    console.log('📊 [Unified] State update summary:', {
      nodesRemoved: 1,
      edgesRemoved: currentEdges.length - newEdges.length, // Edges were removed earlier
      finalNodesCount: finalNodes.length,
      newEdgesCount: newEdges.length,
    });

    // Update nodes state immediately
    setNodes(finalNodes);
    setSelectedNodeId(null); // Clear selection
    console.log('✅ [Unified] Content node deletion completed');
  }, [getNodes, getEdges, setNodes, setEdges]);

  // Custom nodes change handler that records history
  const onNodesChangeHandler: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      console.log('[WorkflowEditor] Node changes detected:', changes);

      // Only track meaningful node changes (add/remove)
      const meaningfulChanges = changes.filter(change =>
        change.type === 'add' ||
        change.type === 'remove'
      );

      if (meaningfulChanges.length > 0) {
        console.log('[WorkflowEditor] Pushing meaningful changes to history:', meaningfulChanges);
        // Push current state to history before any changes
        setHistory(prev => {
          const newHistory = [...prev, { nodes: getNodes(), edges: getEdges() }];
          console.log('[WorkflowEditor] New history length:', newHistory.length);
          return newHistory;
        });
        setFuture([]);
      }

      // Apply the changes
      onNodesChange(changes);

      // Update selection state without tracking in history
      changes.forEach((change) => {
        if (change.type === 'select') {
          console.log('[WorkflowEditor] Selection changed:', { id: change.id, selected: change.selected });
          setSelectedNodeId(change.selected ? change.id : null);
        }
      });
    },
    [onNodesChange, getNodes, getEdges]
  );

  // Custom edges change handler that records history
  const onEdgesChangeHandler: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // Don't track edge changes in history
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  // Add Note function creates a React Flow node
  const handleAddNote = useCallback(() => {
    if (!reactFlowWrapper.current) return;
    // Push current state to history before change
    setHistory(prev => [...prev, { nodes: getNodes(), edges: getEdges() }]);
    setFuture([]);
    // Count existing notes to calculate offset
    const existingNoteCount = getNodes().filter(n => n.type === 'note').length;
    const yOffset = existingNoteCount * 40; // Offset each new note vertically
    const position = project({
      x: 50,
      y: 50 + yOffset,
    });
    const newNoteId = uuidv4();
    const newNode: Node<NoteNodeData> = {
      id: newNoteId,
      type: 'note',
      position,
      data: {
        title: "New Note",
        content: "",
        isEntering: false,
        onDelete: handleDeleteNode
      },
      width: 295,
      height: 235,
      dragHandle: `#note-header-${newNoteId}`,
    };
    const newNodes = [...getNodes(), newNode];
    setNodes(newNodes);
  }, [project, setNodes, getNodes, getEdges, handleDeleteNode]);

  // organizeLayout function
  const organizeLayout = useCallback(() => {
    console.log("Organizing layout...");

    const allNodes = getNodes();
    const allEdges = getEdges();
    const layoutableNodes = allNodes.filter(n => n.type !== 'note');
    const noteNodes = allNodes.filter(n => n.type === 'note');
    const topicalKeywordNode = layoutableNodes.find(n => n.type === 'topicalKeyword');
    if (!topicalKeywordNode) {
      console.warn("Cannot organize layout: Topical Keyword node not found.");
      return;
    }

    // First, organize the layout with relative positions
    const nodeWidth = 128;
    const nodeHeight = 128;
    const horizontalGap = 120;
    const verticalGap = 50;

    // We'll use temporary coordinates for the initial layout
    const tempRootX = 0;
    const firstColX = tempRootX + nodeWidth + horizontalGap;
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

    // Calculate a better vertical starting position
    // We'll use a negative value to ensure nodes are positioned above and below the center
    const startY = -(totalLayoutHeight / 2) + (nodeHeight / 2);
    const rootY = 0; // Place the topical keyword node exactly at vertical center

    // Create the organized nodes with temporary positions
    const organizedNodes: Node[] = [];
    organizedNodes.push({ ...topicalKeywordNode, position: { x: tempRootX, y: rootY } });
    // Calculate row positions to ensure they're centered vertically
    rows.forEach((row, rowIndex) => {
        // Calculate Y position for this row
        const currentRowY = startY + rowIndex * (nodeHeight + verticalGap);

        // Position each node in the row
        row.forEach((node: Node, colIndex: number) => {
            const nodeX = firstColX + colIndex * (nodeWidth + horizontalGap);
            organizedNodes.push({ ...node, position: { x: nodeX, y: currentRowY } });
        });
    });

    // Add any remaining nodes that weren't processed
    layoutableNodes.forEach((node: Node) => {
        if (!processedNodes.has(node.id)) {
            organizedNodes.push(node);
        }
    });

    // Add note nodes
    organizedNodes.push(...noteNodes);

    // Now, calculate the viewport center
    const viewportWidth = reactFlowWrapper.current?.clientWidth || window.innerWidth;
    const viewportHeight = reactFlowWrapper.current?.clientHeight || window.innerHeight;
    const viewportCenterX = viewportWidth / 2;
    const viewportCenterY = viewportHeight / 2;

    console.log("Viewport dimensions for centering:", {
      width: viewportWidth,
      height: viewportHeight,
      center: { x: viewportCenterX, y: viewportCenterY }
    });

    // Find the topical keyword node in the organized nodes
    const organizedTopicalNode = organizedNodes.find(n => n.type === 'topicalKeyword');
    if (!organizedTopicalNode) {
      console.warn("Cannot center layout: Topical Keyword node not found in organized nodes.");
      return;
    }

    // Calculate the offset needed to center the topical keyword node
    const offsetX = viewportCenterX - organizedTopicalNode.position.x;
    const offsetY = viewportCenterY - organizedTopicalNode.position.y;

    console.log("Centering organized layout:", {
      topicalKeywordPosition: organizedTopicalNode.position,
      viewportCenter: { x: viewportCenterX, y: viewportCenterY },
      offset: { x: offsetX, y: offsetY }
    });

    // Apply the offset to all nodes to center the topical keyword node
    const finalNodes = organizedNodes.map(node => ({
      ...node,
      position: {
        x: node.position.x + offsetX,
        y: node.position.y + offsetY
      }
    }));

    console.log("Applying centered layout:", finalNodes);

    // First reset the viewport to ensure proper centering
    // This helps prevent the initial "nodes appear down" issue
    if (window.__REACTFLOW_INSTANCE) {
      window.__REACTFLOW_INSTANCE.setViewport({ x: 0, y: 0, zoom: 1 });
    }

    // Update nodes immediately - this is important to prevent the warning
    setNodes(finalNodes);

    // Then set the viewport with a small delay to ensure the nodes are rendered
    // This approach prevents the initial "nodes appear down" issue
    requestAnimationFrame(() => {
      setViewport({ x: 0, y: 0, zoom: 1 });

      // Apply viewport again after a frame to ensure everything is properly centered
      requestAnimationFrame(() => {
        if (window.__REACTFLOW_INSTANCE) {
          window.__REACTFLOW_INSTANCE.setViewport({ x: 0, y: 0, zoom: 1 });
        }
      });
    });

  }, [getNodes, getEdges, setNodes, setViewport, reactFlowWrapper]);

  // onAddChildNode function
  const onAddChildNode = useCallback((parentId: string, childTypeOrNext: ContentType | 'next') => {
    // Always push to history before any state change
    setHistory(prev => [...prev, { nodes: getNodes(), edges: getEdges() }]);
    setFuture([]);

    // Close any open menu to prevent popupSelect from opening after adding a node
    setOpenMenu(null);

    const parentNode = getNode(parentId);
    // Determine requested child type
    let requestedChildType: ContentType;
    if (childTypeOrNext === 'next') {
      switch (parentNode?.type) {
        case 'article': requestedChildType = 'video'; break;
        case 'video': requestedChildType = 'podcast'; break;
        case 'podcast': requestedChildType = 'socialMedia'; break;
        default:
          console.error('[onAddChildNode - next] Invalid parent type for sequential add:', parentNode?.type);
          return;
      }
    } else {
      requestedChildType = childTypeOrNext;
    }

    // (Moved type checks above for rule enforcement)
    if (!parentNode || parentNode.type === 'note') return;
    // Only restrict adding children for TopicalKeyword nodes if needed
    if (parentNode.type === 'topicalKeyword' && parentNode.data?.canAddChild === false) {
        console.log(`[Workflow Rule] TopicalKeyword node ${parentId} cannot add more children.`);
        return;
    }
    if (parentNode.type === 'socialMedia') {
        console.log('[Workflow Rule] Cannot add children to Social Media node.');
        return;
    }
    let prevNextNodeId: string | null = null;
    if (parentNode.type !== 'topicalKeyword') {
        // Find the outgoing edge (if any) from this node
        const outgoingEdge = edges.find(edge => edge.source === parentId);
        if (outgoingEdge) {
            prevNextNodeId = outgoingEdge.target;
        }
        // Remove all outgoing edges from this node before adding the new one
        setEdges((currentEdges) => currentEdges.filter(edge => edge.source !== parentId));
    }

    if (parentNode?.type === 'topicalKeyword') {
        if (showInfoPanel) {
            setIsInfoPanelExiting(true);
        }
    }
    // Use only UUID for the ID
    const childNodeId = uuidv4();
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
          title: 'Untitled',
          isEntering: true,
          isNew: true,
          canAddChild: requestedChildType !== 'socialMedia',
          onAddChildNode: (parentId: string, childType: ContentType) => {
            onAddChildNode(parentId, childType);
          },
          onDelete: handleDeleteNode,
          onReplaceNode: handleReplaceNode,
          ...(requestedChildType === 'video' && { isLeftConnected: true, isRightConnected: false })
        }
    };
    const newEdge: Edge = {
        // Use plain UUIDs for edge ID
        id: `e-${parentId}-${childNodeId}`,
        source: parentId,
        target: childNodeId, // Target the plain UUID
        sourceHandle: 'right-source',
        targetHandle: 'left-target',
        type: 'customGradientEdge',
        data: {},
    };
    setNodes((nds) => {
        // Add the new child node
        let updatedNodes = nds.concat(childNode);
        // If there was a previous next node, shift all downstream nodes to the right
        if (prevNextNodeId) {
            // Constants for spacing
            const nodeWidth = 128;
            const horizontalGap = 120;
            // Traverse the chain starting from prevNextNodeId
            let currentId = prevNextNodeId;
            let prevNode: Node<ContentNodeData> = childNode;
            const visited = new Set<string>();
            while (currentId && !visited.has(currentId)) {
                visited.add(currentId);
                const idx = updatedNodes.findIndex(n => n.id === currentId);
                if (idx === -1) break;
                const node = updatedNodes[idx];
                // Shift this node to the right of prevNode
                updatedNodes = updatedNodes.map(n =>
                    n.id === node.id ? {
                        ...n,
                        position: {
                            x: prevNode.position.x + nodeWidth + horizontalGap,
                            y: prevNode.position.y
                        }
                    } : n
                );
                // Find the next node in the chain (outgoing edge from currentId)
                const nextEdge = edges.find(e => e.source === currentId);
                // Only assign prevNode if it is a ContentNodeData node (not a start node)
                const maybeNode = updatedNodes.find(n => n.id === node.id);
                if (maybeNode && maybeNode.type !== 'start' && 'title' in maybeNode.data) {
                  prevNode = maybeNode as Node<ContentNodeData>;
                }
                currentId = nextEdge ? nextEdge.target : "";
            }
        }
        return updatedNodes;
    });
    // Edges were already filtered above for non-TopicalKeyword nodes, so just add the new edge
    setEdges((eds) => {
        let updatedEdges = addEdge(newEdge, eds);
        // If there was a previous next node, connect the new node to it
        if (prevNextNodeId) {
            const pushEdge: Edge = {
                id: `e-${childNodeId}-${prevNextNodeId}`,
                source: childNodeId,
                target: prevNextNodeId,
                sourceHandle: 'right-source',
                targetHandle: 'left-target',
                type: 'customGradientEdge',
                data: {},
            };
            updatedEdges = addEdge(pushEdge, updatedEdges);
        }
        return updatedEdges;
    });
    if (parentNode.type !== 'topicalKeyword') {
        setNodes((nds) =>
            nds.map(node =>
                node.id === parentId
                    ? { ...node, data: { ...node.data, canAddChild: false } }
                    : node
            )
        );
    }
  }, [getNode, getNodes, getEdges, nodes, edges, setNodes, setEdges, showInfoPanel, setIsInfoPanelExiting, handleDeleteNode, setOpenMenu]);

  // Store the latest version of onAddChildNode in the ref
  useEffect(() => {
    onAddChildNodeRef.current = onAddChildNode;
  }, [onAddChildNode]);

  // Add onConnect handler
  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({
      ...connection,
      type: 'customGradientEdge'
    }, eds));
  }, [setEdges]);

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
    setShowInfoPanel(true);
    setIsInfoPanelExiting(false);

    // Determine nodeType for icon/label rendering
    let nodeType: 'topicalKeyword' | 'offer' | 'event' = 'topicalKeyword';
    if (type === 'offer') nodeType = 'offer';
    else if (type === 'event') nodeType = 'event';
    else if (type === 'topical' || type === 'topicalKeyword') nodeType = 'topicalKeyword';
    else {
      console.log(`Workflow type "${type}" initiation not implemented yet.`);
      return;
    }
    const startNode = getNode(initialNodeId);
    if (!startNode) return;
    const position = startNode.position;
    const newNodeId = uuidv4();
    const nodeData: TopicalKeywordNodeData & { nodeType: 'topicalKeyword' | 'offer' | 'event' } = {
      title: 'Untitled',
      isEntering: true,
      isRightConnected: false,
      onAddChildNode: (parentId: string, childType: ContentType) => {
        onAddChildNode(parentId, childType);
      },
      nodeType,
      canAddChild: true,
    };
    const newNode: Node<TopicalKeywordNodeData & { nodeType: 'topicalKeyword' | 'offer' | 'event' }> = {
      id: newNodeId,
      type: 'topicalKeyword',
      position,
      data: nodeData,
    };
    setNodes((nds) =>
      nds.map(n => n.id === initialNodeId ? { ...n, data: { ...n.data, isExiting: true } } : n)
    );
    setTimeout(() => {
      setNodes((nds) => nds.concat(newNode));
    }, 10);
    setTimeout(() => {
      setNodes((nds) => nds.filter((node) => node.id !== initialNodeId));
    }, 150);

  }, [getNode, setNodes, getEdges, onAddChildNode, setShowInfoPanel, setIsInfoPanelExiting]);

  // Store the latest version of handleInitiateWorkflow in the ref
  useEffect(() => {
    handleInitiateWorkflowRef.current = handleInitiateWorkflow;
  }, [handleInitiateWorkflow]);

  // Set initial nodes and edges on mount
  useEffect(() => {
    // Define initial nodes WITHOUT functions first
    const initialNodesRaw: Node<WorkflowNodeData>[] = [
      {
        id: initialNodeId,
        type: 'start',
        position: { x: 100, y: 100 },
        data: {
          // Functions will be added AFTER history is set
        },
      },
    ];

    // Now create the nodes with functions for the ACTUAL state
    const nodesWithFuncs = initialNodesRaw.map(node => {
      if (node.type === 'start') {
        return {
          ...node,
          data: {
            ...node.data,
            // Add the function reference via the ref
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

    // Set the actual state using nodes with functions
    setNodes(nodesWithFuncs as Node<WorkflowNodeData>[]);
    setEdges([]); // Start with no edges initially

  }, [setNodes, setEdges]); // Dependencies are just the setters

  // Update refs for functions when they change
  useEffect(() => {
    onAddChildNodeRef.current = onAddChildNode;
  }, [onAddChildNode]);

  useEffect(() => {
    handleInitiateWorkflowRef.current = handleInitiateWorkflow;
  }, [handleInitiateWorkflow]);

  // Callback to handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();

    // Check if nodeAddMenu is open
    if (openMenu?.type === 'add') {
      // If nodeAddMenu is open, just close it without opening popupSelect
      setOpenMenu(null);
    } else {
      // Always set the openMenu to null when clicking on a node
      // This will allow the PopupSelect to be shown (not the TopReplace menu)
      setOpenMenu(null);
    }

    setSelectedNodeId(node.id);
  }, [openMenu, setOpenMenu]);

  const onPaneClick = useCallback(() => {
    if (openMenu) setOpenMenu(null);
    setSelectedNodeId(null);
  }, [openMenu, setOpenMenu]);

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

    // 3. Log the JSON to console (or send it to a server)
    localStorage.setItem('workflowData', jsonString);

    saveWorkFlowToMVC();
  }, [reactFlowInstance, getWorkflowData]);

  // --- Add useEffect for loading data ---
  useEffect(() => {
    // Define the function globally on the window object
    window.loadDataIntoReact = (workflowData: WorkflowData & { isLocked?: boolean }) => {
      console.log("React App: Received data via loadDataIntoReact", workflowData);

      let nodesToLoad = workflowData.nodes;
      if (workflowData.isLocked) {
        nodesToLoad = nodesToLoad.map(node => ({
          ...node,
          data: { ...node.data, isLocked: true }
        }));
      }

      if (workflowData && workflowData.nodes && workflowData.edges) {
        // Get the actual dimensions of the viewport
        const viewportWidth = reactFlowWrapper.current?.clientWidth || window.innerWidth;
        const viewportHeight = reactFlowWrapper.current?.clientHeight || window.innerHeight;

        // Calculate the true center of the viewport
        const viewportCenterX = viewportWidth / 2;
        const viewportCenterY = viewportHeight / 2;

        console.log("Viewport dimensions:", {
          width: viewportWidth,
          height: viewportHeight,
          center: { x: viewportCenterX, y: viewportCenterY }
        });

        // Special handling for locked workflows to ensure the entire diagram is visible
        if (workflowData.isLocked) {
          console.log("Loading locked workflow - calculating optimal view");

          // Calculate the bounding box of all nodes with extra precision
          let minX = Infinity;
          let minY = Infinity;
          let maxX = -Infinity;
          let maxY = -Infinity;

          // First pass: calculate the raw bounding box
          nodesToLoad.forEach(node => {
            // Use node width and height or default values based on node type
            let nodeWidth = 128;
            let nodeHeight = 128;

            // Adjust size based on node type for more accurate calculations
            if (node.type === 'socialMedia') {
              nodeWidth = 140; // Social media nodes might be slightly wider
            } else if (node.type === 'article') {
              nodeWidth = 135; // Article nodes
            } else if (node.type === 'podcast') {
              nodeWidth = 135; // Podcast nodes
            } else if (node.type === 'video') {
              nodeWidth = 135; // Video nodes
            } else if (node.type === 'topicalKeyword') {
              nodeWidth = 135; // Topical keyword nodes
            }

            // Calculate node boundaries
            const left = node.position.x;
            const top = node.position.y;
            const right = left + nodeWidth;
            const bottom = top + nodeHeight;

            // Update bounding box
            minX = Math.min(minX, left);
            minY = Math.min(minY, top);
            maxX = Math.max(maxX, right);
            maxY = Math.max(maxY, bottom);
          });

          // Calculate diagram dimensions
          const diagramWidth = maxX - minX;
          const diagramHeight = maxY - minY;

          // Calculate the exact center of the diagram
          const diagramCenterX = minX + diagramWidth / 2;
          const diagramCenterY = minY + diagramHeight / 2;

          console.log("Diagram dimensions:", {
            minX, minY, maxX, maxY,
            width: diagramWidth,
            height: diagramHeight,
            center: { x: diagramCenterX, y: diagramCenterY }
          });

          // Calculate the offset to perfectly center the diagram
          const offsetX = viewportCenterX - diagramCenterX;
          const offsetY = viewportCenterY - diagramCenterY;

          console.log("Centering offsets:", {
            viewportCenter: { x: viewportCenterX, y: viewportCenterY },
            offset: { x: offsetX, y: offsetY }
          });

          // Calculate the zoom level needed to fit the entire diagram
          // Add padding (0.9) to ensure there's some margin around the diagram
          const zoomX = (viewportWidth / diagramWidth) * 0.9;
          const zoomY = (viewportHeight / diagramHeight) * 0.9;
          const zoom = Math.min(zoomX, zoomY, 1); // Cap at 1 to prevent zooming in too much

          console.log("Diagram dimensions and zoom:", {
            diagramWidth,
            diagramHeight,
            diagramCenter: { x: diagramCenterX, y: diagramCenterY },
            offset: { x: offsetX, y: offsetY },
            calculatedZoom: zoom
          });

          // Apply the offset to all nodes to center the diagram with additional padding
          // Add extra horizontal padding to ensure the diagram is perfectly centered
          const horizontalPadding = 80; // Extra padding on each side
          const verticalPadding = 80;   // Extra padding on top and bottom

          // Adjust offsets to account for padding and ensure perfect centering
          const adjustedOffsetX = offsetX - (horizontalPadding / 2);
          const adjustedOffsetY = offsetY - (verticalPadding / 2);

          console.log("Applying adjusted offsets for perfect centering:", {
            original: { x: offsetX, y: offsetY },
            adjusted: { x: adjustedOffsetX, y: adjustedOffsetY },
            padding: { horizontal: horizontalPadding, vertical: verticalPadding }
          });

          nodesToLoad = nodesToLoad.map(node => ({
            ...node,
            position: {
              x: node.position.x + adjustedOffsetX,
              y: node.position.y + adjustedOffsetY
            }
          }));

          // The zoom will be calculated again after nodes are rendered
        }
        // Standard centering for non-locked workflows
        else {
          // Find the topical keyword node to use as the center reference
          const topicalKeywordNode = nodesToLoad.find(node => node.type === 'topicalKeyword');

          // If we found a topical keyword node, position it at the center of the viewport
          if (topicalKeywordNode) {
            // Calculate the offset needed to center the topical keyword node
            const offsetX = viewportCenterX - topicalKeywordNode.position.x;
            const offsetY = viewportCenterY - topicalKeywordNode.position.y;

            console.log("Centering workflow in viewport", {
              viewportCenter: { x: viewportCenterX, y: viewportCenterY },
              topicalKeywordPosition: topicalKeywordNode.position,
              offset: { x: offsetX, y: offsetY }
            });

            // Apply the offset to all nodes to maintain their relative positions
            nodesToLoad = nodesToLoad.map(node => ({
              ...node,
              position: {
                x: node.position.x + offsetX,
                y: node.position.y + offsetY
              }
            }));
          }
        }

        // Restore function references just like in handleUndo (important if you save/load complex data)
        const restoredNodes = nodesToLoad.map(node => {
          let nodeData = { ...node.data };

          // Attach onDelete handler to all nodes
          nodeData.onDelete = (nodeId: string) => {
            if (handleDeleteNodeRef && handleDeleteNodeRef.current) {
              (handleDeleteNodeRef.current as Function)(nodeId);
            }
          };

          // Attach onAddChildNode for node types that support children
          if (
            node.type === 'article' ||
            node.type === 'video' ||
            node.type === 'podcast' ||
            node.type === 'socialMedia' ||
            node.type === 'topicalKeyword'
          ) {
            nodeData.onAddChildNode = (parentId: string, childType: string) => {
              if (onAddChildNodeRef.current) {
                (onAddChildNodeRef.current as Function)(parentId, childType);
              }
            };
          }

          // Attach onInitiateWorkflow for start node
          if (node.type === 'start') {
            nodeData.onInitiateWorkflow = (type: string) => {
              if (handleInitiateWorkflowRef.current) {
                (handleInitiateWorkflowRef.current as Function)(type);
              }
            };
          }

          return { ...node, data: nodeData };
        });

        // Update the state using the setters
        setNodes(restoredNodes as Node<WorkflowNodeData>[]); // Cast back to specific type if needed
        setEdges(workflowData.edges);

        // For locked workflows, we want to show the diagram immediately without animation
        // Apply viewport settings right away
          // For locked workflows, use the calculated zoom level
          if (workflowData.isLocked) {
            // Calculate the bounding box of all nodes again
            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;

            restoredNodes.forEach(node => {
              // Use more accurate node dimensions based on node type
              let nodeWidth = node.width || 128;
              let nodeHeight = node.height || 128;

              // Adjust size based on node type for more accurate calculations
              if (node.type === 'socialMedia') {
                nodeWidth = 140; // Social media nodes might be slightly wider
              } else if (node.type === 'article') {
                nodeWidth = 135; // Article nodes
              } else if (node.type === 'podcast') {
                nodeWidth = 135; // Podcast nodes
              } else if (node.type === 'video') {
                nodeWidth = 135; // Video nodes
              } else if (node.type === 'topicalKeyword') {
                nodeWidth = 135; // Topical keyword nodes
              }

              const left = node.position.x;
              const top = node.position.y;
              const right = left + nodeWidth;
              const bottom = top + nodeHeight;

              minX = Math.min(minX, left);
              minY = Math.min(minY, top);
              maxX = Math.max(maxX, right);
              maxY = Math.max(maxY, bottom);
            });

            // Calculate diagram dimensions
            const diagramWidth = maxX - minX;
            const diagramHeight = maxY - minY;

            // Calculate the zoom level needed to fit the entire diagram
            const viewportWidth = reactFlowWrapper.current?.clientWidth || window.innerWidth;
            const viewportHeight = reactFlowWrapper.current?.clientHeight || window.innerHeight;

            // Calculate zoom based on diagram dimensions and viewport
            // Use a lower scale factor (0.75) to ensure there's plenty of space around the diagram
            const zoomX = (viewportWidth / diagramWidth) * 0.75; // 75% of viewport width
            const zoomY = (viewportHeight / diagramHeight) * 0.75; // 75% of viewport height

            // Use the minimum of the calculated zooms to ensure the entire diagram fits
            // But set a minimum zoom of 0.5 to ensure the diagram is not too small
            // And a maximum of 0.9 to prevent excessive zooming on small diagrams
            const zoom = Math.max(Math.min(zoomX, zoomY, 0.9), 0.5);

            console.log("Applying calculated zoom for locked workflow:", zoom);

            // For locked workflows, use fitView for best results
            if (window.__REACTFLOW_INSTANCE) {
              // For locked workflows, we'll use a two-step approach:
              // 1. First set the viewport with our calculated zoom
              window.__REACTFLOW_INSTANCE.setViewport({
                x: 0,
                y: 0,
                zoom
              });

              // 2. Then use fitView with increased padding for better visibility
              // This ensures the diagram is perfectly centered and all nodes are fully visible
              window.__REACTFLOW_INSTANCE.fitView({
                padding: 0.6, // 60% padding around the diagram to ensure all nodes are visible and perfectly centered
                includeHiddenNodes: true,
                duration: 0 // No animation - show immediately
              });

              // After fitting, ensure the zoom is within our desired range
              const currentViewport = window.__REACTFLOW_INSTANCE.getViewport();
              if (currentViewport.zoom < 0.5 || currentViewport.zoom > 0.9) {
                // Adjust zoom if needed while maintaining the center position
                const adjustedZoom = Math.max(Math.min(currentViewport.zoom, 0.9), 0.5);
                window.__REACTFLOW_INSTANCE.setViewport({
                  ...currentViewport,
                  zoom: adjustedZoom
                });
              }
            }

            // Also use the React Flow hook for redundancy
            setViewport({ x: 0, y: 0, zoom });
          }
          // For regular workflows, use zoom level 1
          else {
            // Reset the viewport to ensure proper centering
            if (window.__REACTFLOW_INSTANCE) {
              window.__REACTFLOW_INSTANCE.setViewport({ x: 0, y: 0, zoom: 1 });
            }

            // Also use the React Flow hook for redundancy
            setViewport({ x: 0, y: 0, zoom: 1 });
          }

          // Log the final state for debugging
          console.log("Workflow loaded and centered");

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
    // Add setters, setViewport, and reactFlowWrapper to dependency array
  }, [setNodes, setEdges, setViewport, reactFlowWrapper]);
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

    // Dispatch a custom event to notify other components about zoom changes
    const viewportChangeEvent = new CustomEvent('reactflow:viewportchange', {
      detail: { action: 'zoomIn' }
    });
    document.dispatchEvent(viewportChangeEvent);
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut();

    // Dispatch a custom event to notify other components about zoom changes
    const viewportChangeEvent = new CustomEvent('reactflow:viewportchange', {
      detail: { action: 'zoomOut' }
    });
    document.dispatchEvent(viewportChangeEvent);
  }, [zoomOut]);

  // Update zoom level when viewport changes
  const handleViewportChange = useCallback((_: any, viewport: Viewport) => {
    setZoomLevel(viewport.zoom);

    // Dispatch a custom event to notify other components about viewport changes
    const viewportChangeEvent = new CustomEvent('reactflow:viewportchange', {
      detail: { viewport }
    });
    document.dispatchEvent(viewportChangeEvent);
  }, []);

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    console.log('[WorkflowEditor] Undo clicked. Current history length:', history.length);
    if (history.length === 0) {
      console.log('[WorkflowEditor] No history to undo');
      return;
    }
    const prev = history[history.length - 1];
    console.log('[WorkflowEditor] Restoring previous state:', {
      nodesCount: prev.nodes.length,
      edgesCount: prev.edges.length
    });
    setHistory(h => h.slice(0, -1));
    setFuture(f => [{ nodes, edges }, ...f]);

    // Keep track of whether the currently selected node still exists after undo
    const selectedNodeExists = prev.nodes.some(node => node.id === selectedNodeId);
    if (!selectedNodeExists) {
      setSelectedNodeId(null);
    }

    setNodes(prev.nodes);
    setEdges(prev.edges);
  }, [history, nodes, edges, setNodes, setEdges, selectedNodeId]);

  const handleRedo = useCallback(() => {
    console.log('[WorkflowEditor] Redo clicked. Current future length:', future.length);
    if (future.length === 0) {
      console.log('[WorkflowEditor] No future to redo');
      return;
    }
    const next = future[0];
    console.log('[WorkflowEditor] Restoring next state:', {
      nodesCount: next.nodes.length,
      edgesCount: next.edges.length
    });
    setFuture(f => f.slice(1));
    setHistory(h => [...h, { nodes, edges }]);

    // Keep track of whether the currently selected node still exists after redo
    const selectedNodeExists = next.nodes.some(node => node.id === selectedNodeId);
    if (!selectedNodeExists) {
      setSelectedNodeId(null);
    }

    setNodes(next.nodes);
    setEdges(next.edges);
  }, [future, nodes, edges, setNodes, setEdges, selectedNodeId]);

  // Add keyboard shortcuts for delete and undo/redo
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Delete key
      if (event.key === 'Delete' && selectedNodeId) {
        handleDeleteNode(selectedNodeId);
      }

      // Undo (Ctrl+Z)
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault(); // Prevent browser's default undo
        handleUndo();
      }

      // Redo (Ctrl+Y)
      if (event.ctrlKey && event.key === 'y') {
        event.preventDefault(); // Prevent browser's default redo
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleDeleteNode, selectedNodeId, handleUndo, handleRedo]);

  // Add handleDeleteNodeRef with the updated implementation
  const handleDeleteNodeRef = useRef<Function | null>(null);
  useEffect(() => {
    handleDeleteNodeRef.current = handleDeleteNode;
  }, [handleDeleteNode]);

  // When rendering nodes, inject openMenu and setOpenMenu into data for topicalKeyword nodes
  // Use a stable reference for the node transformation function
  const getNodeWithMenu = useCallback((node: Node<WorkflowNodeData>) => ({
    ...node,
    draggable: node.data && node.data.isLocked === true ? false : true,
    selectable: node.data && node.data.isLocked === true ? false : true,
    data: {
      ...node.data,
      openMenu,
      setOpenMenu,
      isSelected: node.id === selectedNodeId
    }
  }), [selectedNodeId, openMenu, setOpenMenu]);

  // Memoize the transformed nodes
  const nodesWithMenu = useMemo(() => {
    return nodes.map(getNodeWithMenu);
  }, [nodes, getNodeWithMenu]);

  // Add handleReplaceNode function after handleDeleteNode
  const handleReplaceNode = useCallback((nodeId: string, newType: ContentType) => {
    // Push current state to history before change
    setHistory(prev => [...prev, { nodes: getNodes(), edges: getEdges() }]);
    setFuture([]);

    const nodeToReplace = getNode(nodeId);
    if (!nodeToReplace) {
      console.error('Node to replace not found:', nodeId);
      return;
    }

    // Don't allow replacing topical keyword nodes
    if (nodeToReplace.type === 'topicalKeyword') {
      console.warn('Cannot replace topical keyword node');
      return;
    }

    // Create new node with same position and connections but new type
    const newNode: Node<ContentNodeData> = {
      ...nodeToReplace,
      type: newType,
      data: {
        ...nodeToReplace.data,
        isEntering: nodeToReplace.type !== 'note', // Only add animation if current node is not a note
        isNew: true,
        canAddChild: newType !== 'socialMedia',
        onAddChildNode: (parentId: string, childType: ContentType) => {
          onAddChildNode(parentId, childType);
        },
        onDelete: handleDeleteNode,
        onReplaceNode: handleReplaceNode,
        isLeftConnected: nodeToReplace.data.isLeftConnected,
        isRightConnected: nodeToReplace.data.isRightConnected
      }
    };

    // Update nodes state
    setNodes(nds => nds.map(node => node.id === nodeId ? newNode : node));
  }, [getNode, getNodes, getEdges, setNodes, onAddChildNode, handleDeleteNode]);

  const isAnyLocked = nodes.some(node => node.data && node.data.isLocked === true);

  return (
    <>
      {showInfoPanel && <WorkflowInfoPanel isExiting={isInfoPanelExiting} />}

      <div ref={reactFlowWrapper} className="w-full h-full">
        <ReactFlow
          nodes={nodesWithMenu}
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
          proOptions={{ hideAttribution: true }}
        >

        </ReactFlow>
      </div>

      {nodes.length > 0 && !isAnyLocked && <ItemsBar
        isVisible={true}
        isNodeSelected={!!selectedNodeId}
        selectedNodeId={selectedNodeId}
        onIconClick={onAddChildNode}
        onOrganizeLayout={organizeLayout}
        onAddNote={handleAddNote}
        onUndo={handleUndo}
        onRedo={handleRedo}
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
  // Top-level wheel handler for canvas
  const handleCanvasWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const targetTag = (e.target as HTMLElement)?.tagName;
    const logObj = {
      file: '[src/components/WorkflowEditor.tsx]',
      event: 'onWheel',
      clientX: e.clientX,
      clientY: e.clientY,
      targetTag,
      deltaY: e.deltaY,
      allowed: true,
      zoomAction: null as string | null,
    };
    logObj.zoomAction = 'canvasZoom';
    console.log('[src/components/WorkflowEditor.tsx] onWheel', logObj);
  };

  // Add mouse/click tracking for canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('[WorkflowEditor] Canvas onMouseDown', { x: e.clientX, y: e.clientY, target: e.target });
  };
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('[WorkflowEditor] Canvas onClick', { x: e.clientX, y: e.clientY, target: e.target });
  };

  // Attach a document-level fallback wheel and click listener for ultimate reliability
  React.useEffect(() => {
    function docWheelHandler(e: WheelEvent) {
      const logObj = {
        file: '[src/components/WorkflowEditor.tsx]',
        source: 'document',
        event: 'onWheel',
        clientX: e.clientX,
        clientY: e.clientY,
        deltaY: e.deltaY,
        eventPhase: e.eventPhase,
        eventTarget: (e.target as HTMLElement)?.tagName,
        composedPath: (e.composedPath && typeof e.composedPath === 'function') ? e.composedPath().map(n => (n as HTMLElement).tagName || n.constructor?.name).join(' > ') : undefined,
        allowed: !e.defaultPrevented,
        zoomAction: !e.defaultPrevented ? 'canvasZoom' : 'blocked',
      };
      console.log('[src/components/WorkflowEditor.tsx] onWheel (document)', logObj);
    }
    function docClickHandler(e: MouseEvent) {
      console.log('[src/components/WorkflowEditor.tsx] onClick (document)', {
        x: e.clientX,
        y: e.clientY,
        target: e.target,
        composedPath: (e.composedPath && typeof e.composedPath === 'function') ? e.composedPath().map(n => (n as HTMLElement).tagName || n.constructor?.name).join(' > ') : undefined,
      });
    }
    document.addEventListener('wheel', docWheelHandler, { capture: true });
    document.addEventListener('click', docClickHandler, { capture: true });
    return () => {
      document.removeEventListener('wheel', docWheelHandler, { capture: true });
      document.removeEventListener('click', docClickHandler, { capture: true });
    };
  }, []);

  return (
    <div
      onWheel={handleCanvasWheel}
      onMouseDown={handleCanvasMouseDown}
      onClick={handleCanvasClick}
      style={{ width: '100%', height: '100%' }}
    >
      <ReactFlowProvider>
        <WorkflowEditorContent />
      </ReactFlowProvider>
    </div>
  );
};

export default WorkflowEditor;