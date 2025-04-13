import React, { useState, useEffect, useRef } from 'react';
import { NodeProps, useReactFlow, useUpdateNodeInternals } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

// Import new icons
import duplicateIcon from '@/assets/icons/duplicate_icon.svg';
import deleteIcon from '@/assets/icons/delete_icon.svg';
// Import the Text Format Menu component
import TextFormatMenu from './TextFormatMenu';

// Data structure for the node
interface NoteNodeData {
  title?: string;
  content?: string;
  onChange?: (id: string, data: { title?: string; content?: string }) => void;
}

// Define default values
const defaultTitle = "Note Title Here";
const defaultContent = "Add Your Note...";

// Define type for menu position
interface MenuPosition {
  top: number;
  left: number;
}

const NoteNode: React.FC<NodeProps<NoteNodeData>> = ({ id, data}) => {
  const { setNodes, getNode } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const menuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the main container

  // Use state for internal editing, initialized from data prop
  const [title, setTitle] = useState(data.title ?? defaultTitle);
  const [content, setContent] = useState(data.content ?? defaultContent);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);

  // State for Text Format Menu
  const [showTextFormatMenu, setShowTextFormatMenu] = useState(false);
  const [textFormatMenuPosition, setTextFormatMenuPosition] = useState<MenuPosition | null>(null);

  // Track current selection
  const [] = useState<{
    element: HTMLInputElement | HTMLTextAreaElement | null,
    start: number,
    end: number
  }>({
    element: null,
    start: 0,
    end: 0
  });

  // Update internal state if data prop changes externally
  useEffect(() => {
    setTitle(data.title ?? defaultTitle);
  }, [data.title]);

  useEffect(() => {
    setContent(data.content ?? defaultContent);
  }, [data.content]);

  // Propagate changes back up to the main nodes state
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    // Update the node data in the global state
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, title: newTitle } };
        }
        return node;
      })
    );
    updateNodeInternals(id); // Trigger internal update if size changes due to text
  };

  const handleContentChange = () => {
    if (textareaRef.current) {
      const newContent = textareaRef.current.innerHTML;
      setContent(newContent);
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, content: newContent } };
          }
          return node;
        })
      );
    }
  };

  // --- Menu Handlers ---


  const handleDelete = () => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setIsMenuOpen(false);
    setIsOptionsMenuOpen(false);
  };

  const handleDuplicate = () => {
    const nodeToDuplicate = getNode(id);
    if (!nodeToDuplicate) return;

    const newNodeId = `note-${uuidv4()}`;
    const position = {
      x: nodeToDuplicate.position.x + 30, // Offset new node slightly
      y: nodeToDuplicate.position.y + 30,
    };

    const newNode = {
      ...nodeToDuplicate,
      id: newNodeId,
      position,
      data: { ...nodeToDuplicate.data }, // Copy data
      selected: false, // Deselect new node
      // Update drag handle ID if it depends on the node ID
      dragHandle: `#note-header-${newNodeId}`, 
    };

    setNodes((nds) => nds.concat(newNode));
    setIsMenuOpen(false);
    setIsOptionsMenuOpen(false);
  };

  // Effect to handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // --- End Menu Handlers ---

  // --- Options Menu Handlers ---
  const toggleOptionsMenu = (event: React.MouseEvent) => {
    event.stopPropagation(); 
    setIsOptionsMenuOpen(!isOptionsMenuOpen);
  };

  // --- Text Format Menu Handlers ---
  const applyFormat = (command: string, value?: string) => {
    console.log(`Applying format: ${command}`, value ? `with value: ${value}` : '');
    
    // Apply visual formatting directly using execCommand
    if (value) {
      document.execCommand(command, false, value);
    } else {
      document.execCommand(command);
    }
    
    // Focus back on the editable div
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    
    // Update the node data in React Flow (get HTML content)
    if (textareaRef.current) {
      const newContent = textareaRef.current.innerHTML;
      setContent(newContent);
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, content: newContent } };
          }
          return node;
        })
      );
    }
    
    // Hide the format menu after applying
    setTimeout(() => {
      setShowTextFormatMenu(false);
    }, 100);
  };

  // Handle direct text selection in the contentEditable div
  const handleTextSelection = () => {
    console.log("Text selection detected");
    
    // Check for valid selection
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !containerRef.current) {
      console.log("No selection detected or missing refs");
      return;
    }
    
    // Only show menu when there's an actual selection
    const range = selection.getRangeAt(0);
    const selectionRect = range.getBoundingClientRect();
    
    if (selectionRect.width > 0 && selectionRect.height > 0) {
      console.log("Valid selection rect");
      
      // Calculate position - place it above the selection
      const containerRect = containerRef.current.getBoundingClientRect();
      const left = selectionRect.left - containerRect.left + (selectionRect.width / 2) - 125;
      
      setTextFormatMenuPosition({ 
        top: 0, // Fixed position, will be adjusted in the component style
        left: Math.max(10, left)
      });
      setShowTextFormatMenu(true);
    } else {
      console.log("No valid selection rect");
    }
  };
  
  // Apply the handlers to both title and content fields
  const handleTitleMouseUp = () => {
    handleTextSelection();
  };
  

  // Keep the escapeHTML function as it might be needed elsewhere
 

  // Close menu if clicked outside
  useEffect(() => {
    const handleInteractionEnd = (event: MouseEvent | TouchEvent) => {
       // Only handle clicks outside the component
       if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          const formatMenuElement = document.getElementById('text-format-menu-container');
          if (!formatMenuElement || !formatMenuElement.contains(event.target as Node)) {
              console.log("Interaction outside node and menu, hiding.");
              setShowTextFormatMenu(false);
              setTextFormatMenuPosition(null);
          }
       }
    };

    document.addEventListener('mouseup', handleInteractionEnd);
    document.addEventListener('touchend', handleInteractionEnd);

    return () => {
      document.removeEventListener('mouseup', handleInteractionEnd);
      document.removeEventListener('touchend', handleInteractionEnd);
    };
  }, []);

  // Recalculate menu position when the node position changes
  useEffect(() => {
    // Hide the menu when the node is dragged to avoid positioning issues
    if (showTextFormatMenu) {
      setShowTextFormatMenu(false);
      setTextFormatMenuPosition(null);
    }
  }, []);

  // --- End Text Format Menu Handlers ---

  return (
    <div className="relative" ref={containerRef}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        // Let React Flow control size based on node dimensions if needed, or keep fixed size
        width="295.141" 
        height="235" 
        viewBox="0 0 295.141 235"
        // Disable pointer events on the SVG wrapper initially
        className={`drop-shadow-lg pointer-events-none`} 
      >
        {/* --- SVG content remains the same --- */}
        <defs>
          <linearGradient id={`note-gradient-${id}`} y1="0.365" x2="1" y2="0.058" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor="#3799db"/>
            <stop offset="1" stopColor="#2db4a6"/>
          </linearGradient>
          <filter id={`note-filter-${id}`} x="0" y="0" width="295.141" height="235" filterUnits="userSpaceOnUse">
            <feOffset dy="9" in="SourceAlpha"/>
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feFlood floodOpacity="0.071"/>
            <feComposite operator="in" in2="blur"/>
            <feComposite in="SourceGraphic"/>
          </filter>
        </defs>
        <g filter={`url(#note-filter-${id})`}>
          <rect 
            id={`note-bg-${id}`} 
            width="270.141" 
            height="210" 
            rx="10" 
            transform="translate(12.5 3.5)" 
            fill="#fff" 
            stroke="#e0e9ef" 
            strokeWidth="1"
            // No stopPropagation needed here anymore with pointer-events approach
          />
        </g>
        <path 
            id={`note-header-${id}`} 
            d="M10,0H260.141a10,10,0,0,1,10,10V35a0,0,0,0,1,0,0H0a0,0,0,0,1,0,0V10A10,10,0,0,1,10,0Z" 
            transform="translate(12.5 3.5)" 
            stroke="rgba(0,0,0,0)" 
            strokeMiterlimit="10" 
            strokeWidth="1" 
            fill={`url(#note-gradient-${id})`}
            // Re-enable pointer events for the drag handle
            style={{ cursor: 'move', pointerEvents: 'auto' }} 
        />
        <g id="stickynote" transform="translate(22.25 10.75)" style={{ pointerEvents: 'none' }}> {/* Ensure icon doesn't interfere */}
           {/* ... sticky note icon paths ... */}
           <path id="Path_409" d="M7.878,5.02a.628.628,0,0,1-.628-.628V1.878a.628.628,0,1,1,1.257,0V4.391A.628.628,0,0,1,7.878,5.02Z" transform="translate(-0.814 0)" fill="#fff"/>
           <path id="Path_410" d="M15.878,5.02a.628.628,0,0,1-.628-.628V1.878a.628.628,0,0,1,1.257,0V4.391A.628.628,0,0,1,15.878,5.02Z" transform="translate(-2.117 0)" fill="#fff"/>
           <path id="Path_411" d="M13.58,11.507h-6.7a.628.628,0,1,1,0-1.257h6.7a.628.628,0,0,1,0,1.257Z" transform="translate(-0.653 -1.465)" fill="#fff"/>
           <path id="Path_412" d="M11.067,15.507H6.878a.628.628,0,1,1,0-1.257h4.188a.628.628,0,1,1,0,1.257Z" transform="translate(-0.652 -2.117)" fill="#fff"/>
           <path id="Path_413" d="M12.924,19.493H7.9c-2.233,0-3.682-.481-4.56-1.515A6.591,6.591,0,0,1,2.25,13.692V8.526c0-2.093.384-3.494,1.209-4.41A4.825,4.825,0,0,1,7.028,2.751H13.8a4.8,4.8,0,0,1,3.572,1.363c.824.917,1.208,2.319,1.208,4.413v5.316a.628.628,0,0,1-1.256,0V8.526a5.375,5.375,0,0,0-.887-3.574,3.677,3.677,0,0,0-2.689-.947H7.082a3.7,3.7,0,0,0-2.69.951,5.366,5.366,0,0,0-.886,3.57v5.165c0,1.781.237,2.82.792,3.474.621.731,1.766,1.072,3.6,1.072h5.023a.628.628,0,1,1,0,1.256Z" transform="translate(0 -0.243)" fill="#fff"/>
           <path id="Path_414" d="M17.391,15.25H19.9a.628.628,0,0,1,.444,1.072l-5.026,5.026A.628.628,0,0,1,14.25,20.9V18.391A2.833,2.833,0,0,1,17.391,15.25Zm1,1.257h-1c-1.321,0-1.885.564-1.885,1.885v1Z" transform="translate(-1.957 -2.283)" fill="#fff"/>
        </g>
        {/* Re-enable pointer events for the input container */}
        <foreignObject x="45" y="8" width="180" height="25" style={{ pointerEvents: 'auto' }}>
            <input 
                type="text"
                value={title}
                onChange={handleTitleChange}
                onMouseUp={handleTitleMouseUp}
                placeholder={defaultTitle}
                className="w-full h-full bg-transparent text-white font-medium text-[15px] focus:outline-none placeholder-white placeholder-opacity-75"
            />
        </foreignObject>
        {/* Re-enable pointer events for the options button */}
        <g 
            id="note-options-btn" 
            transform="translate(245 10)" 
            className="cursor-pointer" 
            style={{ pointerEvents: 'auto' }} 
            onClick={toggleOptionsMenu}
        >
           <path d="M-213.5,0A12.5,12.5,0,0,1-201,12.5,12.5,12.5,0,0,1-213.5,25,12.5,12.5,0,0,1-226,12.5,12.5,12.5,0,0,1-213.5,0Z" transform="translate(226 0)" fill="#fff" stroke="rgba(0,0,0,0)" strokeWidth="1" opacity="0.32"/>
           <circle cx="1.35" cy="1.35" r="1.35" transform="translate(7.24 11.15)" fill="#fff"/>
           <circle cx="1.35" cy="1.35" r="1.35" transform="translate(11.289 11.15)" fill="#fff"/>
           <circle cx="1.35" cy="1.35" r="1.35" transform="translate(15.34 11.15)" fill="#fff"/>
        </g>
        {/* Re-enable pointer events for the textarea container */}
        <foreignObject x="18" y="45" width="255" height="165" style={{ pointerEvents: 'auto' }}> 
           <div
             ref={textareaRef}
             contentEditable
             dangerouslySetInnerHTML={{ __html: content }}
             onMouseUp={handleTextSelection}
             onInput={handleContentChange}
             className="w-full h-full p-2 bg-transparent text-gray-700 text-sm focus:outline-none overflow-auto note-textarea"
             style={{ 
               whiteSpace: 'pre-wrap', 
               wordBreak: 'break-word', 
               minHeight: '150px' 
             }}
           />
        </foreignObject>
        {/* --- End SVG content --- */}
      </svg>

      {/* Conditionally Rendered Menu - Placed outside SVG but positioned relative to node */}
      {isOptionsMenuOpen && (
        <div 
          ref={optionsMenuRef}
          className="absolute top-0 right-0 translate-x-[115px] translate-y-[5px] z-[70]"
          onMouseDown={(e) => e.stopPropagation()} 
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-[130px] p-2">
            <ul>
              <li 
                className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer text-sm text-gray-700"
                onClick={handleDuplicate}
              >
                <img src={duplicateIcon} alt="Duplicate" className="w-4 h-4 mr-2" />
                Duplicate
              </li>
              <li 
                className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer text-sm text-red-600"
                onClick={handleDelete}
              >
                 <img src={deleteIcon} alt="Delete" className="w-4 h-4 mr-2" />
                Delete
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Text Format Menu */} 
      {showTextFormatMenu && textFormatMenuPosition && (
         <div 
            id="text-format-menu-container" 
            className="absolute z-[100]"
            style={{
              position: 'absolute',
              top: '-55px',
              left: '50%',
              transform: 'translateX(-50%)', // Center horizontally
              width: '249px'
            }}
         > 
           <TextFormatMenu 
              onFormat={applyFormat}
           />
         </div>
      )}
    </div>
  );
};

export default NoteNode; 