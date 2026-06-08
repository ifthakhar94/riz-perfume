"use client";

import { useEffect } from "react";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Redo,
  Strikethrough,
  Undo,
} from "lucide-react";

import { cn } from "@/lib/utils";

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      // Prevent the editor losing selection when a toolbar button is pressed.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40",
        active && "bg-muted text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const divider = <span className="mx-1 h-5 w-px bg-border" />;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1">
      <ToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      {divider}
      <ToolbarButton
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      {divider}
      <ToolbarButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>
      {divider}
      <ToolbarButton
        label="Undo"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

/**
 * Rich text editor (TipTap). Controlled by an HTML string (`value`/`onChange`).
 * The HTML is stored in the product `description`. NOTE: when rendering this
 * HTML on the public site, sanitize it (e.g. isomorphic-dompurify).
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "Write a description…" }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[12rem] px-3 py-2 focus:outline-none prose-headings:font-serif",
      },
    },
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
  });

  // Sync external value changes (e.g. async product load) without disrupting typing.
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="min-h-[14rem] rounded-md border bg-muted/20" />;
  }

  return (
    <div className="overflow-hidden rounded-md border focus-within:ring-2 focus-within:ring-ring">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
