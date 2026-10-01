import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ArrowRight,
  Sparkles,
  Smartphone,
  MapPin,
  RotateCw,
  ShoppingBag
} from "lucide-react";
import { CustomerTestimonial } from "../../types";
import { TestimonialService } from "../../services/TestimonialService";

interface PublicTestimonialsSectionProps {
  onExploreDevices?: () => void;
  onStartSwap?: () => void;
}

export default function PublicTestimonialsSection({
  onExploreDevices,
  onStartSwap
}: PublicTestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<CustomerTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTestimonial, setExpandedTestimonial] = useState<CustomerTestimonial | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPublished = async () => {
      setIsLoading(true);
      try {
        const data = await TestimonialService.fetchPublishedTestimonials();
        setTestimonials(data);
      } catch (err) {
        console.error("[PublicTestimonialsSection] Error loading testimonials:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublished();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 380;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="py-24 bg-[#080C14] border-t border-b border-gray-800/80 text-white relative overflow-hidden" id="reviews">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-milito-green/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-milito-green bg-milito-green/10 border border-milito-green/25 px-3.5 py-1.5 rounded-full mb-4 shadow-sm">
              <Shield className="w-3.5 h-3.5" />
              <span>REAL MILITO EXPERIENCES</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Real People. Real Devices. <span className="text-milito-green">Real Transactions.</span>
            </h2>
            <p className="text-gray-400 mt-4 text-sm sm:text-base leading-relaxed">
              See what customers have experienced when buying, selling and swapping devices through MILITO.
            </p>
          </div>

          {/* Carousel Arrows (Desktop) */}
          {testimonials.length > 3 && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                className="p-3 rounded-full bg-gray-900 border border-gray-800 hover:border-milito-green text-gray-300 hover:text-white transition-all shadow-md active:scale-95"
                title="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-3 rounded-full bg-gray-900 border border-gray-800 hover:border-milito-green text-gray-300 hover:text-white transition-all shadow-md active:scale-95"
                title="Scroll Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel / Cards List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 h-80 animate-pulse" />
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-16 px-6 bg-gray-900/40 border border-gray-800/80 rounded-3xl max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-milito-green/10 text-milito-green flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Authentic Customer Proofs</h3>
            <p className="text-xs text-gray-400">
              Customer stories and verified delivery proofs are being prepared. Check back shortly!
            </p>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory focus:outline-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="min-w-[300px] sm:min-w-[360px] max-w-[380px] flex-shrink-0 snap-start bg-[#0D131F] hover:bg-[#101827] border border-gray-800 hover:border-milito-green/40 p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between shadow-xl group hover:shadow-2xl hover:shadow-milito-green/5"
              >
                <div className="space-y-4">
                  {/* Sanitized Screenshot with Click-to-Expand */}
                  {item.publicImageUrl && (
                    <div
                      onClick={() => setExpandedTestimonial(item)}
                      className="relative rounded-2xl overflow-hidden border border-gray-800 bg-black/60 shadow-inner group/img cursor-pointer max-h-52 flex items-center justify-center"
                    >
                      <img
                        src={item.publicImageUrl}
                        alt={`Proof for ${item.customerName}`}
                        className="w-full h-48 object-cover object-top group-hover/img:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      {/* Customer Proof Badge */}
                      <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md text-milito-green text-[10px] font-black px-2.5 py-1 rounded-full border border-milito-green/30 flex items-center gap-1 shadow">
                        <CheckCircle2 className="w-3 h-3 text-milito-green" />
                        <span>Customer Proof</span>
                      </div>

                      {/* Expand Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-milito-green text-gray-950 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>View Proof</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Swap Story Format: "FROM THIS → TO THIS" */}
                  {item.transactionType === "Swap" && item.fromDevice && item.toDevice ? (
                    <div className="p-3.5 rounded-2xl bg-[#080D17] border border-milito-green/30 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-500 block">From</span>
                        <strong className="text-gray-300 font-bold">{item.fromDevice}</strong>
                      </div>
                      <div className="flex flex-col items-center px-2">
                        <span className="text-[8px] text-milito-green font-black uppercase tracking-wider">MILITO SWAP</span>
                        <ArrowRight className="w-4 h-4 text-milito-green mt-0.5" />
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-milito-green block">To</span>
                        <strong className="text-white font-black">{item.toDevice}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                      <Smartphone className="w-3.5 h-3.5 text-milito-green flex-shrink-0" />
                      <span>{item.device} {item.storage ? `· ${item.storage}` : ""}</span>
                    </div>
                  )}

                  {/* Testimonial Quote */}
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed italic line-clamp-4">
                    "{item.testimonialText}"
                  </p>
                </div>

                {/* Footer: Customer Details & Completion Badge */}
                <div className="mt-6 pt-4 border-t border-gray-800/80 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{item.customerName}</span>
                      {item.isVerifiedTransaction && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-milito-green" title="Verified Customer" />
                      )}
                    </h4>
                    <span className="text-[10px] sm:text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      {item.location}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-milito-green bg-milito-green/10 border border-milito-green/25 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {item.transactionStatus}
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Final Public Section CTA */}
        <div className="mt-16 bg-gradient-to-r from-[#0F172A] via-[#111C30] to-[#0F172A] border border-gray-800 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Your MILITO Story Could Be Next.
            </h3>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Ready to find your next device or swap the one you have? Experience guaranteed quality, fast nationwide delivery, and transparent transactions.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              {onExploreDevices && (
                <button
                  onClick={onExploreDevices}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-milito-green hover:bg-emerald-400 text-gray-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-milito-green/20"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explore Devices</span>
                </button>
              )}

              {onStartSwap && (
                <button
                  onClick={onStartSwap}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs uppercase tracking-wider border border-gray-700 transition-all"
                >
                  <RotateCw className="w-4 h-4 text-milito-green" />
                  <span>Start a Swap</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Expanded Modal for Customer Proof */}
      {expandedTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg bg-[#0F172A] border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-milito-green" />
                <span className="text-xs font-bold text-white">Verified Customer Proof</span>
              </div>
              <button
                onClick={() => setExpandedTestimonial(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-res Sanitized Image */}
            {expandedTestimonial.publicImageUrl && (
              <div className="rounded-2xl overflow-hidden border border-gray-800 bg-black/60">
                <img
                  src={expandedTestimonial.publicImageUrl}
                  alt={expandedTestimonial.customerName}
                  className="w-full h-auto max-h-[50vh] object-contain"
                />
              </div>
            )}

            {/* Swap Details */}
            {expandedTestimonial.transactionType === "Swap" && expandedTestimonial.fromDevice && expandedTestimonial.toDevice ? (
              <div className="p-3.5 rounded-2xl bg-[#080D17] border border-milito-green/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-500 block">From</span>
                  <strong className="text-gray-300 font-bold">{expandedTestimonial.fromDevice}</strong>
                </div>
                <div className="flex flex-col items-center px-2">
                  <span className="text-[8px] text-milito-green font-black uppercase tracking-wider">MILITO SWAP</span>
                  <ArrowRight className="w-4 h-4 text-milito-green mt-0.5" />
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-milito-green block">To</span>
                  <strong className="text-white font-black">{expandedTestimonial.toDevice}</strong>
                </div>
              </div>
            ) : (
              <div className="text-xs font-bold text-white">
                {expandedTestimonial.device} {expandedTestimonial.storage ? `· ${expandedTestimonial.storage}` : ""}
              </div>
            )}

            {/* Full Quote */}
            <p className="text-gray-300 text-sm leading-relaxed italic">
              "{expandedTestimonial.testimonialText}"
            </p>

            {/* Customer Details */}
            <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{expandedTestimonial.customerName}</span>
                  {expandedTestimonial.isVerifiedTransaction && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-milito-green" />
                  )}
                </h4>
                <span className="text-xs text-gray-400">{expandedTestimonial.location}</span>
              </div>

              <span className="inline-flex items-center gap-1 text-xs font-black text-milito-green bg-milito-green/10 border border-milito-green/25 px-3 py-1 rounded-full uppercase tracking-wider">
                {expandedTestimonial.transactionStatus}
              </span>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
