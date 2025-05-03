import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';

export default function MinimalEditor() {
  const editor = useEditor({
    extensions: [StarterKit, Bold],
    content: '<p>Hello <strong>world</strong>!</p>',
  });

  return <EditorContent editor={editor} />;
} 