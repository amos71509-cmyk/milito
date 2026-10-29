import React, { useState } from "react";
import { X, Heart, ShieldCheck, UserPlus, LogIn, Sparkles } from "lucide-react";
import { useCustomerAuth } from "../context/CustomerAuthContext";

interface CustomerAuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullAuth?: (mode: "login" | "signup") => void;
}

export default function CustomerAuthPromptModal({
  isOpen,
  onClose,
  onOpenFullAuth,
}: CustomerAuthPromptModalProps) {
  const { login, signup } = useCustomerAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please provide your email address.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please provide your full name.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (mode === "signup") {
        await signup(email, name);
      } else {
        await login(email, name || email.split("@")[0]);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to authenticate. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full border border-gray-200 overflow-hidden shadow-2xl animate-scaleUp text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-gray-100 flex items-start justify-between bg-gradient-to-b from-rose-50/60 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
              <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 block">
                Saved Wishlist
              </span>
              <h3 className="text-base sm:text-lg font-black text-gray-950 leading-tight">
                Save Products You Love
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Create an account or log in to save products you love, track restocks, and review saved devices on any visit.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
              {error}
            </div>
          )}

          {mode === "signup" && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Samuel Alao"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:border-[#00B14F] focus:bg-white text-gray-900 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@gmail.com"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:border-[#00B14F] focus:bg-white text-gray-900 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:border-[#00B14F] focus:bg-white text-gray-900 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-[#00B14F] hover:brightness-105 active:scale-98 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition shadow-md shadow-[#00B14F]/20 cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? "Logging In..." : "Log In to Save"}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? "Creating Account..." : "Create Account & Save"}</span>
              </>
            )}
          </button>

          {/* Toggle Login / Signup */}
          <div className="text-center pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
              className="text-[#00B14F] hover:underline font-bold"
            >
              {mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
