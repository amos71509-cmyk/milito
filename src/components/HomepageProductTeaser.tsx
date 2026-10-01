import React from "react";
import { ArrowRight, ShoppingBag, Sparkles, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Product } from "../types";
import ProductCard from "./ProductCard";

interface HomepageProductTeaserProps {
  products: Product[];
  compareList: Product[];
  onToggleCompare: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onExploreStore: () => void;
  onShareProduct?: (product: Product) => void;
}

export default function HomepageProductTeaser({
  products,
  compareList,
  onToggleCompare,
  onOpenDetails,
  onQuickAdd,
  onExploreStore,
  onShareProduct,
}: HomepageProductTeaserProps) {
  const shouldReduceMotion = useReducedMotion();

  // Pick 3 to 4 real phone products from the catalogue (prioritize featured if available)
  const teaserProducts = React.useMemo(() => {
    const phoneOnly = products.filter((p) => (p.productType || "phone") !== "vehicle");
    const featured = phoneOnly.filter((p) => p.featured);
    const regular = phoneOnly.filter((p) => !p.featured);
    const combined = [...featured, ...regular];
    return combined.slice(0, 4);
  }, [products]);

  if (teaserProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-gray-150 relative" id="product-teaser">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-5">
          <div>
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00B14F]/10 border border-[#00B14F]/20 text-[#00B14F] text-xs font-extrabold uppercase tracking-wider mb-2.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Product Discovery</span>
            </motion.div>

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
            className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl self-start md:self-auto"
          >
            <ShieldCheck className="w-4 h-4 text-[#00B14F] flex-shrink-0" />
            <span>Real verified Nigerian stock with 35-point QC</span>
          </motion.div>
        </div>

        {/* Compact 3-4 Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 items-start">
          {teaserProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              isComparing={compareList.some((p) => p.id === prod.id)}
              onToggleCompare={onToggleCompare}
              onOpenDetails={onOpenDetails}
              onQuickAdd={onQuickAdd}
            />
          ))}
        </div>

        {/* Clear Action Button to Full Store */}
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
