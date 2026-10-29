import React from "react";
import { ArrowRight, ShoppingBag, Sparkles, Smartphone, Tablet, Watch } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useDiscoveryCards, DiscoveryCardId } from "../context/DiscoveryCardsContext";

interface HomepageProductTeaserProps {
  onExploreStore: () => void;
  onSelectCategory: (categoryId: DiscoveryCardId) => void;
}

const CATEGORIES_LIST: { id: DiscoveryCardId; defaultTitle: string; icon: typeof Smartphone }[] = [
  { id: "iphone", defaultTitle: "Find my iPhone", icon: Smartphone },
  { id: "android", defaultTitle: "Look for my Android", icon: Smartphone },
  { id: "ipad", defaultTitle: "Discover my next iPad", icon: Tablet },
  { id: "wrist", defaultTitle: "Search for my Wrist", icon: Watch },
];

export default function HomepageProductTeaser({
  onExploreStore,
  onSelectCategory,
}: HomepageProductTeaserProps) {
  const shouldReduceMotion = useReducedMotion();
  const { config } = useDiscoveryCards();

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-gray-150 relative" id="product-teaser">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-5">
          <div>

            <motion.h2
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight"
            >
              Find Your Next Device
            </motion.h2>

            <motion.p
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-gray-600 mt-2 text-xs sm:text-sm md:text-base max-w-xl leading-relaxed"
            >
              Phones, gadgets and upgrades — all in one place.
            </motion.p>
          </div>

          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 text-[#00B14F] flex-shrink-0" />
            <span>Select a category to explore catalogue</span>
          </motion.div>
        </div>

        {/* The 4 Category Discovery Cards in exact same grid dimensions and card structure */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 items-start">
          {CATEGORIES_LIST.map((item) => {
            const cardData = config.cards[item.id];
            const title = cardData?.title || item.defaultTitle;
            const imageUrl = cardData?.imageUrl || "";
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                className="group relative bg-white rounded-3xl overflow-hidden border border-gray-250 hover:border-[#00B14F]/50 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col will-change-transform cursor-pointer"
              >
                {/* 1:1 Aspect Ratio Image Container */}
                <div className="w-full aspect-square relative bg-gray-100 overflow-hidden group-hover:bg-gray-200 transition-colors flex items-center justify-center">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-4 text-center select-none">
                      <div className="w-12 h-12 rounded-2xl bg-gray-200/80 flex items-center justify-center mb-2 text-gray-400 group-hover:text-[#00B14F] group-hover:bg-[#00B14F]/10 transition-colors">
                        <Icon className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <span className="text-[11px] font-bold text-gray-600 leading-tight">Image not uploaded yet</span>
                      <span className="text-[9px] font-medium text-gray-400 mt-0.5">Admin can add in dashboard</span>
                    </div>
                  )}

                  {/* Subtle click cue on hover */}
                  <div className="absolute inset-x-0 bottom-0 bg-[#1A2025]/90 backdrop-blur-xs py-1.5 text-center text-[10px] font-bold text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    Click to Browse
                  </div>
                </div>

                {/* Category Phrase Only */}
                <div className="p-3 sm:p-4 text-center bg-white flex items-center justify-center min-h-[56px] border-t border-gray-100">
                  <h3 className="font-extrabold text-xs sm:text-sm md:text-base text-gray-900 group-hover:text-[#00B14F] transition-colors leading-snug">
                    {title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button to Full Store */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mt-10 sm:mt-12 text-center"
        >
          <button
            type="button"
            id="homepage-explore-full-store-btn"
            onClick={onExploreStore}
            className="group inline-flex items-center justify-center gap-3 bg-[#00B14F] hover:bg-[#009643] text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-extrabold text-sm sm:text-base uppercase tracking-wider shadow-[0_4px_20px_rgba(0,177,79,0.3)] hover:shadow-[0_8px_25px_rgba(0,177,79,0.4)] transition-all duration-200 cursor-pointer active:scale-98"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            <span>Explore Full Store</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

      </div>
    </section>
  );
}
