import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';
import {
  Wrapper,
  Toolbar,
  ToolBtn,
  ToolDivider,
  ColorBtn,
  EditorArea,
} from '../../styles/mission/MissionRichEditorStyle';

const EXTENSIONS = [StarterKit, TextStyle, Color, Underline];

const COLORS = [
  { label: '기본', value: '' },
  { label: '빨강', value: '#ef4444' },
  { label: '파랑', value: '#3b82f6' },
  { label: '초록', value: '#10b981' },
  { label: '주황', value: '#f59e0b' },
];

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

const MissionRichEditor = ({ value, onChange, placeholder }: Props) => {
  const editor = useEditor({
    extensions: EXTENSIONS,
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <Wrapper>
      <Toolbar>
        <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="굵게">
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="기울임">
          <em>I</em>
        </ToolBtn>
        <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="밑줄">
          <u>U</u>
        </ToolBtn>
        <ToolDivider />
        {COLORS.map(({ label, value: color }) => (
          <ColorBtn
            key={label}
            color={color}
            active={color === '' ? !editor.isActive('textStyle', { color: /.+/ }) : editor.isActive('textStyle', { color })}
            onClick={() => color === '' ? editor.chain().focus().unsetColor().run() : editor.chain().focus().setColor(color).run()}
            title={label}
          />
        ))}
      </Toolbar>
      <EditorArea className={placeholder && editor.isEmpty ? 'is-empty' : ''} data-placeholder={placeholder}>
        <EditorContent editor={editor} />
      </EditorArea>
    </Wrapper>
  );
};

export default MissionRichEditor;
