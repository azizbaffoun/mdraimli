import React from 'react';
import { Editor } from '@tiptap/react';

interface NoteEditorToolbarProps {
  editor: Editor | null;
  position: { x: number; y: number } | null;
}

const NoteEditorToolbar: React.FC<NoteEditorToolbarProps> = ({ editor, position }) => {
  if (!editor || !position) return null;

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-lg"
      style={{
        top: `${position.y - 45}px`,
        left: `${position.x}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="flex items-center p-1 space-x-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded hover:bg-gray-100 ${
            editor.isActive('bold') ? 'bg-gray-200' : ''
          }`}
        >
          <span className="font-bold">B</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded hover:bg-gray-100 ${
            editor.isActive('italic') ? 'bg-gray-200' : ''
          }`}
        >
          <span className="italic">i</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1 rounded hover:bg-gray-100 ${
            editor.isActive('underline') ? 'bg-gray-200' : ''
          }`}
        >
          <span className="underline">U</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1 rounded hover:bg-gray-100 ${
            editor.isActive('strike') ? 'bg-gray-200' : ''
          }`}
        >
          <span className="line-through">S</span>
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1 rounded hover:bg-gray-100 ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 18 18">
            <path fill="currentColor" d="M15 5H3v2h12V5zm-4 4H3v2h8V9zm-8 4h12v2H3v-2z"/>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1 rounded hover:bg-gray-100 ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 18 18">
            <path fill="currentColor" d="M15 5H3v2h12V5zm-2 4H5v2h8V9zm-8 4h12v2H3v-2z"/>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1 rounded hover:bg-gray-100 ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 18 18">
            <path fill="currentColor" d="M15 5H3v2h12V5zm0 4H7v2h8V9zm-12 4h12v2H3v-2z"/>
          </svg>
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded hover:bg-gray-100 ${
            editor.isActive('bulletList') ? 'bg-gray-200' : ''
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 18 18">
            <path fill="currentColor" d="M7 5h11v2H7V5zm0 4h11v2H7V9zm0 4h11v2H7v-2zm-4-8a1 1 0 110 2 1 1 0 010-2zm0 4a1 1 0 110 2 1 1 0 010-2zm0 4a1 1 0 110 2 1 1 0 010-2z"/>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1 rounded hover:bg-gray-100 ${
            editor.isActive('orderedList') ? 'bg-gray-200' : ''
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 18 18">
            <path fill="currentColor" d="M4 5.5h1v-4H3v1h1v3zm-1 2v1h2v-1H4v-1H3v1h.5zm1.5 4.5H3v2.5h2v-1H4v-.5h1v-1H3v1h1.5v-1zm4-8h11v2H8.5v-2zm0 4h11v2H8.5v-2zm0 4h11v2H8.5v-2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NoteEditorToolbar; 