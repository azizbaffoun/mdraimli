import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';

export const useZoom = () => {
  const { zoomIn, zoomOut } = useReactFlow();

  const handleZoomIn = useCallback(() => {
    zoomIn();
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut();
  }, [zoomOut]);

  return { handleZoomIn, handleZoomOut };
}; 