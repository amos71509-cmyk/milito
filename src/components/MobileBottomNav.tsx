import React from "react";
import { Home, ShoppingBag, ArrowLeftRight, ShoppingCart, User } from "lucide-react";

interface MobileBottomNavProps {
  activeTab: "home" | "shop" | "swap" | "cart" | "profile";
  cartCount: number;
  onNavigateHome: () => void;
  onNavigateShop: () => void;
  onNavigateSwap: () => void;
  onOpenCart: () => void;
  onOpenProfile: () => void;
}

export default function MobileBottomNav({
  activeTab,
  cartCount,
  onNavigateHome,
  onNavigateShop,
  onNavigateSwap,
  onOpenCart,
  onOpenProfile,
}: MobileBottomNavProps) {
  const navItems = [
    {
      id: "home" as const,
      label: "Home",
      icon: Home,
      onClick: onNavigateHome,
      badge: 0,
    },
    {
      id: "shop" as const,
      label: "Shop",
      icon: ShoppingBag,
      onClick: onNavigateShop,
      badge: 0,
    },
    {
      id: "swap" as const,
      label: "Swap",
      icon: ArrowLeftRight,
      onClick: onNavigateSwap,
      badge: 0,
    },
    {
      id: "cart" as const,
      label: "Cart",
      icon: ShoppingCart,
      onClick: onOpenCart,
      badge: cartCount,
    },
    {
      id: "profile" as const,
      label: "Profile",
      icon: User,
      onClick: onOpenProfile,
      badge: 0,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.07)] pb-[max(0.35rem,env(safe-area-inset-bottom,0px))]"
    >
      <div className="grid grid-cols-5 h-15 items-center px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              type="button"
              className={`flex flex-col items-center justify-center py-1 relative w-full h-full cursor-pointer select-none transition-all duration-200 active:scale-95 ${
                isActive ? "text-[#00B14F]" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {/* Active top indicator pill */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-[#00B14F]" />
              )}

              {/* Icon Container with optional badge */}
              <div className="relative flex items-center justify-center mt-1">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "stroke-[2.4] scale-110" : "stroke-[1.8]"
                  }`}
                />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-milito-green text-black text-[9px] font-black shadow-sm ring-1 ring-white">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>

              {/* Text Label */}
              <span
                className={`text-[10px] mt-1 tracking-tight leading-none ${
                  isActive ? "font-bold text-[#00B14F]" : "font-medium text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
