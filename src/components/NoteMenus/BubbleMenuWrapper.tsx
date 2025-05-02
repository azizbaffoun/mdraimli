import React from 'react';
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
  return (
    <BubbleMenu 
      key={`bubble-menu-${id}`}
      editor={editor} 
      shouldShow={({ state }) => {
        if (isExiting) return false;
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