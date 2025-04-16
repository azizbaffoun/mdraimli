import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NodeProps, useReactFlow, useUpdateNodeInternals, Handle, Position } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import NoteEditorToolbar from './NoteEditorToolbar';

// Import new icons
import duplicateIcon from '@/assets/icons/duplicate_icon.svg';
import deleteIcon from '@/assets/icons/delete_icon.svg';

// Data structure for the node
interface NoteNodeData {
  title?: string;
  content?: string;
  onChange?: (id: string, data: { title?: string; content?: string }) => void;
}

// Define default values
const defaultTitle = "Note Title Here";
const defaultContent = "Add Your Note...";

// Constants for layout
const HEADER_HEIGHT = 35;
const LINE_HEIGHT = 21;
const MIN_CONTENT_HEIGHT = LINE_HEIGHT + 24; // Base height + padding
const MAX_CONTENT_HEIGHT = LINE_HEIGHT * 7; // 7 lines max

const NoteNode: React.FC<NodeProps<NoteNodeData>> = ({ id, data }) => {
  const { setNodes, getNode } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const menuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaceholderActive, setIsPlaceholderActive] = useState(!data.content || data.content === defaultContent);

  // Use state for internal editing, initialized from data prop
  const [title, setTitle] = useState(data.title ?? defaultTitle);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: data.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-3',
        style: `min-height: ${MIN_CONTENT_HEIGHT}px; max-height: ${MAX_CONTENT_HEIGHT}px; overflow-y: auto`,
      },
    },
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, content: newContent } };
          }
          return node;
        })
      );
      setIsPlaceholderActive(false);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const view = editor.view;
        const { left, top, bottom } = view.coordsAtPos(from);
        const height = bottom - top;
        setToolbarPosition({ x: left, y: top + height / 2 });
      } else {
        setToolbarPosition(null);
      }
    },
    onFocus: () => {
      if (isPlaceholderActive) {
        editor?.commands.setContent('');
        setIsPlaceholderActive(false);
      }
    },
    onBlur: () => {
      if (!editor?.getText().trim()) {
        editor?.commands.setContent('');
        setIsPlaceholderActive(true);
      }
    },
  });

  // Update editor content when data changes externally
  useEffect(() => {
    if (editor && data.content !== editor.getHTML()) {
      editor.commands.setContent(data.content || '');
      setIsPlaceholderActive(!data.content || data.content === defaultContent);
    }
  }, [data.content, editor]);

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

  // --- Options Menu Handlers ---
  const toggleOptionsMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOptionsMenuOpen(!isOptionsMenuOpen);
  };

  return (
    <div 
      className="relative node-wrapper shadow-lg rounded-lg border border-gray-200 overflow-hidden" 
      ref={containerRef} 
      style={{ width: 271.141 }}
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
        className="h-[36px] relative flex items-center"
        style={{
          background: 'linear-gradient(100deg, #3799db 0%, #2db4a6 100%)',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
          padding: '0 12px'
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
              <path id="Union_50" data-name="Union 50" d="M-213.5,0A12.5,12.5,0,0,1-201,12.5,12.5,12.5,0,0,1-213.5,25,12.5,12.5,0,0,1-226,12.5,12.5,12.5,0,0,1-213.5,0Z" transform="translate(582.639 205)" fill="#fff" stroke="rgba(0,0,0,0)" stroke-width="1" opacity="0.32"/>
              <circle id="Ellipse_289" data-name="Ellipse_289" cx="1.35" cy="1.35" r="1.35" transform="translate(363.74 216.15)" fill="#fff" stroke="rgba(0,0,0,0)" stroke-width="1"/>
              <circle id="Ellipse_290" data-name="Ellipse_290" cx="1.35" cy="1.35" r="1.35" transform="translate(367.789 216.15)" fill="#fff" stroke="rgba(0,0,0,0)" stroke-width="1"/>
              <circle id="Ellipse_291" data-name="Ellipse_291" cx="1.35" cy="1.35" r="1.35" transform="translate(371.84 216.15)" fill="#fff" stroke="rgba(0,0,0,0)" stroke-width="1"/>
            </g>
          </svg>
        </button>
      </div>

      {/* TipTap Editor */}
      <div 
        className={`bg-white ${isPlaceholderActive ? 'text-gray-400' : 'text-gray-700'}`}
        style={{ maxHeight: `${MAX_CONTENT_HEIGHT}px`, overflowY: 'auto' }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Formatting Toolbar */}
      <NoteEditorToolbar editor={editor} position={toolbarPosition} />

      {/* Options Menu */}
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
    </div>
  );
};

export default NoteNode; 