import React, { useState, useRef, useCallback } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import {
    Download,
    Maximize2,
    Plus,
    Scan,
    Type,
    Copy,
    Moon,
    Sun,
    Star,
    Trash2,
    ExternalLink,
    Upload
} from 'lucide-react';
import jsQR from 'jsqr';
import { cn } from './lib/utils';
import { motion } from 'framer-motion';

// --- Components ---

const Tabs = ({ children, defaultValue }: { children: React.ReactNode, defaultValue: string }) => {
    const [activeTab, setActiveTab] = useState(defaultValue);
    return (
        <div className="w-full">
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
                }
                return child;
            })}
        </div>
    );
};

const TabsList = ({ children, activeTab, setActiveTab }: { children: React.ReactNode, activeTab?: string, setActiveTab?: (v: string) => void }) => (
    <div className="flex p-1.5 rounded-xl mb-8 max-w-lg mx-auto transition-all duration-300 bg-muted tabs-list-enhanced">
        {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
            }
            return child;
        })}
    </div>
);

const TabsTrigger = ({ value, label, icon: Icon, activeTab, setActiveTab }: { value: string, label: string, icon: any, activeTab?: string, setActiveTab?: (v: string) => void }) => {
    const isActive = activeTab === value;
    return (
        <button
            onClick={() => setActiveTab?.(value)}
            data-active={isActive}
            className={cn(
                "flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-lg transition-all duration-200 font-bold text-base",
                isActive
                    ? "bg-background text-foreground shadow-sm scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
        >
            <Icon size={20} />
            {label}
        </button>
    );
};

const TabsContent = ({ value, children, activeTab }: { value: string, children: React.ReactNode, activeTab?: string }) => {
    if (activeTab !== value) return null;
    return <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">{children}</div>;
};

// --- QR Generator ---

const QRGenerator = () => {
    const [url, setUrl] = useState('https://example.com');
    const [size, setSize] = useState(256);
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const qrRef = useRef<HTMLDivElement>(null);
    const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
    const [particles, setParticles] = useState<{ x: number, y: number, size: number, id: number, delay: number }[]>([]);
    const [isAssembling, setIsAssembling] = useState(false);
    const [isCanvasVisible, setIsCanvasVisible] = useState(true);
    const prevUrlRef = useRef(url);

    const displaySize = size > 400 ? 400 : size;

    const generateParticles = useCallback(() => {
        const canvas = hiddenCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw QR to hidden canvas first
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const newParticles: { x: number, y: number, size: number, id: number, delay: number }[] = [];

        // Higher density for pixel-perfect match
        const gridSize = 29; // QR code Version 3 = 29x29 modules
        const moduleSize = displaySize / gridSize;

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                // Sample at center of each module
                const sampleX = Math.floor(((col + 0.5) / gridSize) * canvas.width);
                const sampleY = Math.floor(((row + 0.5) / gridSize) * canvas.height);
                const index = (sampleY * canvas.width + sampleX) * 4;
                const r = data[index];

                if (r < 128) {
                    // Calculate distance from center for staggered animation
                    const centerOffset = Math.sqrt(
                        Math.pow(col - gridSize / 2, 2) +
                        Math.pow(row - gridSize / 2, 2)
                    );
                    const maxOffset = Math.sqrt(2) * gridSize / 2;
                    const normalizedDelay = 1 - (centerOffset / maxOffset); // Center arrives last

                    newParticles.push({
                        x: col * moduleSize,
                        y: row * moduleSize,
                        size: moduleSize,
                        id: row * gridSize + col,
                        delay: normalizedDelay * 0.3 // Max 0.3s delay spread
                    });
                }
            }
        }

        setParticles(newParticles);
        setIsAssembling(true);
        setIsCanvasVisible(false);

        // Animation duration (1s) + max delay (0.3s) + small buffer (0.1s) = 1.4s total
        setTimeout(() => {
            setIsCanvasVisible(true);
            setIsAssembling(false);
        }, 1400);
    }, [displaySize]);

    React.useEffect(() => {
        if (url !== prevUrlRef.current) {
            generateParticles();
            prevUrlRef.current = url;
        }
    }, [url, generateParticles]);

    const downloadQR = (format: 'png' | 'jpg' | 'svg') => {
        if (format === 'svg') {
            const svg = qrRef.current?.querySelector('svg');
            if (!svg) return;
            const svgData = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement('a');
            downloadLink.href = svgUrl;
            downloadLink.download = `qrcode.svg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } else {
            const canvas = qrRef.current?.querySelector('canvas');
            if (!canvas) return;

            const downloadCanvas = document.createElement('canvas');
            downloadCanvas.width = canvas.width;
            downloadCanvas.height = canvas.height;
            const ctx = downloadCanvas.getContext('2d');
            if (!ctx) return;

            if (format === 'jpg') {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
            }
            ctx.drawImage(canvas, 0, 0);

            const imageUrl = downloadCanvas.toDataURL(`image / ${format === 'jpg' ? 'jpeg' : 'png'} `, 1.0);
            const downloadLink = document.createElement('a');
            downloadLink.href = imageUrl;
            downloadLink.download = `qrcode.${format} `;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <label className="text-sm font-semibold mb-2 block">웹사이트 URL</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-background border rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                        <Type className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
                    </div>
                </div>

                <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <Maximize2 size={16} /> QR 코드 크기
                            </label>
                            <span className="text-sm text-muted-foreground">{size}px</span>
                        </div>
                        <input
                            type="range"
                            min="128"
                            max="1024"
                            step="32"
                            value={size}
                            onChange={(e) => setSize(Number(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold mb-2 block">코드 색상</label>
                            <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-lg">
                                <input
                                    type="color"
                                    value={fgColor}
                                    onChange={(e) => setFgColor(e.target.value)}
                                    className="w-8 h-8 rounded-md border-0 p-0 overflow-hidden cursor-pointer"
                                />
                                <span className="text-xs font-mono uppercase truncate">{fgColor}</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold mb-2 block">배경 색상</label>
                            <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-lg">
                                <input
                                    type="color"
                                    value={bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className="w-8 h-8 rounded-md border-0 p-0 overflow-hidden cursor-pointer"
                                />
                                <span className="text-xs font-mono uppercase truncate">{bgColor}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <label className="text-sm font-semibold mb-4 block">다운로드 형식</label>
                    <div className="grid grid-cols-3 gap-3">
                        {(['png', 'jpg', 'svg'] as const).map((format) => (
                            <button
                                key={format}
                                onClick={() => downloadQR(format)}
                                className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-all uppercase text-xs"
                            >
                                <Download size={14} /> {format}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center justify-center bg-card border rounded-xl p-6 md:p-12 shadow-sm min-h-[440px] overflow-hidden relative">
                    {/* Download Size Notice */}
                    {size > 400 && (
                        <p className="text-sm text-muted-foreground text-center mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            실제 다운로드 파일은 선택한 크기({size}px)로 저장됩니다.
                        </p>
                    )}

                    {/* Size Indicator */}
                    <div
                        className="flex items-center justify-center gap-2 mb-4 text-xs text-muted-foreground font-mono"
                        style={{ width: displaySize }}
                    >
                        <div className="flex-1 h-px bg-muted-foreground/30" />
                        <span className="px-2 whitespace-nowrap">{size}px</span>
                        <div className="flex-1 h-px bg-muted-foreground/30" />
                    </div>

                    {/* Persistent Container with 10px Border (Matches bgColor to be invisible) */}
                    <div
                        ref={qrRef}
                        className="rounded-xl shadow-lg relative z-10"
                        style={{
                            backgroundColor: bgColor,
                            borderWidth: '10px',
                            borderStyle: 'solid',
                            padding: '2px',
                            borderColor: bgColor,
                        }}
                    >
                        {/* Hidden high-res canvas for data extraction */}
                        <div className="hidden">
                            <QRCodeCanvas
                                ref={hiddenCanvasRef}
                                value={url || ' '}
                                size={displaySize}
                                fgColor="#000000"
                                bgColor="#ffffff"
                                level="H"
                                includeMargin={false}
                            />
                        </div>

                        <div className="relative" style={{ width: displaySize, height: displaySize }}>
                            {/* Real QR Code: Persistent Layer with instant reveal */}
                            <div
                                className="absolute inset-0 z-10"
                                style={{
                                    opacity: isCanvasVisible ? 1 : 0,
                                    visibility: isCanvasVisible ? 'visible' : 'hidden'
                                }}
                            >
                                <QRCodeCanvas
                                    value={url || ' '}
                                    size={displaySize}
                                    fgColor={fgColor}
                                    bgColor={bgColor}
                                    level="H"
                                    includeMargin={false}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </div>

                            {/* Particles: Overlayed during assembly */}
                            {isAssembling && (
                                <div className="absolute inset-0 pointer-events-none z-20">
                                    {particles.map((p) => (
                                        <motion.div
                                            key={p.id}
                                            className="absolute"
                                            style={{
                                                width: p.size,
                                                height: p.size,
                                                backgroundColor: fgColor,
                                                left: p.x,
                                                top: p.y,
                                            }}
                                            initial={{
                                                x: (Math.random() - 0.5) * window.innerWidth,
                                                y: (Math.random() - 0.5) * window.innerHeight,
                                                opacity: 0,
                                                scale: 0
                                            }}
                                            animate={{
                                                x: 0,
                                                y: 0,
                                                opacity: 1,
                                                scale: 1
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: p.delay,
                                                ease: [0.16, 1, 0.3, 1]
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="hidden">
                            <QRCodeSVG
                                value={url || ' '}
                                size={size}
                                fgColor={fgColor}
                                bgColor={bgColor}
                                level="H"
                                includeMargin={false}
                            />
                            {/* Download canvas */}
                            <QRCodeCanvas
                                value={url || ' '}
                                size={size}
                                fgColor={fgColor}
                                bgColor={bgColor}
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- QR Scanner ---

const QRScanner = () => {
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scanImage = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) return;

                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    setResult(code.data);
                    setError(null);
                } else {
                    setResult(null);
                    setError('QR 코드를 찾을 수 없습니다.');
                }
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            scanImage(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            scanImage(file);
        }
    };

    const isUrl = (text: string) => {
        try {
            new URL(text);
            return true;
        } catch (_) {
            return false;
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 flex flex-col items-center justify-center text-center",
                    isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/20 hover:border-primary/50",
                    !result && !error ? "min-h-[300px]" : ""
                )}
            >
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Upload className="text-muted-foreground" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">이미지 드래그 앤 드롭 또는 클릭</h3>
                <p className="text-sm text-muted-foreground mb-6">QR 코드 이미지 파일을 업로드해 주세요 (PNG, JPG, SVG 지원)</p>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all"
                >
                    파일 선택하기
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
            </div>

            {(result || error) && (
                <div className="bg-card border rounded-xl p-6 shadow-sm animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-sm">스캔 결과</h4>
                        <button
                            onClick={() => { setResult(null); setError(null); }}
                            className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    {error ? (
                        <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-3 text-sm">
                            <span className="w-2 h-2 rounded-full bg-destructive" />
                            {error}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-muted/50 rounded-lg break-all font-mono text-sm leading-relaxed">
                                {result}
                            </div>
                            <div className="flex gap-3">
                                {isUrl(result!) && (
                                    <a
                                        href={result!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all text-sm"
                                    >
                                        <ExternalLink size={14} /> 링크로 이동
                                    </a>
                                )}
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(result!);
                                        // Could add toast here
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all text-sm"
                                >
                                    <Copy size={14} /> 복사하기
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Splash Modal ---

const SplashModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background Image */}
                <div className="relative aspect-video">
                    <img
                        src="/splash.jpg"
                        alt="WOWQR Splash"
                        className="w-full h-full object-cover"
                        style={{ transform: 'scale(1.2)', objectPosition: 'center 30%' }}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-between p-8">
                        {/* Top: Title */}
                        <h2 className="text-2xl md:text-3xl text-white tracking-tight flex items-baseline gap-3 flex-wrap">
                            <span>
                                <span className="font-light">WOW</span><span className="font-black">QR</span>
                            </span>
                            <span className="text-white/70 text-base md:text-lg font-normal">
                                빠르고 아름다운 QR 코드 생성기
                            </span>
                        </h2>

                        {/* Bottom: Tech Stack & Footer */}
                        <div className="space-y-4">
                            {/* Tech Stack */}
                            <div className="flex items-center gap-3">
                                <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/React-Dark.svg" alt="React" className="w-8 h-8" />
                                <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Vite-Dark.svg" alt="Vite" className="w-8 h-8" />
                                <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TypeScript.svg" alt="TypeScript" className="w-8 h-8" />
                                <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TailwindCSS-Dark.svg" alt="Tailwind" className="w-8 h-8" />
                            </div>

                            {/* Footer Info */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/20">
                                <div className="text-white/60 text-sm">
                                    <span>© 2026 </span>
                                    <span className="text-white font-medium">Jinho Jung</span>
                                </div>
                                <div className="text-white/60 text-sm">
                                    Built with ❤️ and Framer Motion
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all"
                    >
                        ✕
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Main App ---

export default function QRApp() {
    const [theme, setTheme] = useState<'light' | 'dark' | 'blue'>('light');
    const [showSplash, setShowSplash] = useState(false);

    const cycleTheme = () => {
        const themes: ('light' | 'dark' | 'blue')[] = ['light', 'dark', 'blue'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];

        // Remove all theme classes
        document.documentElement.classList.remove('dark', 'blue');

        // Add new theme class if not light
        if (nextTheme !== 'light') {
            document.documentElement.classList.add(nextTheme);
        }

        setTheme(nextTheme);
    };

    const getThemeIcon = () => {
        switch (theme) {
            case 'dark':
                return <Moon size={20} className="text-indigo-400" />;
            case 'blue':
                return <Star size={20} className="text-cyan-400" />;
            default:
                return <Sun size={20} className="text-amber-500" />;
        }
    };

    return (
        <div className={cn(
            "min-h-screen transition-colors duration-300",
            theme === 'dark' ? "dark bg-background" :
                theme === 'blue' ? "blue bg-background" :
                    "bg-[#f8f9fa]"
        )}>
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/QR.png"
                            alt="WOWQR"
                            className="w-10 h-10 cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setShowSplash(true)}
                        />
                        <h1 className="text-xl tracking-tight">
                            <span className="font-light">WOW</span><span className="font-black">QR</span>
                        </h1>
                    </div>
                    <button
                        onClick={cycleTheme}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                        aria-label="Toggle theme"
                        title={`현재: ${theme === 'light' ? '라이트' : theme === 'dark' ? '다크' : '블루'} 테마`}
                    >
                        {getThemeIcon()}
                    </button>
                </div>
            </header>

            <main className="pt-24 pb-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                    </div>

                    <Tabs defaultValue="create">
                        <TabsList>
                            <TabsTrigger value="create" label="코드 생성" icon={Plus} />
                            <TabsTrigger value="scan" label="코드 스캔" icon={Scan} />
                        </TabsList>

                        <TabsContent value="create">
                            <QRGenerator />
                        </TabsContent>

                        <TabsContent value="scan">
                            <QRScanner />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <footer className="py-8 border-t bg-muted/30">
                <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>© 2026 WOWQR</span>
                        <span className="mx-2 text-muted-foreground/30">|</span>
                        <div className="flex items-center gap-3">
                            <a href="https://react.dev/" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                                <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/React-Dark.svg" alt="React" className="w-5 h-5" title="React" />
                            </a>
                            <a href="https://vitejs.dev/" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                                <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Vite-Dark.svg" alt="Vite" className="w-5 h-5" title="Vite" />
                            </a>
                            <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                                <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TypeScript.svg" alt="TypeScript" className="w-5 h-5" title="TypeScript" />
                            </a>
                            <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                                <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TailwindCSS-Dark.svg" alt="Tailwind CSS" className="w-5 h-5" title="Tailwind CSS" />
                            </a>
                        </div>
                        <span className="mx-2 text-muted-foreground/30">|</span>
                        <span>Built with Shadcn/UI & Lucide Icons</span>
                    </div>
                </div>
            </footer>

            {/* Splash Modal */}
            {showSplash && (
                <SplashModal onClose={() => setShowSplash(false)} />
            )}
        </div>
    );
}
