import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NodeProps, useReactFlow, Handle, Position } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import { Editor } from '@tiptap/core';
import BubbleMenuWrapper from './NoteMenus/BubbleMenuWrapper';
import OptionsMenu from './NoteMenus/OptionsMenu';

// Define default values
const defaultTitle = "Note Title Here";

// Constants for layout
const LINE_HEIGHT = 21;
const MIN_CONTENT_HEIGHT = LINE_HEIGHT + 24; // Base height + padding
const MAX_CONTENT_HEIGHT = LINE_HEIGHT * 7; // 7 lines max

export default function NoteNode({ id, data }: NodeProps) {
  const { setNodes, getNode } = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(data.title ?? defaultTitle);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // --- Tiptap Editor Setup ---
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: 'Start typing...',
      }),
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: data.content ?? '',
    onUpdate: useCallback(({ editor }: { editor: Editor }) => {
      const content = editor.getHTML();
      // Debounce the node update to prevent excessive re-renders
      const timeoutId = setTimeout(() => {
        setNodes(nds => nds.map(node => node.id === id ? { ...node, data: { ...node.data, content } } : node));
      }, 100);
      return () => clearTimeout(timeoutId);
    }, [id, setNodes]),
    editorProps: {
      attributes: {
        class: 'note-editor-inner w-full resize-none focus:outline-none text-black',
        style: `min-height: ${MIN_CONTENT_HEIGHT}px; max-height: ${MAX_CONTENT_HEIGHT}px; overflow-y: auto; padding-left: 12px; padding-right: 12px; padding-top: 0; box-sizing: border-box; font-size: 15px; font-family: 'Segoe UI'; line-height: 22px; border: none; border-radius: 0; background: transparent;`,
      },
    },
  });

  // Single, unified wheel event handler for the container
  const handleWheel = useCallback((e: WheelEvent) => {
    // Get the target element that's actually scrolling
    const target = e.target as HTMLElement;
    const scrollableTarget = target.closest('.ProseMirror') as HTMLElement;
    
    if (!scrollableTarget) return;

    const isScrollable = scrollableTarget.scrollHeight > scrollableTarget.clientHeight;
    const atTop = scrollableTarget.scrollTop === 0;
    const atBottom = scrollableTarget.scrollTop + scrollableTarget.clientHeight >= scrollableTarget.scrollHeight;
    const scrollingUp = e.deltaY < 0;
    const scrollingDown = e.deltaY > 0;

    // Always stop propagation to prevent canvas zoom while over note
    e.stopPropagation();

    // Prevent default only when:
    // 1. Content is not scrollable, or
    // 2. Trying to scroll up when already at top, or
    // 3. Trying to scroll down when already at bottom
    if (!isScrollable || (scrollingUp && atTop) || (scrollingDown && atBottom)) {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Remove the old wheel handlers from the textarea and editor
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const resizeObserver = new ResizeObserver(() => {
      if (textarea.scrollHeight > textarea.clientHeight) {
        // Handle scrollable state if needed
      }
    });

    resizeObserver.observe(textarea);
    return () => resizeObserver.disconnect();
  }, []);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, title: newTitle } };
        }
        return node;
      })
    );
  };

  // Function to calculate the bounding rect of the current selection
  const getSelectionBoundingRect = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return {
        width: 0, height: 0, top: -9999, left: -9999, right: -9999, bottom: -9999, x: -9999, y: -9999, toJSON: () => ({}),
      };
    }
  
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const bubbleWidth = 240;
    const bubbleHeight = 90;
    const bubbleGap = 16;
    const leftOffset = -40;
  
    const left = rect.left + (rect.width / 2) - (bubbleWidth / 2) + leftOffset;
    const top = rect.top - bubbleHeight - bubbleGap;
  
    return {
      width: bubbleWidth,
      height: bubbleHeight,
      top,
      bottom: top + bubbleHeight,
      left,
      right: left + bubbleWidth,
      x: left,
      y: top,
      toJSON: () => ({})
    };
  }, []);

  // --- Menu Handlers ---
  const handleDelete = () => {
    if (data.onDelete) {
      data.onDelete(id);
    }
    setIsOptionsMenuOpen(false);
  };

  const handleDuplicate = () => {
    const nodeToDuplicate = getNode(id);
    if (!nodeToDuplicate) return;

    const newNodeId = `note-${uuidv4()}`;
    const position = {
      x: nodeToDuplicate.position.x + 30,
      y: nodeToDuplicate.position.y + 30,
    };

    const newNode = {
      ...nodeToDuplicate,
      id: newNodeId,
      position,
      data: { 
        ...nodeToDuplicate.data,
        onDelete: data.onDelete
      },
      selected: false,
      dragHandle: `#note-header-${newNodeId}`,
    };

    setNodes((nds) => nds.concat(newNode));
    setIsOptionsMenuOpen(false);
  };

  // --- Options Menu Handlers ---
  const toggleOptionsMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOptionsMenuOpen(!isOptionsMenuOpen);
  };

  // Main cleanup effect for editor destruction on unmount
  useEffect(() => {
    if (data.isExiting) {
      setIsOptionsMenuOpen(false);
      if (editor && !editor.isDestroyed) {
        editor.setOptions({ editable: false });
        editor.destroy();
      }
    }
    
    return () => {
      setIsOptionsMenuOpen(false);
      if (editor && !editor.isDestroyed) {
        editor.setOptions({ editable: false });
        editor.destroy();
      }
    };
  }, [data.isExiting, editor]);

  return (
    <div
      ref={containerRef}
      className={`note-node-container relative bg-white rounded-lg shadow-md border border-gray-200 flex flex-col hover:shadow-lg transition-all duration-150 ${data.isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
      style={{ width: 270, minHeight: 110 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ opacity: 0 }}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ opacity: 0 }}
      />
      
      {/* Header */}
      <div
        id={`note-header-${id}`}
        className="h-[36px] w-full flex items-center rounded-t-lg"
        style={{
          background: 'linear-gradient(100deg, #3799db 0%, #2db4a6 100%)',
          paddingLeft: '12px',
          paddingRight: '5px'
        }}
      >
        {/* Note Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16.326" height="18" viewBox="0 0 16.326 18">
          <g id="Group_5337" data-name="Group 5337" transform="translate(-129.859 -208.5)">
            <g id="stickynote" transform="translate(127.609 207.25)">
              <path id="Path_409" data-name="Path 409" d="M7.878,5.02a.628.628,0,0,1-.628-.628V1.878a.628.628,0,1,1,1.257,0V4.391A.628.628,0,0,1,7.878,5.02Z" transform="translate(-0.814 0)" fill="#fff"/>
              <path id="Path_410" data-name="Path 410" d="M15.878,5.02a.628.628,0,0,1-.628-.628V1.878a.628.628,0,0,1,1.257,0V4.391A.628.628,0,0,1,15.878,5.02Z" transform="translate(-2.117 0)" fill="#fff"/>
              <path id="Path_411" data-name="Path 411" d="M13.58,11.507h-6.7a.628.628,0,1,1,0-1.257h6.7a.628.628,0,0,1,0,1.257Z" transform="translate(-0.653 -1.465)" fill="#fff"/>
              <path id="Path_412" data-name="Path 412" d="M11.067,15.507H6.878a.628.628,0,1,1,0-1.257h4.188a.628.628,0,1,1,0,1.257Z" transform="translate(-0.652 -2.117)" fill="#fff"/>
              <path id="Path_413" data-name="Path 413" d="M12.924,19.493H7.9c-2.233,0-3.682-.481-4.56-1.515A6.591,6.591,0,0,1,2.25,13.692V8.526c0-2.093.384-3.494,1.209-4.41A4.825,4.825,0,0,1,7.028,2.751H13.8a4.8,4.8,0,0,1,3.572,1.363c.824.917,1.208,2.319,1.208,4.413v5.316a.628.628,0,0,1-1.256,0V8.526a5.375,5.375,0,0,0-.887-3.574,3.677,3.677,0,0,0-2.689-.947H7.082a3.7,3.7,0,0,0-2.69.951,5.366,5.366,0,0,0-.886,3.57v5.165c0,1.781.237,2.82.792,3.474.621.731,1.766,1.072,3.6,1.072h5.023a.628.628,0,1,1,0,1.256Z" transform="translate(0 -0.243)" fill="#fff"/>
              <path id="Path_414" data-name="Path 414" d="M17.391,15.25H19.9a.628.628,0,0,1,.444,1.072l-5.026,5.026A.628.628,0,0,1,14.25,20.9V18.391A2.833,2.833,0,0,1,17.391,15.25Zm1,1.257h-1c-1.321,0-1.885.564-1.885,1.885v1Z" transform="translate(-1.957 -2.283)" fill="#fff"/>
            </g>
          </g>
        </svg>

        {/* Title Input */}
        <input 
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder={defaultTitle}
          className="flex-grow h-full bg-transparent text-white font-['Segoe UI'] text-[15px] focus:outline-none placeholder-white placeholder-opacity-75"
          style={{
            marginLeft: '8px',
            lineHeight: '36px',
            fontWeight: 400
          }}
        />
        
        {/* Options Button */}
        <button 
          onClick={toggleOptionsMenu}
          className="flex-shrink-0 w-[26px] h-[26px] flex items-center justify-center"
          style={{ marginLeft: 'auto' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
            <g id="Group_5350" data-name="Group_5350" transform="translate(-356.139 -204.5)">
              <path id="Union_50" data-name="Union 50" d="M-213.5,0A12.5,12.5,0,0,1-201,12.5,12.5,12.5,0,0,1-213.5,25,12.5,12.5,0,0,1-226,12.5,12.5,12.5,0,0,1-213.5,0Z" transform="translate(582.639 205)" fill="#fff" stroke="rgba(0,0,0,0)" strokeWidth="1" opacity="0.32"/>
              <circle id="Ellipse_289" data-name="Ellipse_289" cx="1.35" cy="1.35" r="1.35" transform="translate(363.74 216.15)" fill="#fff" stroke="rgba(0,0,0,0)" strokeWidth="1"/>
              <circle id="Ellipse_290" data-name="Ellipse_290" cx="1.35" cy="1.35" r="1.35" transform="translate(367.789 216.15)" fill="#fff" stroke="rgba(0,0,0,0)" strokeWidth="1"/>
              <circle id="Ellipse_291" data-name="Ellipse_291" cx="1.35" cy="1.35" r="1.35" transform="translate(371.84 216.15)" fill="#fff" stroke="rgba(0,0,0,0)" strokeWidth="1"/>
            </g>
          </svg>
        </button>
      </div>

      {/* Textarea Editor */}
      <div
        className="bg-white note-editor-outer"
        style={{
          position: 'relative',
          maxHeight: `${MAX_CONTENT_HEIGHT}px`,
          paddingTop: 0,
          boxSizing: 'border-box',
        }}
      >
        {/* Tiptap Rich Text Editor */}
        {editor && (
          <>
            {/* BubbleMenu */}
            <BubbleMenuWrapper
              editor={editor}
              id={id}
              isExiting={!!data.isExiting}
              getSelectionBoundingRect={getSelectionBoundingRect}
            />

            {/* Editor content */}
            <div style={{ width: '100%' }}>
              <EditorContent editor={editor} />
            </div>
          </>
        )}
      </div>

      {/* Options Menu */}
      {isOptionsMenuOpen && (
        <OptionsMenu
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
} 