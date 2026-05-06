"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { cn } from "@/lib/utils";

// Инициализируем один раз — вне компонента
mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
    fontFamily: "system-ui, sans-serif",
    themeVariables: {
        primaryColor: "#3b82f6",
        primaryBorderColor: "#2563eb",
        primaryTextColor: "#1e293b",
        lineColor: "#64748b",
    },
});

interface MermaidProps {
    chart: string;
    className?: string;
}

export default function Mermaid({ chart, className }: MermaidProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!containerRef.current || !chart?.trim()) return;

        let cancelled = false;

        const renderChart = async () => {
            try {
                setError(null);
                const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                const { svg } = await mermaid.render(id, chart.trim());
                if (!cancelled && containerRef.current) {
                    containerRef.current.innerHTML = svg;
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Ошибка рендеринга");
                }
            }
        };

        renderChart();
        return () => { cancelled = true; };
    }, [chart]);

    if (error) {
        return (
            <div className="p-3 bg-destructive/10 rounded-lg text-destructive text-xs">
                <p className="font-medium">❌ Не удалось отобразить диаграмму</p>
                <pre className="mt-1 overflow-x-auto">{error}</pre>
            </div>
        );
    }

    return <div ref={containerRef} className={cn("flex justify-center overflow-x-auto", className)} />;
}