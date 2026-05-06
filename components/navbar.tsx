"use client";

import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
    Moon,
    Sun,
    LogOut,
    Shield,
    User as UserIcon,
    SkipBack,
    SkipForward,
    Play,
    Pause,
    Volume2,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserRole } from "@/hooks/useUserRole";
import { useRef, useState, useEffect, useCallback } from "react";

const MUSIC_TRACKS = [
    'https://iiislambekkk.github.io/exams/false_hope_perhaps.mp3',
    'https://iiislambekkk.github.io/exams/Queen - Dont Stop Me Now.mp3',
    'https://iiislambekkk.github.io/exams/Queens Of The Stone Age - No One Knows.mp3',
    'https://iiislambekkk.github.io/exams/Depeche Mode - Wrong.mp3',
    'https://iiislambekkk.github.io/exams/Royal Blood - Figure_It_Out.mp3',
    'https://iiislambekkk.github.io/exams/Foo Fighters - Medicine At Midnight.mp3',
    'https://iiislambekkk.github.io/exams/Imagine Dragons - Im So Sorry.mp3',
    'https://iiislambekkk.github.io/exams/Kasabian - Call.mp3',
    'https://iiislambekkk.github.io/exams/RHCP - Cant Stop.mp3',
    'https://iiislambekkk.github.io/exams/Kasabian - Hippie Sunshine.mp3',
    'https://iiislambekkk.github.io/exams/Puscifer - Momma Sed.mp3',
    'https://iiislambekkk.github.io/exams/Kasabian - Ill Ray The King.mp3',
    'https://iiislambekkk.github.io/exams/Manapart -Suspiria.mp3',
    'https://iiislambekkk.github.io/exams/3 Libras.mp3',
    'https://iiislambekkk.github.io/exams/Muse - Hysteria.mp3',
    'https://iiislambekkk.github.io/exams/Blue.mp3',
    'https://iiislambekkk.github.io/exams/Audioslave - Like a Stone.mp3',
    'https://iiislambekkk.github.io/exams/Magdalena.mp3',
    'https://iiislambekkk.github.io/exams/Serj Tankian - The_Rains_of_Castamere.mp3',
    'https://iiislambekkk.github.io/exams/The Rolling Stones - Paint It Black.mp3',
    'https://iiislambekkk.github.io/exams/Tool - Invincible.mp3',
];

function getTrackName(url: string) {
    const fileName = url.split('/').pop() ?? '';
    return fileName.replace('.mp3', '').replace(/_/g, ' ');
}

// ── Плеер ──────────────────────────────────────────────────────────────────

function MusicPlayer({ onClose }: { onClose: () => void }) {
    const [trackIdx, setTrackIdx] = useState(0); // строго по порядку
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [collapsed, setCollapsed] = useState(false); // свёрнут/развёрнут
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const audio = new Audio();
        audio.volume = volume;
        audioRef.current = audio;

        audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
        audio.addEventListener('ended', () => setTrackIdx(i => (i + 1) % MUSIC_TRACKS.length));
        audio.addEventListener('timeupdate', () => {
            if (rafRef.current) return;
            rafRef.current = requestAnimationFrame(() => {
                setCurrentTime(audio.currentTime);
                rafRef.current = null;
            });
        });

        return () => {
            audio.pause();
            audioRef.current = null;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.src = MUSIC_TRACKS[trackIdx];
        audio.play().catch(() => {
        });
        setIsPlaying(true);
        setCurrentTime(0);
        setDuration(0);
    }, [trackIdx]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    const prevTrack = () => setTrackIdx(i => (i - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length);
    const nextTrack = () => setTrackIdx(i => (i + 1) % MUSIC_TRACKS.length);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const t = parseFloat(e.target.value);
        if (audioRef.current) audioRef.current.currentTime = t;
        setCurrentTime(t);
    };

    const fmt = (s: number) => {
        if (isNaN(s) || !isFinite(s)) return '0:00';
        return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    };

    const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
    const trackName = getTrackName(MUSIC_TRACKS[trackIdx]);

    // ── Свёрнутое состояние — маленькая кнопка справа ──
    if (collapsed) {
        return (
            <button
                onClick={() => setCollapsed(false)}
                className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full bg-primary shadow-lg flex items-center justify-center text-primary-foreground border border-primary/20 animate-in slide-in-from-right-4 duration-200 active:scale-95 transition-transform"
                title={trackName}
            >
                {isPlaying ? (
                    <div className="flex items-end gap-[2px] h-4">
                        {[3, 5, 4, 6, 3].map((h, i) => (
                            <div
                                key={i}
                                className="w-[3px] bg-primary-foreground rounded-full"
                                style={{
                                    height: `${h * 2}px`,
                                    animation: `eq-bar ${0.6 + i * 0.1}s ease-in-out infinite alternate`,
                                    animationDelay: `${i * 0.1}s`,
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <Play size={18}/>
                )}
            </button>
        );
    }

    return (
        <div className="fixed bottom-20 right-4 z-50 w-80 animate-in slide-in-from-right-4 duration-200">
            <div className="bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden">
                {/* Прогресс */}
                <div className="h-0.5 bg-muted">
                    <div
                        className="h-full bg-primary transition-none"
                        style={{width: `${pct}%`}}
                    />
                </div>

                <div className="p-3">
                    {/* Шапка */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 text-sm">
                            🎵
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-muted-foreground leading-none mb-0.5">
                                {trackIdx + 1} / {MUSIC_TRACKS.length}
                            </p>
                            <p className="text-xs font-medium text-foreground truncate">{trackName}</p>
                        </div>
                        <button
                            onClick={() => setCollapsed(true)}
                            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-lg"
                            title="Свернуть"
                        >
                            <ChevronRight size={15}/>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-lg text-lg leading-none"
                        >
                            ×
                        </button>
                    </div>

                    {/* Контролы */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <button
                            onClick={prevTrack}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        >
                            <SkipBack size={13}/>
                        </button>
                        <button
                            onClick={togglePlay}
                            className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all active:scale-95 hover:bg-primary/90"
                        >
                            {isPlaying ? <Pause size={13}/> : <Play size={13}/>}
                        </button>
                        <button
                            onClick={nextTrack}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        >
                            <SkipForward size={13}/>
                        </button>

                        <span className="text-[10px] text-muted-foreground font-mono">{fmt(currentTime)}</span>

                        <input
                            type="range" min={0} max={duration || 0} step={0.1}
                            value={currentTime} onChange={handleSeek}
                            className="flex-1 h-0.5 rounded-full appearance-none cursor-pointer accent-primary"
                            style={{
                                background: `linear-gradient(to right, hsl(var(--primary)) ${pct}%, hsl(var(--muted)) ${pct}%)`
                            }}
                        />

                        <span className="text-[10px] text-muted-foreground font-mono">{fmt(duration)}</span>
                    </div>

                    {/* Громкость */}
                    <div className="flex items-center gap-2">
                        <Volume2 size={11} className="text-muted-foreground shrink-0"/>
                        <input
                            type="range" min={0} max={1} step={0.01}
                            value={volume}
                            onChange={e => setVolume(parseFloat(e.target.value))}
                            className="flex-1 h-0.5 rounded-full appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, hsl(var(--primary)) ${volume * 100}%, hsl(var(--muted)) ${volume * 100}%)`
                            }}
                        />
                        <span className="text-[10px] text-muted-foreground font-mono">{Math.round(volume * 100)}%</span>
                    </div>
                </div>
            </div>

            <style>{`
            @keyframes eq-bar {
                from { transform: scaleY(0.4); }
                to   { transform: scaleY(1); }
            }
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 8px; height: 8px;
                border-radius: 50%;
                background: hsl(var(--primary));
                cursor: pointer;
            }
        `}</style>
        </div>
    );
}
// ── Видео модал ────────────────────────────────────────────────────────────

function VideoModal({ onClose }: { onClose: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div className="relative max-w-[90vw]" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute -top-10 right-0 text-white/60 hover:text-white text-2xl transition-colors"
                >
                    ✕
                </button>
                <video
                    ref={videoRef}
                    src="https://iiislambekkk.github.io/exams/aza.mp4"
                    className="max-w-full max-h-[65vh] rounded-2xl shadow-2xl"
                    controls autoPlay playsInline loop
                />
                <p className="text-center text-white/30 text-xs mt-3">Нажми на фон, чтобы закрыть</p>
            </div>
        </div>
    );
}

// ── Navbar ─────────────────────────────────────────────────────────────────

interface NavbarProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export function Navbar({ user }: NavbarProps) {
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const { isAdmin } = useUserRole();

    // Пасхалка
    const [showPlayer, setShowPlayer] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const clickCount = useRef(0);
    const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleAvatarClick = (e: React.MouseEvent) => {
        // Не открываем дропдаун если тройной клик
        clickCount.current += 1;
        if (clickTimer.current) clearTimeout(clickTimer.current);
        clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 600);

        if (clickCount.current >= 3) {
            clickCount.current = 0;
            e.preventDefault();
            e.stopPropagation();
            setShowVideo(true);
            setShowPlayer(true);
        }
    };

    const initials = user.name
            ?.split(" ").map(n => n[0]).join("").toUpperCase()
        ?? user.email?.[0]?.toUpperCase()
        ?? "U";

    return (
        <>
            <header className="border-b h-14 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="hidden md:block" />

                <span className="text-sm font-medium">{user.name}</span>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost" size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="rounded-full"
                        onClickCapture={handleAvatarClick}
                    >
                        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            {/* onClickCapture — срабатывает до открытия дропдауна */}
                            <Avatar
                                className="cursor-pointer h-8 w-8 hover:opacity-80 transition-opacity select-none"
                                onClickCapture={handleAvatarClick}
                            >
                                <AvatarImage src={user.image ?? ""} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push("/profile")}>
                                <UserIcon size={14} className="mr-2" /> Профиль
                            </DropdownMenuItem>
                            {isAdmin && (
                                <DropdownMenuItem onClick={() => router.push("/admin/exams")}>
                                    <Shield size={14} className="mr-2" /> Админ панель
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="text-red-600 focus:text-red-600"
                            >
                                <LogOut size={14} className="mr-2" /> Выйти
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {showPlayer && <MusicPlayer onClose={() => setShowPlayer(false)} />}
            {showVideo && <VideoModal onClose={() => setShowVideo(false)} />}

            <style>{`
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 10px; height: 10px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                }
            `}</style>
        </>
    );
}