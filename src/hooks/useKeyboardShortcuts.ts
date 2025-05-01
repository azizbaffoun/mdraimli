import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  handleUndo: () => void;
  handleRedo: () => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  layoutNodes: () => void;
}

export const useKeyboardShortcuts = ({
  handleUndo,
  handleRedo,
  handleZoomIn,
  handleZoomOut,
  layoutNodes,
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.shiftKey) {
        switch (event.key.toLowerCase()) {
          case 'z':
            event.preventDefault();
            handleUndo();
            break;
          case 'y':
            event.preventDefault();
            handleRedo();
            break;
          case '=':
          case '+':
            event.preventDefault();
            handleZoomIn();
            break;
          case '-':
            event.preventDefault();
            handleZoomOut();
            break;
          case 'l':
            event.preventDefault();
            layoutNodes();
            break;
        }
      } else if ((event.metaKey || event.ctrlKey) && event.shiftKey) {
        if (event.key.toLowerCase() === 'z') {
          event.preventDefault();
          handleRedo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleZoomIn, handleZoomOut, layoutNodes]);
}; 