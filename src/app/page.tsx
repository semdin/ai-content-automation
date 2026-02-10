"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import {
    Sparkles, Zap, Image, Palette, Target, BarChart3,
    ArrowRight, Check, Star, Globe, Layers, Clock,
    ChevronRight, Shield, Upload, Wand2, MonitorPlay,
    MousePointerClick, Smartphone, Camera, Video
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ========================================
   NAVBAR
   ======================================== */

function Navbar() {
    const { data: session } = useSession();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled
                    ? "border-b bg-background/80 backdrop-blur-lg shadow-sm"
                    : "bg-transparent"
            )}
        >
            <div className="mx-auto max-w-6xl flex h-16 items-center justify-between px-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-xl">ContentAI</span>
                </Link>

                <div className="hidden sm:flex items-center gap-8 text-sm text-muted-foreground">
                    <a href="#how-it-works" className="hover:text-foreground transition-colors">Nasıl Çalışır</a>
                    <a href="#features" className="hover:text-foreground transition-colors">Özellikler</a>
                    <a href="#showcase" className="hover:text-foreground transition-colors">Demo</a>
                    <a href="#pricing" className="hover:text-foreground transition-colors">Fiyatlandırma</a>
                </div>

                <div className="flex items-center gap-3">
                    {session ? (
                        <Button asChild size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/login">Giriş Yap</Link>
                            </Button>
                            <Button asChild size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                                <Link href="/register">Ücretsiz Başla</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </motion.nav>
    );
}

/* ========================================
   HERO SECTION
   ======================================== */

function HeroSection() {
    const { data: session } = useSession();

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-violet-950/20 dark:to-violet-950/30" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMjgsMTI4LDEyOCwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
            
            {/* Floating Orbs */}
            <motion.div 
                animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-violet-500/20 blur-[100px]"
            />
            <motion.div 
                animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 8, repeat: Infinity, delay: 1 }}
                className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px]"
            />
            <motion.div 
                animate={{ x: [0, 15, 0], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 7, repeat: Infinity, delay: 2 }}
                className="absolute top-1/3 right-1/3 h-64 w-64 rounded-full bg-pink-500/15 blur-[80px]"
            />

            <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Badge className="mb-6 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 px-4 py-1.5 text-sm font-medium">
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        AI-Powered Content Automation
                    </Badge>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
                >
                    <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                        İçerik Üretimini
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Otomatikleştirin
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                >
                    Yapay zeka ile markanız için profesyonel fotoğraf ve video içerikler oluşturun.
                    Marka varlıklarınızı yükleyin, konseptinizi tanımlayın — gerisini AI halleder.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    {session ? (
                        <Button asChild size="lg" className="h-13 px-8 text-base gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-xl shadow-violet-500/25">
                            <Link href="/dashboard">
                                Dashboard&apos;a Git
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild size="lg" className="h-13 px-8 text-base gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-xl shadow-violet-500/25">
                                <Link href="/register">
                                    Ücretsiz Başla
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-13 px-8 text-base gap-2">
                                <Link href="#how-it-works">
                                    Nasıl Çalışır?
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </>
                    )}
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground"
                >
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span>Güvenli Altyapı</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>Hızlı Üretim</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-500" />
                        <span>Bulut Tabanlı</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

/* ========================================
   HOW IT WORKS — INTERACTIVE
   ======================================== */

const workflowSteps = [
    {
        step: "01",
        title: "Varlıkları Yükleyin",
        description: "Marka logonuzu, ürün fotoğraflarınızı ve referans görsellerinizi platforma yükleyin.",
        icon: Upload,
        color: "from-emerald-500 to-teal-600",
        bgColor: "bg-emerald-500/10",
        details: [
            { icon: Image, text: "Ürün fotoğrafları" },
            { icon: Camera, text: "Marka logosu" },
            { icon: Layers, text: "Referans görseller" },
        ],
    },
    {
        step: "02",
        title: "Konsepti Tanımlayın",
        description: "Yapay zekaya ne tür bir içerik istediğinizi doğal dilde anlatın. Manken, arka plan, stil belirleyin.",
        icon: Wand2,
        color: "from-violet-500 to-purple-600",
        bgColor: "bg-violet-500/10",
        details: [
            { icon: Palette, text: "Stil & konsept" },
            { icon: Target, text: "Hedef kitle" },
            { icon: Globe, text: "Platform seçimi" },
        ],
    },
    {
        step: "03",
        title: "AI Üretsin",
        description: "Gelişmiş AI motor konseptinize uygun profesyonel fotoğraf ve video içerikler üretir.",
        icon: Sparkles,
        color: "from-amber-500 to-orange-600",
        bgColor: "bg-amber-500/10",
        details: [
            { icon: Image, text: "Yüksek çözünürlük" },
            { icon: Video, text: "Video desteği" },
            { icon: Smartphone, text: "Çoklu format" },
        ],
    },
];

function HowItWorksSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 3);
        }, 3500);
        return () => clearInterval(interval);
    }, [isInView]);

    return (
        <section id="how-it-works" ref={ref} className="py-32 px-6">
            <div className="mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <Badge variant="outline" className="mb-4 px-3 py-1">
                        <Layers className="w-3 h-3 mr-1.5" />
                        Nasıl Çalışır?
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Üç Adımda İçerik Üretin
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                        Karmaşık tasarım süreçlerini basitleştirin. Dakikalar içinde profesyonel içerikler oluşturun.
                    </p>
                </motion.div>

                <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] items-center">
                    {/* Step Navigation */}
                    <div className="space-y-4">
                        {workflowSteps.map((item, idx) => {
                            const StepIcon = item.icon;
                            const isActive = activeStep === idx;
                            return (
                                <motion.button
                                    key={item.step}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                                    onClick={() => setActiveStep(idx)}
                                    className={cn(
                                        "w-full text-left p-5 rounded-2xl border transition-all duration-300",
                                        isActive
                                            ? "bg-card shadow-lg shadow-black/5 border-primary/20 scale-[1.02]"
                                            : "hover:bg-muted/50 border-transparent"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white transition-transform",
                                            item.color,
                                            isActive && "scale-110"
                                        )}>
                                            <StepIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-muted-foreground">ADIM {item.step}</span>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeStep"
                                                        className="h-1.5 w-1.5 rounded-full bg-primary"
                                                    />
                                                )}
                                            </div>
                                            <h3 className="font-bold text-lg">{item.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Animated Visual Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Card className="border-0 shadow-2xl shadow-black/10 overflow-hidden">
                            <div className="bg-gradient-to-br from-muted/50 to-muted p-1.5 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                    <span className="ml-2 text-xs text-muted-foreground">ContentAI — Workflow</span>
                                </div>
                            </div>
                            <CardContent className="p-8 min-h-[320px] flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeStep}
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                        transition={{ duration: 0.4 }}
                                        className="text-center w-full"
                                    >
                                        <div className={cn(
                                            "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl",
                                            workflowSteps[activeStep].bgColor
                                        )}>
                                            {(() => {
                                                const ActiveIcon = workflowSteps[activeStep].icon;
                                                return <ActiveIcon className="h-10 w-10 text-primary" />;
                                            })()}
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{workflowSteps[activeStep].title}</h3>
                                        <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                                            {workflowSteps[activeStep].description}
                                        </p>
                                        <div className="flex items-center justify-center gap-4">
                                            {workflowSteps[activeStep].details.map((detail, i) => {
                                                const DetailIcon = detail.icon;
                                                return (
                                                    <motion.div
                                                        key={detail.text}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.2 + i * 0.1 }}
                                                        className="flex flex-col items-center gap-1.5"
                                                    >
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                                                            <DetailIcon className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">{detail.text}</span>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>

                                        {/* Progress bar */}
                                        <div className="mt-8 flex items-center gap-2 justify-center">
                                            {[0, 1, 2].map((i) => (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "h-1.5 rounded-full transition-all duration-300",
                                                        i === activeStep
                                                            ? "w-8 bg-primary"
                                                            : "w-2 bg-muted-foreground/20"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

/* ========================================
   FEATURES SECTION — With Animated Icons
   ======================================== */

const features = [
    { icon: Sparkles, title: "AI İçerik Üretimi", description: "Fal.ai altyapısı ile yüksek kaliteli fotoğraf ve video içerikler" },
    { icon: Target, title: "Marka Tutarlılığı", description: "Marka varlıklarınızla uyumlu, tutarlı içerikler oluşturun" },
    { icon: Layers, title: "Çoklu Format", description: "1:1, 9:16, 16:9 formatlarında Instagram, TikTok ve YouTube için" },
    { icon: Clock, title: "Dakikalar İçinde", description: "Saatler süren tasarım süreçleri yerine dakikalar içinde içerik" },
    { icon: BarChart3, title: "Kampanya Yönetimi", description: "İçeriklerinizi kampanyalara gruplayın ve performanslarını takip edin" },
    { icon: Shield, title: "Güvenli Depolama", description: "Tüm varlıklarınız güvenli bulut altyapısında saklanır" },
];

function FeaturesSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section id="features" ref={ref} className="py-32 px-6 bg-muted/30">
            <div className="mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <Badge variant="outline" className="mb-4 px-3 py-1">
                        <Zap className="w-3 h-3 mr-1.5" />
                        Özellikler
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        İhtiyacınız Olan Her Şey
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                        Tüm içerik üretim sürecinizi tek bir platformda yönetin.
                    </p>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, idx) => {
                        const FeatureIcon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.4, delay: idx * 0.1 }}
                            >
                                <Card className="border-0 shadow-md shadow-black/5 hover:shadow-lg transition-all h-full group hover:-translate-y-1 duration-300 overflow-hidden">
                                    <CardContent className="p-6 flex items-start gap-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                            <FeatureIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">{feature.title}</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/* ========================================
   SHOWCASE / DEMO SECTION
   ======================================== */

const showcaseItems = [
    { label: "Ürün Fotoğrafı", format: "1:1", platform: "Instagram", color: "from-pink-500 to-rose-600" },
    { label: "Reels / TikTok", format: "9:16", platform: "Instagram & TikTok", color: "from-violet-500 to-purple-600" },
    { label: "YouTube Thumbnail", format: "16:9", platform: "YouTube", color: "from-red-500 to-orange-600" },
];

function ShowcaseSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [activeShowcase, setActiveShowcase] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        const interval = setInterval(() => {
            setActiveShowcase((prev) => (prev + 1) % showcaseItems.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [isInView]);

    const aspectRatios: Record<string, string> = {
        "1:1": "aspect-square w-64",
        "9:16": "aspect-[9/16] w-44",
        "16:9": "aspect-video w-80",
    };

    return (
        <section id="showcase" ref={ref} className="py-32 px-6">
            <div className="mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <Badge variant="outline" className="mb-4 px-3 py-1">
                        <MonitorPlay className="w-3 h-3 mr-1.5" />
                        Demo
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Her Format İçin İçerik
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                        Instagram, TikTok, YouTube ve daha fazlası. Tek tıkla tüm platformlar için içerik.
                    </p>
                </motion.div>

                {/* Format Selector */}
                <div className="flex items-center justify-center gap-3 mb-12">
                    {showcaseItems.map((item, idx) => (
                        <button
                            key={item.label}
                            onClick={() => setActiveShowcase(idx)}
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                                activeShowcase === idx
                                    ? "bg-primary text-primary-foreground shadow-lg"
                                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Animated Preview */}
                <div className="flex justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeShowcase}
                            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                            transition={{ duration: 0.5, type: "spring" }}
                        >
                            <div className={cn(
                                "relative rounded-2xl overflow-hidden bg-gradient-to-br shadow-2xl shadow-black/20",
                                showcaseItems[activeShowcase].color,
                                aspectRatios[showcaseItems[activeShowcase].format]
                            )}>
                                {/* Mock Content Overlay */}
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring" }}
                                        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-4"
                                    >
                                        <Camera className="h-8 w-8" />
                                    </motion.div>
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-lg font-bold text-center"
                                    >
                                        {showcaseItems[activeShowcase].label}
                                    </motion.p>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="mt-2 flex items-center gap-2"
                                    >
                                        <Badge className="bg-white/20 text-white border-0">
                                            {showcaseItems[activeShowcase].format}
                                        </Badge>
                                        <Badge className="bg-white/20 text-white border-0">
                                            {showcaseItems[activeShowcase].platform}
                                        </Badge>
                                    </motion.div>
                                </div>
                                
                                {/* Animated Sparkles */}
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-1 h-1 bg-white rounded-full"
                                        initial={{ opacity: 0 }}
                                        animate={{
                                            opacity: [0, 1, 0],
                                            y: [0, -30],
                                            x: [0, (i % 2 === 0 ? 1 : -1) * 15],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: i * 0.4,
                                        }}
                                        style={{
                                            left: `${20 + i * 15}%`,
                                            bottom: `${20 + i * 8}%`,
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Platform Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.4 }}
                    className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto"
                >
                    {[
                        { label: "Desteklenen Format", value: "3+" },
                        { label: "AI Modeli", value: "Fal.ai" },
                        { label: "Üretim Süresi", value: "<30sn" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <p className="text-2xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                {stat.value}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

/* ========================================
   PRICING SECTION
   ======================================== */

const plans = [
    {
        name: "Başlangıç",
        price: "Ücretsiz",
        description: "Platformu keşfetmek için ideal",
        features: ["Ayda 10 içerik", "1 marka", "Fotoğraf üretimi", "Temel formatlar"],
        cta: "Ücretsiz Başla",
        popular: false,
    },
    {
        name: "Profesyonel",
        price: "₺499",
        period: "/ay",
        description: "Büyüyen markalar için",
        features: ["Ayda 100 içerik", "5 marka", "Fotoğraf + Video", "Tüm formatlar", "Kampanya yönetimi", "Öncelikli destek"],
        cta: "Pro'ya Geç",
        popular: true,
    },
    {
        name: "Kurumsal",
        price: "İletişime Geçin",
        description: "Büyük ekipler için özel çözümler",
        features: ["Sınırsız içerik", "Sınırsız marka", "Özel AI modelleri", "API erişimi", "Özel entegrasyonlar", "Dedicated destek"],
        cta: "İletişime Geç",
        popular: false,
    },
];

function PricingSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section id="pricing" ref={ref} className="py-32 px-6 bg-muted/30">
            <div className="mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <Badge variant="outline" className="mb-4 px-3 py-1">
                        <Star className="w-3 h-3 mr-1.5" />
                        Fiyatlandırma
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Basit ve Şeffaf Fiyatlandırma
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                        İhtiyacınıza göre bir plan seçin. İstediğiniz zaman yükseltin.
                    </p>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-3">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: idx * 0.15 }}
                        >
                            <Card className={cn(
                                "relative overflow-hidden border-0 shadow-lg h-full flex flex-col",
                                plan.popular ? "shadow-violet-500/20 ring-2 ring-violet-500/50" : "shadow-black/5"
                            )}>
                                {plan.popular && (
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />
                                )}
                                <CardContent className="p-8 flex-1 flex flex-col">
                                    {plan.popular && (
                                        <Badge className="self-start mb-4 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20">
                                            En Popüler
                                        </Badge>
                                    )}
                                    <h3 className="text-xl font-bold">{plan.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                                    <div className="mt-6 mb-8">
                                        <span className="text-4xl font-black">{plan.price}</span>
                                        {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                                    </div>
                                    <ul className="space-y-3 flex-1">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center gap-3 text-sm">
                                                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        className={cn(
                                            "w-full mt-8",
                                            plan.popular
                                                ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
                                                : ""
                                        )}
                                        variant={plan.popular ? "default" : "outline"}
                                    >
                                        {plan.cta}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ========================================
   CTA SECTION
   ======================================== */

function CTASection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const { data: session } = useSession();

    return (
        <section ref={ref} className="py-32 px-6">
            <div className="mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-12 sm:p-16 text-center text-white"
                >
                    <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                    
                    <div className="relative z-10">
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"
                        >
                            <Sparkles className="h-8 w-8" />
                        </motion.div>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                            İçerik Üretimine Hemen Başlayın
                        </h2>
                        <p className="text-lg text-white/70 max-w-lg mx-auto mb-8">
                            Ücretsiz hesap oluşturun ve AI destekli içerik üretiminin gücünü keşfedin.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {session ? (
                                <Button asChild size="lg" className="bg-white text-violet-700 hover:bg-white/90 shadow-xl h-13 px-8 text-base font-semibold">
                                    <Link href="/dashboard">
                                        Dashboard&apos;a Git
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild size="lg" className="bg-white text-violet-700 hover:bg-white/90 shadow-xl h-13 px-8 text-base font-semibold">
                                        <Link href="/register">
                                            Ücretsiz Hesap Oluştur
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="ghost" size="lg" className="text-white hover:bg-white/10 h-13 px-8 text-base">
                                        <Link href="/login">
                                            Giriş Yap
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

/* ========================================
   FOOTER
   ======================================== */

function Footer() {
    return (
        <footer className="border-t py-12 px-6">
            <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-lg">ContentAI</span>
                </Link>
                <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} ContentAI. Tüm hakları saklıdır.
                </p>
            </div>
        </footer>
    );
}

/* ========================================
   MAIN PAGE
   ======================================== */

export default function LandingPage() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <HeroSection />
            <HowItWorksSection />
            <FeaturesSection />
            <ShowcaseSection />
            <PricingSection />
            <CTASection />
            <Footer />
        </div>
    );
}
