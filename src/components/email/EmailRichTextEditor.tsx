"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type ReactNode,
} from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link2,
  List,
  ListOrdered,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type EmailRichTextEditorHandle = {
  getHtml: () => string;
  getText: () => string;
  clear: () => void;
  setHtml: (html: string) => void;
  insertImage: (src: string, alt?: string) => void;
};

type EmailRichTextEditorProps = {
  disabled?: boolean;
  className?: string;
};

export const EmailRichTextEditor = forwardRef<
  EmailRichTextEditorHandle,
  EmailRichTextEditorProps
>(function EmailRichTextEditor({ disabled = false, className }, ref) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Placeholder.configure({
        placeholder: "Rédigez votre message…",
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-md my-2",
        },
      }),
    ],
    content: "",
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[220px] px-3 py-2 text-sm text-white focus:outline-none [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-sky-400 [&_blockquote]:border-l-2 [&_blockquote]:border-gray-600 [&_blockquote]:pl-3 [&_blockquote]:text-gray-300",
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  useImperativeHandle(
    ref,
    () => ({
      getHtml: () => editor?.getHTML() ?? "",
      getText: () => editor?.getText() ?? "",
      clear: () => {
        editor?.commands.clearContent();
      },
      setHtml: (html: string) => {
        editor?.commands.setContent(html);
      },
      insertImage: (src: string, alt?: string) => {
        if (!src) return;
        editor
          ?.chain()
          .focus()
          .setImage({ src, alt: alt?.trim() || undefined })
          .run();
      },
    }),
    [editor],
  );

  if (!mounted || !editor) {
    return (
      <div
        className={cn(
          "min-h-[260px] rounded-lg border border-gray-700 bg-gray-800/80 animate-pulse",
          className,
        )}
      />
    );
  }

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Adresse du lien (URL)", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const ToolBtn = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-1.5 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-40",
        active && "bg-gray-700 text-white",
      )}
    >
      {children}
    </button>
  );

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-700 bg-gray-800/50 overflow-hidden flex flex-col",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-700 bg-gray-900/80">
        <ToolBtn
          title="Gras"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          title="Italique"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          title="Souligner"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn title="Lien" active={editor.isActive("link")} onClick={setLink}>
          <Link2 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          title="Liste à puces"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          title="Liste numérotée"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          title="Annuler"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          title="Rétablir"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo className="w-4 h-4" />
        </ToolBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
});
