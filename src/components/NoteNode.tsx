import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NodeProps, useReactFlow, Handle, Position } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import ReactDOM from 'react-dom';

import { EditorContent, useEditor, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import FloatingMenu from './FloatingMenu';

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
            {ReactDOM.createPortal(
              <BubbleMenu 
                editor={editor} 
                tippyOptions={{
                  getReferenceClientRect: getSelectionBoundingRect,
                  placement: 'top',
                  appendTo: () => document.body,
                  interactive: true,
                  popperOptions: {
                    modifiers: [
                      {
                        name: 'offset',
                        options: {
                          offset: [0, 10],
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
                }}
                shouldShow={({ editor, from, to }) => {
                  const show = from !== to;
                  console.log('[NoteNode] BubbleMenu shouldShow check:', { show, from, to, editorExists: !!editor });
                  return show;
                }}
              >
                <FloatingMenu editor={editor} placement="top" />
              </BubbleMenu>,
              document.body
            )}

            {/* Editor content */}
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