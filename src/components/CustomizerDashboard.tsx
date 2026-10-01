import React, { useState, useRef } from "react";
import { X, Sparkles, UploadCloud, Link2, Tv, Image, Save, Plus, Edit3, Trash2, Check, Play, RefreshCw, Layers } from "lucide-react";
import { Product } from "../types";

export interface SiteConfig {
  hero: {
    titleLine1: string;
    titleLine2Color: string;
    titleLine3: string;
    subtitle: string;
    badgeTag: string;
    badgeText: string;
    ctaTextPrimary: string;
    ctaTextSecondary: string;
    metric1Value: string;
    metric1Label: string;
    metric2Value: string;
    metric2Label: string;
    metric3Value: string;
    metric3Label: string;
    glowIntensity: number; // 1 to 10
    particleCount: number;
  };
  products: Product[];
  animationMedia: {
    useCustomShowcase: boolean;
    type: "image" | "video";
    url: string; // URL link or base64 stream
    motionPattern: "floating" | "parallax" | "spin" | "pulse" | "bounce";
    motionSpeed: number; // 1 to 10 seconds
    ambientColor: string; // e.g., "green", "emerald", "blue", "purple", "gold"
  };
}

interface CustomizerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  onChangeConfig: (newConfig: SiteConfig) => void;
  onResetToDefault: () => void;
}

export default function CustomizerDashboard({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onResetToDefault,
}: CustomizerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"sections" | "products" | "motion">("sections");
  
  // Image URL master tester states
  const [pasteUrlInput, setPasteUrlInput] = useState("");
  const [urlPreviewVisible, setUrlPreviewVisible] = useState(false);

  // File Upload states for Base64 conversion
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedBase64, setUploadedBase64] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Product Editor temporary local states
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);

  // Buffer state for products or new products
  const [productForm, setProductForm] = useState<Partial<Product>>({
    id: "",
    name: "",
    brand: "Apple",
    condition: "Brand New",
    price: 100000,
    originalPrice: 120000,
    badge: "",
    image: "",
    gallery: [],
    storageOptions: ["256GB"],
    colorOptions: [{ name: "Space Gray", hex: "#555" }],
    description: "",
    specs: {
      screen: "6.7-inch OLED",
      camera: "48MP Main",
      chipset: "Premium ChipSet",
      batterySize: "5000 mAh",
      os: "Latest OS",
      warranty: "1 Year Store Warranty",
      simType: "Dual Nano-SIM + eSIM"
    },
    rating: 4.8,
    reviewsCount: 15
  });

  if (!isOpen) return null;

  // Converts local file to base64 and persists it permanently
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadedBase64(base64String);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 2500);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateHeroField = (field: keyof SiteConfig["hero"], value: any) => {
    onChangeConfig({
      ...config,
      hero: {
        ...config.hero,
        [field]: value,
      },
    });
  };

  const updateAnimationField = (field: keyof SiteConfig["animationMedia"], value: any) => {
    onChangeConfig({
      ...config,
      animationMedia: {
        ...config.animationMedia,
        [field]: value,
      },
    });
  };

  // Reflects URL Preview or Uploaded Base64 directly into target fields
  const applyImageToHeroShowcase = (imageUrl: string) => {
    if (!imageUrl) return;
    onChangeConfig({
      ...config,
      animationMedia: {
        ...config.animationMedia,
        useCustomShowcase: true,
        type: "image",
        url: imageUrl,
      },
    });
    alert("Applied instantly to Hero Showcase Interactive view!");
  };

  const applyImageToSelectedProduct = (imageUrl: string) => {
    if (!imageUrl) return;
    if (selectedProductIndex === null) {
      alert("Please select a smartphone from the list below to update its image.");
      return;
    }
    const updatedProducts = [...config.products];
    updatedProducts[selectedProductIndex] = {
      ...updatedProducts[selectedProductIndex],
      image: imageUrl,
      gallery: [imageUrl]
    };
    onChangeConfig({
      ...config,
      products: updatedProducts
    });
    alert(`Applied instantly and saved permanently to ${updatedProducts[selectedProductIndex].name}!`);
  };

  // Product edit handlers
  const handleStartEditProduct = (index: number) => {
    setSelectedProductIndex(index);
    setProductForm({ ...config.products[index] });
    setIsEditingProduct(true);
    setIsAddingNewProduct(false);
  };

  const handleStartAddProduct = () => {
    setSelectedProductIndex(null);
    setProductForm({
      id: "device-" + Date.now(),
      name: "New Phone Model",
      brand: "Apple",
      condition: "Brand New",
      price: 950000,
      originalPrice: 1050000,
      badge: "In Stock",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop",
      gallery: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop"],
      storageOptions: ["256GB" , "512GB"],
      colorOptions: [{ name: "Titanium Black", hex: "#232426" }],
      description: "Enter detailed flagship features here.",
      specs: {
        screen: "6.7-inch AMOLED (120Hz)",
        camera: "108MP Main camera",
        chipset: "Flagship Octa-core",
        batterySize: "5000 mAh",
        os: "OS v15 Configured",
        warranty: "1 Year Warranty",
        simType: "Dual SIM Slot Ready"
      },
      rating: 4.9,
      reviewsCount: 12
    });
    setIsAddingNewProduct(true);
    setIsEditingProduct(false);
  };

  const handleSaveProductForm = () => {
    if (!productForm.name || !productForm.image) {
      alert("Please ensure the Smartphone Model Name and Image URL / Base64 Image is provided.");
      return;
    }

    let updatedProducts = [...config.products];
    if (isEditingProduct && selectedProductIndex !== null) {
      updatedProducts[selectedProductIndex] = productForm as Product;
    } else {
      updatedProducts.push(productForm as Product);
    }

    onChangeConfig({
      ...config,
      products: updatedProducts
    });

    setIsEditingProduct(false);
    setIsAddingNewProduct(false);
    setSelectedProductIndex(null);
    alert("Saved configuration permanently to catalog state!");
  };

  const handleDeleteProduct = (index: number) => {
    if (confirm("Are you sure you want to remove this product from the inventory?")) {
      const updatedProducts = config.products.filter((_, i) => i !== index);
      onChangeConfig({
         ...config,
         products: updatedProducts
      });
      setIsEditingProduct(false);
      setSelectedProductIndex(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-lg overflow-y-auto font-sans text-gray-200 selection:bg-milito-green selection:text-black select-none">
      <div className="bg-[#0b0c10] border border-white/[0.08] w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh] max-h-[800px] animate-scaleUp">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 bg-[#07080a] p-6 border-r border-white/[0.06] flex flex-col justify-between">
          <div>
            {/* Header section admin branding */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-lg bg-milito-green flex items-center justify-center text-black font-extrabold text-sm shadow-[0_0_15px_rgba(0,177,79,0.3)]">
                ⚙️
              </div>
              <div>
                <h3 className="text-white font-extrabold text-xs tracking-wider uppercase">Milito Tech Hub</h3>
                <span className="text-[9px] text-[#00B14F] font-bold tracking-widest uppercase">Admin Dashboard</span>
              </div>
            </div>

            {/* Sidebar button configurations */}
            <div className="space-y-2">
              <button
                onClick={() => { setActiveTab("sections"); setIsEditingProduct(false); setIsAddingNewProduct(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                  activeTab === "sections" ? "bg-white/[0.06] text-white border-l-2 border-milito-green" : "text-gray-400 hover:bg-white/[0.02]"
                }`}
              >
                <Layers className="w-4 h-4 text-milito-green" />
                <span>Landing Page Sections</span>
              </button>

              <button
                onClick={() => { setActiveTab("products"); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                  activeTab === "products" ? "bg-white/[0.06] text-white border-l-2 border-milito-green" : "text-gray-400 hover:bg-white/[0.02]"
                }`}
              >
                <Image className="w-4 h-4 text-emerald-400" />
                <span>Smartphone Catalog</span>
              </button>

              <button
                onClick={() => { setActiveTab("motion"); setIsEditingProduct(false); setIsAddingNewProduct(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                  activeTab === "motion" ? "bg-white/[0.06] text-white border-l-2 border-milito-green" : "text-gray-400 hover:bg-white/[0.02]"
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>Motion & Media Engine</span>
              </button>
            </div>
          </div>

          {/* Quick HUD controls */}
          <div className="space-y-2.5 pt-6 border-t border-white/[0.06]">
            <button
              onClick={onResetToDefault}
              className="w-full py-2.5 px-4 bg-red-950/30 text-red-400 text-[10px] font-extrabold uppercase rounded-lg border border-red-900/30 hover:bg-red-900/40 transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset All Defaults
            </button>
            <div className="flex items-center gap-1.5 justify-center bg-white/[0.01] py-1.5 rounded text-[8px] text-gray-500 font-mono tracking-wider">
              <span>CONFIG: DEPLOYED SECURE</span>
            </div>
          </div>
        </div>

        {/* Content body layout pane */}
        <div className="flex-1 flex flex-col h-full bg-[#0a0a0c]">
          
          {/* Header toolbar */}
          <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center bg-[#07080a]">
            <div>
              <h2 className="text-white font-black text-sm tracking-wide">
                {activeTab === "sections" && "🔧 Page Sections Customizer"}
                {activeTab === "products" && "📱 Smartphone Inventory Configurations"}
                {activeTab === "motion" && "🎬 Advanced Motion, Images & Video Animators"}
              </h2>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Updates will save permanently using zero-latency base64 sandbox structures.
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 bg-white/[0.04] text-gray-400 hover:text-white rounded-xl border border-white/[0.08] hover:bg-white/[0.1] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrolling Panel View wrapper */}
          <div className="flex-1 p-6 overflow-y-auto space-y-8">
            
            {/* TAB 1: SECTIONS EDITING CARD */}
            {activeTab === "sections" && (
              <div className="space-y-6">
                
                {/* Hero Headline visual blocks */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
                  <h4 className="text-white text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5 border-b border-white/[0.04] pb-2.5">
                    <Layers className="w-4.5 h-4.5 text-milito-green" />
                    Hero Title Banner Headline
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-extrabold uppercase">Headline Row 1 Text</label>
                      <input
                        type="text"
                        value={config.hero.titleLine1}
                        onChange={(e) => updateHeroField("titleLine1", e.target.value)}
                        className="w-full bg-[#0f1115] border border-white/[0.1] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-milito-green font-bold"
                      />
                    </div>
                    
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] text-gray-400 font-extrabold uppercase">Headline Highlight Green Box Text</label>
                      <input
                        type="text"
                        value={config.hero.titleLine2Color}
                        onChange={(e) => updateHeroField("titleLine2Color", e.target.value)}
                        className="w-full bg-[#0f1115] border border-white/[0.1] rounded-lg p-2.5 text-xs text-milito-green focus:outline-none focus:border-milito-green font-bold shadow-[0_0_12px_rgba(0,177,79,0.1)]"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] text-gray-400 font-extrabold uppercase">Headline Row 3 Text</label>
                      <input
                        type="text"
                        value={config.hero.titleLine3}
                        onChange={(e) => updateHeroField("titleLine3", e.target.value)}
                        className="w-full bg-[#0f1115] border border-white/[0.1] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-milito-green font-bold"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] text-gray-400 font-extrabold uppercase">Hero Subdescription Para text</label>
                      <textarea
                        value={config.hero.subtitle}
                        onChange={(e) => updateHeroField("subtitle", e.target.value)}
                        rows={3}
                        className="w-full bg-[#0f1115] border border-white/[0.1] rounded-lg p-2.5 text-xs text-gray-300 focus:outline-none focus:border-milito-green leading-relaxed font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Secure Trust Badges details */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
                  <h4 className="text-white text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5 border-b border-white/[0.04] pb-2.5">
                    <Check className="w-4.5 h-4.5 text-emerald-400" />
                    Featured Security Header Trust Ribbon Settings
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-extrabold uppercase">Secure Active Lock Badge Label Text</label>
                      <input
                        type="text"
                        value={config.hero.badgeTag}
                        onChange={(e) => updateHeroField("badgeTag", e.target.value)}
                        className="w-full bg-[#0f1115] border border-white/[0.1] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-extrabold uppercase">Ribbon Description Right text</label>
                      <input
                        type="text"
                        value={config.hero.badgeText}
                        onChange={(e) => updateHeroField("badgeText", e.target.value)}
                        className="w-full bg-[#0f1115] border border-white/[0.1] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* CTA text buttons and quick counters indicators */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
                  <h4 className="text-white text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5 border-b border-white/[0.04] pb-2.5">
                    <Play className="w-4.5 h-4.5 text-milito-green" />
                    Primary Actions Call-To-Action & Metrics Indicators
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-extrabold uppercase">Primary Green Button CTA Text</label>
                      <input
                        type="text"
                        value={config.hero.ctaTextPrimary}
                        onChange={(e) => updateHeroField("ctaTextPrimary", e.target.value)}
                        className="w-full bg-[#0f1115] border border-white/[0.1] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-extrabold uppercase">Secondary Border Button CTA Text</label>
                      <input
                        type="text"
                        value={config.hero.ctaTextSecondary}
                        onChange={(e) => updateHeroField("ctaTextSecondary", e.target.value)}
                        className="w-full bg-[#0f1115] border border-white/[0.1] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Metrics subgrid */}
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/[0.04]">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-500 font-bold uppercase block">Metric 1 Value</label>
                      <input
                        type="text"
                        value={config.hero.metric1Value}
                        onChange={(e) => updateHeroField("metric1Value", e.target.value)}
                        className="w-full bg-[#0f1115] border border-white/[0.1] rounded-lg p-2 text-xs text-white font-mono"
                      />
                      <input
                        type="text"
                        value={config.hero.metric1Label}
                        onChange={(e) => updateHeroField("metric1Label", e.target.value)}
                        className="w-full bg-[#0f1115] p-1 text-[9px] text-gray-400 focus:outline-none border-none mt-1 uppercase"
                        placeholder="Label"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-500 font-bold uppercase block">Metric 2 Value</label>
                      <input
                        type="text"
                        value={config.hero.metric2Value}
                        onChange={(e) => updateHeroField("metric2Value", e.target.value)}
                        className="w-full bg-[#0f1115] border border-white/[0.1] rounded-lg p-2 text-xs text-white font-mono"
                      />
                      <input
                        type="text"
                        value={config.hero.metric2Label}
                        onChange={(e) => updateHeroField("metric2Label", e.target.value)}
                        className="w-full bg-[#0f1115] p-1 text-[9px] text-gray-400 focus:outline-none border-none mt-1 uppercase"
                        placeholder="Label"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-500 font-bold uppercase block">Metric 3 Value</label>
                      <input
                        type="text"
                        value={config.hero.metric3Value}
                        onChange={(e) => updateHeroField("metric3Value", e.target.value)}
                        className="w-full bg-[#0f1115] border border-white/[0.1] rounded-lg p-2 text-xs text-white font-mono"
                      />
                      <input
                        type="text"
                        value={config.hero.metric3Label}
                        onChange={(e) => updateHeroField("metric3Label", e.target.value)}
                        className="w-full bg-[#0f1115] p-1 text-[9px] text-gray-400 focus:outline-none border-none mt-1 uppercase"
                        placeholder="Label"
                      />
                    </div>
                  </div>
                </div>

                {/* Particles and ambient glow control */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
                  <h4 className="text-white text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5 border-b border-white/[0.04] pb-2.5">
                    <Sparkles className="w-4.5 h-4.5 text-purple-400" />
                    Interactive Atmospheric Physics Accent settings
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase font-extrabold">
                        <span>Background Green Glow Intensity</span>
                        <span className="text-milito-green">{config.hero.glowIntensity} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={config.hero.glowIntensity}
                        onChange={(e) => updateHeroField("glowIntensity", parseInt(e.target.value))}
                        className="w-full accent-milito-green cursor-pointer bg-[#0f1115]"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase font-extrabold">
                        <span>Ambient Micro Floating Particles count</span>
                        <span className="text-milito-green">{config.hero.particleCount} stars</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="35"
                        step="5"
                        value={config.hero.particleCount}
                        onChange={(e) => updateHeroField("particleCount", parseInt(e.target.value))}
                        className="w-full accent-milito-green cursor-pointer bg-[#0f1115]"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: SMARTPHONE CATALOG */}
            {activeTab === "products" && (
              <div className="space-y-6">
                
                {/* Image Master utility tool wrapper */}
                <div className="bg-[#0e1017] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-inner">
                  <span className="text-[9px] bg-milito-green/20 text-milito-green border border-milito-green/30 px-2 py-0.5 rounded-full inline-block font-extrabold uppercase tracking-widest leading-normal">
                    Media Master Tools
                  </span>
                  
                  <h3 className="text-white font-extrabold text-xs">
                    📁 Base64 Image Local Permanent Saver & External URL Preview Reflector
                  </h3>
                  
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Paste any external URL to preview it immediately, or upload and convert a native computer image directly into local <strong>Base64 format</strong> data to save permanently into the codebase storage system.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2 items-start">
                    
                    {/* Left Pane - Inputs */}
                    <div className="lg:col-span-7 space-y-4">
                      
                      {/* URL Field input */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1">
                          <Link2 className="w-3.5 h-3.5 text-sky-400" />
                          Paste Remote Website Image URL Link:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={pasteUrlInput}
                            onChange={(e) => setPasteUrlInput(e.target.value)}
                            placeholder="https://images.unsplash.com/... or raw image uri link"
                            className="bg-[#090a0d] border border-white/[0.1] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-milito-green flex-1 font-mono text-ellipsis w-10"
                          />
                          <button
                            onClick={() => {
                              if (pasteUrlInput) {
                                setUrlPreviewVisible(true);
                              } else {
                                alert("Please paste an image URL first!");
                              }
                            }}
                            className="px-4 py-2 text-xs font-extrabold uppercase bg-white/[0.04] text-white hover:bg-white/[0.08] rounded-lg border border-white/[0.08] transition"
                          >
                            Verify & Pop Up
                          </button>
                        </div>
                      </div>

                      {/* File Upload component converter */}
                      <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                        <label className="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1">
                          <UploadCloud className="w-3.5 h-3.5 text-[#00B14F]" />
                          Upload Device Picture (Converts to Base64 data String):
                        </label>

                        <div className="flex items-center gap-3 bg-[#090a0d] border border-dashed border-white/[0.1] rounded-xl p-4.5">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2.5 bg-milito-green text-black font-extrabold text-[10px] uppercase rounded-lg hover:brightness-115 transition cursor-pointer shadow-md shadow-milito-green/10"
                          >
                            Choose PC Image File
                          </button>
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                          />

                          <div className="flex-1">
                            {uploadedBase64 ? (
                              <div>
                                <span className="text-[10px] text-gray-300 font-semibold truncate block max-w-[200px]">
                                  Base64 conversion complete!
                                </span>
                                <span className="text-[8px] text-[#00B14F] font-mono font-bold block">
                                  Size: ~{(uploadedBase64.length / 1024).toFixed(1)} KB (Preserves eternally)
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-500 font-medium block">
                                Select PNG/JPEG to lock permanently.
                              </span>
                            )}
                          </div>
                        </div>

                        {uploadSuccess && (
                          <p className="text-[10px] text-milito-green font-bold animate-bounce mt-1">
                            ✓ Base64 system synchronised successfully! Ready to apply.
                          </p>
                        )}
                      </div>

                    </div>

                    {/* Right Pane - Dynamic Interactive Pop Up Preview panel */}
                    <div className="lg:col-span-5 bg-[#07080a] p-4.5 rounded-xl border border-white/[0.08] flex flex-col justify-between items-center min-h-[220px]">
                      
                      <div className="w-full text-center">
                        <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest block border-b border-white/[0.04] pb-1.5 mb-2">
                          🖼️ Interactive Pop Up Preview
                        </span>
                      </div>

                      {/* Display pasted or local files converter dynamic target */}
                      <div className="w-full h-32 flex items-center justify-center bg-[#0d0d12] rounded-lg overflow-hidden border border-white/5 p-2">
                        {pasteUrlInput && urlPreviewVisible ? (
                          <img
                            src={pasteUrlInput}
                            alt="Preview test"
                            className="h-full object-contain drop-shadow-[0_4px_15px_rgba(0,0,0,0.5)]"
                            onError={() => {
                              alert("Testing failed: the URL provided is not reachable or isn't a valid visual image format.");
                              setUrlPreviewVisible(false);
                            }}
                          />
                        ) : uploadedBase64 ? (
                          <img
                            src={uploadedBase64}
                            alt="Uploaded base64 test"
                            className="h-full object-contain drop-shadow-[0_4px_15px_rgba(0,177,79,0.2)]"
                          />
                        ) : (
                          <div className="text-center">
                            <span className="text-[10px] text-gray-500 font-bold block">NO MEDIA LOADED</span>
                            <span className="text-[9px] text-gray-650 block mt-0.5">Please provide image url link or upload file to pop up</span>
                          </div>
                        )}
                      </div>

                      {/* quick apply matrix */}
                      <div className="w-full grid grid-cols-2 gap-2 mt-3">
                        <button
                          onClick={() => applyImageToHeroShowcase(pasteUrlInput || uploadedBase64)}
                          disabled={!pasteUrlInput && !uploadedBase64}
                          className="py-1.5 text-[10px] font-bold uppercase rounded bg-sky-950/45 text-sky-455 border border-sky-800/25 hover:bg-sky-900/40 disabled:opacity-30 disabled:pointer-events-none transition"
                        >
                          Send to Hero Showcase
                        </button>
                        <button
                          onClick={() => applyImageToSelectedProduct(pasteUrlInput || uploadedBase64)}
                          disabled={!pasteUrlInput && !uploadedBase64}
                          className="py-1.5 text-[10px] font-bold uppercase rounded bg-emerald-950/45 text-[#00B14F] border border-emerald-800/25 hover:bg-emerald-900/40 disabled:opacity-30 disabled:pointer-events-none transition"
                        >
                          Bind to Catalog Item
                        </button>
                      </div>

                    </div>

                  </div>
                </div>

                {/* Smartphone catalog checklist & editor */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white font-extrabold text-sm flex items-center gap-2">
                      <Layers className="w-4.5 h-4.5 text-milito-green" />
                      <span>Devices Stock Management</span>
                      <span className="text-xs font-mono text-gray-400 font-normal">({config.products.length} models)</span>
                    </h3>
                    
                    {!isAddingNewProduct && (
                      <button
                        onClick={handleStartAddProduct}
                        className="py-2 px-4 bg-milito-green text-black font-extrabold text-xs uppercase tracking-wide rounded-xl hover:brightness-105 transition flex items-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(0,177,79,0.15)]"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Model
                      </button>
                    )}
                  </div>

                  {/* Form to Add / Edit product detail */}
                  {(isEditingProduct || isAddingNewProduct) && (
                    <div className="bg-[#0e0f14] border-2 border-milito-green/20 rounded-2xl p-5 space-y-4 animate-scaleUp">
                      
                      <div className="flex justify-between items-center border-b border-white/[0.04] pb-2.5">
                        <h4 className="text-white font-bold text-xs uppercase flex items-center gap-1.5">
                          <Edit3 className="w-4 h-4 text-milito-green" />
                          {isEditingProduct ? `Editing Catalog Item` : `Introduce New Smartphone Model`}
                        </h4>
                        <button
                          onClick={() => { setIsEditingProduct(false); setIsAddingNewProduct(false); }}
                          className="text-xs text-gray-400 hover:text-white uppercase font-bold"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Main parameters inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 uppercase font-bold">Smartphone Name</label>
                          <input
                            type="text"
                            value={productForm.name}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            className="w-full bg-[#07080a] border border-white/[0.08] p-2 text-xs text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 uppercase font-bold">Brand</label>
                          <select
                            value={productForm.brand}
                            onChange={(e) => setProductForm({ ...productForm, brand: e.target.value as any })}
                            className="w-full bg-[#07080a] border border-white/[0.08] p-2 text-xs text-white focus:outline-none"
                          >
                            <option value="Apple">Apple</option>
                            <option value="Samsung">Samsung</option>
                            <option value="Google">Google</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 uppercase font-bold">Condition Grade</label>
                          <select
                            value={productForm.condition}
                            onChange={(e) => setProductForm({ ...productForm, condition: e.target.value as any })}
                            className="w-full bg-[#07080a] border border-white/[0.08] p-2 text-xs text-white focus:outline-none"
                          >
                            <option value="Brand New">Brand New</option>
                            <option value="Premium UK Used">Premium UK Used</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 uppercase font-bold">Price (₦ NGN)</label>
                          <input
                            type="number"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: parseInt(e.target.value) })}
                            className="w-full bg-[#07080a] border border-white/[0.08] p-2 text-xs text-white font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 uppercase font-bold">Original Cross-out Price (₦)</label>
                          <input
                            type="number"
                            value={productForm.originalPrice}
                            onChange={(e) => setProductForm({ ...productForm, originalPrice: parseInt(e.target.value) })}
                            className="w-full bg-[#07080a] border border-white/[0.08] p-2 text-xs text-white font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 uppercase font-bold">Top Badge Tag (e.g., Best Seller)</label>
                          <input
                            type="text"
                            value={productForm.badge}
                            onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                            className="w-full bg-[#07080a] border border-white/[0.08] p-2 text-xs text-white"
                          />
                        </div>

                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[10px] text-gray-400 uppercase font-bold">Main Image Source URL / Base64 Data String</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={productForm.image}
                              onChange={(e) => setProductForm({ ...productForm, image: e.target.value, gallery: [e.target.value] })}
                              placeholder="Paste URL or generate from base64"
                              className="w-full bg-[#07080a] border border-white/[0.08] p-2 text-xs text-white font-mono text-ellipsis"
                            />
                            <button
                              onClick={() => {
                                if (uploadedBase64) {
                                  setProductForm({ ...productForm, image: uploadedBase64, gallery: [uploadedBase64] });
                                  alert("Applied converted base64 image data to form source!");
                                } else {
                                  alert("No base64 upload available. Please choose a local image file first under 'Media Master Tools'.");
                                }
                              }}
                              className="px-3.5 py-1 bg-white/[0.04] text-xs font-bold text-gray-300 border border-white/10 rounded uppercase"
                            >
                              Insert Base64
                            </button>
                          </div>
                        </div>

                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[10px] text-gray-400 uppercase font-bold">Highlight Descriptive Text</label>
                          <textarea
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            rows={2}
                            className="w-full bg-[#07080a] border border-white/[0.08] p-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      {/* Specs nested details */}
                      <div className="pt-3 border-t border-white/[0.05] space-y-2.5">
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block">Detailed Technical Specifications</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400 uppercase font-bold">Display specs</label>
                            <input
                              type="text"
                              value={productForm.specs?.screen}
                              onChange={(e) => setProductForm({
                                ...productForm,
                                specs: { ...productForm.specs!, screen: e.target.value }
                              })}
                              className="w-full bg-[#07080a] border border-white/[0.08] p-1.5 text-[11px]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400 uppercase font-bold">Camera hardware</label>
                            <input
                              type="text"
                              value={productForm.specs?.camera}
                              onChange={(e) => setProductForm({
                                ...productForm,
                                specs: { ...productForm.specs!, camera: e.target.value }
                              })}
                              className="w-full bg-[#07080a] border border-white/[0.08] p-1.5 text-[11px]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400 uppercase font-bold">CPU Chipset processor</label>
                            <input
                              type="text"
                              value={productForm.specs?.chipset}
                              onChange={(e) => setProductForm({
                                ...productForm,
                                specs: { ...productForm.specs!, chipset: e.target.value }
                              })}
                              className="w-full bg-[#07080a] border border-white/[0.08] p-1.5 text-[11px]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400 uppercase font-bold">Battery health/capacity</label>
                            <input
                              type="text"
                              value={productForm.specs?.batterySize}
                              onChange={(e) => setProductForm({
                                ...productForm,
                                specs: { ...productForm.specs!, batterySize: e.target.value }
                              })}
                              className="w-full bg-[#07080a] border border-white/[0.08] p-1.5 text-[11px]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400 uppercase font-bold">OS Platform version</label>
                            <input
                              type="text"
                              value={productForm.specs?.os}
                              onChange={(e) => setProductForm({
                                ...productForm,
                                specs: { ...productForm.specs!, os: e.target.value }
                              })}
                              className="w-full bg-[#07080a] border border-white/[0.08] p-1.5 text-[11px]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400 uppercase font-bold">Store Warranty</label>
                            <input
                              type="text"
                              value={productForm.specs?.warranty}
                              onChange={(e) => setProductForm({
                                ...productForm,
                                specs: { ...productForm.specs!, warranty: e.target.value }
                              })}
                              className="w-full bg-[#07080a] border border-white/[0.08] p-1.5 text-[11px]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.04]">
                        <button
                          type="button"
                          onClick={() => { setIsEditingProduct(false); setIsAddingNewProduct(false); }}
                          className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl text-xs font-bold text-gray-400"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveProductForm}
                          className="px-5 py-2 bg-gradient-to-r from-milito-green to-emerald-500 text-black font-extrabold text-xs uppercase rounded-xl hover:brightness-110 shadow-lg"
                        >
                          Save Smartphone listing
                        </button>
                      </div>

                    </div>
                  )}

                  {/* Products listings list view */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {config.products.map((p, idx) => (
                      <div
                        key={p.id}
                        onClick={() => handleStartEditProduct(idx)}
                        className={`p-3.5 bg-white/[0.02] border rounded-2xl flex justify-between items-center cursor-pointer transition ${
                          selectedProductIndex === idx
                            ? "border-milito-green/50 bg-milito-green/[0.03] shadow-[0_0_15px_rgba(0,177,79,0.06)]"
                            : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-12 h-12 bg-black rounded-lg overflow-hidden border border-white/[0.06] flex items-center justify-center p-1 font-sans">
                            <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                          </div>
                          <div className="overflow-hidden">
                            <span className="block text-xs font-extrabold text-white truncate max-w-[200px]">{p.name}</span>
                            <span className="text-[10px] text-gray-500 block">
                              ₦{p.price.toLocaleString("en-NG")} • {p.condition}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEditProduct(idx);
                            }}
                            className="p-1.5 bg-white/[0.04] text-gray-400 hover:text-white rounded hover:bg-white/[0.08]"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(idx);
                            }}
                            className="p-1.5 bg-white/[0.04] text-red-500 hover:text-red-400 rounded hover:bg-white/[0.08]"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            )}

            {/* TAB 3: MOTION & MEDIA ENGINE */}
            {activeTab === "motion" && (
              <div className="space-y-6">
                
                {/* Motion details setup */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
                  <h4 className="text-white text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5 border-b border-white/[0.04] pb-2.5">
                    <Sparkles className="w-4.5 h-4.5 text-purple-400 animate-spin" />
                    Interactive Feature / Flagship Media Customizer
                  </h4>

                  <div className="space-y-4.5">
                    
                    {/* Choose switch */}
                    <div className="flex items-center justify-between p-4 bg-[#08090d] border border-white/[0.06] rounded-xl">
                      <div>
                        <span className="block text-white font-extrabold text-xs">Enable Custom Animator Showcase</span>
                        <span className="text-[9px] text-gray-500 block mt-0.5">Toggle to construct base64 animated panels / interactive video streams on the landing page hero.</span>
                      </div>

                      <div className="relative inline-flex items-center cursor-pointer">
                        <button
                          onClick={() => updateAnimationField("useCustomShowcase", !config.animationMedia.useCustomShowcase)}
                          className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-250 border border-white/10 ${
                            config.animationMedia.useCustomShowcase ? "bg-milito-green" : "bg-gray-800"
                          }`}
                        >
                          <div
                            className={`w-5.2 h-5.2 rounded-full bg-black shadow-md transform transition-transform duration-250 ${
                              config.animationMedia.useCustomShowcase ? "translate-x-5.5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Media specifications */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-extrabold uppercase">Media Source Type</label>
                        <div className="flex bg-[#08090d] p-1 border border-white/[0.06] rounded-xl">
                          {(["image", "video"] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => updateAnimationField("type", t)}
                              className={`flex-1 py-1.5 text-xs font-extrabold uppercase rounded-lg transition-all ${
                                config.animationMedia.type === t ? "bg-milito-green text-black" : "text-gray-400 hover:text-white"
                              }`}
                            >
                              {t === "image" ? (
                                <span className="flex items-center justify-center gap-1.5">
                                  <Image className="w-3.5 h-3.5" />
                                  Image Showcase
                                </span>
                              ) : (
                                <span className="flex items-center justify-center gap-1.5">
                                  <Tv className="w-3.5 h-3.5" />
                                  Video Accent
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-extrabold uppercase">Animation Motion Behavior</label>
                        <select
                          value={config.animationMedia.motionPattern}
                          onChange={(e) => updateAnimationField("motionPattern", e.target.value)}
                          className="w-full bg-[#08090d] border border-white/[0.06] rounded-xl p-2.5 text-xs text-white uppercase font-extrabold cursor-pointer focus:outline-none"
                        >
                          <option value="floating">Continuous 3D Floating Stream</option>
                          <option value="parallax">Interactive Parallax tracking</option>
                          <option value="spin">Slow Cinematic Celestial Orbit</option>
                          <option value="pulse">Respiratory Ambient Pulse Scale</option>
                          <option value="bounce">Luxury Gravity bouncing Loop</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-extrabold uppercase block">
                          Media Source Link (Paste high-fidelity picture URL, raw MP4, or YouTube Embed player ID)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={config.animationMedia.url}
                            onChange={(e) => updateAnimationField("url", e.target.value)}
                            placeholder="Supports base64 data, MP4 links, or Unsplash links..."
                            className="w-full bg-[#08090d] border border-white/[0.08] p-2.5 text-xs text-white font-mono"
                          />
                          <button
                            onClick={() => {
                              if (uploadedBase64) {
                                updateAnimationField("url", uploadedBase64);
                                alert("Uploaded base64 media linked to active motion showcase!");
                              } else {
                                alert("Please choose a PC local file under 'Media Master Tools' inside the catalog tab to generate base64 first.");
                              }
                            }}
                            className="px-3.5 py-1 bg-[#12141a] text-xs font-extrabold uppercase border border-white/10 text-gray-400 rounded block hover:bg-[#181a22]"
                          >
                            Load Base64
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase font-extrabold">
                          <span>Animation Duration Speed</span>
                          <span className="text-milito-green">{config.animationMedia.motionSpeed}s loop</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="15"
                          step="1"
                          value={config.animationMedia.motionSpeed}
                          onChange={(e) => updateAnimationField("motionSpeed", parseInt(e.target.value))}
                          className="w-full accent-milito-green bg-[#0f1115] cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-extrabold uppercase">Glow Backdrop Accent</label>
                        <select
                          value={config.animationMedia.ambientColor}
                          onChange={(e) => updateAnimationField("ambientColor", e.target.value)}
                          className="w-full bg-[#08090d] border border-white/[0.06] rounded-xl p-2.5 text-xs text-white"
                        >
                          <option value="green">Classic Milito Green (Green Glow)</option>
                          <option value="emerald">Prism Forest (Emerald Green)</option>
                          <option value="blue">Tesla Cyber Blue</option>
                          <option value="purple">Premium Nebula Twilight (Purple Glow)</option>
                          <option value="gold">Luxury Gold Champagne</option>
                        </select>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Animated Showcase Sandbox Screen Preview panel */}
                <div className="bg-[#0b0c10] border border-white/[0.08] rounded-2xl p-5 space-y-4">
                  <h4 className="text-white text-xs font-bold uppercase flex items-center gap-1.5">
                    <Play className="w-4.5 h-4.5 text-milito-green" />
                    Atmospheric Animation Live Sandbox Simulation
                  </h4>

                  <div className="w-full h-88 bg-[#040404] rounded-2xl border border-white/[0.04] relative overflow-hidden flex items-center justify-center p-6">
                    {/* Shadow ambient glow */}
                    <div className={`absolute w-72 h-72 rounded-full blur-[80px] opacity-20 pointer-events-none ${
                      config.animationMedia.ambientColor === "green" ? "bg-milito-green" :
                      config.animationMedia.ambientColor === "emerald" ? "bg-emerald-500" :
                      config.animationMedia.ambientColor === "blue" ? "bg-sky-500" :
                      config.animationMedia.ambientColor === "purple" ? "bg-purple-500" : "bg-amber-500"
                    }`} />

                    <div className="text-center space-y-4 max-w-sm relative z-10">
                      {config.animationMedia.useCustomShowcase ? (
                        <div className="space-y-5">
                          
                          {/* Live representation display */}
                          <div className="h-44 flex items-center justify-center rounded-xl bg-black border border-white/5 p-2 overflow-hidden shadow-2xl relative select-none">
                            {config.animationMedia.type === "image" ? (
                              <img
                                src={config.animationMedia.url || "/src/assets/images/hero_smartphone_showcase_1782052739867.jpg"}
                                alt="Active visual layout animation"
                                className="max-h-full max-w-full object-contain drop-shadow-[0_15px_30px_rgba(0,177,79,0.22)] rounded"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#111] flex items-center justify-center rounded text-gray-500 text-xs font-mono select-none">
                                {config.animationMedia.url && config.animationMedia.url.includes("youtube.com") ? (
                                  <div className="text-center p-2">
                                    <Tv className="w-7 h-7 mx-auto text-red-500 mb-1" />
                                    <span>YouTube video container stream active</span>
                                  </div>
                                ) : (
                                  <div className="p-3 text-center">
                                    <Play className="w-7 h-7 mx-auto text-[#00B14F] mb-1 animate-pulse" />
                                    <span>HTML5 Custom mp4 player stream active</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div>
                            <span className="block text-white font-extrabold text-xs">Active Interactive showcase successfully configured!</span>
                            <span className="block text-[9px] text-[#00B14F] font-bold font-mono tracking-widest uppercase mt-0.5">
                              {config.animationMedia.motionPattern.toUpperCase()} MOTION PATTERN ACTIVE
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8">
                          <Image className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                          <p className="text-gray-400 text-xs leading-relaxed font-bold">
                            Default High-end 3D Showcase is currently active on the Homepage.
                          </p>
                          <button
                            onClick={() => updateAnimationField("useCustomShowcase", true)}
                            className="mt-3 py-2 px-4 bg-white/[0.04] text-white border border-white/10 rounded-xl text-[10px] font-bold hover:bg-white/[0.08] transition uppercase"
                          >
                            Switch to Custom Media Animator
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Bottom command bar */}
          <div className="px-6 py-4.5 border-t border-white/[0.06] flex justify-between items-center bg-[#07080a]">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-milito-green animate-pulse"></span>
              <span className="text-[10px] text-gray-500 font-mono tracking-wide">STATE PERSISTENCE: READY</span>
            </div>
            
            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-milito-green text-black font-extrabold text-xs uppercase tracking-wide hover:brightness-110 active:scale-98 transition shadow-[0_4px_20px_rgba(0,177,79,0.3)] cursor-pointer"
            >
              Apply & Close Dashboard
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
