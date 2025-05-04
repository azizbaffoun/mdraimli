import React, { useEffect, useState } from 'react';
import { BubbleMenu } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import FloatingMenu from '../FloatingMenu';

interface BubbleMenuWrapperProps {
  editor: Editor;
  id: string;
  isExiting: boolean;
  getSelectionBoundingRect: () => DOMRect;
}

const BubbleMenuWrapper: React.FC<BubbleMenuWrapperProps> = ({
  editor,
  id,
  isExiting,
  getSelectionBoundingRect
}) => {
  const [forceHide, setForceHide] = useState(false);

  // Effect to hide the bubble menu when zooming
  useEffect(() => {
    // Function to hide the bubble menu
    const handleViewportChange = () => {
      // Force hide the bubble menu
      setForceHide(true);

      // Reset after a short delay to allow showing again on new selection
      setTimeout(() => {
        setForceHide(false);
      }, 300);

      // Deselect text to hide the bubble menu
      if (editor && editor.view) {
        editor.commands.blur();
      }
    };

    // Listen for ReactFlow viewport changes
    document.addEventListener('reactflow:viewportchange', handleViewportChange);

    // Listen for wheel events which might trigger zoom
    const wheelHandler = () => {
      handleViewportChange();
    };
    document.addEventListener('wheel', wheelHandler);

    // Listen for zoom control button clicks
    const zoomControlHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if the click is on a zoom control button
      if (target.closest('.fixed.bottom-16.right-6')) {
        handleViewportChange();
      }
    };
    document.addEventListener('click', zoomControlHandler);

    // Listen for keyboard zoom shortcuts (Ctrl+Plus, Ctrl+Minus)
    const keyboardHandler = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === '+' || event.key === '=' || event.key === '-') {
          handleViewportChange();
        }
      }
    };
    document.addEventListener('keydown', keyboardHandler);

    // Cleanup
    return () => {
      document.removeEventListener('reactflow:viewportchange', handleViewportChange);
      document.removeEventListener('wheel', wheelHandler);
      document.removeEventListener('click', zoomControlHandler);
      document.removeEventListener('keydown', keyboardHandler);
    };
  }, [editor]);

  if (!editor) return null;
  return (
    <BubbleMenu
      key={`bubble-menu-${id}`}
      editor={editor}
      shouldShow={({ state }) => {
        if (isExiting || forceHide) return false;
        const { from, to } = state.selection;
        return from !== to;
      }}
      tippyOptions={{
        getReferenceClientRect: getSelectionBoundingRect,
        placement: 'top',
        appendTo: () => document.getElementById(`note-portal-${id}`) || document.body,
        interactive: true,
        zIndex: 9999,
        onHide: () => {
          const tippyElements = document.querySelectorAll('[data-tippy-root]');
          tippyElements.forEach(el => {
            try {
              if (document.body.contains(el)) {
                el.remove();
              }
            } catch (e) {
              console.warn('[BubbleMenu] Could not remove tippy element:', e);
            }
          });
        },
        onDestroy: () => {
          const tippyElements = document.querySelectorAll('[data-tippy-root]');
          tippyElements.forEach(el => {
            try {
              if (document.body.contains(el)) {
                el.remove();
              }
            } catch (err) {
              console.warn('[BubbleMenu] Failed to remove tippy element during onDestroy:', err);
            }
          });
        },
        popperOptions: {
          modifiers: [
            {
              name: 'flip',
              options: {
                fallbackPlacements: ['bottom', 'right', 'left'],
              },
            },
            {
              name: 'preventOverflow',
              options: {
                altAxis: true,
                padding: 5,
              },
            }
          ],
        }
      }}
    >
      <div style={{
        position: 'fixed',
        zIndex: 9999,
        transformOrigin: 'top left',
        pointerEvents: 'auto',
        padding: '8px',
        listStyle: 'none'
      }}>
        <FloatingMenu editor={editor} placement="top" />
      </div>
    </BubbleMenu>
  );
};

export default BubbleMenuWrapper;