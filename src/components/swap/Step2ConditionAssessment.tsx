import React, { useState } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Battery, 
  Camera, 
  Smartphone, 
  Sliders,
  Check,
  AlertCircle,
  Sparkles,
  Info
} from "lucide-react";
import { SwapDeviceConditionAnswers } from "../../types";
import { 
  calculateSwapValuation, 
  isConditionComplete, 
  formatNaira 
} from "../../utils/swapUtils";

interface Step2ConditionAssessmentProps {
  selectedBrand: string;
  selectedModel: string;
  selectedStorage: string;
  answers: SwapDeviceConditionAnswers;
  onChangeAnswers: (answers: SwapDeviceConditionAnswers) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step2ConditionAssessment({
  selectedBrand,
  selectedModel,
  selectedStorage,
  answers,
  onChangeAnswers,
  onBack,
  onNext,
}: Step2ConditionAssessmentProps) {
  const isApple = selectedBrand.toLowerCase().includes("apple") || selectedModel.toLowerCase().includes("iphone");

  // Validation error state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Calculate valuation only if complete
  const valuation = calculateSwapValuation(
    selectedModel,
    selectedStorage,
    answers,
    selectedBrand
  );

  const isComplete = isConditionComplete(answers, selectedBrand);

  // Update handlers
  const handleUpdateScreen = (val: SwapDeviceConditionAnswers["screen"]) => {
    onChangeAnswers({ ...answers, screen: val });
    setValidationError(null);
  };

  const handleUpdateBody = (val: SwapDeviceConditionAnswers["body"]) => {
    onChangeAnswers({ ...answers, body: val });
    setValidationError(null);
  };

  const handleUpdateCamera = (val: SwapDeviceConditionAnswers["camera"]) => {
    onChangeAnswers({ ...answers, camera: val });
    setValidationError(null);
  };

  const handleUpdateBatteryHealth = (val: number | null) => {
    onChangeAnswers({ ...answers, batteryHealth: val });
    setValidationError(null);
  };

  const handleUpdateBatteryCondition = (val: SwapDeviceConditionAnswers["batteryCondition"]) => {
    onChangeAnswers({ ...answers, batteryCondition: val });
    setValidationError(null);
  };

  const handleToggleFunction = (key: keyof SwapDeviceConditionAnswers["otherFunctions"]) => {
    onChangeAnswers({
      ...answers,
      otherFunctions: {
        ...answers.otherFunctions,
        [key]: !answers.otherFunctions[key],
      },
      checklistReviewed: true,
    });
    setValidationError(null);
  };

  const handleCheckAllFunctions = () => {
    onChangeAnswers({
      ...answers,
      otherFunctions: {
        screenTouch: true,
        cameras: true,
        speakers: true,
        microphone: true,
        chargingPort: true,
        buttons: true,
        wifiBluetooth: true,
        faceOrFingerprint: true,
      },
      checklistReviewed: true,
    });
    setValidationError(null);
  };

  const handleMarkChecklistReviewed = () => {
    onChangeAnswers({
      ...answers,
      checklistReviewed: true,
    });
    setValidationError(null);
  };

  // Validation before proceeding
  const handleProceed = () => {
    if (!answers.screen) {
      setValidationError("Please select an option for Screen / Display Condition to continue.");
      return;
    }
    if (!answers.body) {
      setValidationError("Please select an option for Body & Frame Condition to continue.");
      return;
    }
    if (!answers.camera) {
      setValidationError("Please select your Camera Condition to continue.");
      return;
    }
    if (isApple) {
      if (typeof answers.batteryHealth !== "number" || answers.batteryHealth < 50 || answers.batteryHealth > 100) {
        setValidationError("Please provide your battery health percentage to continue.");
        return;
      }
    } else {
      if (!answers.batteryCondition && (typeof answers.batteryHealth !== "number" || answers.batteryHealth < 50)) {
        setValidationError("Please provide your battery performance or condition to continue.");
        return;
      }
    }
    if (!answers.checklistReviewed) {
      setValidationError("Please complete the functional checklist to continue.");
      return;
    }

    setValidationError(null);
    onNext();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-milito-green/10 border border-milito-green/20 text-milito-green text-xs font-extrabold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          STEP 2: CONDITION ASSESSMENT
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight font-sans">
          Describe Your Device Condition
        </h2>
        <p className="text-gray-600 text-sm sm:text-base font-medium">
          Tell us about the actual condition of your device. Your answers will be used to prepare an estimated trade-in value.
        </p>
      </div>

      {/* Valuation Header Card: ONLY shown when customer has completed answers */}
      {isComplete && valuation.grade ? (
        <div className="bg-gradient-to-r from-gray-950 via-[#1A2025] to-gray-900 text-white p-5 sm:p-7 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden animate-fadeIn">
          <div className="absolute top-0 right-0 w-64 h-64 bg-milito-green/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-milito-green bg-milito-green/10 px-2.5 py-1 rounded-full border border-milito-green/20">
                  Estimated Condition
                </span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                  valuation.grade === "Grade A" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" :
                  valuation.grade === "Grade B" ? "bg-blue-500/20 text-blue-300 border border-blue-400/30" :
                  valuation.grade === "Grade C" ? "bg-amber-500/20 text-amber-300 border border-amber-400/30" :
                  "bg-red-500/20 text-red-300 border border-red-400/30"
                }`}>
                  {valuation.grade}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-sans">
                {selectedModel} ({selectedStorage})
              </h3>
              <p className="text-xs text-gray-300 font-medium max-w-md">
                Estimated based on the information you provided. Final swap credit is subject to physical inspection.
              </p>
            </div>

            {valuation.isValuationSet && valuation.estimatedValue > 0 ? (
              <div className="sm:text-right bg-white/5 border border-white/10 p-3.5 sm:p-4 rounded-2xl sm:min-w-[240px]">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                  Estimated Swap Credit
                </span>
                <span className="text-2xl sm:text-3xl font-black text-milito-green font-sans block mt-0.5">
                  {formatNaira(valuation.estimatedValue)}
                </span>
                {valuation.baseTradeInValue && (
                  <div className="text-[10px] text-gray-400 mt-1 flex flex-col sm:items-end">
                    <span>Base Value: {formatNaira(valuation.baseTradeInValue)}</span>
                    <span className="text-amber-300/90">
                      {valuation.grade} ({valuation.rulePercentage}%): {formatNaira(valuation.conditionAdjustment)}
                    </span>
                  </div>
                )}
                <span className="text-[9px] text-gray-400 block mt-1.5 font-medium">
                  Estimated amount that may be credited toward your selected upgrade based on the information you provided.
                </span>
              </div>
            ) : (
              <div className="sm:text-right bg-amber-950/30 border border-amber-500/30 p-3.5 sm:p-4 rounded-2xl sm:min-w-[240px]">
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-black block">
                  Valuation Not Set
                </span>
                <span className="text-sm font-bold text-amber-200 block mt-1">
                  Admin valuation required before this device can be used for Swap Deals.
                </span>
                <span className="text-[10px] text-gray-400 block mt-1.5">
                  You can proceed to choose an upgrade; our team will appraise your device manually.
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span>
              Please answer the condition questions below. An estimated condition grade and trade-in valuation will be prepared based on your actual responses.
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap hidden sm:inline-block">
            {selectedModel} • {selectedStorage}
          </span>
        </div>
      )}

      {/* Assessment Questions Box */}
      <div className="space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs">
        
        {/* 1. Screen / Display Condition */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-extrabold text-gray-900 uppercase tracking-widest">
            <Smartphone className="w-4 h-4 text-milito-green" />
            1. Screen / Display Condition
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: "flawless", label: "No cracks or major damage", desc: "Display is intact with zero cracks or lines" },
              { id: "minor_scratches", label: "Minor scratches", desc: "Faint micro-scratches barely noticeable when screen is lit" },
              { id: "visible_scratches", label: "Visible scratches", desc: "Clear scratches across front glass, display works" },
              { id: "cracked", label: "Cracked or damaged", desc: "Cracked glass, black ink spots, lines, or touch malfunction" },
            ].map((opt) => {
              const isSelected = answers.screen === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleUpdateScreen(opt.id as any)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? "bg-emerald-50/60 border-milito-green ring-2 ring-milito-green/20"
                      : "bg-white border-gray-200 hover:border-gray-350 hover:bg-gray-50/60 text-gray-800"
                  }`}
                >
                  <div>
                    <h4 className={`text-xs sm:text-sm font-bold ${isSelected ? "text-gray-950 font-extrabold" : "text-gray-800"}`}>
                      {opt.label}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected ? "bg-milito-green border-milito-green text-black" : "border-gray-300"
                  }`}>
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Body & Frame Condition */}
        <div className="space-y-3 pt-6 border-t border-gray-150">
          <label className="flex items-center gap-2 text-xs font-extrabold text-gray-900 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-milito-green" />
            2. Body & Frame Condition
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: "flawless", label: "Excellent / minimal signs of use", desc: "Clean body without notable marks, dents or scratches" },
              { id: "minor_scuffs", label: "Minor signs of use", desc: "Faint rub marks around corners or sides from normal case usage" },
              { id: "visible_dents", label: "Visible scratches or dents", desc: "Noticeable scratches, paint chips, or small edge dents" },
              { id: "damaged", label: "Heavy damage", desc: "Cracked back glass, bent frame, or deep body dents" },
            ].map((opt) => {
              const isSelected = answers.body === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleUpdateBody(opt.id as any)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? "bg-emerald-50/60 border-milito-green ring-2 ring-milito-green/20"
                      : "bg-white border-gray-200 hover:border-gray-350 hover:bg-gray-50/60 text-gray-800"
                  }`}
                >
                  <div>
                    <h4 className={`text-xs sm:text-sm font-bold ${isSelected ? "text-gray-950 font-extrabold" : "text-gray-800"}`}>
                      {opt.label}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected ? "bg-milito-green border-milito-green text-black" : "border-gray-300"
                  }`}>
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Camera Condition */}
        <div className="space-y-3 pt-6 border-t border-gray-150">
          <label className="flex items-center gap-2 text-xs font-extrabold text-gray-900 uppercase tracking-widest">
            <Camera className="w-4 h-4 text-milito-green" />
            3. Camera & Lenses
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "working", label: "Crystal clear / fully working", desc: "All lenses crisp, 0.5x, 1x, 3x/5x zoom working" },
              { id: "minor_issue", label: "Minor focus or lens issue", desc: "Slight blur, slow autofocus, or dust speck" },
              { id: "faulty", label: "Cracked lens or faulty camera", desc: "Cracked camera glass, black screen or camera failure" },
            ].map((opt) => {
              const isSelected = answers.camera === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleUpdateCamera(opt.id as any)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-emerald-50/60 border-milito-green ring-2 ring-milito-green/20"
                      : "bg-white border-gray-200 hover:border-gray-350 hover:bg-gray-50/60 text-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-xs sm:text-sm font-bold ${isSelected ? "text-gray-950 font-extrabold" : "text-gray-800"}`}>
                      {opt.label}
                    </h4>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "bg-milito-green border-milito-green text-black" : "border-gray-300"
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Battery Health / Condition — ADAPTIVE BASED ON DEVICE */}
        <div className="space-y-3 pt-6 border-t border-gray-150">
          {isApple ? (
            /* Apple iPhone Battery Health Percentage */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="flex items-center gap-2 text-xs font-extrabold text-gray-900 uppercase tracking-widest">
                    <Battery className="w-4 h-4 text-milito-green" />
                    4. Battery Health
                  </label>
                  <span className="text-[11px] text-gray-500 font-medium">
                    Enter or select your iPhone's Battery Health Percentage (Settings &gt; Battery &gt; Battery Health)
                  </span>
                </div>
                {typeof answers.batteryHealth === "number" && (
                  <span className="text-sm font-black text-gray-950 bg-emerald-50 text-emerald-950 px-3 py-1 rounded-xl border border-emerald-200">
                    {answers.batteryHealth}%
                  </span>
                )}
              </div>

              <div className="bg-gray-50/70 p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-700">Enter percentage:</span>
                  <div className="relative w-28">
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={typeof answers.batteryHealth === "number" ? answers.batteryHealth : ""}
                      onChange={(e) => {
                        const val = e.target.value ? parseInt(e.target.value, 10) : null;
                        handleUpdateBatteryHealth(val);
                      }}
                      placeholder="e.g. 88"
                      className="w-full px-3 py-2 pr-7 bg-white border border-gray-300 rounded-xl text-xs font-black text-gray-950 focus:outline-none focus:border-milito-green focus:ring-2 focus:ring-milito-green/20"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      %
                    </span>
                  </div>
                </div>

                {/* Quick Selection Presets */}
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-[11px] font-bold text-gray-500 block mb-2">Or select a range:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "100% (Brand New / Pristine)", val: 100 },
                      { label: "90–95% (Great Health)", val: 92 },
                      { label: "85–89% (Good Health)", val: 86 },
                      { label: "80–84% (Fair Health)", val: 82 },
                      { label: "Below 80% (Service Recommended)", val: 76 },
                    ].map((preset) => {
                      const isSelected = answers.batteryHealth === preset.val;
                      return (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => handleUpdateBatteryHealth(preset.val)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-milito-green text-black font-black shadow-xs ring-2 ring-milito-green/20"
                              : "bg-white text-gray-700 border border-gray-250 hover:bg-gray-100 hover:border-gray-350"
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Android / Other Brands Battery Condition */
            <div className="space-y-3">
              <div>
                <label className="flex items-center gap-2 text-xs font-extrabold text-gray-900 uppercase tracking-widest">
                  <Battery className="w-4 h-4 text-milito-green" />
                  4. Battery Condition
                </label>
                <span className="text-[11px] text-gray-500 font-medium">
                  How would you describe the battery performance?
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "excellent", label: "Excellent", desc: "Holds charge exceptionally well, easily lasts full day of active use" },
                  { id: "good", label: "Good", desc: "Standard healthy battery life with normal daily screen time" },
                  { id: "fair", label: "Fair", desc: "Noticeable battery drain, requires charging during the day" },
                  { id: "poor", label: "Poor", desc: "Drains very quickly, shuts down unexpectedly or needs replacement" },
                ].map((opt) => {
                  const isSelected = answers.batteryCondition === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleUpdateBatteryCondition(opt.id as any)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? "bg-emerald-50/60 border-milito-green ring-2 ring-milito-green/20"
                          : "bg-white border-gray-200 hover:border-gray-350 hover:bg-gray-50/60 text-gray-800"
                      }`}
                    >
                      <div>
                        <h4 className={`text-xs sm:text-sm font-bold ${isSelected ? "text-gray-950 font-extrabold" : "text-gray-800"}`}>
                          {opt.label}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? "bg-milito-green border-milito-green text-black" : "border-gray-300"
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 5. Functional Checklist */}
        <div className="space-y-3 pt-6 border-t border-gray-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="flex items-center gap-2 text-xs font-extrabold text-gray-900 uppercase tracking-widest">
                <Sliders className="w-4 h-4 text-milito-green" />
                5. Functional Checklist
              </label>
              <span className="text-[11px] text-gray-500 font-medium">
                Check the features that are currently working:
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheckAllFunctions}
              className="text-xs font-extrabold text-milito-green hover:underline cursor-pointer self-start sm:self-auto py-1"
            >
              ✓ Select All Working Features
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {[
              { key: "screenTouch" as const, label: "Screen / Touch" },
              { key: "cameras" as const, label: "Cameras" },
              { key: "speakers" as const, label: "Speakers" },
              { key: "microphone" as const, label: "Microphone" },
              { key: "chargingPort" as const, label: "Charging Port" },
              { key: "buttons" as const, label: "Buttons" },
              { key: "wifiBluetooth" as const, label: "Wi-Fi & Bluetooth" },
              { 
                key: "faceOrFingerprint" as const, 
                label: isApple ? "Face ID / Touch ID" : "Fingerprint / Face Unlock" 
              },
            ].map(({ key, label }) => {
              const isChecked = answers.otherFunctions?.[key] || false;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleToggleFunction(key)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isChecked
                      ? "bg-emerald-50/60 border-emerald-300 text-gray-950 font-bold"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-xs">{label}</span>
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${
                    isChecked
                      ? "bg-milito-green border-milito-green text-black"
                      : "bg-white border-gray-300"
                  }`}>
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explicit Confirmation action */}
          {!answers.checklistReviewed && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleMarkChecklistReviewed}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <span>Confirm selected working features</span>
              </button>
            </div>
          )}
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-3.5 border border-gray-300 hover:bg-gray-100 text-gray-800 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Device Model</span>
        </button>

        <button
          type="button"
          onClick={handleProceed}
          className="w-full sm:w-auto px-8 py-3.5 bg-milito-green hover:brightness-105 active:scale-98 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>See Upgrade Options</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
