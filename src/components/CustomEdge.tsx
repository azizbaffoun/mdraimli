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
const CustomEdge: React.FC<EdgeProps> = ({ 
    id, 
    source, // Use source ID
    target, // Use target ID
    // sourceX, sourceY, targetX, targetY are technically available but potentially inaccurate for our offset handles
    // data prop is no longer needed for node info
}) => {

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
    const calcSourceX = sourceNode.positionAbsolute.x + sourceNodeWidth + connectorOffset;
    const calcSourceY = sourceNode.positionAbsolute.y + (sourceNodeHeight * 0.45);
    const calcTargetX = targetNode.positionAbsolute.x - connectorOffset;
    const calcTargetY = targetNode.positionAbsolute.y + (targetNodeHeight * 0.45);

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

    // Get source/target colors from the NODE types in data
    const sourceColor = nodeColors[sourceNode.type as keyof typeof nodeColors] || nodeColors.default;
    const targetColor = nodeColors[targetNode.type as keyof typeof nodeColors] || sourceColor;

    // Remove NaN check if confident, or keep if needed
    // if (isNaN(visualSourceX) || ...) { ... }

    return (
        <g>
            {/* Remove Debugging Elements */}
            {/* <circle ... /> */}
            {/* <path ... stroke="lime" ... /> */}

            {/* Restore original complex rendering - using direct coordinates */}
            <defs>
                <linearGradient id={`edge-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={sourceColor} stopOpacity="0.2" />
                    <stop offset="49%" stopColor={sourceColor} stopOpacity="0.2" />
                    <stop offset="51%" stopColor={targetColor} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={targetColor} stopOpacity="0.2" />
                </linearGradient>
            </defs>

            {/* Background shadow path - Use CALCULATED points */}
            <path
                d={`M${visualSourceX},${visualSourceY} L${visualTargetX},${visualTargetY}`}
                stroke={`url(#edge-gradient-${id})`}
                strokeWidth="24" 
                fill="none"
                strokeLinecap="round"
            >
                {/* Pulsing animation */}
                <animate
                    attributeName="stroke-opacity"
                    values="0.2;0.4;0.2"
                    dur="3s"
                    repeatCount="indefinite"
                />
            </path>

            {/* Main line composed of small rectangles - positioned at CALCULATED source, rotated */}
            <g
                transform={`translate(${visualSourceX},${visualSourceY}) rotate(${angleDegrees})`} 
                style={{ pointerEvents: 'none' }}
            >
                {/* Draw fixed rectangles along the distance */}
                {Array.from({ length: Math.max(1, Math.ceil(finalVisualDistance / 26)) }).map((_, index) => (
                    <rect
                        key={index}
                        x={index * 26} 
                        y="-2.5" 
                        width="20"
                        height="5"
                        fill={index < Math.ceil(finalVisualDistance / 52) ? sourceColor : targetColor}
                        stroke="white"
                        strokeWidth="1"
                    />
                ))}

                {/* Animated overlay rectangle - covers distance */}
                <rect
                    x="0"
                    y="-2.5"
                    width={finalVisualDistance} 
                    height="5"
                    fill="white"
                    opacity="0.3" 
                >
                    {/* Animate along the distance */}
                    <animate
                        attributeName="x"
                        values={`-20;${finalVisualDistance}`} 
                        dur="1.5s"
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