"use client";

import { useCallback, useEffect, useRef } from "react";
import {
    Editor,
    rootCtx,
    defaultValueCtx,
    editorViewOptionsCtx,
} from "@milkdown/kit/core";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { gfm } from "@milkdown/kit/preset/gfm";
import { callCommand } from "@milkdown/kit/utils";
import {
    toggleStrongCommand,
    toggleEmphasisCommand,
    toggleInlineCodeCommand,
    wrapInBlockquoteCommand,
    wrapInBulletListCommand,
    wrapInOrderedListCommand,
    insertHrCommand,
    turnIntoTextCommand,
    wrapInHeadingCommand,
} from "@milkdown/kit/preset/commonmark";
import { toggleStrikethroughCommand } from "@milkdown/kit/preset/gfm";
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
import { history, undoCommand, redoCommand } from "@milkdown/kit/plugin/history";
import { clipboard } from "@milkdown/kit/plugin/clipboard";
import { cursor } from "@milkdown/kit/plugin/cursor";
import { trailing } from "@milkdown/kit/plugin/trailing";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { ProsemirrorAdapterProvider } from "@prosemirror-adapter/react";

interface MilkdownEditorProps {
    value: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    height?: string;
    readOnly?: boolean;
    className?: string;
}

interface ToolbarButtonProps {
    title: string;
    active?: boolean;
    onClick: (e: React.MouseEvent) => void;
    children: React.ReactNode;
}

function ToolbarButton({ title, active, onClick, children }: ToolbarButtonProps) {
    return (
        <button
            title={title}
            aria-label={title}
            aria-pressed={active}
            type="button"
            onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick(e);
            }}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                padding: 0,
                border: "none",
                borderRadius: 4,
                background: active ? "var(--accent)" : "transparent",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--foreground)",
                transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = "var(--accent)";
            }}
            onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
        >
            {children}
        </button>
    );
}

function ToolbarDivider() {
    return (
        <span style={{
            display: "inline-block",
            width: 1,
            height: 18,
            background: "var(--border)",
            margin: "0 4px",
            verticalAlign: "middle",
        }} />
    );
}

interface InnerProps {
    value: string;
    onChange?: (v: string) => void;
    placeholder?: string;  // ← добавлено
    readOnly?: boolean;
    editorRef: React.MutableRefObject<Editor | null>;
}

function MilkdownEditorInner({ value, onChange, placeholder, readOnly, editorRef }: InnerProps) {
    const { get } = useEditor((root) =>
        Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, root);
                ctx.set(defaultValueCtx, value);
                ctx.set(editorViewOptionsCtx, {
                    editable: () => !readOnly,
                    attributes: {
                        class: "milkdown-prose",
                        spellcheck: "true",
                        "data-placeholder": placeholder ?? "",
                    },
                });
                ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, prevMarkdown) => {
                    if (markdown !== prevMarkdown) {
                        onChange?.(markdown);
                    }
                });
            })
            .use(commonmark)
            .use(gfm)
            .use(listener)
            .use(history)
            .use(clipboard)
            .use(cursor)
            .use(trailing)
    );

    useEffect(() => {
        editorRef.current = get() ?? null;
    });

    return <Milkdown />;
}

function Toolbar({ editorRef }: { editorRef: React.MutableRefObject<Editor | null> }) {
    const call = useCallback(
        <T,>(command: Parameters<typeof callCommand>[0], payload?: T) => {
            editorRef.current?.action(callCommand(command, payload as any));
        },
        [editorRef]
    );

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
                padding: "4px 8px",
                borderBottom: "1px solid var(--border)",
                background: "var(--muted)",
            }}
        >
            {[1, 2, 3].map((level) => (
                <ToolbarButton
                    key={level}
                    title={`Heading ${level}`}
                    onClick={() => call(wrapInHeadingCommand.key, level)}
                >
                    H{level}
                </ToolbarButton>
            ))}
            <ToolbarButton title="Plain text" onClick={() => call(turnIntoTextCommand.key)}>
                P
            </ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton title="Bold (Ctrl+B)" onClick={() => call(toggleStrongCommand.key)}>
                <b>B</b>
            </ToolbarButton>
            <ToolbarButton title="Italic (Ctrl+I)" onClick={() => call(toggleEmphasisCommand.key)}>
                <em>I</em>
            </ToolbarButton>
            <ToolbarButton title="Strikethrough" onClick={() => call(toggleStrikethroughCommand.key)}>
                <s>S</s>
            </ToolbarButton>
            <ToolbarButton title="Inline code" onClick={() => call(toggleInlineCodeCommand.key)}>
                {"</>"}
            </ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton title="Blockquote" onClick={() => call(wrapInBlockquoteCommand.key)}>
                ❝
            </ToolbarButton>
            <ToolbarButton title="Bullet list" onClick={() => call(wrapInBulletListCommand.key)}>
                • ≡
            </ToolbarButton>
            <ToolbarButton title="Ordered list" onClick={() => call(wrapInOrderedListCommand.key)}>
                1.≡
            </ToolbarButton>
            <ToolbarButton title="Horizontal rule" onClick={() => call(insertHrCommand.key)}>
                ─
            </ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton title="Undo (Ctrl+Z)" onClick={() => call(undoCommand.key)}>
                ↩
            </ToolbarButton>
            <ToolbarButton title="Redo (Ctrl+Y)" onClick={() => call(redoCommand.key)}>
                ↪
            </ToolbarButton>
        </div>
    );
}

export function MilkdownEditor({
                                   value,
                                   onChange,
                                   placeholder,
                                   height = "360px",
                                   readOnly = false,
                                   className,
                               }: MilkdownEditorProps) {
    const editorRef = useRef<Editor | null>(null);

    return (
        <div
            className={className}
            style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                height,
                background: "var(--card)",
            }}
        >
            <style>{`
                .milkdown-prose {
                    outline: none;
                    padding: 12px 16px;
                    line-height: 1.7;
                    font-size: 15px;
                    color: var(--foreground);
                    min-height: 100%;
                    box-sizing: border-box;
                    position: relative;
                }
                .milkdown-prose p { margin: 0.5em 0; }
                .milkdown-prose h1 { font-size: 1.75em; font-weight: 700; margin: 0.75em 0 0.3em; color: var(--foreground); }
                .milkdown-prose h2 { font-size: 1.4em; font-weight: 700; margin: 0.75em 0 0.3em; color: var(--foreground); }
                .milkdown-prose h3 { font-size: 1.15em; font-weight: 600; margin: 0.75em 0 0.3em; color: var(--foreground); }
                .milkdown-prose blockquote {
                    border-left: 3px solid var(--border);
                    margin: 0.5em 0;
                    padding: 0 0 0 1em;
                    color: var(--muted-foreground);
                }
                .milkdown-prose code {
                    background: var(--muted);
                    color: var(--foreground);
                    padding: 0.1em 0.35em;
                    border-radius: 4px;
                    font-family: ui-monospace, monospace;
                    font-size: 0.88em;
                }
                .milkdown-prose pre {
                    background: var(--card);
                    color: var(--card-foreground);
                    border: 1px solid var(--border);
                    padding: 1em;
                    border-radius: 6px;
                    overflow: auto;
                    font-family: ui-monospace, monospace;
                    font-size: 0.88em;
                }
                .milkdown-prose pre code { background: transparent; color: inherit; padding: 0; }
                .milkdown-prose ul { list-style: disc; padding-left: 1.5em; margin: 0.4em 0; }
                .milkdown-prose ol { list-style: decimal; padding-left: 1.5em; margin: 0.4em 0; }
                .milkdown-prose li { margin: 0.2em 0; }
                .milkdown-prose hr { border: none; border-top: 1px solid var(--border); margin: 1em 0; }
                .milkdown-prose a { color: var(--primary); text-decoration: underline; }
                .milkdown-prose strong { font-weight: 700; }
                .milkdown-prose em { font-style: italic; }
                .milkdown-prose s { text-decoration: line-through; }
                .milkdown-prose table { border-collapse: collapse; width: 100%; margin: 0.75em 0; }
                .milkdown-prose th, .milkdown-prose td {
                    border: 1px solid var(--border);
                    padding: 6px 10px;
                    text-align: left;
                }
                .milkdown-prose th { background: var(--muted); color: var(--foreground); font-weight: 600; }
                .ProseMirror-selectednode { outline: 2px solid var(--ring); }
                .ProseMirror-gapcursor:after { border-top-color: var(--muted-foreground); }
                .ProseMirror-dropcursor { border-color: var(--primary); }
                .milkdown-prose.ProseMirror:not(:has(> p:not(:empty), > h1, > h2, > h3, > ul, > ol, > blockquote))::before,
                .milkdown-prose:has(> p:only-child > br:only-child)::before {
                    content: attr(data-placeholder);
                    position: absolute;
                    top: 12px;
                    left: 16px;
                    color: var(--muted-foreground);
                    pointer-events: none;
                    font-size: 15px;
                    user-select: none;
                }
            `}</style>

            {!readOnly && <Toolbar editorRef={editorRef} />}

            <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
                <MilkdownProvider>
                    <ProsemirrorAdapterProvider>
                        <MilkdownEditorInner
                            value={value}
                            onChange={onChange}
                            placeholder={placeholder}  // ← пробрасываем
                            readOnly={readOnly}
                            editorRef={editorRef}
                        />
                    </ProsemirrorAdapterProvider>
                </MilkdownProvider>
            </div>
        </div>
    );
}