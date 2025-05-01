import React, { memo, useMemo } from 'react';
import { EdgeProps, useStore, Node } from 'reactflow';

// 1. Define node colors (Adjust keys/values to match your node types)
const nodeColors = {
  start: '#888888',         // Default gray for start
  topicalKeyword: {
    left: '#82ced1',       // Left connector color (teal)
    right: '#82ced1'       // Right connector color (teal)
  },
  video: {
    left: '#86c1e9',       // Left connector color
    right: '#86c1e9'       // Right connector color
  },
  article: '#3799DB',       // Article blue
  podcast: '#b388de',       // Podcast purple
  socialMedia: '#FC8500',   // Orange
  default: '#888888'        // Default fallback color
};

// Helper function to select node data from the store
const nodeSelector = (s: any) => ({
  nodes: s.getNodes(),
});

// Helper function to get the correct color based on node type and position
const getNodeColor = (node: Node | undefined, isSource: boolean) => {
  if (!node) return nodeColors.default;
  const nodeType = node.type as keyof typeof nodeColors;
  const colors = nodeColors[nodeType];
  
  if (typeof colors === 'string') return colors;
  return isSource ? colors?.left || nodeColors.default : colors?.right || nodeColors.default;
};

// Memoized gradient definition component
const GradientDef = memo(({ 
  id, 
  sourceColor, 
  targetColor,
  sourceX,
  sourceY,
  targetX,
  targetY,
  angle
}: { 
  id: string, 
  sourceColor: string, 
  targetColor: string,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  angle: number
}) => {
  // Calculate the gradient vector based on the angle
  const gradientLength = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  
  // Calculate gradient coordinates
  const x1 = midX - (gradientLength / 2) * Math.cos(angle * Math.PI / 180);
  const y1 = midY - (gradientLength / 2) * Math.sin(angle * Math.PI / 180);
  const x2 = midX + (gradientLength / 2) * Math.cos(angle * Math.PI / 180);
  const y2 = midY + (gradientLength / 2) * Math.sin(angle * Math.PI / 180);

  return (
    <linearGradient 
      id={id} 
      gradientUnits="userSpaceOnUse"
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
    >
      <stop offset="0%" stopColor={sourceColor} stopOpacity="1" />
      <stop offset="49%" stopColor={sourceColor} stopOpacity="1" />
      <stop offset="51%" stopColor={targetColor} stopOpacity="1" />
      <stop offset="100%" stopColor={targetColor} stopOpacity="1" />
    </linearGradient>
  );
});

// Constants for dash calculation
const shortDashWidth = 12.79;
const longDashWidth = 16.794;
const dashGap = 8;
const pairWidth = shortDashWidth + dashGap + longDashWidth + dashGap;
const MIN_EDGE_DISTANCE = 30; // Minimum distance to ensure gradient works

// Opacity settings for different parts
const opacitySettings = {
  background: 0.15,  // Reduced background opacity
  sourceDashes: {
    short: { fill: 1, stroke: 1 },  // Full opacity for dashes
    long: { fill: 1, stroke: 1 }
  },
  targetDashes: {
    short: { fill: 1, stroke: 1 },
    long: { fill: 1, stroke: 1 }
  },
  animatedOverlay: 0.2
};

// Calculate number of dashes that fit in a given distance
const calculateDashes = (distance: number) => {
  const effectiveDistance = Math.max(distance, MIN_EDGE_DISTANCE);
  const minDistance = shortDashWidth + dashGap; // Minimum distance needed for one dash
  
  if (effectiveDistance < minDistance) {
    return 1; // Always show at least one dash
  }

  // Calculate how many complete pairs can fit
  const availableSpace = effectiveDistance + dashGap; // Add one gap to account for the last element
  const pairsCount = Math.floor(availableSpace / pairWidth);
  
  // Calculate remaining space
  const remainingSpace = availableSpace - (pairsCount * pairWidth);
  
  // Check if we can fit an additional short dash
  let additionalDashes = 0;
  if (remainingSpace >= shortDashWidth) {
    additionalDashes++;
    if (remainingSpace >= shortDashWidth + dashGap + longDashWidth) {
      additionalDashes++;
    }
  }

  return Math.max(1, (pairsCount * 2) + additionalDashes);
};

const CustomEdge: React.FC<EdgeProps> = memo(({ 
  id, 
  source,
  target,
  sourceX: defaultSourceX,
  sourceY: defaultSourceY,
  targetX: defaultTargetX,
  targetY: defaultTargetY,
}) => {
  const { nodes } = useStore(nodeSelector);
  
  const sourceNode = nodes.find((n: Node) => n.id === source);
  const targetNode = nodes.find((n: Node) => n.id === target);

  // Calculate coordinates with fallback to default positions
  const sourceX = sourceNode?.position ? 
    sourceNode.position.x + (sourceNode.width || 0) + 16.5 : 
    defaultSourceX;
  const sourceY = sourceNode?.position ? 
    sourceNode.position.y + ((sourceNode.height || 0) * 0.4) : 
    defaultSourceY;
  const targetX = targetNode?.position ? 
    targetNode.position.x - 16.5 : 
    defaultTargetX;
  const targetY = targetNode?.position ? 
    targetNode.position.y + ((targetNode.height || 0) * 0.4) : 
    defaultTargetY;

  // Calculate angle and distance
  const deltaX = targetX - sourceX;
  const deltaY = targetY - sourceY;
  const rawDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || MIN_EDGE_DISTANCE;
  const distance = Math.max(rawDistance, MIN_EDGE_DISTANCE);
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  // Get colors using the new helper function
  const sourceColor = getNodeColor(sourceNode, true);
  const targetColor = getNodeColor(targetNode, false);

  // Memoize gradient path
  const gradientPath = useMemo(() => {
    const isInitialConnection = deltaX === 0 && deltaY === 0;
    const endX = isInitialConnection ? sourceX + MIN_EDGE_DISTANCE : targetX;
    const endY = isInitialConnection ? sourceY : targetY;
    return `M${sourceX},${sourceY} L${endX},${endY}`;
  }, [sourceX, sourceY, targetX, targetY, deltaX, deltaY]);

  // Calculate number of dashes
  const numDashes = calculateDashes(distance);

  return (
    <g style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }}>
      <defs>
        <GradientDef 
          id={`edge-gradient-${id}`} 
          sourceColor={sourceColor} 
          targetColor={targetColor}
          sourceX={sourceX}
          sourceY={sourceY}
          targetX={targetX}
          targetY={targetY}
          angle={angle}
        />
      </defs>

      {/* Background group with lower z-index */}
      <g style={{ zIndex: 1 }}>
        <path
          d={gradientPath}
          stroke={`url(#edge-gradient-${id})`}
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
          style={{ 
            pointerEvents: 'none',
            transform: 'translate3d(0,0,0)',
            willChange: 'transform',
            mixBlendMode: 'multiply'
          }}
          strokeOpacity={opacitySettings.background}
        />
      </g>

      {/* Dashes group with higher z-index */}
      <g style={{ zIndex: 2 }}>
        <g transform={`translate(${sourceX},${sourceY}) rotate(${angle})`}>
          {Array.from({ length: numDashes }).map((_, index) => {
            const isShortDash = index % 2 === 0;
            const pairIndex = Math.floor(index / 2);
            let currentX = pairIndex * pairWidth;
            
            if (!isShortDash) {
              currentX += shortDashWidth + dashGap;
            }

            const rectWidth = isShortDash ? shortDashWidth : longDashWidth;
            const rectHeight = 7.089;
            const rectRx = 2;
            const rectX = currentX + 0.75;
            const rectY = -3.5445 + 0.75;

            const isSourceSide = index < Math.ceil(numDashes / 2);
            const opacities = isSourceSide 
              ? opacitySettings.sourceDashes[isShortDash ? 'short' : 'long']
              : opacitySettings.targetDashes[isShortDash ? 'short' : 'long'];

            return (
              <g key={index}>
                <rect
                  x={rectX}
                  y={rectY}
                  width={rectWidth}
                  height={rectHeight}
                  rx={rectRx}
                  fill={isSourceSide ? sourceColor : targetColor}
                  stroke="#fff"
                  strokeWidth={1.5}
                  fillOpacity={opacities.fill}
                  strokeOpacity={opacities.stroke}
                  style={{ mixBlendMode: 'normal' }}
                />
              </g>
            );
          })}

          {/* Animated overlay with highest z-index */}
          <g style={{ zIndex: 3 }}>
            <rect
              x="0"
              y="-10"
              width={distance}
              height="20"
              fill="white"
              opacity={opacitySettings.animatedOverlay}
            >
              <animate
                attributeName="x"
                values={`-20;${distance}`}
                dur="1.5s"
                repeatCount="indefinite"
              />
            </rect>
          </g>
        </g>
      </g>
    </g>
  );
});

CustomEdge.displayName = 'CustomEdge';

export const edgeTypes = {
  customGradientEdge: CustomEdge,
};

export default CustomEdge; 