// components/providers/ColorSchemeProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

interface ThemeColors {
    light: Record<string, string>;
    dark: Record<string, string>;
}

interface ColorTheme {
    id: string;
    name: string;
    description: string;
    icon: string;
    colors: ThemeColors;
}

const AVAILABLE_THEMES: ColorTheme[] = [
    {
        id: "default",
        name: "По умолчанию",
        description: "Стандартная тема",
        icon: "🎨",
        colors: {
            light: {
                background: "oklch(0.9730 0.0133 286.1503)",
                foreground: "oklch(0.3015 0.0572 282.4176)",
                card: "oklch(1.0000 0 0)",
                "card-foreground": "oklch(0.3015 0.0572 282.4176)",
                popover: "oklch(1.0000 0 0)",
                "popover-foreground": "oklch(0.3015 0.0572 282.4176)",
                primary: "oklch(0.5417 0.1790 288.0332)",
                "primary-foreground": "oklch(1.0000 0 0)",
                secondary: "oklch(0.9174 0.0435 292.6901)",
                "secondary-foreground": "oklch(0.4143 0.1039 288.1742)",
                muted: "oklch(0.9580 0.0133 286.1454)",
                "muted-foreground": "oklch(0.5426 0.0465 284.7435)",
                accent: "oklch(0.9221 0.0373 262.1410)",
                "accent-foreground": "oklch(0.3015 0.0572 282.4176)",
                destructive: "oklch(0.6861 0.2061 14.9941)",
                "destructive-foreground": "oklch(1.0000 0 0)",
                border: "oklch(0.9115 0.0216 285.9625)",
                input: "oklch(0.9115 0.0216 285.9625)",
                ring: "oklch(0.5417 0.1790 288.0332)",
                sidebar: "oklch(0.9580 0.0133 286.1454)",
                "sidebar-foreground": "oklch(0.3015 0.0572 282.4176)",
                "sidebar-primary": "oklch(0.5417 0.1790 288.0332)",
                "sidebar-primary-foreground": "oklch(1.0000 0 0)",
                "sidebar-accent": "oklch(0.9221 0.0373 262.1410)",
                "sidebar-accent-foreground": "oklch(0.3015 0.0572 282.4176)",
                "sidebar-border": "oklch(0.9115 0.0216 285.9625)",
                "sidebar-ring": "oklch(0.5417 0.1790 288.0332)",
            },
            dark: {
                background: "oklch(0.1743 0.0227 283.7998)",
                foreground: "oklch(0.9185 0.0257 285.8834)",
                card: "oklch(0.2284 0.0384 282.9324)",
                "card-foreground": "oklch(0.9185 0.0257 285.8834)",
                popover: "oklch(0.2284 0.0384 282.9324)",
                "popover-foreground": "oklch(0.9185 0.0257 285.8834)",
                primary: "oklch(0.7162 0.1597 290.3962)",
                "primary-foreground": "oklch(0.1743 0.0227 283.7998)",
                secondary: "oklch(0.3139 0.0736 283.4591)",
                "secondary-foreground": "oklch(0.8367 0.0849 285.9111)",
                muted: "oklch(0.2710 0.0621 281.4377)",
                "muted-foreground": "oklch(0.7166 0.0462 285.1741)",
                accent: "oklch(0.3354 0.0828 280.9705)",
                "accent-foreground": "oklch(0.9185 0.0257 285.8834)",
                destructive: "oklch(0.6861 0.2061 14.9941)",
                "destructive-foreground": "oklch(1.0000 0 0)",
                border: "oklch(0.3261 0.0597 282.5832)",
                input: "oklch(0.3261 0.0597 282.5832)",
                ring: "oklch(0.7162 0.1597 290.3962)",
                sidebar: "oklch(0.2284 0.0384 282.9324)",
                "sidebar-foreground": "oklch(0.9185 0.0257 285.8834)",
                "sidebar-primary": "oklch(0.7162 0.1597 290.3962)",
                "sidebar-primary-foreground": "oklch(0.1743 0.0227 283.7998)",
                "sidebar-accent": "oklch(0.3354 0.0828 280.9705)",
                "sidebar-accent-foreground": "oklch(0.9185 0.0257 285.8834)",
                "sidebar-border": "oklch(0.3261 0.0597 282.5832)",
                "sidebar-ring": "oklch(0.7162 0.1597 290.3962)",
            },
        },
    },
    {
        id: "purple",
        name: "Фиолетовая",
        description: "Нежная фиолетовая тема",
        icon: "💜",
        colors: {
            light: {
                background: "oklch(0.98 0.01 280)",
                foreground: "oklch(0.25 0.05 280)",
                card: "oklch(1 0 0)",
                "card-foreground": "oklch(0.25 0.05 280)",
                popover: "oklch(1 0 0)",
                "popover-foreground": "oklch(0.25 0.05 280)",
                primary: "oklch(0.65 0.2 280)",
                "primary-foreground": "oklch(1 0 0)",
                secondary: "oklch(0.92 0.04 280)",
                "secondary-foreground": "oklch(0.35 0.1 280)",
                muted: "oklch(0.96 0.01 280)",
                "muted-foreground": "oklch(0.55 0.05 280)",
                accent: "oklch(0.94 0.03 280)",
                "accent-foreground": "oklch(0.25 0.05 280)",
                destructive: "oklch(0.68 0.2 15)",
                "destructive-foreground": "oklch(1 0 0)",
                border: "oklch(0.92 0.02 280)",
                input: "oklch(0.92 0.02 280)",
                ring: "oklch(0.65 0.2 280)",
                sidebar: "oklch(0.97 0.01 280)",
                "sidebar-foreground": "oklch(0.25 0.05 280)",
                "sidebar-primary": "oklch(0.65 0.2 280)",
                "sidebar-primary-foreground": "oklch(1 0 0)",
                "sidebar-accent": "oklch(0.94 0.03 280)",
                "sidebar-accent-foreground": "oklch(0.25 0.05 280)",
                "sidebar-border": "oklch(0.92 0.02 280)",
                "sidebar-ring": "oklch(0.65 0.2 280)",
            },
            dark: {
                background: "oklch(0.15 0.03 280)",
                foreground: "oklch(0.92 0.02 280)",
                card: "oklch(0.2 0.04 280)",
                "card-foreground": "oklch(0.92 0.02 280)",
                popover: "oklch(0.2 0.04 280)",
                "popover-foreground": "oklch(0.92 0.02 280)",
                primary: "oklch(0.7 0.18 280)",
                "primary-foreground": "oklch(0.15 0.03 280)",
                secondary: "oklch(0.28 0.06 280)",
                "secondary-foreground": "oklch(0.85 0.08 280)",
                muted: "oklch(0.25 0.04 280)",
                "muted-foreground": "oklch(0.7 0.05 280)",
                accent: "oklch(0.3 0.07 280)",
                "accent-foreground": "oklch(0.92 0.02 280)",
                destructive: "oklch(0.68 0.2 15)",
                "destructive-foreground": "oklch(1 0 0)",
                border: "oklch(0.3 0.05 280)",
                input: "oklch(0.3 0.05 280)",
                ring: "oklch(0.7 0.18 280)",
                sidebar: "oklch(0.18 0.04 280)",
                "sidebar-foreground": "oklch(0.92 0.02 280)",
                "sidebar-primary": "oklch(0.7 0.18 280)",
                "sidebar-primary-foreground": "oklch(0.15 0.03 280)",
                "sidebar-accent": "oklch(0.3 0.07 280)",
                "sidebar-accent-foreground": "oklch(0.92 0.02 280)",
                "sidebar-border": "oklch(0.3 0.05 280)",
                "sidebar-ring": "oklch(0.7 0.18 280)",
            },
        },
    },

    {
        id: "shadow-theme",
        name: "Тень",
        description: "Тема с тенями",
        icon: "🎨",
        colors: {
            light: {
                background: "oklch(1.0000 0 0)",
                foreground: "oklch(0.3588 0.1354 278.6973)",
                card: "oklch(1.0000 0 0)",
                "card-foreground": "oklch(0.3588 0.1354 278.6973)",
                popover: "oklch(1.0000 0 0)",
                "popover-foreground": "oklch(0.3588 0.1354 278.6973)",
                primary: "oklch(0.6056 0.2189 292.7172)",
                "primary-foreground": "oklch(1.0000 0 0)",
                secondary: "oklch(0.9618 0.0202 295.1913)",
                "secondary-foreground": "oklch(0.4568 0.2146 277.0229)",
                muted: "oklch(0.9691 0.0161 293.7558)",
                "muted-foreground": "oklch(0.5413 0.2466 293.0090)",
                accent: "oklch(0.9319 0.0316 255.5855)",
                "accent-foreground": "oklch(0.4244 0.1809 265.6377)",
                destructive: "oklch(0.6368 0.2078 25.3313)",
                "destructive-foreground": "oklch(1.0000 0 0)",
                border: "oklch(0.9299 0.0334 272.7879)",
                input: "oklch(0.9299 0.0334 272.7879)",
                ring: "oklch(0.6056 0.2189 292.7172)",
                sidebar: "oklch(0.9691 0.0161 293.7558)",
                "sidebar-foreground": "oklch(0.3588 0.1354 278.6973)",
                "sidebar-primary": "oklch(0.6056 0.2189 292.7172)",
                "sidebar-primary-foreground": "oklch(1.0000 0 0)",
                "sidebar-accent": "oklch(0.9319 0.0316 255.5855)",
                "sidebar-accent-foreground": "oklch(0.4244 0.1809 265.6377)",
                "sidebar-border": "oklch(0.9299 0.0334 272.7879)",
                "sidebar-ring": "oklch(0.6056 0.2189 292.7172)",
            },
            dark: {
                background: "oklch(0.2077 0.0398 265.7549)",
                foreground: "oklch(0.9299 0.0334 272.7879)",
                card: "oklch(0.2573 0.0861 281.2883)",
                "card-foreground": "oklch(0.9299 0.0334 272.7879)",
                popover: "oklch(0.2573 0.0861 281.2883)",
                "popover-foreground": "oklch(0.9299 0.0334 272.7879)",
                primary: "oklch(0.6056 0.2189 292.7172)",
                "primary-foreground": "oklch(1.0000 0 0)",
                secondary: "oklch(0.2573 0.0861 281.2883)",
                "secondary-foreground": "oklch(0.9299 0.0334 272.7879)",
                muted: "oklch(0.2329 0.0919 279.1398)",
                "muted-foreground": "oklch(0.8112 0.1013 293.5712)",
                accent: "oklch(0.4568 0.2146 277.0229)",
                "accent-foreground": "oklch(0.9299 0.0334 272.7879)",
                destructive: "oklch(0.6368 0.2078 25.3313)",
                "destructive-foreground": "oklch(1.0000 0 0)",
                border: "oklch(0.2827 0.1351 291.0894)",
                input: "oklch(0.2827 0.1351 291.0894)",
                ring: "oklch(0.6056 0.2189 292.7172)",
                sidebar: "oklch(0.2077 0.0398 265.7549)",
                "sidebar-foreground": "oklch(0.9299 0.0334 272.7879)",
                "sidebar-primary": "oklch(0.6056 0.2189 292.7172)",
                "sidebar-primary-foreground": "oklch(1.0000 0 0)",
                "sidebar-accent": "oklch(0.4568 0.2146 277.0229)",
                "sidebar-accent-foreground": "oklch(0.9299 0.0334 272.7879)",
                "sidebar-border": "oklch(0.2827 0.1351 291.0894)",
                "sidebar-ring": "oklch(0.6056 0.2189 292.7172)",
            },
        },
    },

    {
        id: "warm-theme",
        name: "Теплая",
        description: "Теплая тема",
        icon: "🔥",
        colors: {
            light: {
                background: "oklch(0.9818 0.0054 95.0986)",
                foreground: "oklch(0.3438 0.0269 95.7226)",
                card: "oklch(0.9818 0.0054 95.0986)",
                "card-foreground": "oklch(0.1908 0.0020 106.5859)",
                popover: "oklch(1.0000 0 0)",
                "popover-foreground": "oklch(0.2671 0.0196 98.9390)",
                primary: "oklch(0.6171 0.1375 39.0427)",
                "primary-foreground": "oklch(1.0000 0 0)",
                secondary: "oklch(0.9245 0.0138 92.9892)",
                "secondary-foreground": "oklch(0.4334 0.0177 98.6048)",
                muted: "oklch(0.9341 0.0153 90.2390)",
                "muted-foreground": "oklch(0.6059 0.0075 97.4233)",
                accent: "oklch(0.9245 0.0138 92.9892)",
                "accent-foreground": "oklch(0.2671 0.0196 98.9390)",
                destructive: "oklch(0.1908 0.0020 106.5859)",
                "destructive-foreground": "oklch(1.0000 0 0)",
                border: "oklch(0.8847 0.0069 97.3627)",
                input: "oklch(0.7621 0.0156 98.3528)",
                ring: "oklch(0.6171 0.1375 39.0427)",
                sidebar: "oklch(0.9663 0.0080 98.8792)",
                "sidebar-foreground": "oklch(0.3590 0.0051 106.6524)",
                "sidebar-primary": "oklch(0.6171 0.1375 39.0427)",
                "sidebar-primary-foreground": "oklch(0.9881 0 0)",
                "sidebar-accent": "oklch(0.9245 0.0138 92.9892)",
                "sidebar-accent-foreground": "oklch(0.3250 0 0)",
                "sidebar-border": "oklch(0.9401 0 0)",
                "sidebar-ring": "oklch(0.7731 0 0)",
            },
            dark: {
                background: "oklch(0.2679 0.0036 106.6427)",
                foreground: "oklch(0.8074 0.0142 93.0137)",
                card: "oklch(0.2679 0.0036 106.6427)",
                "card-foreground": "oklch(0.9818 0.0054 95.0986)",
                popover: "oklch(0.3085 0.0035 106.6039)",
                "popover-foreground": "oklch(0.9211 0.0040 106.4781)",
                primary: "oklch(0.6724 0.1308 38.7559)",
                "primary-foreground": "oklch(1.0000 0 0)",
                secondary: "oklch(0.9818 0.0054 95.0986)",
                "secondary-foreground": "oklch(0.3085 0.0035 106.6039)",
                muted: "oklch(0.2213 0.0038 106.7070)",
                "muted-foreground": "oklch(0.7713 0.0169 99.0657)",
                accent: "oklch(0.2130 0.0078 95.4245)",
                "accent-foreground": "oklch(0.9663 0.0080 98.8792)",
                destructive: "oklch(0.6368 0.2078 25.3313)",
                "destructive-foreground": "oklch(1.0000 0 0)",
                border: "oklch(0.3618 0.0101 106.8928)",
                input: "oklch(0.4336 0.0113 100.2195)",
                ring: "oklch(0.6724 0.1308 38.7559)",
                sidebar: "oklch(0.2357 0.0024 67.7077)",
                "sidebar-foreground": "oklch(0.8074 0.0142 93.0137)",
                "sidebar-primary": "oklch(0.3250 0 0)",
                "sidebar-primary-foreground": "oklch(0.9881 0 0)",
                "sidebar-accent": "oklch(0.1680 0.0020 106.6177)",
                "sidebar-accent-foreground": "oklch(0.8074 0.0142 93.0137)",
                "sidebar-border": "oklch(0.9401 0 0)",
                "sidebar-ring": "oklch(0.7731 0 0)",
            },
        },
    },
];


const STORAGE_KEY = "user-color-theme";

interface ColorSchemeContextType {
    currentTheme: ColorTheme | null;
    themes: ColorTheme[];
    changeTheme: (theme: ColorTheme) => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined);

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
    const [currentTheme, setCurrentTheme] = useState<ColorTheme | null>(null);

    const applyTheme = useCallback((theme: ColorTheme, isDark: boolean) => {
        const root = document.documentElement;
        const colors = isDark ? theme.colors.dark : theme.colors.light;

        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    }, []);

    const changeTheme = useCallback((theme: ColorTheme) => {
        setCurrentTheme(theme);
        localStorage.setItem(STORAGE_KEY, theme.id);

        const isDark = document.documentElement.classList.contains("dark");
        applyTheme(theme, isDark);
    }, [applyTheme]);

    // Загрузка темы при старте
    useEffect(() => {
        const savedThemeId = localStorage.getItem(STORAGE_KEY);
        const isDark = document.documentElement.classList.contains("dark");

        let themeToApply = AVAILABLE_THEMES[0];

        if (savedThemeId) {
            const found = AVAILABLE_THEMES.find(t => t.id === savedThemeId);
            if (found) themeToApply = found;
        }

        setCurrentTheme(themeToApply);
        applyTheme(themeToApply, isDark);
    }, [applyTheme]);

    // Следим за переключением dark/light
    useEffect(() => {
        if (!currentTheme) return;

        let debounceTimer: NodeJS.Timeout;

        const observer = new MutationObserver(() => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const isDark = document.documentElement.classList.contains("dark");
                applyTheme(currentTheme, isDark);
            }, 10);
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"]
        });

        return () => {
            observer.disconnect();
            clearTimeout(debounceTimer);
        };
    }, [currentTheme, applyTheme]);

    return (
        <ColorSchemeContext.Provider value={{ currentTheme, themes: AVAILABLE_THEMES, changeTheme }}>
            {children}
        </ColorSchemeContext.Provider>
    );
}

export function useColorScheme() {
    const context = useContext(ColorSchemeContext);
    if (context === undefined) {
        throw new Error("useColorScheme must be used within a ColorSchemeProvider");
    }
    return context;
}