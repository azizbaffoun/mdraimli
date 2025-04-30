import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NodeProps, useReactFlow, Handle, Position } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

import { EditorContent, useEditor, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';

// Data structure for the node
interface NoteNodeData {
  title?: string;
  content?: string;
  onChange?: (id: string, data: { title?: string; content?: string }) => void;
}

// Define default values
const defaultTitle = "Note Title Here";

// Constants for layout
const LINE_HEIGHT = 21;
const MIN_CONTENT_HEIGHT = LINE_HEIGHT + 24; // Base height + padding
const MAX_CONTENT_HEIGHT = LINE_HEIGHT * 7; // 7 lines max

const NoteNode: React.FC<NodeProps<NoteNodeData>> = ({ id, data }) => {
  const { setNodes, getNode } = useReactFlow();
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(data.title ?? defaultTitle);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);

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
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      console.log("[NoteNode] onUpdate - Content Changed:", content.substring(0, 50) + "..."); // Log content change
      setNodes(nds => nds.map(node => node.id === id ? { ...node, data: { ...node.data, content } } : node));    },
     
      onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const start = editor.view.coordsAtPos(from);
        const end = editor.view.coordsAtPos(to);
        const left = Math.min(start.left, end.left);
        const right = Math.max(start.right, end.right);
        const top = Math.min(start.top, end.top);
        const bottom = Math.max(start.bottom, end.bottom);
        const rect = { left, top, right, bottom, width: right - left, height: bottom - top };
        console.log('[NoteNode] Text selected:', { from, to, rect });
      } else {
      }
    },
    editorProps: {
      attributes: {
        class: 'note-editor-inner w-full resize-none focus:outline-none text-black',
        style: `min-height: ${MIN_CONTENT_HEIGHT}px; max-height: ${MAX_CONTENT_HEIGHT}px; overflow-y: auto; padding-left: 12px; padding-right: 12px; padding-top: 0; box-sizing: border-box; font-size: 15px; font-family: 'Segoe UI'; line-height: 22px; border: none; border-radius: 0; background: transparent;`,
      },
    },
  });

  // Simple textarea for note content
  const [content, setContent] = useState(data.content ?? '');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  // State for scrollable detection and hover
  const [isScrollable, setIsScrollable] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setContent(data.content ?? '');
  }, [data.content]);

  // Auto-expand textarea up to 7 lines and detect scrollable
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = MAX_CONTENT_HEIGHT;
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
      // Debug log
      console.log('[NoteNode] textarea scrollHeight:', scrollHeight, 'maxHeight:', maxHeight, 'isScrollable:', scrollHeight > maxHeight);
      // Detect if content is scrollable (over 7 lines)
      setIsScrollable(scrollHeight > maxHeight);
    }
  }, [content]);

  // Native wheel event listener for textarea (to catch events React might miss)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const handler = (e: WheelEvent) => {
      const el = textarea;
      const isScrollable = el.scrollHeight > el.clientHeight;
      const atTop = el.scrollTop === 0;
      const atBottom = el.scrollTop + el.clientHeight === el.scrollHeight;
      const scrollingUp = e.deltaY < 0;
      const scrollingDown = e.deltaY > 0;
      console.log('[NoteNode] native textarea wheel', { isHovered, isScrollable, atTop, atBottom, deltaY: e.deltaY });
      // Always stop propagation to prevent canvas zoom
      e.stopPropagation();
      // Only preventDefault if not scrollable, or at edge and trying to scroll past
      if (!isScrollable || (scrollingUp && atTop) || (scrollingDown && atBottom)) {
        console.log('[NoteNode] native preventDefault called onWheel (block canvas zoom at edge)');
        e.preventDefault();
      }
    };
    textarea.addEventListener('wheel', handler, { passive: false });
    return () => textarea.removeEventListener('wheel', handler);
  }, [isHovered, isScrollable]);

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
  
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    const bubbleWidth = 240; // bubble width
    const arrowOffset = 20; // distance from left edge to arrow
  
    // Shift the bubble left so the arrow points to the start
    const left = rect.left - arrowOffset;
    const top = rect.top;
  
    return {
      width: bubbleWidth,
      height: rect.height,
      top,
      bottom: top + rect.height,
      left,
      right: left + bubbleWidth,
      x: left,
      y: top,
      toJSON: () => JSON.stringify({
        width: bubbleWidth,
        height: rect.height,
        top,
        bottom: top + rect.height,
        left,
        right: left + bubbleWidth,
        x: left,
        y: top,
      }),
    };
  }, []);

  // --- Menu Handlers ---
  const handleDelete = () => {
    console.log('[NoteNode] Menu Action:', {
      action: 'delete',
      nodeId: id,
      timestamp: new Date().toISOString()
    });
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setIsOptionsMenuOpen(false);
  };

  const handleDuplicate = () => {
    console.log('[NoteNode] Menu Action:', {
      action: 'duplicate',
      nodeId: id,
      timestamp: new Date().toISOString()
    });
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
      data: { ...nodeToDuplicate.data },
      selected: false,
      dragHandle: `#note-header-${newNodeId}`,
    };

    setNodes((nds) => nds.concat(newNode));
    setIsOptionsMenuOpen(false);
  };


  // --- Options Menu Handlers ---
  const toggleOptionsMenu = (event: React.MouseEvent) => {
    console.log('[NoteNode] Menu State:', {
      action: 'toggle',
      isOpen: !isOptionsMenuOpen,
      nodeId: id,
      timestamp: new Date().toISOString()
    });
    event.stopPropagation();
    setIsOptionsMenuOpen(!isOptionsMenuOpen);
  };

  const tippyOptions = {
    getReferenceClientRect: getSelectionBoundingRect,
    placement: 'top' as const,
    appendTo: () => document.body,
    interactive: true,
    popperOptions: {
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 10], // [x offset, y offset]
          },
        },
        {
          name: 'preventOverflow',
          options: {
            boundary: 'viewport',
            padding: 8,
          },
        },
      ],
    },
  };

  return (
    <div
      ref={containerRef}
      className="note-node-container relative bg-white rounded-lg shadow-md border border-gray-200 flex flex-col"
      style={{ width: 270, minHeight: 110 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={(e) => {
        // Stop clicks inside the node from propagating to ReactFlow
        console.log('[NoteNode] onMouseDown on root div, stopping propagation.');
        e.stopPropagation();
      }}
      onWheel={e => {
        const isTextArea = textareaRef.current && textareaRef.current.contains(e.target as Node);
        if (isHovered && isScrollable && isTextArea) {
          e.stopPropagation();
        }
      }}
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
            <BubbleMenu 
              editor={editor} 
              tippyOptions={tippyOptions}
              shouldShow={({ editor, from, to, state, view }) => {
                // Only show the bubble menu if text is selected
                const show = from !== to;
                console.log('[NoteNode] BubbleMenu shouldShow check:', { show, from, to, editorExists: !!editor, stateExists: !!state, viewExists: !!view });
                return show;
              }}
            >
              <div style={{ position: 'relative', width: 249, height: 92.779, background: 'none', boxShadow: 'none', borderRadius: 0, padding: 0, minWidth: 0, minHeight: 0 }}>
                {/* SVG as background */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  width="249"
                  height="92.779"
                  viewBox="0 0 249 92.779"
                  style={{ position: 'absolute', top: 0, left: 0, width: '249px', height: '92.779px', pointerEvents: 'none', zIndex: 0 }}
                  aria-hidden="true"
                  focusable="false"
                >
                  <defs>
                    <filter id="Union_92" x="0" y="0" width="249" height="92.779" filterUnits="userSpaceOnUse">
                      {/* @ts-ignore */}
                      <feOffset dy="2" input="SourceAlpha" />
                      {/* @ts-ignore */}
                      <feGaussianBlur stdDeviation="1" result="blur" />
                      <feFlood floodOpacity="0.071" />
                      {/* @ts-ignore */}
                      <feComposite operator="in" in2="blur" />
                      <feComposite in="SourceGraphic" />
                    </filter>
                  </defs>
                  <g id="Group_5351" data-name="Group 5351" transform="translate(-228.359 -558.501)">
                    <g transform="matrix(1, 0, 0, 1, 228.36, 558.5)" filter="url(#Union_92)">
                      <g id="Union_92-2" data-name="Union 92" transform="translate(5784 1823)" fill="#fff">
                        <path d="M -5751.92236328125 -1735.720581054688 L -5751.92236328125 -1735.720581054688 L -5751.92236328125 -1735.720581054688 C -5752.31640625 -1735.720458984375 -5752.681640625 -1735.845581054688 -5752.951171875 -1736.07275390625 L -5756.5595703125 -1739.109619140625 L -5756.69873046875 -1739.22705078125 L -5756.88134765625 -1739.22705078125 L -5766.99951171875 -1739.22705078125 C -5770.60595703125 -1739.22705078125 -5773.99658203125 -1740.631225585938 -5776.54638671875 -1743.180908203125 C -5779.09619140625 -1745.73046875 -5780.50048828125 -1749.120361328125 -5780.50048828125 -1752.726196289062 L -5780.50048828125 -1807.998779296875 C -5780.50048828125 -1811.605224609375 -5779.09619140625 -1814.99560546875 -5776.54638671875 -1817.54541015625 C -5773.99658203125 -1820.09521484375 -5770.60595703125 -1821.499389648438 -5766.99951171875 -1821.499389648438 L -5551.99951171875 -1821.499389648438 C -5548.3935546875 -1821.499389648438 -5545.00390625 -1820.09521484375 -5542.4541015625 -1817.54541015625 C -5539.90478515625 -1814.99560546875 -5538.50048828125 -1811.605224609375 -5538.50048828125 -1807.998779296875 L -5538.50048828125 -1752.726196289062 C -5538.50048828125 -1749.120483398438 -5539.90478515625 -1745.73046875 -5542.4541015625 -1743.180786132812 C -5545.00390625 -1740.631225585938 -5548.3935546875 -1739.22705078125 -5551.99951171875 -1739.22705078125 L -5746.90380859375 -1739.22705078125 L -5747.083984375 -1739.22705078125 L -5747.22314453125 -1739.111938476562 L -5750.88818359375 -1736.072387695312 C -5751.1611328125 -1735.845458984375 -5751.5283203125 -1735.720581054688 -5751.92236328125 -1735.720581054688 Z" stroke="none" />
                        <path d="M -5751.92236328125 -1736.220581054688 C -5751.64892578125 -1736.220581054688 -5751.388671875 -1736.306640625 -5751.20703125 -1736.457153320312 L -5747.2646484375 -1739.72705078125 L -5551.99951171875 -1739.72705078125 C -5548.52734375 -1739.72705078125 -5545.26318359375 -1741.079223632812 -5542.8076171875 -1743.534423828125 C -5540.3525390625 -1745.989624023438 -5539.00048828125 -1749.254028320312 -5539.00048828125 -1752.726196289062 L -5539.00048828125 -1807.998779296875 C -5539.00048828125 -1811.4716796875 -5540.3525390625 -1814.736450195312 -5542.8076171875 -1817.19189453125 C -5545.26318359375 -1819.647216796875 -5548.52734375 -1820.999389648438 -5551.99951171875 -1820.999389648438 L -5766.99951171875 -1820.999389648438 C -5770.47265625 -1820.999389648438 -5773.7373046875 -1819.647216796875 -5776.19287109375 -1817.19189453125 C -5778.6484375 -1814.736450195312 -5780.00048828125 -1811.4716796875 -5780.00048828125 -1807.998779296875 L -5780.00048828125 -1752.726196289062 C -5780.00048828125 -1749.25390625 -5778.6484375 -1745.989624023438 -5776.19287109375 -1743.534423828125 C -5773.7373046875 -1741.079223632812 -5770.47216796875 -1739.72705078125 -5766.99951171875 -1739.72705078125 L -5756.5166015625 -1739.72705078125 L -5752.62890625 -1736.455078125 C -5752.4521484375 -1736.305908203125 -5752.19482421875 -1736.220458984375 -5751.9228515625 -1736.220581054688 L -5751.92236328125 -1736.220581054688 M -5751.92236328125 -1735.220581054688 C -5752.41259765625 -1735.220458984375 -5752.90185546875 -1735.377197265625 -5753.2734375 -1735.6904296875 L -5756.88134765625 -1738.72705078125 L -5766.99951171875 -1738.72705078125 C -5774.732421875 -1738.72705078125 -5781.00048828125 -1744.99462890625 -5781.00048828125 -1752.726196289062 L -5781.00048828125 -1807.998779296875 C -5781.00048828125 -1815.731811523438 -5774.732421875 -1821.999389648438 -5766.99951171875 -1821.999389648438 L -5551.99951171875 -1821.999389648438 C -5544.26806640625 -1821.999389648438 -5538.00048828125 -1815.731811523438 -5538.00048828125 -1807.998779296875 L -5538.00048828125 -1752.726196289062 C -5538.00048828125 -1744.99462890625 -5544.26806640625 -1738.72705078125 -5551.99951171875 -1738.72705078125 L -5746.90380859375 -1738.72705078125 L -5750.56884765625 -1735.6875 C -5750.94384765625 -1735.376098632812 -5751.43359375 -1735.220581054688 -5751.92236328125 -1735.220581054688 Z" stroke="none" fill="#e4e9ee" />
                      </g>
                    </g>
                    <path id="Path_1474" data-name="Path 1474" d="M66.25,45.8A3.68,3.68,0,0,0,68,43a3.93,3.93,0,0,0-3.86-4H57.65V53h7a3.74,3.74,0,0,0,3.7-3.78V49.1a3.64,3.64,0,0,0-2.1-3.3ZM59.65,41h4.2a2,2,0,0,1,.63,3.91,2.228,2.228,0,0,1-.63.09h-4.2Zm4.6,10h-4.6V47h4.6a2,2,0,0,1,.63,3.91,2.228,2.228,0,0,1-.63.09Z" transform="translate(204.359 538)" />
                    <path id="Path_1475" data-name="Path 1475" d="M106.76,43h2l-2.2,10h-2Zm1.68-4a1,1,0,1,0,.707.293A1,1,0,0,0,108.44,39Z" transform="translate(204.359 538)" />
                    <path id="Path_1476" data-name="Path 1476" d="M158,54v2H144V54Zm-3-6.785a4,4,0,0,1-5.74,3.4,3.751,3.751,0,0,1-2.26-3.53v-8.08h-2v8.21a6,6,0,0,0,8,5.44,5.852,5.852,0,0,0,4-5.65v-8h-2ZM155,39h0Zm-8,0h0Z" transform="translate(204.359 536)" />
                    <path id="Path_1477" data-name="Path 1477" d="M186,46.2h18v1.5h-4.366a3.6,3.6,0,0,1,.35,1.593,3.251,3.251,0,0,1-1.315,2.7,5.548,5.548,0,0,1-3.466,1,6.444,6.444,0,0,1-2.624-.539,4.459,4.459,0,0,1-1.892-1.488,3.67,3.67,0,0,1-.671-2.155V48.7h2v.113a2.187,2.187,0,0,0,.854,1.831,3.691,3.691,0,0,0,2.328.679,3.388,3.388,0,0,0,2.077-.546,1.734,1.734,0,0,0,.7-1.467,1.7,1.7,0,0,0-.647-1.434,3.048,3.048,0,0,0-.274-.177H186Zm13.345-5.143a4.187,4.187,0,0,0-1.721-1.514A5.63,5.63,0,0,0,195.111,39a5.163,5.163,0,0,0-3.364,1.062,3.36,3.36,0,0,0-1.307,2.706,3.238,3.238,0,0,0,.322,1.428h2.6c-.083-.054-.185-.106-.252-.161a1.608,1.608,0,0,1-.653-1.3,1.8,1.8,0,0,1,.688-1.511,3.131,3.131,0,0,1,1.97-.552,3.048,3.048,0,0,1,2.106.669,2.348,2.348,0,0,1,.736,1.833v.113h2v-.113a3.906,3.906,0,0,0-.611-2.114Z" transform="translate(204.359 537.005)" />
                    <path id="Path_1478" data-name="Path 1478" d="M280.918,46.241l7.747-5.39,1.18,1.3-6.094,7.208Zm-2.331.411,4.536,4.983a.934.934,0,0,0,1.4-.091l7.451-8.813a.908.908,0,0,0,.022-1.2l-2.513-2.761a.908.908,0,0,0-1.2-.091l-9.474,6.591a.936.936,0,0,0-.421.64.933.933,0,0,0,.2.74Zm-4.793,5.876,5.617.972,1.479-1.346-3.029-3.328Z" transform="translate(160.566 537.501)" />
                    <g id="Group_5351-2" data-name="Group 5351" transform="translate(129.775 -176.5)">
                      <path id="Path_1083" data-name="Path 1083" d="M434,52h6V50h-6Zm0-7v2h12V45Zm0-5v2h18V40Z" transform="translate(-310.915 747.5)" />
                      <path id="Path_1084" data-name="Path 1084" d="M459,48.5l4-5h-8Z" transform="translate(-310.915 747)" />
                    </g>
                    <g id="Group_5352" data-name="Group 5352" transform="translate(122.025 -176.5)">
                      <path id="Path_1085" data-name="Path 1085" d="M485.5,50h2v.5h-1v1h1V52h-2v1h3V49h-3Zm1-7h1V39h-2v1h1Zm-1,2h1.8l-1.8,2.1V48h3V47h-1.8l1.8-2.1V44h-3Zm5-5v2h14V40Zm0,12h14V50h-14Zm0-5h14V45h-14Z" transform="translate(-310.915 747.5)" />
                      <path id="Path_1086" data-name="Path 1086" d="M511,48.5l4-5h-8Z" transform="translate(-310.915 747)" />
                    </g>
                    <g id="Group_5353" data-name="Group 5353" transform="translate(114.025 -176.5)">
                      <path id="Path_1087" data-name="Path 1087" d="M539,44.5a1.5,1.5,0,1,0,1.5,1.5A1.538,1.538,0,0,0,539,44.5Zm0-5a1.5,1.5,0,1,0,1.5,1.5A1.538,1.538,0,0,0,539,39.5Zm0,10a1.5,1.5,0,1,0,1.5,1.5A1.538,1.538,0,0,0,539,49.5Zm3.5-9.5v2h14V40Zm0,12h14V50h-14Zm0-5h14V45h-14Z" transform="translate(-310.915 747)" />
                      <path id="Path_1088" data-name="Path 1088" d="M563,48.5l4-5h-8Z" transform="translate(-310.915 747)" />
                    </g>
                    <path id="Path_1479" data-name="Path 1479" d="M590,43v6l3-3Zm0,10h18V51H590Zm0-12h18V39H590Zm6,4h12V43H596Zm0,4h12V47H596Z" transform="translate(-197.99 571)" />
                    <g id="Group_5354" data-name="Group 5354" transform="translate(-199.641 571)" opacity="0.25">
                      <path id="Path_1090" data-name="Path 1090" d="M634,46l3,3V43Zm0,7h18V51H634Zm0-12h18V39H634Zm6,4h12V43H640Zm0,4h12V47H640Z" />
                    </g>
                  </g>
                </svg>
                {/* Button container positioned inside BubbleMenu wrapper */}
                <div 
                  style={{
                    width: '243px',
                    height: '86.779px', 
                    position: 'absolute',
                    left: '3px',
                    top: '1px',
                    zIndex: 1,
                    pointerEvents: 'auto',
                  }}
                >
                  <button /* Bold */ onClick={() => { 
                    console.log('[NoteNode] Bold button clicked. Editor exists?', !!editor);
                    if (!editor) {
                      console.error('[NoteNode] Bold onMouseDown: Editor is null!');
                      return;
                    }
                    console.log('[NoteNode] Bold: Editor focused before?:', editor.isFocused);
                    const success = editor.chain().focus().toggleBold().run();
                    console.log('[NoteNode] Bold: Command run success?', success);
                    console.log('[NoteNode] Bold: Editor focused after?:', editor.isFocused);
                  }} style={{ position:'absolute', left:'15px', top:'12px', width:'35px', height:'28px', background:'transparent', border:'none', cursor:'pointer', padding:0, pointerEvents:'auto', borderRadius:'4px' }} aria-label="Bold" type="button" />
                  <button /* Italic */ onClick={() => { 
                    console.log('[NoteNode] Italic button clicked. Editor exists?', !!editor);
                    if (!editor) return;
                    console.log('[NoteNode] Italic: Editor focused before?:', editor.isFocused);
                    const success = editor.chain().focus().toggleItalic().run(); 
                    console.log('[NoteNode] Italic: Command run success?', success);
                    console.log('[NoteNode] Italic: Editor focused after?:', editor.isFocused);
                  }} style={{ position:'absolute', left:'64px', top:'12px', width:'28px', height:'28px', background:'transparent', border:'none', cursor:'pointer', padding:0, pointerEvents:'auto', borderRadius:'4px' }} aria-label="Italic" type="button" />
                  <button /* Underline */ onClick={() => { if(editor) { console.log('[NoteNode] Underline clicked. Focused before:', editor.isFocused); const s = editor.chain().focus().toggleUnderline().run(); console.log('Success:', s, 'Focused after:', editor.isFocused); } else console.log('Underline clicked, editor null'); }} style={{ position:'absolute', left:'110px', top:'12px', width:'28px', height:'28px', background:'transparent', border:'none', cursor:'pointer', padding:0, pointerEvents:'auto', borderRadius:'4px' }} aria-label="Underline" type="button" />
                  <button /* Strike */ onClick={() => { if(editor) { console.log('[NoteNode] Strike clicked. Focused before:', editor.isFocused); const s = editor.chain().focus().toggleStrike().run(); console.log('Success:', s, 'Focused after:', editor.isFocused); } else console.log('Strike clicked, editor null'); }} style={{ position:'absolute', left:'155px', top:'12px', width:'28px', height:'28px', background:'transparent', border:'none', cursor:'pointer', padding:0, pointerEvents:'auto', borderRadius:'4px' }} aria-label="Strike" type="button" />
                  <button /* Highlight */ onClick={() => { if(editor) { console.log('[NoteNode] Highlight clicked. Focused before:', editor.isFocused); const s = editor.chain().focus().toggleHighlight().run(); console.log('Success:', s, 'Focused after:', editor.isFocused); } else console.log('Highlight clicked, editor null'); }} style={{ position:'absolute', left:'198px', top:'12px', width:'28px', height:'28px', background:'transparent', border:'none', cursor:'pointer', padding:0, pointerEvents:'auto', borderRadius:'4px' }} aria-label="Highlight" type="button" />
                  <button /* Task List */ onClick={() => { if(editor) { console.log('[NoteNode] Task List clicked. Focused before:', editor.isFocused); const s = editor.chain().focus().toggleTaskList().run(); console.log('Success:', s, 'Focused after:', editor.isFocused); } else console.log('Task List clicked, editor null'); }} style={{ position:'absolute', left:'20px', top:'45px', width:'38px', height:'28px', background:'transparent', border:'none', cursor:'pointer', padding:0, pointerEvents:'auto', borderRadius:'4px' }} aria-label="Task List" type="button" />
                  <button /* Ordered List */ onClick={() => { if(editor) { console.log('[NoteNode] Ordered List clicked. Focused before:', editor.isFocused); const s = editor.chain().focus().toggleOrderedList().run(); console.log('Success:', s, 'Focused after:', editor.isFocused); } else console.log('Ordered List clicked, editor null'); }} style={{ position:'absolute', left:'64px', top:'45px', width:'28px', height:'28px', background:'transparent', border:'none', cursor:'pointer', padding:0, pointerEvents:'auto', borderRadius:'4px' }} aria-label="Ordered List" type="button" />
                  <button /* Bullet List */ onClick={() => { if(editor) { console.log('[NoteNode] Bullet List clicked. Focused before:', editor.isFocused); const s = editor.chain().focus().toggleBulletList().run(); console.log('Success:', s, 'Focused after:', editor.isFocused); } else console.log('Bullet List clicked, editor null'); }} style={{ position:'absolute', left:'102px', top:'45px', width:'37px', height:'28px', background:'transparent', border:'none', cursor:'pointer', padding:0, pointerEvents:'auto', borderRadius:'4px' }} aria-label="Bullet List" type="button" />
                  <button /* Align Left */ onClick={() => { if(editor) { console.log('[NoteNode] Align Left clicked. Focused before:', editor.isFocused); const s = editor.chain().focus().setTextAlign('left').run(); console.log('Success:', s, 'Focused after:', editor.isFocused); } else console.log('Align Left clicked, editor null'); }} style={{ position:'absolute', left:'155px', top:'45px', width:'30px', height:'28px', background:'transparent', border:'none', cursor:'pointer', padding:0, pointerEvents:'auto', borderRadius:'4px' }} aria-label="Align Left" type="button" />
                  <button /* Align Right */ onClick={() => { if(editor) { console.log('[NoteNode] Align Right clicked. Focused before:', editor.isFocused); const s = editor.chain().focus().setTextAlign('right').run(); console.log('Success:', s, 'Focused after:', editor.isFocused); } else console.log('Align Right clicked, editor null'); }} style={{ position:'absolute', left:'194px', top:'45px', width:'37px', height:'28px', background:'transparent', border:'none', cursor:'pointer', padding:0, pointerEvents:'auto', borderRadius:'4px' }} aria-label="Align Right" type="button" />
                </div>
              </div>
            </BubbleMenu>

            <div style={{ width: '100%' }}>
              <EditorContent editor={editor} />
            </div>

            {/* Native wheel event interception for robust scroll/canvas zoom blocking */}
            {editor && (
              (() => {
                // Attach native event listener to the ProseMirror element
                // Use a ref to ensure we only attach once
                const proseMirrorRef = useRef<HTMLElement | null>(null);
                useEffect(() => {
                  // Find the actual ProseMirror element
                  const el = document.querySelector('.ProseMirror') as HTMLElement | null;
                  proseMirrorRef.current = el;
                  if (!el) return;
                  const handler = (e: WheelEvent) => {
                    const isScrollable = el.scrollHeight > el.clientHeight;
                    const atTop = el.scrollTop === 0;
                    const atBottom = el.scrollTop + el.clientHeight === el.scrollHeight;
                    const scrollingUp = e.deltaY < 0;
                    const scrollingDown = e.deltaY > 0;
                    const nodeId = id;
                    const logObj = {
                      file: '[src/components/NoteNode.tsx]',
                      nodeId,
                      clientX: e.clientX,
                      clientY: e.clientY,
                      isScrollable,
                      atTop,
                      atBottom,
                      scrollingUp,
                      scrollingDown,
                      deltaY: e.deltaY,
                      scrollTop: el.scrollTop,
                      scrollHeight: el.scrollHeight,
                      clientHeight: el.clientHeight,
                    };
                    let stopped = false;
                    let prevented = false;
                    // Always stop propagation to prevent canvas zoom
                    e.stopPropagation();
                    stopped = true;
                    // Only preventDefault if overscrolling (at edge)
                    if ((scrollingUp && atTop) || (scrollingDown && atBottom) || !isScrollable) {
                      e.preventDefault();
                      prevented = true;
                      (logObj as any).canvasZoomBlocked = true;
                      console.log('[src/components/NoteNode.tsx] onWheel (overscroll/canvas zoom blocked) [native]', logObj);
                    } else {
                      (logObj as any).canvasZoomBlocked = false;
                      console.log('[src/components/NoteNode.tsx] onWheel (scroll allowed, only stopPropagation) [native]', logObj);
                    }
                    (logObj as any).stopped = stopped;
                    (logObj as any).prevented = prevented;
                  };
                  el.addEventListener('wheel', handler, { passive: false });
                  return () => {
                    el.removeEventListener('wheel', handler);
                  };
                }, [editor, id]);
                return null;
              })()
            )}
          </>
        )}
      </div>


      {/* Options Menu - Replaced with SVG */}
      {isOptionsMenuOpen && (
        <div
          ref={optionsMenuRef}
          className="absolute top-[-4px] left-[266px] z-[70]"
          onMouseDown={(e) => e.stopPropagation()}
          style={{ width: '133.872px', height: '84.42px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="133.872" height="84.42" viewBox="0 0 133.872 84.42">
            <defs>
              <filter id="Union_9" x="0" y="0" width="133.872" height="84.42" filterUnits="userSpaceOnUse">
                {/* @ts-ignore */}
                <feOffset dy="2" input="SourceAlpha"/>
                {/* @ts-ignore */}
                <feGaussianBlur stdDeviation="1" result="blur"/>
                <feFlood floodOpacity="0.071"/>
                {/* @ts-ignore */}
                <feComposite operator="in" in2="blur"/>
                <feComposite in="SourceGraphic"/>
              </filter>
              <linearGradient id="linear-gradient" y1="0.365" x2="1" y2="0.058" gradientUnits="objectBoundingBox">
                <stop offset="0" stopColor="#3799db"/>
                <stop offset="1" stopColor="#2db4a6"/>
              </linearGradient>
            </defs>
            <g id="Group_5042" data-name="Group 5042" transform="translate(-67.445 -507.58)">
              <g transform="matrix(1, 0, 0, 1, 67.44, 507.58)" filter="url(#Union_9)">
                <g id="Union_9-2" data-name="Union 9" transform="translate(5.24 -0.58)" fill="#fff">
                  {/* SVG Path for background shape */}
                  <path d="M 111.6305999755859 79.50009918212891 L 14.3163013458252 79.50009918212891 C 10.71041774749756 79.50009918212891 7.320384502410889 78.09577941894531 4.770651340484619 75.54581451416016 C 2.220968008041382 72.99591827392578 0.8168013095855713 69.60569763183594 0.8168013095855713 65.99970245361328 L 0.8168013095855713 27.04506492614746 L 0.8168013095855713 26.86246490478516 L 0.6991346478462219 26.72284889221191 L -1.515765309333801 24.09478187561035 C -1.782815337181091 23.7774829864502 -1.817298650741577 23.25718307495117 -1.589331984519958 22.98159980773926 L 0.7018846273422241 20.21491622924805 L 0.8168013095855713 20.07614898681641 L 0.8168013095855713 19.89599800109863 L 0.8168013095855713 15.57989883422852 C 0.8168013095855713 11.97396564483643 2.220968008041382 8.583915710449219 4.770634651184082 6.034232139587402 C 7.32031774520874 3.484565496444702 10.71036815643311 2.080398797988892 14.3163013458252 2.080398797988892 L 111.6305999755859 2.080398797988892 C 115.2366027832031 2.080398797988892 118.6268157958984 3.484565496444702 121.1767196655273 6.034248828887939 C 123.7266845703125 8.583982467651367 125.1310043334961 11.97401523590088 125.1310043334961 15.57989883422852 L 125.1310043334961 65.99970245361328 C 125.1310043334961 69.60562896728516 123.7266693115234 72.995849609375 121.1767196655273 75.54581451416016 C 118.6267547607422 78.09576416015625 115.2365341186523 79.50009918212891 111.6305999755859 79.50009918212891 Z" stroke="none"/>
                  <path d="M 111.6305999755859 79.00009918212891 C 115.1029815673828 79.00009918212891 118.3676376342773 77.64778137207031 120.8231506347656 75.19224548339844 C 123.2786865234375 72.73673248291016 124.6310043334961 69.47208404541016 124.6310043334961 65.99970245361328 L 124.6310043334961 15.57989883422852 C 124.6310043334961 12.10758209228516 123.2787017822266 8.84311580657959 120.8231811523438 6.387832164764404 C 118.3677215576172 3.932565450668335 115.1030502319336 2.580398797988892 111.6305999755859 2.580398797988892 L 14.3163013458252 2.580398797988892 C 10.84391784667969 2.580398797988892 7.579434871673584 3.932565450668335 5.12420129776001 6.38779878616333 C 2.668967962265015 8.843031883239746 1.316801309585571 12.10751533508301 1.316801309585571 15.57989883422852 L 1.316801309585571 20.25631523132324 L -1.204048633575439 23.3002815246582 C -1.259515404701233 23.36733245849609 -1.267648696899414 23.61309814453125 -1.133448719978333 23.7725658416748 L 1.316801309585571 26.67986488342285 L 1.316801309585571 65.99970245361328 C 1.316801309585571 69.47214508056641 2.668967962265015 72.73681640625 5.124234676361084 75.19228363037109 C 7.579517841339111 77.64779663085938 10.84398460388184 79.00009918212891 14.3163013458252 79.00009918212891 L 111.6305999755859 79.00009918212891 M 111.6305999755859 80.00009918212891 L 14.3163013458252 80.00009918212891 C 6.58440113067627 80.00009918212891 0.3168013095855713 73.73159790039062 0.3168013095855713 65.99970245361328 L 0.3168013095855713 27.04506492614746 L -1.898098707199097 24.41699981689453 C -2.323798656463623 23.91119956970215 -2.357998609542847 23.12639808654785 -1.97459864616394 22.66289901733398 L 0.3168013095855713 19.89599800109863 L 0.3168013095855713 15.57989883422852 C 0.3168013095855713 7.847999095916748 6.58440113067627 1.580398917198181 14.3163013458252 1.580398917198181 L 111.6305999755859 1.580398917198181 C 119.3625030517578 1.580398917198181 125.6310043334961 7.847999095916748 125.6310043334961 15.57989883422852 L 125.6310043334961 65.99970245361328 C 125.6310043334961 73.73159790039062 119.3625030517578 80.00009918212891 111.6305999755859 80.00009918212891 Z" stroke="none" fill="#e4e9ee"/>
                </g>
              </g>
              {/* -- Duplicate Button Area -- */}
              <g
                onClick={handleDuplicate}
                style={{ cursor: 'pointer' }}
                aria-label="Duplicate Note"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDuplicate(); }}
              >
                <rect x="70" y="515" width="125" height="30" fill="transparent" />
                <text id="Duplicate_Text" data-name="Duplicate" transform="translate(111.843 536.026)" fill="#222" stroke="rgba(0,0,0,0)" strokeWidth="1" fontSize="15" fontFamily="SegoeUI, Segoe UI">
                  <tspan x="0" y="0">Duplicate</tspan>
                </text>
                <g id="Iconly_Light-Outline_Paper-Plus" data-name="Iconly/Light-Outline/Paper-Plus" transform="translate(83.291 519.026)">
                  <g id="Paper-Plus" transform="translate(3 2)">
                    <path id="Combined-Shape" d="M10.974,0A.753.753,0,0,1,11.1.011h.136a.752.752,0,0,1,.541.23l5.066,5.279a.753.753,0,0,1,.208.519v9.3a4.533,4.533,0,0,1-4.471,4.526H4.4A4.473,4.473,0,0,1,0,15.327V4.491A4.6,4.6,0,0,1,4.57.012h6.279A.753.753,0,0,1,10.974,0Zm-.75,1.511H4.573a3.086,3.086,0,0,0-3.072,3V15.34a2.969,2.969,0,0,0,2.913,3.027h8.159a3.028,3.028,0,0,0,2.979-3.025V6.983H13.543a3.332,3.332,0,0,1-3.319-3.325Zm-1.88,6.2a.75.75,0,0,1,.75.75v1.7h1.7a.75.75,0,1,1,0,1.5h-1.7v1.7a.75.75,0,0,1-1.5,0v-1.7h-1.7a.75.75,0,0,1,0-1.5h1.7v-1.7A.75.75,0,0,1,8.344,7.714Zm3.38-5.362V3.659a1.829,1.829,0,0,0,1.821,1.825h1.183Z" fillRule="evenodd" fill="url(#linear-gradient)"/>
                  </g>
                </g>
              </g>
              {/* -- Delete Button Area -- */}
              <g
                onClick={handleDelete}
                style={{ cursor: 'pointer' }}
                aria-label="Delete Note"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDelete(); }}
              >
                <rect x="70" y="545" width="125" height="30" fill="transparent" />
                <text id="Delete_Text" data-name="Delete" transform="translate(111.843 570.026)" fill="#222" stroke="rgba(0,0,0,0)" strokeWidth="1" fontSize="15" fontFamily="SegoeUI, Segoe UI">
                  <tspan x="0" y="0">Delete</tspan>
                </text>
                <g id="Iconly_Light-Outline_Delete" data-name="Iconly/Light-Outline/Delete" transform="translate(84.52 552.026)">
                  <g id="Delete" transform="translate(3 2)">
                    <path id="Combined-Shape-2" data-name="Combined-Shape" d="M16.385,6.72a.751.751,0,0,1,.688.808c-.006.068-.548,6.779-.86,9.594a2.976,2.976,0,0,1-3.09,2.842C11.79,19.987,10.5,20,9.247,20c-1.355,0-2.676-.015-3.983-.042a2.967,2.967,0,0,1-3.018-2.829c-.315-2.84-.854-9.534-.859-9.6a.749.749,0,0,1,.687-.808.77.77,0,0,1,.808.687c0,.043.224,2.777.464,5.482l.048.54c.121,1.344.244,2.636.343,3.536a1.472,1.472,0,0,0,1.558,1.494c2.5.053,5.051.056,7.8.006a1.5,1.5,0,0,0,1.626-1.507c.31-2.794.85-9.482.856-9.55A.766.766,0,0,1,16.385,6.72ZM11.345,0a2.033,2.033,0,0,1,1.962,1.506l.254,1.261a.9.9,0,0,0,.865.722h3.282a.75.75,0,1,1,0,1.5H.75a.75.75,0,1,1,0-1.5H4.031l.1-.006A.9.9,0,0,0,4.9,2.767L5.14,1.551A2.043,2.043,0,0,1,7.112,0Zm0,1.5H7.112a.529.529,0,0,0-.512.392l-.233,1.17a2.379,2.379,0,0,1-.128.427h5.979a2.386,2.386,0,0,1-.128-.427l-.243-1.216A.524.524,0,0,0,11.345,1.5Z" fillRule="evenodd" fill="url(#linear-gradient)"/>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </div>
      )}
    </div>
  );
};

export default NoteNode; 