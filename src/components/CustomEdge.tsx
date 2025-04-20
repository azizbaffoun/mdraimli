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
    // --- Fix: Force re-render if distance is zero (background bug workaround) ---
    const [renderKey, setRenderKey] = React.useState(0);


    // Get live node data from the store using IDs
    const nodeInternals = useStore(nodeSelector);
    const sourceNode = nodeInternals.get(source);
    const targetNode = nodeInternals.get(target);

    // Define connector offset and node dimensions (adjust if dynamic)
    const connectorOffset = 16.5;
    // Get dimensions from live nodes, fallback if needed
    const sourceNodeWidth = sourceNode?.width ?? 128;
    const sourceNodeHeight = sourceNode?.height ?? 128;
    const targetNodeHeight = targetNode?.height ?? 128;

    // Check if node data is available from the store
    if (!sourceNode || !targetNode) {
        // Return null or a default line if data is missing
        console.warn(`CustomEdge ${id}: Missing source or target node data from store.`);
        return null; // Or draw a simple line between fallbacks
    }

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
    console.log('[CustomEdge Render]', {
        id,
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
        renderKey
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
            <path
                d={`M${visualSourceX},${visualSourceY} L${visualTargetX},${visualTargetY}`}
                stroke={blendColors(sourceColor, targetColor, 0.5)}
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
                {/* Draw fixed PATHS along the distance */}
                {Array.from({ length: numDashes }).map((_, index) => {
                    let currentX = 0;
                    const pairIndex = Math.floor(index / 2);
                    const isShortDash = index % 2 === 0;

                    currentX = pairIndex * pairWidth;
                    if (!isShortDash) {
                        currentX += shortDashWidth + dashGap;
                    }

                    const pathData = isShortDash ? shortDashPath : longDashPath;
                    const fillColor = index < colorSplitIndex ? sourceColor : targetColor;
                    const verticalOffset = -3.5445; // Center the 7.089 height

                    // Return a fragment containing both the white background and the colored foreground
                    return (
                        <React.Fragment key={index}>
                            {/* White Background/Border Path */}
                            <path
                                d={pathData}
                                transform={`translate(${currentX}, ${verticalOffset})`}
                                fill="#fff"
                                // No stroke needed if the fill covers the area
                            />
                            {/* Colored Foreground Path (drawn on top) */}
                            <path
                                d={pathData}
                                transform={`translate(${currentX}, ${verticalOffset})`} 
                                fill={fillColor}
                                // No stroke here
                            />
                        </React.Fragment>
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