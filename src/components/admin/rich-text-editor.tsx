"use client";

import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Type,
  Undo,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A small dependency-free WYSIWYG editor.
 *
 * The editable area is *uncontrolled*: the initial HTML is written to the DOM
 * once, and edits are reported upward. That avoids the caret jumping to the end
 * on every keystroke, which is what happens when React re-renders a controlled
 * contentEditable. When the parent needs to replace the content (for example
 * when the editing language changes) it passes a different `key`, which
 * remounts this component with fresh HTML.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write here…",
  minHeight = 220,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showSource, setShowSource] = useState(false);
  const [source, setSource] = useState(value);
  const [isEmpty, setIsEmpty] = useState(!value || value === "<p></p>");

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
    // Runs on mount only; see the note above about remounting via `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emit() {
    const html = editorRef.current?.innerHTML ?? "";
    setIsEmpty(html.replace(/<br\s*\/?>|<p>\s*<\/p>|\s|&nbsp;/g, "") === "");
    onChange(html);
  }

  function exec(command: string, argument?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    emit();
  }

  function addLink() {
    const url = window.prompt("Link URL", "https://");
    if (!url) return;
    exec("createLink", url);
  }

  function applySource(next: string) {
    setSource(next);
    onChange(next);
  }

  if (showSource) {
    return (
      <div className="overflow-hidden rounded-lg border border-ink-200">
        <Toolbar>
          <ToolbarButton label="Visual editor" onClick={() => setShowSource(false)}>
            <Type className="h-4 w-4" aria-hidden />
          </ToolbarButton>
          <span className="px-2 text-xs font-medium text-ink-500">HTML source</span>
        </Toolbar>
        <textarea
          value={source}
          onChange={(event) => applySource(event.target.value)}
          spellCheck={false}
          style={{ minHeight }}
          className="w-full resize-y bg-ink-900 px-4 py-3 font-mono text-xs leading-relaxed text-ink-100 outline-none"
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-ink-200 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
      <Toolbar>
        <ToolbarButton label="Bold" onClick={() => exec("bold")}>
          <Bold className="h-4 w-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => exec("italic")}>
          <Italic className="h-4 w-4" aria-hidden />
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="Paragraph" onClick={() => exec("formatBlock", "<p>")}>
          <Type className="h-4 w-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton label="Heading 2" onClick={() => exec("formatBlock", "<h2>")}>
          <Heading2 className="h-4 w-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton label="Heading 3" onClick={() => exec("formatBlock", "<h3>")}>
          <Heading3 className="h-4 w-4" aria-hidden />
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="Bulleted list" onClick={() => exec("insertUnorderedList")}>
          <List className="h-4 w-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" onClick={() => exec("insertOrderedList")}>
          <ListOrdered className="h-4 w-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton label="Quote" onClick={() => exec("formatBlock", "<blockquote>")}>
          <Quote className="h-4 w-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton label="Link" onClick={addLink}>
          <LinkIcon className="h-4 w-4" aria-hidden />
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="Undo" onClick={() => exec("undo")}>
          <Undo className="h-4 w-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => exec("redo")}>
          <Redo className="h-4 w-4" aria-hidden />
        </ToolbarButton>

        <span className="ml-auto" />

        <ToolbarButton
          label="Edit HTML"
          onClick={() => {
            setSource(editorRef.current?.innerHTML ?? "");
            setShowSource(true);
          }}
        >
          <Code className="h-4 w-4" aria-hidden />
        </ToolbarButton>
      </Toolbar>

      <div className="relative">
        {isEmpty ? (
          <span className="pointer-events-none absolute left-4 top-3 text-sm text-ink-400">
            {placeholder}
          </span>
        ) : null}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          onInput={emit}
          onBlur={emit}
          onPaste={(event) => {
            // Paste as plain text so Word/Docs markup never reaches the site.
            event.preventDefault();
            const text = event.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
          }}
          style={{ minHeight }}
          className="rte max-w-none px-4 py-3 text-sm outline-none"
        />
      </div>
    </div>
  );
}

function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-ink-200 bg-ink-50 px-2 py-1.5">
      {children}
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-ink-200" />;
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-600 transition-colors hover:bg-white hover:text-ink-900",
      )}
    >
      {children}
    </button>
  );
}
