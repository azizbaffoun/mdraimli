import React from 'react';
import { EdgeProps, useStore } from 'reactflow';

// 1. Define node colors (Adjust keys/values to match your node types)
const nodeColors = {
  start: '#888888',         // Default gray for start
  topicalKeyword: '#3799DB', // Blue
  article: '#2C93EA',       // Lighter Blue
  video: '#3799DB',         // Blue (Match Topical Keyword)
  podcast: '#A362E4',       // Purple
  socialMedia: '#FC8500',    // Orange (Add Social Media)
  // Add any other node types and their corresponding colors your project uses
  default: '#888888'       // Default fallback color
};

// Helper function to select node data from the store
const nodeSelector = (s: any) => s.nodeInternals;

// 2. Define the CustomEdge component
// Helper: Blend two hex colors at a specified ratio (0-1)
function blendColors(color1: string, color2: string, ratio: number): string {
    // Remove # if present
    color1 = color1.replace('#', '');
    color2 = color2.replace('#', '');
    // Parse r,g,b
    const r1 = parseInt(color1.substring(0,2), 16);
    const g1 = parseInt(color1.substring(2,4), 16);
    const b1 = parseInt(color1.substring(4,6), 16);
    const r2 = parseInt(color2.substring(0,2), 16);
    const g2 = parseInt(color2.substring(2,4), 16);
    const b2 = parseInt(color2.substring(4,6), 16);
    // Blend
    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
    // Return hex
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

const CustomEdge: React.FC<EdgeProps> = ({ 
    id, 
    source, // Use source ID
    target, // Use target ID
    // sourceX, sourceY, targetX, targetY are technically available but potentially inaccurate for our offset handles
    // data prop is no longer needed for node info
}) => {
    // --- Clear console on first render of any edge this session ---
    if ((window as any).__customEdgeConsoleCleared !== true) {
        console.clear();
        (window as any).__customEdgeConsoleCleared = true;
    }

    // --- Fix: Force re-render if distance is zero (background bug workaround) ---
    const [renderKey, setRenderKey] = React.useState(0);


    // Get live node data from the store using IDs
    const nodeInternals = useStore(nodeSelector);
    const sourceNode = nodeInternals.get(source);
    const targetNode = nodeInternals.get(target);

    // --- Node creation detection ---
    const prevExist = React.useRef<{src?: boolean, tgt?: boolean}>({});
    React.useEffect(() => {
        if (!prevExist.current.src && !!sourceNode) {
            console.log('[CustomEdge][Node Created]', {
                nodeId: source,
                nodeType: sourceNode?.type,
                method: sourceNode?.creationMethod || 'unknown',
                node: sourceNode
            });
        }
        if (!prevExist.current.tgt && !!targetNode) {
            console.log('[CustomEdge][Node Created]', {
                nodeId: target,
                nodeType: targetNode?.type,
                method: targetNode?.creationMethod || 'unknown',
                node: targetNode
            });
        }
        prevExist.current.src = !!sourceNode;
        prevExist.current.tgt = !!targetNode;
    }, [sourceNode, targetNode, source, target]);

    // --- Force re-render when node positions/dimensions become ready ---
    const prevSource = React.useRef<{x?: number, y?: number, w?: number, h?: number}>();
    const prevTarget = React.useRef<{x?: number, y?: number, w?: number, h?: number}>();
    React.useEffect(() => {
        const isReady = (n: any) => n && n.positionAbsolute && typeof n.width === 'number' && n.width > 0 && typeof n.height === 'number' && n.height > 0;
        const srcReady = isReady(sourceNode);
        const tgtReady = isReady(targetNode);
        // Compare prev and current for "became ready"
        if (
            (srcReady && (!prevSource.current || !isReady(prevSource.current))) ||
            (tgtReady && (!prevTarget.current || !isReady(prevTarget.current)))
        ) {
            setRenderKey(k => k + 1);
        }
        prevSource.current = sourceNode ? {
            x: sourceNode.positionAbsolute?.x,
            y: sourceNode.positionAbsolute?.y,
            w: sourceNode.width,
            h: sourceNode.height
        } : {};
        prevTarget.current = targetNode ? {
            x: targetNode.positionAbsolute?.x,
            y: targetNode.positionAbsolute?.y,
            w: targetNode.width,
            h: targetNode.height
        } : {};
    }, [sourceNode, targetNode]);

    // Define connector offset and node dimensions (adjust if dynamic)
    const connectorOffset = 16.5;
    // Get dimensions from live nodes, fallback if needed
    const sourceNodeWidth = sourceNode?.width ?? 128;
    const sourceNodeHeight = sourceNode?.height ?? 128;
    const targetNodeHeight = targetNode?.height ?? 128;

    // Check if node data is available from the store
    // More robust retry: higher count, longer delay


    if (!sourceNode || !targetNode) {
        // Fallback: Always render a simple straight background line between fallback positions
        // Use fallback positions if node data is missing
        const fallbackSourceX = 0;
        const fallbackSourceY = 0;
        const fallbackTargetX = 100;
        const fallbackTargetY = 0;
        return (
            <g>
                <path
                    d={`M${fallbackSourceX},${fallbackSourceY} L${fallbackTargetX},${fallbackTargetY}`}
                    stroke="#bbb"
                    strokeWidth="20"
                    fill="none"
                    strokeLinecap="round"
                    style={{ pointerEvents: 'none' }}
                    strokeOpacity={0.18}
                />
            </g>
        );
    }

    // No retry logic needed for background path. Always render a fallback if data is missing.

    // Calculate absolute coordinates of the handles using LIVE node positions
    let calcSourceX = sourceNode.positionAbsolute.x + sourceNodeWidth + connectorOffset; // Default calculation
    const calcSourceY = sourceNode.positionAbsolute.y + (sourceNodeHeight * 0.4);
    let calcTargetX = targetNode.positionAbsolute.x - connectorOffset; // Default calculation
    const calcTargetY = targetNode.positionAbsolute.y + (targetNodeHeight * 0.4);

    // Adjust source X specifically for TopicalKeywordNode
    if (sourceNode.type === 'topicalKeyword') {
        const customOffset = 14; // New offset, closer to the right edge of the connector visual
        calcSourceX = sourceNode.positionAbsolute.x + sourceNodeWidth + customOffset;
    }

    // TODO: Add similar check for targetNode if other nodes have custom left connectors
    // if (targetNode.type === 'someOtherNodeTypeWithLeftConnector') {
    //     const leftConnectorVisualWidth = ...;
    //     calcTargetX = targetNode.positionAbsolute.x - (leftConnectorVisualWidth / 2);
    // }

    // Calculate angle and distance between the CALCULATED points
    const deltaX = calcTargetX - calcSourceX;
    const deltaY = calcTargetY - calcSourceY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);
    const angleDegrees = angle * (180 / Math.PI);

    // Visual points are the CALCULATED points
    const visualSourceX = calcSourceX;
    const visualSourceY = calcSourceY;
    const visualTargetX = calcTargetX;
    const visualTargetY = calcTargetY;
    const finalVisualDistance = Math.max(0, distance);

    // --- Debug Logging ---
    const isReady = (n: any) => n && n.positionAbsolute && typeof n.width === 'number' && n.width > 0 && typeof n.height === 'number' && n.height > 0;
    console.log('[CustomEdge][Edge State]', {
        edgeId: id,
        source,
        target,
        sourceNodeType: sourceNode?.type,
        targetNodeType: targetNode?.type,
        sourceNodePos: sourceNode?.positionAbsolute,
        targetNodePos: targetNode?.positionAbsolute,
        sourceNodeWidth,
        sourceNodeHeight,
        targetNodeHeight,
        visualSourceX,
        visualSourceY,
        visualTargetX,
        visualTargetY,
        finalVisualDistance,
        renderKey,
        sourceNodeReady: isReady(sourceNode),
        targetNodeReady: isReady(targetNode)
    });


    // If the distance is 0 (buggy), force a re-render after a tick
    React.useEffect(() => {
        if (finalVisualDistance < 2) {
            console.warn(`[CustomEdge] Forcing re-render due to short distance (id: ${id}, distance: ${finalVisualDistance})`);
            const timer = setTimeout(() => setRenderKey(k => k + 1), 20);
            return () => clearTimeout(timer);
        }
    }, [finalVisualDistance]);


    // Get source/target colors from the NODE types in data
    const sourceColor = nodeColors[sourceNode.type as keyof typeof nodeColors] || nodeColors.default;
    const targetColor = nodeColors[targetNode.type as keyof typeof nodeColors] || sourceColor;

    // Define constants for dash calculation *before* the return statement
    const shortDashPath = "M2,0 H10.79 A2,2 0 0 1 12.79,2 V5.089 A2,2 0 0 1 10.79,7.089 H2 A2,2 0 0 1 0,5.089 V2 A2,2 0 0 1 2,0 Z";
    const longDashPath = "M2,0 H14.794 A2,2 0 0 1 16.794,2 V5.089 A2,2 0 0 1 14.794,7.089 H2 A2,2 0 0 1 0,5.089 V2 A2,2 0 0 1 2,0 Z";
    const shortDashWidth = 12.79;
    const longDashWidth = 16.794;
    const dashGap = 8; // Desired gap between dashes
    const pairWidth = shortDashWidth + dashGap + longDashWidth + dashGap; // Width of short+gap+long+gap

    // Calculate the exact number of dashes that fit
    let numDashes = 0;
    let currentDistance = 0;
    while (currentDistance < finalVisualDistance) {
        const isShort = numDashes % 2 === 0;
        const currentSegmentWidth = isShort ? shortDashWidth : longDashWidth;
        if (currentDistance + currentSegmentWidth <= finalVisualDistance) {
            currentDistance += currentSegmentWidth;
            numDashes++;
            // Add gap if there's space for it and another dash might follow
            if (currentDistance + dashGap <= finalVisualDistance && (currentDistance + dashGap + (isShort ? longDashWidth : shortDashWidth)) <= finalVisualDistance) {
                 currentDistance += dashGap;
            } else if (currentDistance < finalVisualDistance && numDashes > 0) {
                // Add gap if it fits, even if another dash doesn't
                if (currentDistance + dashGap <= finalVisualDistance) {
                    currentDistance += dashGap;
                } 
            }
        } else {
            break; // Can't fit the next dash
        }
    }
    numDashes = Math.max(1, numDashes); // Ensure at least one dash if distance > 0

    // Determine color split index
    const colorSplitIndex = Math.ceil(numDashes / 2);

    return (
        <g key={renderKey}>
            {/* Restore original complex rendering - using direct coordinates */}
            <defs>
                <linearGradient id={`edge-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={sourceColor} stopOpacity="1" />
                    <stop offset="49%" stopColor={sourceColor} stopOpacity="1" />
                    <stop offset="51%" stopColor={targetColor} stopOpacity="1" />
                    <stop offset="100%" stopColor={targetColor} stopOpacity="1" />
                </linearGradient>
            </defs>

            {/* Background shadow path - Use CALCULATED points, adjusted style */}
            {/* Background shadow path - blend source and target color, opacity 0.28 */}
            {/* Gradient stroke for main connection line background */}
            <defs>
                <linearGradient
  id={`edge-gradient-bg-${id}`}
  gradientUnits="userSpaceOnUse"
  x1={visualSourceX}
  y1={visualSourceY}
  x2={visualTargetX}
  y2={visualTargetY}
>
  <stop offset="0%" stopColor={sourceColor} />
  <stop offset="49%" stopColor={sourceColor} />
  <stop offset="51%" stopColor={targetColor} />
  <stop offset="100%" stopColor={targetColor} />
</linearGradient>
            </defs>
            <path
                d={`M${visualSourceX},${visualSourceY} L${visualTargetX},${visualTargetY}`}
                stroke={`url(#edge-gradient-bg-${id})`}
                strokeWidth="20"
                fill="none"
                strokeLinecap="round"
                style={{ pointerEvents: 'none' }}
                strokeOpacity={0.28}
            />

            {/* Main line composed of alternating small PATHS */}
            <g
                transform={`translate(${visualSourceX},${visualSourceY}) rotate(${angleDegrees})`}
                style={{ pointerEvents: 'none' }}
            >
                {/* Use the same gradient for both background and squares */}
                {/* Draw fixed SVG squares/dashes along the distance */}
                {Array.from({ length: numDashes }).map((_, index) => {
                    let currentX = 0;
                    const pairIndex = Math.floor(index / 2);
                    const isShortDash = index % 2 === 0;

                    currentX = pairIndex * pairWidth;
                    if (!isShortDash) {
                        currentX += shortDashWidth + dashGap;
                    }

                    // verticalOffset for SVG dash alignment
                    const verticalOffset = -3.5445;

                    // Use the rectangle and outline path from the provided SVG
                    const rectWidth = isShortDash ? 12.79 : 16.794;
                    const rectHeight = 7.089;
                    const rectRx = 2;
                    const rectStrokeWidth = 1.5;
                    const rectX = currentX + 0.75;
                    const rectY = verticalOffset + 0.75;
                    const outlinePath = isShortDash
                        ? "M2-.75h8.79A2.753,2.753,0,0,1,13.54,2V5.089a2.753,2.753,0,0,1-2.75,2.75H2A2.753,2.753,0,0,1-.75,5.089V2A2.753,2.753,0,0,1,2-.75Zm8.79,7.089a1.251,1.251,0,0,0,1.25-1.25V2A1.251,1.251,0,0,0,10.79.75H2A1.251,1.251,0,0,0,.75,2V5.089A1.251,1.251,0,0,0,2,6.339Z"
                        : "M0 0h16.794a2 2 0 0 1 2 2v3.089a2 2 0 0 1-2 2H0a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm16.794 7.089a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H0a1 1 0 0 0-1 1v4.089a1 1 0 0 0 1 1z";
                    const outlineTransform = `translate(${currentX + 0.75}, ${verticalOffset + 0.75})`;
                    return (
                        <g key={index}>
                            {/* Gradient rectangle with white stroke */}
                            <rect
                                x={rectX}
                                y={rectY}
                                width={rectWidth}
                                height={rectHeight}
                                rx={rectRx}
                                fill={index < Math.ceil(numDashes / 2) ? sourceColor : targetColor}
                                stroke="#fff"
                                strokeWidth={rectStrokeWidth}
                            />
                            {/* Outline path overlay (white) */}
                            <path
                                d={outlinePath}
                                transform={outlineTransform}
                                fill="#fff"
                            />
                        </g>
                    );
                })}

                {/* Animated overlay rectangle - covers distance (keep as simple rect) */}
                <rect
                    x="0"
                    y="-10" // Adjust y to cover the thicker background
                    width={finalVisualDistance}
                    height="20" // Adjust height to cover the thicker background
                    fill="white"
                    opacity="0.5" // Keep increased opacity
                >
                    {/* Animate along the distance - Use animation values/duration from provided code */}
                    <animate
                        attributeName="x"
                        values={`-20;${finalVisualDistance}`} // Use values from provided code
                        dur="1.5s" // Use duration from provided code
                        repeatCount="indefinite"
                    />
                </rect>
            </g>
        </g>
    );
};

// 3. Define edgeTypes for React Flow registration
export const edgeTypes = {
    customGradientEdge: CustomEdge, // You can name the type key whatever you like
};

export default CustomEdge; 