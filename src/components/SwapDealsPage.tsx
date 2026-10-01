import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { 
  ArrowLeft, 
  ArrowLeftRight, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  HelpCircle,
  Smartphone,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  Clock,
  Check
} from "lucide-react";
import { Product, SwapDeviceConditionAnswers, SwapRequest } from "../types";
import { SAMPLE_PRODUCTS } from "../data";
import { calculateSwapValuation, formatNaira } from "../utils/swapUtils";
import {
  saveSwapDraft,
  getStoredSwapDraft,
  clearSwapDraft,
  hasActiveSwapDraft,
  SwapDraftState,
  PERSISTENCE_EVENTS
} from "../utils/userProgressPersistence";

// Modular Swap Components
import SwapProgressBar, { SwapStepNumber } from "./swap/SwapProgressBar";
import Step1DeviceSelection from "./swap/Step1DeviceSelection";
import Step2ConditionAssessment from "./swap/Step2ConditionAssessment";
import Step3UpgradeSelection from "./swap/Step3UpgradeSelection";
import Step4SubmitRequest from "./swap/Step4SubmitRequest";
import SwapSuccessView from "./swap/SwapSuccessView";
import SwapTrackerModal from "./swap/SwapTrackerModal";

interface SwapDealsPageProps {
  onBack: () => void;
  products?: Product[];
  initialTargetProduct?: Product | null;
  onClearTargetProduct?: () => void;
}

const INITIAL_UNSELECTED_CONDITION_ANSWERS: SwapDeviceConditionAnswers = {
  screen: "" as any,
  body: "" as any,
  camera: "" as any,
  batteryHealth: null,
  batteryCondition: "" as any,
  otherFunctions: {
    screenTouch: false,
    cameras: false,
    speakers: false,
    microphone: false,
    chargingPort: false,
    buttons: false,
    wifiBluetooth: false,
    faceOrFingerprint: false,
  },
  checklistReviewed: false,
};

export default function SwapDealsPage({
  onBack,
  products = SAMPLE_PRODUCTS,
  initialTargetProduct = null,
  onClearTargetProduct,
}: SwapDealsPageProps) {
  // Available Upgrade Catalog
  const availableTargetProducts = useMemo(() => {
    if (products && products.length > 0) {
      const phoneOnly = products.filter(p => (p.productType || "phone") !== "vehicle");
      if (phoneOnly.length > 0) return phoneOnly;
    }
    return SAMPLE_PRODUCTS;
  }, [products]);

  // Load existing draft from persistence on initialization
  const initialDraft = useMemo(() => getStoredSwapDraft(), []);

  // Step navigation: 1 (Device), 2 (Condition), 3 (Upgrade), 4 (Submit)
  const [currentStep, setCurrentStep] = useState<SwapStepNumber>(() => {
    if (initialDraft?.currentStep) return initialDraft.currentStep;
    return 1;
  });

  const [maxReachedStep, setMaxReachedStep] = useState<SwapStepNumber>(() => {
    if (initialDraft?.maxReachedStep) return initialDraft.maxReachedStep;
    if (initialTargetProduct) return 3;
    return 1;
  });

  // Current Device States
  const [selectedBrand, setSelectedBrand] = useState<string>(() => {
    return initialDraft?.selectedBrand || "";
  });

  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return initialDraft?.selectedModel || "";
  });

  const [selectedStorage, setSelectedStorage] = useState<string>(() => {
    return initialDraft?.selectedStorage || "";
  });

  const [conditionAnswers, setConditionAnswers] = useState<SwapDeviceConditionAnswers>(() => {
    if (initialDraft?.conditionAnswers && Object.keys(initialDraft.conditionAnswers).length > 0) {
      return {
        ...INITIAL_UNSELECTED_CONDITION_ANSWERS,
        ...initialDraft.conditionAnswers,
        otherFunctions: {
          ...INITIAL_UNSELECTED_CONDITION_ANSWERS.otherFunctions,
          ...(initialDraft.conditionAnswers.otherFunctions || {}),
        },
      };
    }
    return INITIAL_UNSELECTED_CONDITION_ANSWERS;
  });

  // Target Upgrade Product State with live catalog resolution
  const [selectedTargetProduct, setSelectedTargetProduct] = useState<Product | null>(() => {
    if (initialTargetProduct) return initialTargetProduct;

    if (initialDraft?.selectedTargetProductId) {
      const foundInCatalog = availableTargetProducts.find(
        (p) => p.id === initialDraft.selectedTargetProductId
      );
      if (foundInCatalog) return foundInCatalog;
    }

    if (initialDraft?.selectedTargetProductSnapshot) {
      return initialDraft.selectedTargetProductSnapshot as Product;
    }

    return null;
  });

  // Target product availability warning (if product became out of stock while away)
  const [targetProductNotice, setTargetProductNotice] = useState<string | null>(null);

  // Submitted Swap State
  const [submittedRequest, setSubmittedRequest] = useState<SwapRequest | null>(() => {
    return initialDraft?.submittedRequest || null;
  });

  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [trackingSwapId, setTrackingSwapId] = useState("");

  // Start Over Confirmation Modal
  const [isStartOverModalOpen, setIsStartOverModalOpen] = useState(false);

  // Saved Draft Banner / Indicator
  const [isDraftRestored, setIsDraftRestored] = useState<boolean>(() => {
    return Boolean(initialDraft && (initialDraft.selectedBrand || initialDraft.currentStep > 1));
  });

  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number | null>(() => {
    return initialDraft?.updatedAt || null;
  });

  // Synchronize target product with live catalogue whenever catalogue changes
  useEffect(() => {
    if (!selectedTargetProduct) return;

    const liveMatch = availableTargetProducts.find((p) => p.id === selectedTargetProduct.id);
    if (liveMatch) {
      // Check if price changed
      if (liveMatch.price !== selectedTargetProduct.price) {
        setTargetProductNotice(
          `Catalogue price for ${liveMatch.name} has been updated to ${formatNaira(liveMatch.price)}.`
        );
      }

      // Check if stock became unavailable
      if (
        liveMatch.availability === "Sold Out" ||
        (typeof liveMatch.stockQuantity === "number" && liveMatch.stockQuantity <= 0)
      ) {
        setTargetProductNotice(
          `Your selected upgrade (${liveMatch.name}) is currently unavailable / sold out. Please choose an available phone from the catalogue.`
        );
      }

      // Automatically sync to live product reference without resetting form
      setSelectedTargetProduct(liveMatch);
    }
  }, [availableTargetProducts]);

  // Handle incoming direct swap target product
  useEffect(() => {
    if (initialTargetProduct) {
      setSelectedTargetProduct(initialTargetProduct);
      setMaxReachedStep((prev) => Math.max(prev, 3) as SwapStepNumber);
      saveSwapDraft(
        {
          selectedTargetProductId: initialTargetProduct.id,
          selectedTargetProductSnapshot: {
            id: initialTargetProduct.id,
            name: initialTargetProduct.name,
            brand: initialTargetProduct.brand,
            price: initialTargetProduct.price,
            condition: initialTargetProduct.condition,
            image: initialTargetProduct.image,
          },
        },
        true
      );
    }
  }, [initialTargetProduct]);

  // Continuous Auto-Save to Persistent Storage on meaningful user progress
  useEffect(() => {
    if (submittedRequest) return; // do not save active draft if request was completed

    const hasAnyProgress = Boolean(
      selectedBrand ||
      selectedModel ||
      selectedStorage ||
      currentStep > 1 ||
      selectedTargetProduct ||
      conditionAnswers.screen ||
      conditionAnswers.body
    );

    if (hasAnyProgress) {
      saveSwapDraft({
        currentStep,
        maxReachedStep,
        selectedBrand,
        selectedModel,
        selectedStorage,
        conditionAnswers,
        selectedTargetProductId: selectedTargetProduct?.id || null,
        selectedTargetProductSnapshot: selectedTargetProduct
          ? {
              id: selectedTargetProduct.id,
              name: selectedTargetProduct.name,
              brand: selectedTargetProduct.brand,
              price: selectedTargetProduct.price,
              condition: selectedTargetProduct.condition,
              image: selectedTargetProduct.image,
            }
          : null,
      });
      setLastSavedTimestamp(Date.now());
    }
  }, [
    currentStep,
    maxReachedStep,
    selectedBrand,
    selectedModel,
    selectedStorage,
    conditionAnswers,
    selectedTargetProduct,
    submittedRequest,
  ]);

  // Multi-tab sync listener
  useEffect(() => {
    const handleDraftUpdated = (e: any) => {
      const draft = e.detail as SwapDraftState | null;
      if (draft && !submittedRequest) {
        if (draft.selectedBrand && draft.selectedBrand !== selectedBrand) setSelectedBrand(draft.selectedBrand);
        if (draft.selectedModel && draft.selectedModel !== selectedModel) setSelectedModel(draft.selectedModel);
        if (draft.selectedStorage && draft.selectedStorage !== selectedStorage) setSelectedStorage(draft.selectedStorage);
        if (draft.currentStep && draft.currentStep !== currentStep) setCurrentStep(draft.currentStep);
        if (draft.maxReachedStep && draft.maxReachedStep !== maxReachedStep) setMaxReachedStep(draft.maxReachedStep);
        setLastSavedTimestamp(draft.updatedAt);
      }
    };

    window.addEventListener(PERSISTENCE_EVENTS.SWAP_DRAFT_UPDATED, handleDraftUpdated);
    return () => {
      window.removeEventListener(PERSISTENCE_EVENTS.SWAP_DRAFT_UPDATED, handleDraftUpdated);
    };
  }, [selectedBrand, selectedModel, selectedStorage, currentStep, maxReachedStep, submittedRequest]);

  // Valuation calculation for current device
  const currentValuation = useMemo(() => {
    return calculateSwapValuation(selectedModel, selectedStorage, conditionAnswers, selectedBrand);
  }, [selectedModel, selectedStorage, conditionAnswers, selectedBrand]);

  // Navigation handlers
  const goToStep = (step: SwapStepNumber) => {
    if (step === 4 && !selectedTargetProduct) {
      setCurrentStep(3);
      window.scrollTo({ top: 120, behavior: "smooth" });
      return;
    }
    setCurrentStep(step);
    setMaxReachedStep((prev) => Math.max(prev, step) as SwapStepNumber);
    saveSwapDraft({ currentStep: step, maxReachedStep: Math.max(maxReachedStep, step) as SwapStepNumber }, true);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  // Start Over with complete confirmation
  const handleConfirmStartOver = () => {
    clearSwapDraft();
    setSubmittedRequest(null);
    setCurrentStep(1);
    setMaxReachedStep(1);
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedStorage("");
    setConditionAnswers(INITIAL_UNSELECTED_CONDITION_ANSWERS);
    setSelectedTargetProduct(null);
    setTargetProductNotice(null);
    setIsDraftRestored(false);
    setIsStartOverModalOpen(false);
    if (onClearTargetProduct) onClearTargetProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartNewSwap = () => {
    clearSwapDraft();
    setSubmittedRequest(null);
    setCurrentStep(1);
    setMaxReachedStep(1);
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedStorage("");
    setConditionAnswers(INITIAL_UNSELECTED_CONDITION_ANSWERS);
    setSelectedTargetProduct(null);
    setTargetProductNotice(null);
    setIsDraftRestored(false);
    if (onClearTargetProduct) onClearTargetProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenTracker = (id?: string) => {
    if (id) setTrackingSwapId(id);
    setIsTrackerOpen(true);
  };

  const hasAnyEnteredData = Boolean(
    selectedBrand ||
    selectedModel ||
    selectedStorage ||
    currentStep > 1 ||
    conditionAnswers.screen ||
    conditionAnswers.body
  );

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-950 pb-28 animate-fadeIn">
      
      {/* 1. Header Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gray-700 hover:text-black py-2 px-3 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-milito-green" />
            <span>Back to Store</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Start Over Button (Visible when user has entered progress) */}
            {hasAnyEnteredData && !submittedRequest && (
              <button
                type="button"
                onClick={() => setIsStartOverModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 py-2 px-3 rounded-xl transition cursor-pointer"
                title="Clear current Swap form and start fresh"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Start Over</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleOpenTracker()}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-gray-800 hover:text-black bg-gray-100 hover:bg-gray-200 py-2 px-3.5 rounded-xl transition cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-milito-green" />
              <span>Track Swap</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Page Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 text-center space-y-3">
        {/* Small premium label with persistent draft indicator */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-milito-green/10 border border-milito-green/20 text-milito-green text-xs font-black tracking-widest uppercase">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>↔ SWAP DEALS</span>
          </div>

          {isDraftRestored && !submittedRequest && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Progress Restored</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-950 tracking-tight font-sans">
          Swap Your Phone. Upgrade Your Device.
        </h1>

        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
          Tell us what you have, and we'll show you what you could upgrade to. Transparent valuations, direct catalogue upgrades, and hassle-free physical appraisals.
        </p>

        {/* Dynamic target product warning or confirmation */}
        {targetProductNotice && !submittedRequest && (
          <div className="max-w-xl mx-auto bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs font-semibold text-amber-900 flex items-center gap-2.5 text-left mt-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{targetProductNotice}</span>
          </div>
        )}

        {initialTargetProduct && !submittedRequest && !targetProductNotice && (
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-xs font-bold text-emerald-900 mt-2">
            <Sparkles className="w-4 h-4 text-milito-green" />
            <span>Upgrading to: <strong>{initialTargetProduct.name}</strong></span>
          </div>
        )}
      </div>

      {/* 3. Main Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* If a request was just submitted, show confirmation view */}
        {submittedRequest ? (
          <SwapSuccessView
            request={submittedRequest}
            onTrackSwap={(id) => handleOpenTracker(id)}
            onStartNewSwap={handleStartNewSwap}
            onBackToShop={onBack}
          />
        ) : (
          <>
            {/* Step Progress Bar */}
            <SwapProgressBar
              currentStep={currentStep}
              maxReachedStep={maxReachedStep}
              onStepClick={goToStep}
            />

            {/* Step 1: Device Selection */}
            {currentStep === 1 && (
              <Step1DeviceSelection
                selectedBrand={selectedBrand}
                onSelectBrand={setSelectedBrand}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                selectedStorage={selectedStorage}
                onSelectStorage={setSelectedStorage}
                onNext={() => goToStep(2)}
              />
            )}

            {/* Step 2: Condition Assessment */}
            {currentStep === 2 && (
              <Step2ConditionAssessment
                selectedBrand={selectedBrand}
                selectedModel={selectedModel}
                selectedStorage={selectedStorage}
                answers={conditionAnswers}
                onChangeAnswers={setConditionAnswers}
                onBack={() => goToStep(1)}
                onNext={() => goToStep(3)}
              />
            )}

            {/* Step 3: Upgrade Selection */}
            {currentStep === 3 && (
              <Step3UpgradeSelection
                currentModel={selectedModel}
                currentStorage={selectedStorage}
                currentEstimatedGrade={currentValuation.grade || "Grade B"}
                currentEstimatedValue={currentValuation.estimatedValue}
                availableProducts={availableTargetProducts}
                selectedTargetProduct={selectedTargetProduct}
                onSelectTargetProduct={setSelectedTargetProduct}
                onBack={() => goToStep(2)}
                onNext={() => goToStep(4)}
              />
            )}

            {/* Step 4: Submit Swap Request */}
            {currentStep === 4 && selectedTargetProduct && (
              <Step4SubmitRequest
                currentBrand={selectedBrand}
                currentModel={selectedModel}
                currentStorage={selectedStorage}
                answers={conditionAnswers}
                targetProduct={selectedTargetProduct}
                onBack={() => goToStep(3)}
                onSubmitSuccess={(newReq) => {
                  setSubmittedRequest(newReq);
                  clearSwapDraft(); // safely clear draft upon successful submission
                }}
              />
            )}
          </>
        )}

      </main>

      {/* 4. Swap Tracker Modal */}
      <SwapTrackerModal
        isOpen={isTrackerOpen}
        initialSwapId={trackingSwapId}
        onClose={() => {
          setIsTrackerOpen(false);
          setTrackingSwapId("");
        }}
      />

      {/* 5. Start Over Confirmation Modal */}
      {isStartOverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-5 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-gray-950 font-sans">
                Start Over Swap Appraisal?
              </h3>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">
                Are you sure you want to start over? Your current Swap device selections and condition answers will be cleared.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsStartOverModalOpen(false)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStartOver}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs transition shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
