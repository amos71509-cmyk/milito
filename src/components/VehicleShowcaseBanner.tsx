import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Car,
  ArrowRight,
  ShieldCheck,
  FileCheck2
} from "lucide-react";
import { useVehicleShowcase } from "../context/VehicleShowcaseContext";

interface VehicleShowcaseBannerProps {
  onExploreVehicles: () => void;
  onOpenEstimator?: () => void;
  vehicleCount?: number;
  isGatewayMode?: boolean;
}

export default function VehicleShowcaseBanner({
  onExploreVehicles,
  onOpenEstimator,
  vehicleCount = 0,
  isGatewayMode = false
}: VehicleShowcaseBannerProps) {
  const { config } = useVehicleShowcase();

  // Filter only active items with valid URLs
  const activeItems = useMemo(() => {
    const valid = (config.items || []).filter((item) => item.active && (item.url || item.posterUrl));
    return valid.length > 0 ? valid : config.items;
  }, [config.items]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState<{ [key: string]: boolean }>({});
  
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const currentItem = activeItems[currentIndex] || activeItems[0];
  const isCurrentVideo = useMemo(() => {
    if (!currentItem) return false;
    return (
      currentItem.type === "video" ||
      /\.(mp4|webm|mov|mkv|m4v|avi)(\?.*)?$/i.test(currentItem.url || "") ||
      (currentItem.url || "").includes("/video/")
    );
  }, [currentItem]);

  // Video slides deserve longer display time (8s) so viewers can see full cinematic footage; images use configured interval (default 4s)
  const rotationMs = useMemo(() => {
    if (isCurrentVideo) {
      return 9000; // 9 seconds for rich video clips
    }
    return Math.max(3000, (config.rotationIntervalSeconds || 4) * 1000);
  }, [isCurrentVideo, config.rotationIntervalSeconds]);

  // Safe playback trigger
  const triggerPlay = useCallback((vid: HTMLVideoElement | null) => {
    if (!vid) return;
    try {
      vid.muted = isMuted;
      vid.defaultMuted = true;
      vid.playsInline = true;
      vid.setAttribute("muted", "");
      vid.setAttribute("playsinline", "");
      vid.setAttribute("webkit-playsinline", "");
      
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn("[VehicleShowcaseBanner] Autoplay deferred until user interaction:", err);
          });
      }
    } catch (e) {
      console.warn("[VehicleShowcaseBanner] Play error:", e);
    }
  }, [isMuted]);

  // Auto-rotation timer loop
  useEffect(() => {
    if (!config.autoRotate || activeItems.length <= 1 || isHovered || !isPlaying) {
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeItems.length);
    }, rotationMs);

    return () => clearInterval(intervalId);
  }, [config.autoRotate, activeItems.length, rotationMs, isHovered, isPlaying]);

  // Ensure current index is within bounds if items change
  useEffect(() => {
    if (currentIndex >= activeItems.length) {
      setCurrentIndex(0);
    }
  }, [activeItems.length, currentIndex]);

  // Handle playing active video and pausing inactive videos safely
  useEffect(() => {
    activeItems.forEach((item, idx) => {
      const vid = videoRefs.current[item.id];
      if (vid) {
        if (idx === currentIndex) {
          triggerPlay(vid);
        } else {
          vid.pause();
        }
      }
    });
  }, [currentIndex, activeItems, triggerPlay]);

  if ((!config.enabled && !isGatewayMode) || activeItems.length === 0) {
    return null;
  }

  const nextItem = activeItems[(currentIndex + 1) % activeItems.length];

  return (
    <section
      id="vehicle-showcase-section"
      className={`relative w-full overflow-hidden bg-[#070A10] text-white flex items-center ${
        isGatewayMode
          ? "min-h-screen h-full"
          : "border-y border-emerald-500/20 min-h-[540px] sm:min-h-[580px] lg:min-h-[620px]"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. FULL-WIDTH HORIZONTAL EDGE-TO-EDGE BACKGROUND MEDIA CONTAINER */}
      <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none z-0">
        {activeItems.map((item, index) => {
          const isCurrent = index === currentIndex;
          let isSlowNetwork = false;
          try {
            const conn = typeof navigator !== "undefined" ? (navigator as any).connection : null;
            if (conn && (conn.saveData || conn.effectiveType === "slow-2g" || conn.effectiveType === "2g" || conn.effectiveType === "3g")) {
              isSlowNetwork = true;
            }
          } catch {}

          const isVideo =
            !isSlowNetwork &&
            (item.type === "video" ||
              /\.(mp4|webm|mov|mkv|m4v|avi)(\?.*)?$/i.test(item.url || "") ||
              (item.url || "").includes("/video/"));

          const optimizeShowcaseImg = (raw: string) => {
            if (!raw) return "";
            if (raw.includes("images.unsplash.com")) {
              return raw.replace(/w=\d+/g, isSlowNetwork ? "w=540" : "w=960").replace(/q=\d+/g, isSlowNetwork ? "q=60" : "q=75");
            }
            return raw;
          };

          return (
            <div
              key={item.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                isCurrent ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105 pointer-events-none"
              }`}
            >
              {isVideo ? (
                <div className="w-full h-full relative overflow-hidden bg-black">
                  <video
                    ref={(el) => {
                      if (el) {
                        videoRefs.current[item.id] = el;
                        el.muted = isMuted;
                        el.defaultMuted = true;
                      }
                    }}
                    src={item.url}
                    poster={optimizeShowcaseImg(item.posterUrl || "")}
                    muted={isMuted}
                    autoPlay={isCurrent}
                    loop={true}
                    playsInline={true}
                    preload={isCurrent ? "metadata" : "none"}
                    onLoadedData={() => {
                      setVideoLoaded((prev) => ({ ...prev, [item.id]: true }));
                      const el = videoRefs.current[item.id];
                      if (el && isCurrent) {
                        triggerPlay(el);
                      }
                    }}
                    onCanPlay={() => {
                      const el = videoRefs.current[item.id];
                      if (el && isCurrent) {
                        triggerPlay(el);
                      }
                    }}
                    className="w-full h-full object-cover absolute inset-0 z-10"
                  />
                  {/* Poster fallback displayed only while video initializes */}
                  {item.posterUrl && !videoLoaded[item.id] && (
                    <img
                      src={optimizeShowcaseImg(item.posterUrl)}
                      alt={item.title || "Vehicle Preview"}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover absolute inset-0 z-0 opacity-80"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              ) : (
                <img
                  src={optimizeShowcaseImg(item.posterUrl || item.url)}
                  alt={item.title || "Vehicle Showcase"}
                  className="w-full h-full object-cover absolute inset-0"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          );
        })}

        {/* 2. RICH DARK GRADIENT OVERLAYS FOR CRISP READABILITY & CONTRAST */}
        {/* Balanced Dark Mask for Centered Readability */}
        <div className="absolute inset-0 bg-[#070A10]/65 z-20 pointer-events-none" />
        
        {/* Vertical Top/Bottom Edge Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A10] via-transparent to-[#070A10]/75 z-20 pointer-events-none" />
        
        {/* Ambient Emerald Accent Light & Texture */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none z-20" />
        <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none z-20" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-[0.025] z-20 pointer-events-none" />
      </div>

      {/* 3. INNER CONTENT CONTAINER (Centered for optimal typographic hierarchy) */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 flex flex-col items-center justify-center text-center h-full">
        
        {/* CENTERED CONTENT: HEADLINE, SUBHEADLINE, BODY DESCRIPTION & CTA */}
        <div className="max-w-4xl mx-auto space-y-6 text-center flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] uppercase drop-shadow-lg">
            {config.headline || "LOOKING FOR A VEHICLE?"}
          </h2>

          <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#10B981] tracking-tight leading-snug drop-shadow-md">
            {config.subheadline || "Source your next ride through MILITO."}
          </p>

          <p className="text-sm sm:text-base lg:text-lg text-gray-200 font-semibold leading-relaxed max-w-2xl mx-auto drop-shadow-sm">
            {config.description ||
              "Browse verified Foreign Used (Tokunbo) and Nigerian Used vehicles with authentic Customs Service clearance, 35-point mechanical inspection, and door-to-door delivery across Nigeria."}
          </p>

          {/* Single Centered Call to Action: Explore Cars */}
          <div className="pt-2 flex items-center justify-center w-full">
            <button
              onClick={onExploreVehicles}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl bg-[#10B981] hover:bg-[#0ea372] text-black font-black text-sm uppercase tracking-wider shadow-[0_4px_25px_rgba(16,185,129,0.35)] hover:brightness-110 active:scale-98 transition-all duration-200 cursor-pointer group"
            >
              <span>{isGatewayMode ? "EXPLORE CARS" : (config.ctaText || "EXPLORE CARS")}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* HIGHLIGHTS / FEATURE PILLS (Centered) */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2 bg-[#0C121E]/90 text-white px-3.5 py-2 rounded-xl border border-white/20 shadow-md backdrop-blur-md text-xs sm:text-sm font-semibold">
              <Car className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>Direct Tokunbo Stock {vehicleCount > 0 ? `(${vehicleCount} live)` : "(1 live)"}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#0C121E]/90 text-white px-3.5 py-2 rounded-xl border border-white/20 shadow-md backdrop-blur-md text-xs sm:text-sm font-semibold">
              <FileCheck2 className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>100% Genuine Customs Papers</span>
            </div>
            <div className="flex items-center gap-2 bg-[#0C121E]/90 text-white px-3.5 py-2 rounded-xl border border-white/20 shadow-md backdrop-blur-md text-xs sm:text-sm font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>Engine & Gearbox Inspection</span>
            </div>
          </div>

          {/* Progress Dots (Centered) */}
          {activeItems.length > 1 && (
            <div className="pt-4 flex items-center justify-center">
              <div className="flex items-center gap-1.5 bg-black/60 px-3 py-2 rounded-xl border border-white/15">
                {activeItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentIndex
                        ? "w-6 bg-[#10B981] shadow-sm shadow-[#10B981]"
                        : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                    title={`Slide #${idx + 1}`}
                    aria-label={`Slide #${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
