// components/ui/markdown.tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export function Markdown({ content }: { content: string }) {
    return (
        <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none
      prose-headings:mt-4 prose-headings:mb-2
      prose-p:my-2 prose-ul:my-2 prose-ol:my-2
      prose-li:my-0.5 prose-code:bg-muted prose-code:px-1 prose-code:py-0.5
      prose-code:rounded prose-code:text-sm prose-code:font-normal
      prose-pre:bg-muted prose-pre:border prose-pre:shadow-sm">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}