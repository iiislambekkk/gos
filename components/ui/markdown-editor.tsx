// components/ui/markdown-editor.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { Eye, Edit3 } from "lucide-react";

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
    label?: string;
}

export function MarkdownEditor({
                                   value,
                                   onChange,
                                   placeholder,
                                   minHeight = "200px",
                               }: MarkdownEditorProps) {
    return (
        <Tabs defaultValue="write">
            <TabsList className="h-8">
                <TabsTrigger value="write" className="text-xs gap-1 h-7">
                    <Edit3 size={12} />
                    Жазу
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-xs gap-1 h-7">
                    <Eye size={12} />
                    Превью
                </TabsTrigger>
            </TabsList>
            <TabsContent value="write" className="mt-2">
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{ minHeight }}
                    className="font-mono text-sm resize-y"
                />
            </TabsContent>
            <TabsContent value="preview" className="mt-2">
                <div
                    className="border rounded-md p-3 prose prose-sm max-w-none dark:prose-invert overflow-auto"
                    style={{ minHeight }}
                >
                    {value ? (
                        <ReactMarkdown>{value}</ReactMarkdown>
                    ) : (
                        <p className="text-muted-foreground text-sm italic">Бос</p>
                    )}
                </div>
            </TabsContent>
        </Tabs>
    );
}