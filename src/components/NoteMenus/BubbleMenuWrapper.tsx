import React, { useEffect, useState, useRef } from 'react';
import { BubbleMenu } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import FloatingMenu from '../FloatingMenu';
import { useReactFlow } from 'reactflow';

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
  const menuRef = useRef<HTMLDivElement>(null);
  const { getViewport } = useReactFlow();
  const lastViewportRef = useRef(getViewport());
  const isFormattingActiveRef = useRef(false);

  // Function to hide the bubble menu - defined outside useEffect to be accessible in tippyOptions
  const handleViewportChange = () => {
    // Force hide the bubble menu
    setForceHide(true);

    // Reset after a short delay to allow showing again on new selection
    setTimeout(() => {
      setForceHide(false);
    }, 300);

    // Deselect text to ensure the menu closes
    if (editor && editor.view) {
      // Use the built-in commands to clear the selection
      editor.commands.blur();

      // Use window.getSelection to clear any browser selection
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }

      // Use a more direct approach to clear the selection
      try {
        // First blur the editor to remove focus
        editor.commands.blur();

        // Then use a command to deselect
        editor.commands.selectTextblockEnd();
        editor.commands.selectTextblockStart();

        // Force clear any text selection
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
        }
      } catch (e) {
        console.warn('[BubbleMenuWrapper] Error clearing selection:', e);
      }
    }
  };

  // Track when formatting is applied
  useEffect(() => {
    if (!editor) return;

    // Set up a transaction handler to detect formatting changes
    const handleTransaction = () => {
      // If any formatting mark is active, set the formatting active flag
      const isAnyFormatActive =
        editor.isActive('bold') ||
        editor.isActive('italic') ||
        editor.isActive('underline') ||
        editor.isActive('strike') ||
        editor.isActive('highlight') ||
        editor.isActive('taskList') ||
        editor.isActive('orderedList') ||
        editor.isActive('bulletList') ||
        editor.isActive({ textAlign: 'left' }) ||
        editor.isActive({ textAlign: 'right' }) ||
        editor.isActive({ textAlign: 'center' });

      isFormattingActiveRef.current = isAnyFormatActive;
    };

    // Add transaction handler
    editor.on('transaction', handleTransaction);

    return () => {
      editor.off('transaction', handleTransaction);
    };
  }, [editor]);

  // We'll handle zoom events in a more optimized way to avoid performance issues

  // Effect to hide the bubble menu when zooming or clicking outside
  useEffect(() => {

    // Check for zoom changes
    const checkZoomChanges = () => {
      const currentViewport = getViewport();
      if (currentViewport.zoom !== lastViewportRef.current.zoom) {
        // Zoom has changed, hide the menu
        handleViewportChange();

        // Force clear any text selection immediately
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
        }

        // Also clear the editor selection directly
        if (editor && editor.view) {
          // Force blur the editor to clear selection
          editor.commands.blur();
        }

        lastViewportRef.current = currentViewport;
      }
    };

    // Set up interval to check for zoom changes, but with a longer interval for better performance
    const zoomCheckInterval = setInterval(checkZoomChanges, 300);

    // Listen for ReactFlow viewport changes
    const viewportChangeHandler = () => {
      // Hide the menu
      handleViewportChange();

      // Force clear any text selection immediately
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }

      // Also clear the editor selection directly
      if (editor && editor.view) {
        // Force blur the editor to clear selection
        editor.commands.blur();
      }
    };
    document.addEventListener('reactflow:viewportchange', viewportChangeHandler);

    // Listen for wheel events which might trigger zoom, but with debouncing for performance
    let wheelTimeout: NodeJS.Timeout | null = null;
    const wheelHandler = (e: WheelEvent) => {
      // Skip if the wheel event is inside a note and not a zoom event (Ctrl key not pressed)
      const target = e.target as HTMLElement;
      const isInsideNote = !!target.closest('.note-node-container');
      const isZoomEvent = e.ctrlKey || e.metaKey;

      // Only process if it's a zoom event or outside a note
      if (isZoomEvent || !isInsideNote) {
        // Debounce to avoid performance issues
        if (wheelTimeout) {
          clearTimeout(wheelTimeout);
        }

        wheelTimeout = setTimeout(() => {
          // Close the menu
          handleViewportChange();

          // Clear any text selection
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
          }
        }, 50);
      }
    };
    document.addEventListener('wheel', wheelHandler);

    // Listen for zoom control button clicks
    const zoomControlHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if the click is on a zoom control button
      if (target.closest('.fixed.bottom-16.right-6')) {
        // Hide the menu
        handleViewportChange();

        // Force clear any text selection immediately
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
        }

        // Also clear the editor selection directly
        if (editor && editor.view) {
          // Force blur the editor to clear selection
          editor.commands.blur();
        }
      }
    };
    document.addEventListener('click', zoomControlHandler);

    // Listen for keyboard zoom shortcuts (Ctrl+Plus, Ctrl+Minus)
    const keyboardHandler = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === '+' || event.key === '=' || event.key === '-') {
          // Hide the menu
          handleViewportChange();

          // Force clear any text selection immediately
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
          }

          // Also clear the editor selection directly
          if (editor && editor.view) {
            // Force blur the editor to clear selection
            editor.commands.blur();
          }
        }
      }
    };
    document.addEventListener('keydown', keyboardHandler);

    // Handle clicks outside the menu to close it
    const handleClickOutside = (event: MouseEvent) => {
      // Get all tippy elements
      const tippyElements = document.querySelectorAll('[data-tippy-root]');

      // Check if the click is outside all tippy elements
      let isOutsideTippy = true;
      tippyElements.forEach(el => {
        if (el.contains(event.target as Node)) {
          isOutsideTippy = false;
        }
      });

      // Check if the click is outside the editor content
      const isOutsideEditor = !editor?.options.element?.contains(event.target as Node);

      // Check if the click is on the canvas (ReactFlow pane)
      const isOnCanvas = !!(event.target as HTMLElement).closest('.react-flow__pane');

      // Check if the click is on the note container
      const isOnNoteContainer = !!(event.target as HTMLElement).closest('.note-node-container');

      // Only hide the menu if clicking outside both tippy and editor,
      // or directly on the canvas but not on the note container
      if ((isOutsideTippy && isOutsideEditor) || (isOnCanvas && !isOnNoteContainer)) {
        // Use the same handler as for viewport changes to ensure consistent behavior
        handleViewportChange();

        // Extra safety: directly clear any text selection
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
        }

        // Additional step to ensure the editor selection is cleared
        if (editor) {
          // First blur the editor to remove focus
          editor.commands.blur();

          // Then use commands to reset selection
          editor.commands.selectTextblockEnd();
          editor.commands.selectTextblockStart();

          // Set a flag to indicate we've cleared the selection
          isFormattingActiveRef.current = false;
        }
      }
    };

    // Use both mousedown and click events to ensure we catch all interactions
    document.addEventListener('mousedown', handleClickOutside, { capture: true });
    document.addEventListener('click', handleClickOutside, { capture: true });

    // Cleanup
    return () => {
      clearInterval(zoomCheckInterval);
      document.removeEventListener('reactflow:viewportchange', viewportChangeHandler);
      document.removeEventListener('wheel', wheelHandler);
      document.removeEventListener('click', zoomControlHandler);
      document.removeEventListener('keydown', keyboardHandler);
      document.removeEventListener('mousedown', handleClickOutside, { capture: true });
      document.removeEventListener('click', handleClickOutside, { capture: true });
    };
  }, [editor, getViewport, handleViewportChange]);

  if (!editor) return null;
  return (
    <BubbleMenu
      key={`bubble-menu-${id}`}
      editor={editor}
      shouldShow={({ state }) => {
        if (isExiting || forceHide) return false;

        // Only show when there's a text selection
        const { from, to } = state.selection;
        const hasSelection = from !== to;

        // Check if editor is focused - but don't require focus for showing the menu
        // This allows the menu to stay visible even when clicking on formatting buttons
        return hasSelection;
      }}
      tippyOptions={{
        getReferenceClientRect: getSelectionBoundingRect,
        placement: 'top',
        appendTo: () => document.getElementById(`note-portal-${id}`) || document.body,
        interactive: true,
        zIndex: 9999,
        hideOnClick: false, // Don't hide when clicking inside the menu
        onClickOutside: () => {
          // Use the same handler as for viewport changes to ensure consistent behavior
          handleViewportChange();

          // Extra safety: directly clear any text selection
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
          }
        },
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
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          zIndex: 9999,
          transformOrigin: 'top left',
          pointerEvents: 'auto',
          padding: '8px',
          listStyle: 'none'
        }}
      >
        <FloatingMenu editor={editor} placement="top" />
      </div>
    </BubbleMenu>
  );
};

export default BubbleMenuWrapper;