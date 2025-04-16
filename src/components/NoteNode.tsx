import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NodeProps, useReactFlow, useUpdateNodeInternals } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

// Import new icons
import duplicateIcon from '@/assets/icons/duplicate_icon.svg';
import deleteIcon from '@/assets/icons/delete_icon.svg';
// Remove Text Format Menu import as textarea doesn't support rich text directly
// import TextFormatMenu from './TextFormatMenu';

// Data structure for the node
interface NoteNodeData {
  title?: string;
  content?: string;
  onChange?: (id: string, data: { title?: string; content?: string }) => void;
  // Remove isInitial, we'll rely on content/placeholder state
}

// Define default values
const defaultTitle = "Note Title Here";
const defaultContent = "Add Your Note...";

// Constants for layout
const HEADER_HEIGHT = 35;
const PADDING_TOP = 10; // Padding above the content area
const PADDING_BOTTOM = 10; // Padding below the content area
const BORDER_WIDTH = 1; // From the SVG rect stroke
const BASE_SVG_PADDING_Y = 3.5 * 2; // From translate(12.5 3.5) and filter offset
const TOTAL_HORIZONTAL_PADDING = 12.5 * 2; // SVG horizontal offset/padding
const CONTENT_AREA_X_OFFSET = 18 + 8; // = 26px, X position for text area relative to SVG start
const CONTENT_AREA_Y_OFFSET = HEADER_HEIGHT + PADDING_TOP; // Y position relative to SVG start
const CONTENT_WIDTH = 270.141 - (18 - 12.5) * 2 - 16; // Calculate based on SVG width and padding
const TITLE_X_OFFSET = 45;
const TITLE_Y_OFFSET = 8;
const TITLE_HEIGHT = 25;
const TITLE_WIDTH = 180;

const MAX_CONTENT_HEIGHT_LINES = 7;
const LINE_HEIGHT = 21; // Approx px based on 14px font and 1.5 line-height
const MAX_CONTENT_HEIGHT = MAX_CONTENT_HEIGHT_LINES * LINE_HEIGHT;
// Recalculate placeholder height based on LINE_HEIGHT + padding (p-3 -> 12px top/bottom)
const PADDING_TEXTAREA = 12; // Corresponds to p-3
const MIN_CONTENT_HEIGHT_PLACEHOLDER = LINE_HEIGHT + (PADDING_TEXTAREA * 2); // 21 + 24 = 45

// Define type for menu position
// interface MenuPosition {
//   top: number;
//   left: number;
// }

const NoteNode: React.FC<NodeProps<NoteNodeData>> = ({ id, data}) => {
  const { setNodes, getNode } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const menuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the main container
  // Track if the note is in its initial "Add Your Note..." state
  const [isPlaceholderActive, setIsPlaceholderActive] = useState(!data.content || data.content === defaultContent); 

  // Use state for internal editing, initialized from data prop
  const [title, setTitle] = useState(data.title ?? defaultTitle);
  // Initialize content: show placeholder if no content, otherwise the actual content
  const [content, setContent] = useState(data.content && data.content !== defaultContent ? data.content : defaultContent); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);

  // State for dynamic height calculation
  const [currentContentHeight, setCurrentContentHeight] = useState<number>(MIN_CONTENT_HEIGHT_PLACEHOLDER);

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

  // Refactored updateHeight logic - Calculates and sets state
  const calculateAndUpdateHeight = useCallback(() => {
    if (textareaRef.current) {
      const currentVal = textareaRef.current.value; 
      const isEmpty = !currentVal.trim(); 
      const scrollHeight = textareaRef.current.scrollHeight;
      let targetHeight;

      // Logic based purely on emptiness
      if (isEmpty) {
        targetHeight = MIN_CONTENT_HEIGHT_PLACEHOLDER;
      } else { // Text exists
        // If scrollHeight exceeds the max, the background should stop at max height
        if (scrollHeight > MAX_CONTENT_HEIGHT) {
          targetHeight = MAX_CONTENT_HEIGHT;
        } else {
          // Otherwise, use scrollHeight (ensuring at least one line)
          targetHeight = Math.max(LINE_HEIGHT, scrollHeight);
        }
      }

      // Update state ONLY if height actually changes
      if (currentContentHeight !== targetHeight) {
        setCurrentContentHeight(targetHeight);
      }
    }
    // Dependencies: only need currentContentHeight for comparison, and constants
  }, [currentContentHeight, MAX_CONTENT_HEIGHT, MIN_CONTENT_HEIGHT_PLACEHOLDER, LINE_HEIGHT]); 

  // Update internal state if data prop changes externally
  useEffect(() => {
    const newContent = data.content ?? defaultContent;
    const placeholderActive = !data.content || data.content === defaultContent;
    setContent(newContent);
    setIsPlaceholderActive(placeholderActive);
    // Update height on external data change
    // No need to set innerHTML for textarea
    // if (textareaRef.current) { ... }
    calculateAndUpdateHeight(); // Recalculate height based on new external content
  }, [data.content, calculateAndUpdateHeight]);

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
    calculateAndUpdateHeight(); // Trigger internal update if size changes due to text
  };

  // Update handleContentChange for textarea
  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = event.target.value;

      // Don't use setTimeout anymore, direct state update is fine for textarea
      // setTimeout(() => {
        // Update internal React state
      setContent(newContent);
        const stillEmpty = !newContent.trim(); 
        const currentlyPlaceholder = stillEmpty; // Placeholder if empty
        if (isPlaceholderActive !== currentlyPlaceholder) {
          setIsPlaceholderActive(currentlyPlaceholder); 
        }

        // Update the global React Flow node state
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, content: newContent } };
          }
          return node;
        })
      );
        // Trigger height update
        calculateAndUpdateHeight();
      // }, 0); 
  };

  // Handle focus: clear placeholder if active
  const handleFocus = () => {
    if (isPlaceholderActive) {
      setContent(''); // Update internal state -> triggers useEffect for height
      setIsPlaceholderActive(false); // Update placeholder state
      // Update nodes immediately - less critical than content state for height calc
      setNodes((nds) =>
         nds.map((node) => {
           if (node.id === id) {
             return { ...node, data: { ...node.data, content: '' } };
           }
           return node;
         })
       );
       // calculateAndUpdateHeight(); // Removed: useEffect watching content handles this
    }
  };

  // Handle blur: restore placeholder if empty
  const handleBlur = () => {
    const isEmpty = !content.trim();
    if (isEmpty) {
        if (!isPlaceholderActive) {
             // Set states -> triggers useEffect for height
             setContent(defaultContent); 
             setIsPlaceholderActive(true); 
             // Update nodes immediately
             setNodes((nds) =>
               nds.map((node) => {
                 if (node.id === id) {
                   return { ...node, data: { ...node.data, content: defaultContent } };
                 }
                 return node;
               })
             );
        }
    } else {
        if (isPlaceholderActive) {
             // Ensure placeholder state is correct if content was added
             setIsPlaceholderActive(false);
        }
        // Node data should already be up-to-date via handleContentChange
    }
    // calculateAndUpdateHeight(); // Removed: useEffect watching content handles this
  };

  // Effect to run height update on initial mount and when content changes
  useEffect(() => {
    // Calculate height whenever content changes
    calculateAndUpdateHeight(); 
  }, [content, calculateAndUpdateHeight]); 

  // Effect to update React Flow internals AFTER the height state has changed
  useEffect(() => {
      // Notify React Flow about the size change after state update
      updateNodeInternals(id); 
  }, [currentContentHeight, id, updateNodeInternals]); // Run whenever the calculated height changes

  // Use ResizeObserver to detect content height changes more reliably
  useEffect(() => {
    const target = textareaRef.current;
    if (!target) return;

    const observer = new ResizeObserver(() => {
      // Recalculate height on observed resize
      calculateAndUpdateHeight(); 
    });

    observer.observe(target);

    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  // Dependency ensures observer uses latest calculation logic
  }, [calculateAndUpdateHeight]); 

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

  // --- Text Format Menu Handlers --- (Remove all)
  /*
  const applyFormat = (command: string, value?: string) => { ... };
  const handleTextSelection = () => { ... };
  const handleTitleMouseUp = () => { ... };
  useEffect(() => { ... close menu logic ... }, []);
  useEffect(() => { ... recalculate menu position ... }, []);
  */
  // Keep title mouse up for potential future use, but remove selection logic
  const handleTitleMouseUp = () => {};

  // --- End Text Format Menu Handlers ---

  // Calculate the dynamic height required for the textarea content
  const targetContentHeight = currentContentHeight;

  return (
    // Main container: Sets overall width and relative positioning context
    <div 
      className="relative node-wrapper shadow-lg rounded-lg border border-gray-200 overflow-hidden" 
      ref={containerRef} 
      style={{ 
        width: 271.141, // Exact width from SVG
        // Height is determined by children now
      }}
    >
      {/* Header Div - Updated to match SVG exactly */}
      <div 
        id={`note-header-${id}`}
        className="h-[36px] relative flex items-center"
        style={{
          background: 'linear-gradient(100deg, #3799db 0%, #2db4a6 100%)',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
          padding: '0 12px'
        }}
      >
        {/* Updated Note Icon - Simpler version */}
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


        {/* Title Input - Updated styling */}
        <input 
          type="text"
          value={title}
          onChange={handleTitleChange}
          onMouseUp={handleTitleMouseUp}
          placeholder={defaultTitle}
          className="flex-grow h-full bg-transparent text-white font-['Segoe UI'] text-[15px] focus:outline-none placeholder-white placeholder-opacity-75"
          style={{
            marginLeft: '8px',
            lineHeight: '36px',
            fontWeight: 400
          }}
        />
        
        {/* Options Button - Updated with exact SVG */}
        <button 
          onClick={toggleOptionsMenu}
          className="flex-shrink-0 w-[26px] h-[26px] flex items-center justify-center"
          style={{
            marginLeft: 'auto'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
            <g id="Group_5350" data-name="Group_5350" transform="translate(-356.139 -204.5)">
              <path id="Union_50" data-name="Union 50" d="M-213.5,0A12.5,12.5,0,0,1-201,12.5,12.5,12.5,0,0,1-213.5,25,12.5,12.5,0,0,1-226,12.5,12.5,12.5,0,0,1-213.5,0Z" transform="translate(582.639 205)" fill="#fff" stroke="rgba(0,0,0,0)" stroke-width="1" opacity="0.32"/>
              <circle id="Ellipse_289" data-name="Ellipse_289" cx="1.35" cy="1.35" r="1.35" transform="translate(363.74 216.15)" fill="#fff" stroke="rgba(0,0,0,0)" stroke-width="1"/>
              <circle id="Ellipse_290" data-name="Ellipse_290" cx="1.35" cy="1.35" r="1.35" transform="translate(367.789 216.15)" fill="#fff" stroke="rgba(0,0,0,0)" stroke-width="1"/>
              <circle id="Ellipse_291" data-name="Ellipse_291" cx="1.35" cy="1.35" r="1.35" transform="translate(371.84 216.15)" fill="#fff" stroke="rgba(0,0,0,0)" stroke-width="1"/>
            </g>
          </svg>
        </button>
      </div>

      {/* TextArea acting as the node body */}
      <textarea
        ref={textareaRef}
        value={isPlaceholderActive ? '' : content}
        placeholder={isPlaceholderActive ? defaultContent : ''}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleContentChange}
        onWheel={(e) => {
          e.stopPropagation();
          e.preventDefault();
          const textarea = e.currentTarget;
          textarea.scrollTop += e.deltaY;
        }}
        className={`w-full block bg-white text-sm focus:outline-none overflow-auto note-textarea resize-none p-3 ${isPlaceholderActive ? 'text-gray-400 placeholder-gray-400' : 'text-gray-700'}`}
        style={{ 
          height: `${targetContentHeight}px`, 
          lineHeight: `${LINE_HEIGHT}px`, 
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-word', 
          border: 'none',
          borderTop: 'none',
          zIndex: 1,
          overscrollBehavior: 'contain'
        }}
      />

      {/* Options Menu - Position relative to wrapper */}
      {isOptionsMenuOpen && (
        <div 
          ref={optionsMenuRef}
          className="absolute top-[5px] right-[5px] z-[70]" 
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

      {/* Text Format Menu - REMOVED */}
      {/* {showTextFormatMenu && textFormatMenuPosition && ( ... )} */}
    </div>
  );
};

export default NoteNode; 