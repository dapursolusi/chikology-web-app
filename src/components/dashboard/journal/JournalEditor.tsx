'use client';

import { type Dispatch, type SetStateAction, useState } from 'react';

import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface JournalEditorProps {
  content: string;
  onChange: Dispatch<SetStateAction<string>>;
}

export function JournalEditor({ content, onChange }: JournalEditorProps) {
  const [activeBold, setActiveBold] = useState(false);
  const [activeItalic, setActiveItalic] = useState(false);
  const [activeBulletList, setActiveBulletList] = useState(false);
  const [activeOrderedList, setActiveOrderedList] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
        code: false,
      }),
      Placeholder.configure({
        placeholder: 'Tuliskan perasaanmu hari ini...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      setActiveBold(editor.isActive('bold'));
      setActiveItalic(editor.isActive('italic'));
      setActiveBulletList(editor.isActive('bulletList'));
      setActiveOrderedList(editor.isActive('orderedList'));
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base dark:prose-invert max-w-none min-h-[140px] focus:outline-none text-sm',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <TooltipProvider delayDuration={300}>
        <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/40 p-1.5">
          <ToolbarButton
            active={activeBold}
            onClick={() => {
              editor.chain().focus().toggleBold().run();
              setActiveBold(editor.isActive('bold'));
              setActiveItalic(editor.isActive('italic'));
              setActiveBulletList(editor.isActive('bulletList'));
              setActiveOrderedList(editor.isActive('orderedList'));
            }}
            tooltip="Bold (Ctrl+B)"
          >
            <Bold className="size-4" strokeWidth={2.5} />
          </ToolbarButton>
          <ToolbarButton
            active={activeItalic}
            onClick={() => {
              editor.chain().focus().toggleItalic().run();
              setActiveBold(editor.isActive('bold'));
              setActiveItalic(editor.isActive('italic'));
              setActiveBulletList(editor.isActive('bulletList'));
              setActiveOrderedList(editor.isActive('orderedList'));
            }}
            tooltip="Italic (Ctrl+I)"
          >
            <Italic className="size-4" strokeWidth={2.5} />
          </ToolbarButton>
          <div className="mx-1 h-5 w-px bg-border" />
          <ToolbarButton
            active={activeBulletList}
            onClick={() => {
              editor.chain().focus().toggleBulletList().run();
              setActiveBold(editor.isActive('bold'));
              setActiveItalic(editor.isActive('italic'));
              setActiveBulletList(editor.isActive('bulletList'));
              setActiveOrderedList(editor.isActive('orderedList'));
            }}
            tooltip="Daftar Poin"
          >
            <List className="size-4" strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            active={activeOrderedList}
            onClick={() => {
              editor.chain().focus().toggleOrderedList().run();
              setActiveBold(editor.isActive('bold'));
              setActiveItalic(editor.isActive('italic'));
              setActiveBulletList(editor.isActive('bulletList'));
              setActiveOrderedList(editor.isActive('orderedList'));
            }}
            tooltip="Daftar Nomor"
          >
            <ListOrdered className="size-4" strokeWidth={2} />
          </ToolbarButton>
        </div>
      </TooltipProvider>
      <div className="rounded-lg border bg-background p-0.5">
        <EditorContent
          editor={editor}
          className="[&_.ProseMirror]:rounded-md [&_.ProseMirror]:bg-background [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2 [&_.ProseMirror]:min-h-[140px] [&_.ProseMirror]:focus:outline-none"
        />
      </div>
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  tooltip,
  children,
}: {
  active: boolean;
  onClick: () => void;
  tooltip: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={onClick}
          className={`size-8 p-0 ${active ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' : ''}`}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
