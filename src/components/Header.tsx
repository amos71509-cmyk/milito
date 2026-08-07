import React, { useState, useRef } from "react";
import { ShoppingCart, Menu, X, User, Trash2, LogIn, LogOut, Check, Search, ShieldCheck } from "lucide-react";
import { CartItem, resolveImageUrl } from "../types";
import { useBranding } from "../context/BrandingContext";

interface HeaderProps {
  cart: CartItem[];
  onUpdateCartQty: (key: string, qty: number) => void;
  onRemoveFromCart: (key: string) => void;
  onOpenCheckout: () => void;
  onOpenTracker: () => void;
  onScrollToSection: (id: string) => void;
  onOpenDashboard: () => void;
}

export default function Header({
  cart,
  onUpdateCartQty,
  onRemoveFromCart,
  onOpenCheckout,
  onOpenTracker,
  onScrollToSection,
  onOpenDashboard,
}: HeaderProps) {
  const { branding } = useBranding();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const logoClicksRef = useRef(0);
  const noticeTimeoutRef = useRef<any>(null);
  const lastScrollTimeRef = useRef(0);
  const [clickNotice, setClickNotice] = useState("");

  const handleBrandClick = () => {
    const now = Date.now();
    // Throttle the scrolling interaction during fast taps to prevent jumpy jitter
    if (now - lastScrollTimeRef.current > 3000) {
      onScrollToSection("hero");
      lastScrollTimeRef.current = now;
    }

    if (noticeTimeoutRef.current) {
      clearTimeout(noticeTimeoutRef.current);
    }

    setClickNotice("🔓 Access Unlocked: Opening Developer Dashboard!");
    onOpenDashboard();
    noticeTimeoutRef.current = setTimeout(() => {
      setClickNotice("");
    }, 3000);
  };

  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [inputEmail, setInputEmail] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(p);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail || !inputPassword || (authMode === "signup" && !inputName)) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    if (authMode === "signup") {
      setUserName(inputName);
      setUserEmail(inputEmail);
    } else {
      setUserName(inputEmail.split("@")[0]);
      setUserEmail(inputEmail);
    }

    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
    setErrorMessage("");
    // Clear inputs
    setInputEmail("");
    setInputName("");
    setInputPassword("");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    setUserName("");
  };

  const navLinks = [
    { label: "Home", sectionId: "hero" },
    { label: "Shop Phones", sectionId: "shop" },
    { label: "Trade-In", sectionId: "trade-in" },
    { label: "Vehicle Import", sectionId: "vehicle-import" },
    { label: "How It Works", sectionId: "how-it-works" },
  ];

  return (
    <>
      {clickNotice && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[99] bg-black/90 text-milito-green text-xs font-bold px-4 py-2.5 rounded-full border border-milito-green/30 shadow-[0_4px_25px_rgba(0,177,79,0.2)] animate-pulse tracking-wide flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-milito-green animate-ping"></div>
          {clickNotice}
        </div>
      )}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-colors duration-300 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-24 py-2">
            {/* Logo */}
            <div 
              className="flex-shrink-0 flex items-center gap-2 cursor-pointer select-none"
              onClick={handleBrandClick}
            >
              {branding.logoUrl ? (
                <div className="flex items-center gap-2 py-1">
                  <img 
                    src={branding.logoUrl} 
                    alt="MILITO TECH HOME Logo" 
                    className="h-14 sm:h-16 md:h-18 lg:h-20 max-w-[220px] sm:max-w-[250px] md:max-w-[300px] w-auto object-contain bg-transparent p-0 border-0 shadow-none mix-blend-multiply transition-all duration-300"
                  />
                  <span className="font-extrabold text-[#1A2025] text-sm md:text-xl tracking-wider hidden md:inline">
                    MILITO <span className="text-milito-green">TECH</span>
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-lg bg-milito-green flex items-center justify-center font-extrabold text-[#1A2025] leading-none text-xl shadow-[0_4px_15px_rgba(0,177,79,0.25)]">
                    M
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-[#1A2025] md:text-gray-900 text-base md:text-lg tracking-wider">
                      MILITO <span className="text-milito-green">TECH</span>
                    </span>
                    <span className="text-[9px] tracking-[0.2em] uppercase text-gray-500 font-bold -mt-1">
                      HOME
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-4">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => onScrollToSection(link.sectionId)}
                  className="text-xs font-black uppercase tracking-wider text-gray-750 hover:text-milito-green transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={onOpenTracker}
                className="text-xs font-black uppercase tracking-wider text-gray-750 hover:text-milito-green transition-colors cursor-pointer flex items-center gap-0.5"
              >
                Track Order
              </button>
            </nav>

            {/* Icons Area */}
            <div className="hidden md:flex items-center space-x-6">
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-gray-100 px-3.5 py-1.5 rounded-full border border-gray-200">
                    <div className="w-2.5 h-2.5 rounded-full bg-milito-green animate-pulse"></div>
                    <span className="text-xs text-gray-700 font-semibold">Hi, {userName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setIsLoginModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-gray-100 hover:bg-gray-200 hover:text-gray-900 transition-all duration-300 border border-gray-200 cursor-pointer text-gray-800"
                >
                  <User className="w-4 h-4" />
                  Login
                </button>
              )}

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 hover:text-gray-900 transition-all duration-300 border border-gray-200 cursor-pointer text-gray-850"
              >
                <ShoppingCart className="w-5 h-5 text-current" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-milito-green text-black text-[11px] font-bold shadow-md">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile controls */}
            <div className="flex md:hidden items-center space-x-4">
              {/* Mobile Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full bg-gray-100 text-gray-850 border border-gray-200"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-milito-green text-black text-[10px] font-bold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-black"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white py-4 px-6 space-y-4 animate-fadeIn">
            {branding.logoUrl && (
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <img
                  src={branding.logoUrl}
                  alt="Website Logo"
                  className="h-14 sm:h-16 max-w-[250px] object-contain mix-blend-multiply bg-transparent p-0 border-0 shadow-none"
                />
              </div>
            )}
            <div className="flex flex-col space-y-4 font-semibold text-lg">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => {
                    onScrollToSection(link.sectionId);
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-gray-800 hover:text-milito-green transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => {
                  onOpenTracker();
                  setIsMobileMenuOpen(false);
                }}
                className="text-left text-gray-800 hover:text-milito-green transition-colors"
              >
                Track Order
              </button>
            </div>

            <div className="border-t border-gray-100 pt-4 flex flex-col space-y-4">
              {isLoggedIn ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Account: {userName}</span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-sm text-red-500 flex items-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setIsLoginModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-milito-green text-black font-extrabold shadow-lg"
                >
                  <User className="w-4 h-4" />
                  Account Login
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Cart Sidebar Slide-Over */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsCartOpen(false)}
            ></div>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col bg-white shadow-2xl border-l border-gray-200 animate-slideIn">
                  {/* Cart Header */}
                  <div className="flex items-center justify-between px-6 py-6 border-b border-gray-150">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-milito-green" />
                      <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider" id="slide-over-title">
                        Shopping Cart
                      </h2>
                    </div>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="rounded-md p-1.5 text-gray-550 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Cart List */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-20">
                        <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-400 mb-4">
                          <ShoppingCart className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-800">Your cart is empty</h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-xs">
                          You haven't added any premium gadgets to your cart yet. Explore our featured smartphones to get started!
                        </p>
                        <button
                          onClick={() => {
                            setIsCartOpen(false);
                            onScrollToSection("shop");
                          }}
                          className="mt-6 px-5 py-2.5 text-xs font-semibold rounded-full bg-milito-green text-black hover:bg-opacity-90 transition cursor-pointer font-bold"
                        >
                          Browse Smartphones
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-150">
                        {cart.map((item) => (
                          <div key={item.id} className="flex py-4 first:pt-0 last:pb-0 gap-4">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50 p-1 flex items-center justify-center">
                              <img
                                src={resolveImageUrl(item.product.image)}
                                alt={item.product.name}
                                referrerPolicy="no-referrer"
                                className="h-full object-contain"
                              />
                            </div>

                            <div className="flex flex-1 flex-col">
                              <div>
                                <div className="flex justify-between text-sm font-semibold text-gray-950">
                                  <h3 className="line-clamp-1">{item.product.name}</h3>
                                  <p className="ml-4 text-milito-green font-bold font-mono">{formatPrice(item.product.price * item.quantity)}</p>
                                </div>
                                <div className="mt-1 flex gap-2 text-[11px] text-gray-500">
                                  <span className="bg-gray-150 text-gray-700 px-2 py-0.5 rounded font-mono font-medium">{item.selectedStorage}</span>
                                  <span className="flex items-center gap-1.5 bg-gray-150 text-gray-750 px-2 py-0.5 rounded">
                                    <span className="w-2.5 h-2.5 rounded-full border border-gray-300 inline-block" style={{ backgroundColor: item.selectedColor.hex }}></span>
                                    {item.selectedColor.name}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-1 flex-col justify-end text-xs mt-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center border border-gray-250 rounded-lg overflow-hidden bg-gray-50">
                                    <button
                                      onClick={() => onUpdateCartQty(item.id, item.quantity - 1)}
                                      className="px-2.5 py-1 text-gray-500 hover:text-black hover:bg-gray-200 cursor-pointer font-bold"
                                    >
                                      -
                                    </button>
                                    <span className="px-3 text-gray-900 font-bold text-xs">{item.quantity}</span>
                                    <button
                                      onClick={() => onUpdateCartQty(item.id, item.quantity + 1)}
                                      className="px-2.5 py-1 text-gray-500 hover:text-black hover:bg-gray-200 cursor-pointer font-bold"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => onRemoveFromCart(item.id)}
                                    className="font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cart Footer */}
                  {cart.length > 0 && (
                    <div className="border-t border-gray-200 px-6 py-6 bg-gray-50">
                      <div className="flex justify-between text-base font-bold text-gray-900 mb-2">
                        <span>Subtotal</span>
                        <span className="text-xl text-milito-green font-black font-mono">{formatPrice(cartTotal)}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 mb-6 flex items-center gap-1 bg-white p-2.5 rounded border border-gray-200 shadow-sm leading-normal">
                        <ShieldCheck className="w-5 h-5 text-milito-green flex-shrink-0" />
                        <span>Protected by MILITO escrow lock. All clearances, swap valuations, and couriers are backed by secure delivery parameters.</span>
                      </p>

                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            setIsCartOpen(false);
                            onOpenCheckout();
                          }}
                          className="w-full flex items-center justify-center rounded-xl bg-milito-green px-6 py-3.5 text-sm font-bold text-black shadow-lg hover:brightness-105 active:scale-98 transition duration-200 cursor-pointer"
                        >
                          Checkout Securely (Escrow Lock)
                        </button>
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="w-full flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-xs font-semibold text-gray-750 hover:bg-gray-100 transition cursor-pointer"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login / Auth Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-250 overflow-hidden shadow-2xl animate-scaleUp">
            <div className="px-6 py-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-950 font-sans">
                {authMode === "login" ? "Welcome Back" : "Create Brand Account"}
              </h3>
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 text-gray-500 hover:text-black hover:bg-gray-200 transition cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-100 border border-red-200 text-xs text-red-700 font-semibold leading-relaxed">
                  {errorMessage}
                </div>
              )}

              {authMode === "signup" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="e.g. Samuel Alao"
                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-white border border-gray-300 focus:outline-none focus:border-milito-green text-gray-900 transition placeholder-gray-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-white border border-gray-300 focus:outline-none focus:border-milito-green text-gray-900 transition placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-white border border-gray-300 focus:outline-none focus:border-milito-green text-gray-900 transition placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-milito-green text-black font-extrabold shadow-lg hover:bg-opacity-90 active:scale-98 transition duration-200 mt-2 text-sm cursor-pointer uppercase tracking-wider"
              >
                {authMode === "login" ? "Login Securely" : "Register with MILITO"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "signup" : "login");
                    setErrorMessage("");
                  }}
                  className="text-xs text-gray-550 hover:text-milito-green transition font-medium cursor-pointer"
                >
                  {authMode === "login" 
                    ? "New to MILITO TECH HOME? Create an Account" 
                    : "Already have an account? Log In"
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
