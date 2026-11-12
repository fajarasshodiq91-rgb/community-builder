"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ConsultationAnswers,
  CreatorProfileSummary,
  AIRecommendationPayload,
} from "@/lib/discovery/types";
import { CommunityBlueprint } from "@/lib/blueprint/types";
import { PlatformRecommendation } from "@/lib/recommendations/types";
import BlueprintReview from "./BlueprintReview";
import {
  STEPS_CONFIG,
  NICHE_OPTIONS,
  AUDIENCE_TIER_OPTIONS,
  GOAL_OPTIONS,
  ACCESS_MODEL_OPTIONS,
  INTERACTION_PACE_OPTIONS,
  MODERATION_OPTIONS,
  BUDGET_OPTIONS,
  validateStep,
} from "@/lib/discovery/consultation";

const PRIMARY_PLATFORMS = [
  "YouTube",
  "Twitter / X",
  "Newsletter / Substack",
  "TikTok",
  "Instagram",
  "LinkedIn",
  "Podcast",
  "Twitch",
  "Blog / Website",
  "Other",
];

const STORAGE_KEY = "cb_consultation_draft_v1";

const INITIAL_ANSWERS: ConsultationAnswers = {
  communityName: "",
  niche: {
    category: "tech_dev",
    customDescription: "",
  },
  audienceSize: {
    tier: "small",
    primaryPlatform: "YouTube",
  },
  communityGoal: {
    primaryGoal: "peer_learning",
    notes: "",
  },
  accessModel: {
    model: "open_public",
    requiresApproval: false,
    notes: "",
  },
  interactionStyle: {
    pace: "realtime_chat",
    notes: "",
  },
  moderationCapacity: {
    tier: "moderate_solo",
    hasCommunityGuidelines: false,
    notes: "",
  },
  budget: {
    tier: "free_only",
    monetizationPlan: "free_community",
  },
  additionalContext: "",
};

export default function ConsultationWizard() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [answers, setAnswers] = useState<ConsultationAnswers>(INITIAL_ANSWERS);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [summary, setSummary] = useState<CreatorProfileSummary | null>(null);
  const [recommendationPayload, setRecommendationPayload] =
    useState<AIRecommendationPayload | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showPayloadRaw, setShowPayloadRaw] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<{
    blueprint: CommunityBlueprint;
    recommendation: PlatformRecommendation;
  } | null>(null);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState<boolean>(false);

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && parsed.communityName) {
          setAnswers(parsed);
          setDraftNotice(`Loaded saved draft for "${parsed.communityName}"`);
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  // Auto-save draft on answers change
  useEffect(() => {
    try {
      if (answers.communityName || answers.niche.customDescription) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
      }
    } catch {
      // Ignore storage write errors
    }
  }, [answers]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setAnswers(INITIAL_ANSWERS);
    setCurrentStep(1);
    setSummary(null);
    setIsCompleted(false);
    setStepErrors({});
    setApiError(null);
    setDraftNotice(null);
  };

  const totalSteps = STEPS_CONFIG.length;
  const progressPercent = Math.round(
    isCompleted ? 100 : summary ? 90 : ((currentStep - 1) / totalSteps) * 80 + 10
  );

  const handleNextStep = () => {
    setApiError(null);
    const validation = validateStep(currentStep, answers);
    if (!validation.success) {
      setStepErrors(validation.errors);
      return;
    }
    setStepErrors({});

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      generateSummary();
    }
  };

  const handlePreviousStep = () => {
    setApiError(null);
    setStepErrors({});
    if (summary && !isCompleted) {
      setSummary(null);
      setCurrentStep(totalSteps);
      return;
    }
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const jumpToStep = (stepNumber: number) => {
    setSummary(null);
    setIsCompleted(false);
    setStepErrors({});
    setApiError(null);
    setCurrentStep(stepNumber);
  };

  const generateSummary = async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate consultation summary");
      }

      setSummary(data.summary);
      setRecommendationPayload(data.recommendationPayload);
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAndComplete = () => {
    setIsCompleted(true);
  };

  const handleGenerateBlueprint = async () => {
    setIsGeneratingBlueprint(true);
    setApiError(null);
    try {
      const res = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate community blueprint");
      }
      setGeneratedData({
        blueprint: data.blueprint,
        recommendation: data.recommendation,
      });
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "Failed to generate community blueprint"
      );
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  const handleCopyPayload = async () => {
    if (!recommendationPayload) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(recommendationPayload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const currentStepConfig = STEPS_CONFIG.find((s) => s.stepNumber === currentStep) || STEPS_CONFIG[0];

  if (generatedData) {
    return (
      <BlueprintReview
        initialBlueprint={generatedData.blueprint}
        recommendation={generatedData.recommendation}
        onBackToConsultation={() => setGeneratedData(null)}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Top Header & Breadcrumb */}
      <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-400 transition hover:text-white"
        >
          ← Back to Overview
        </Link>
        <div className="flex items-center gap-3">
          {draftNotice && !isCompleted && (
            <button
              onClick={clearDraft}
              className="text-xs text-zinc-500 hover:text-rose-400 underline transition"
            >
              Reset Draft
            </button>
          )}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
            <span>Phase 1</span>
            <span className="text-zinc-600">/</span>
            <span>Community Intelligence</span>
          </div>
        </div>
      </div>

      {/* Draft Notification Pill */}
      {draftNotice && !isCompleted && !summary && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-950/30 px-4 py-2 text-xs text-indigo-200">
          <div className="flex items-center gap-2">
            <span>💾</span>
            <span>{draftNotice} (auto-saved locally)</span>
          </div>
          <button
            onClick={() => setDraftNotice(null)}
            className="text-zinc-400 hover:text-white text-xs ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>
            {isCompleted
              ? "Consultation Completed"
              : summary
              ? "Review & Confirm Summary"
              : `Step ${currentStep} of ${totalSteps} · ${currentStepConfig.title}`}
          </span>
          <span className="font-semibold text-zinc-300">{progressPercent}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-indigo-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Error Banner */}
      {apiError && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-sm text-rose-200">
          <div className="flex items-start gap-3">
            <span className="text-rose-400">⚠️</span>
            <div className="flex-1">
              <p className="font-medium">Could not process consultation</p>
              <p className="mt-1 text-xs text-rose-300/80">{apiError}</p>
            </div>
            <button
              onClick={() => generateSummary()}
              className="rounded-lg bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-200 hover:bg-rose-500/30"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area: Progressive Questions */}
      {!summary && !isCompleted && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-2xl md:p-10">
          {/* Conversational Assistant Card */}
          <div className="mb-8 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
              <span>💡 Consultation Assistant</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">
              {currentStepConfig.question}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">{currentStepConfig.explanation}</p>
          </div>

          {/* Step 1: Identity & Niche */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  What is your community or project called?
                </label>
                <input
                  type="text"
                  value={answers.communityName}
                  onChange={(e) =>
                    setAnswers({ ...answers, communityName: e.target.value })
                  }
                  placeholder="e.g., Pixel Crafters Club, Indie SaaS Builders"
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-indigo-400 focus:outline-none"
                />
                {stepErrors.communityName && (
                  <p className="mt-1.5 text-xs text-rose-400">{stepErrors.communityName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  Select your primary niche:
                </label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {NICHE_OPTIONS.map((opt) => {
                    const isSelected = answers.niche.category === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            niche: {
                              ...answers.niche,
                              category: opt.value as typeof answers.niche.category,
                            },
                          })
                        }
                        className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/10 text-white shadow-sm shadow-indigo-500/20 ring-1 ring-indigo-500/50"
                            : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                        }`}
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{opt.label}</p>
                          <p className="mt-1 text-xs text-zinc-500">{opt.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  Briefly describe your specific topic or craft:
                </label>
                <input
                  type="text"
                  value={answers.niche.customDescription}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      niche: {
                        ...answers.niche,
                        customDescription: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., Solo developers building micro-SaaS with Next.js and AI"
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-indigo-400 focus:outline-none"
                />
                {stepErrors.niche && (
                  <p className="mt-1.5 text-xs text-rose-400">{stepErrors.niche}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Audience & Reach */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  What is your estimated current audience or follower count?
                </label>
                <div className="mt-3 grid gap-3">
                  {AUDIENCE_TIER_OPTIONS.map((opt) => {
                    const isSelected = answers.audienceSize.tier === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            audienceSize: {
                              ...answers.audienceSize,
                              tier: opt.value as typeof answers.audienceSize.tier,
                            },
                          })
                        }
                        className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500/50"
                            : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{opt.label}</p>
                          <p className="mt-0.5 text-xs text-zinc-500">{opt.description}</p>
                        </div>
                        {opt.tag && (
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                            {opt.tag}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  Where does your audience primarily engage with you currently?
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PRIMARY_PLATFORMS.map((platform) => {
                    const isSelected = answers.audienceSize.primaryPlatform === platform;
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            audienceSize: {
                              ...answers.audienceSize,
                              primaryPlatform: platform,
                            },
                          })
                        }
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/20 text-indigo-200"
                            : "border-white/10 bg-black/30 text-zinc-400 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {platform}
                      </button>
                    );
                  })}
                </div>
                {stepErrors.audienceSize && (
                  <p className="mt-1.5 text-xs text-rose-400">{stepErrors.audienceSize}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Goal */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  What is the primary reason people will gather in your community?
                </label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {GOAL_OPTIONS.map((opt) => {
                    const isSelected = answers.communityGoal.primaryGoal === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            communityGoal: {
                              ...answers.communityGoal,
                              primaryGoal: opt.value as typeof answers.communityGoal.primaryGoal,
                            },
                          })
                        }
                        className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500/50"
                            : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                        }`}
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{opt.label}</p>
                          <p className="mt-1 text-xs text-zinc-500">{opt.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {stepErrors.communityGoal && (
                  <p className="mt-1.5 text-xs text-rose-400">{stepErrors.communityGoal}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  Any specific outcomes or rituals you have in mind? (Optional)
                </label>
                <input
                  type="text"
                  value={answers.communityGoal.notes || ""}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      communityGoal: {
                        ...answers.communityGoal,
                        notes: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., Weekly live demo on Fridays, quarterly hackathons, beginner questions channel"
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-indigo-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 4: Access Model & Entry Boundaries */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  How should members gain access to join your community?
                </label>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {ACCESS_MODEL_OPTIONS.map((opt) => {
                    const isSelected = answers.accessModel.model === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            accessModel: {
                              ...answers.accessModel,
                              model: opt.value as typeof answers.accessModel.model,
                            },
                          })
                        }
                        className={`flex flex-col justify-between rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500/50"
                            : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                        }`}
                      >
                        <div>
                          <span className="text-2xl">{opt.icon}</span>
                          <p className="mt-2 text-sm font-medium text-white">{opt.label}</p>
                          <p className="mt-1 text-xs text-zinc-500">{opt.description}</p>
                        </div>
                        {opt.tag && (
                          <span className="mt-3 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                            {opt.tag}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {stepErrors.accessModel && (
                  <p className="mt-1.5 text-xs text-rose-400">{stepErrors.accessModel}</p>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={answers.accessModel.requiresApproval}
                    onChange={(e) =>
                      setAnswers({
                        ...answers,
                        accessModel: {
                          ...answers.accessModel,
                          requiresApproval: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 rounded border-white/20 bg-black text-indigo-500 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      Require onboarding verification before full access
                    </p>
                    <p className="text-xs text-zinc-500">
                      New members land in a welcoming gate channel until they introduce themselves or agree to rules.
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  Any specific access requirements or notes? (Optional)
                </label>
                <input
                  type="text"
                  value={answers.accessModel.notes || ""}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      accessModel: {
                        ...answers.accessModel,
                        notes: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., Must have a GitHub handle or have purchased the course"
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-indigo-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 5: Interaction Style */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  What conversation pace best fits your community style?
                </label>
                <div className="mt-3 grid gap-3">
                  {INTERACTION_PACE_OPTIONS.map((opt) => {
                    const isSelected = answers.interactionStyle.pace === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            interactionStyle: {
                              ...answers.interactionStyle,
                              pace: opt.value as typeof answers.interactionStyle.pace,
                            },
                          })
                        }
                        className={`flex items-center gap-4 rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500/50"
                            : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                        }`}
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{opt.label}</p>
                          <p className="mt-0.5 text-xs text-zinc-500">{opt.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {stepErrors.interactionStyle && (
                  <p className="mt-1.5 text-xs text-rose-400">{stepErrors.interactionStyle}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  Interaction preferences or notes: (Optional)
                </label>
                <input
                  type="text"
                  value={answers.interactionStyle.notes || ""}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      interactionStyle: {
                        ...answers.interactionStyle,
                        notes: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., Members are in different time zones; prefer asynchronous posts over rapid chat."
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-indigo-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 6: Moderation Capacity */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  How much time do you realistically have for moderation & community care?
                </label>
                <div className="mt-3 grid gap-3">
                  {MODERATION_OPTIONS.map((opt) => {
                    const isSelected = answers.moderationCapacity.tier === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            moderationCapacity: {
                              ...answers.moderationCapacity,
                              tier: opt.value as typeof answers.moderationCapacity.tier,
                            },
                          })
                        }
                        className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500/50"
                            : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{opt.label}</p>
                          <p className="mt-0.5 text-xs text-zinc-500">{opt.description}</p>
                        </div>
                        {opt.tag && (
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                            {opt.tag}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {stepErrors.moderationCapacity && (
                  <p className="mt-1.5 text-xs text-rose-400">{stepErrors.moderationCapacity}</p>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={answers.moderationCapacity.hasCommunityGuidelines}
                    onChange={(e) =>
                      setAnswers({
                        ...answers,
                        moderationCapacity: {
                          ...answers.moderationCapacity,
                          hasCommunityGuidelines: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 rounded border-white/20 bg-black text-indigo-500 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      I already have community guidelines or rules drafted
                    </p>
                    <p className="text-xs text-zinc-500">
                      If unchecked, the AI blueprint will generate a starter code of conduct tailored to your niche.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 7: Budget & Monetization */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  What is your budget for community tooling and platform software?
                </label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {BUDGET_OPTIONS.map((opt) => {
                    const isSelected = answers.budget.tier === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            budget: {
                              ...answers.budget,
                              tier: opt.value as typeof answers.budget.tier,
                            },
                          })
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500/50"
                            : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white">{opt.label}</p>
                          <span className="text-[11px] font-semibold text-indigo-300">{opt.tag}</span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">{opt.description}</p>
                      </button>
                    );
                  })}
                </div>
                {stepErrors.budget && (
                  <p className="mt-1.5 text-xs text-rose-400">{stepErrors.budget}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  What is your intended monetization model?
                </label>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {[
                    { value: "free_community", label: "100% Free Community", desc: "No paywall, open to followers" },
                    { value: "freemium_tiers", label: "Freemium Tiers", desc: "Free open spaces + VIP supporter roles" },
                    { value: "paid_membership", label: "Paid Membership Only", desc: "Paywall access to all channels" },
                    { value: "not_sure_yet", label: "Not Sure Yet", desc: "Start free, decide monetization later" },
                  ].map((model) => {
                    const isSelected = answers.budget.monetizationPlan === model.value;
                    return (
                      <button
                        key={model.value}
                        type="button"
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            budget: {
                              ...answers.budget,
                              monetizationPlan: model.value as typeof answers.budget.monetizationPlan,
                            },
                          })
                        }
                        className={`rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/20 text-white ring-1 ring-indigo-500/50"
                            : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <p className="text-xs font-semibold text-zinc-200">{model.label}</p>
                        <p className="mt-0.5 text-[11px] text-zinc-500">{model.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  Any additional context for the AI community planner? (Optional)
                </label>
                <textarea
                  rows={2}
                  value={answers.additionalContext || ""}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      additionalContext: e.target.value,
                    })
                  }
                  placeholder="e.g., We plan to host monthly community hackathons and share exclusive code templates."
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-indigo-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={handlePreviousStep}
              disabled={currentStep === 1 || isLoading}
              className={`rounded-xl px-5 py-2.5 text-sm font-medium transition ${
                currentStep === 1 || isLoading
                  ? "cursor-not-allowed opacity-30 text-zinc-600"
                  : "border border-white/15 text-zinc-300 hover:bg-white/5"
              }`}
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Summarizing...</span>
              ) : currentStep === totalSteps ? (
                <span>Review Needs Summary →</span>
              ) : (
                <span>Continue →</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Summary Review Screen */}
      {summary && !isCompleted && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-2xl md:p-10">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6">
            <div>
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
                Consultation Summary
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                {summary.communityName}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Review your profile before we prepare the AI platform recommendation. You can edit any section.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-xs">
              <span className="text-zinc-500">Suggested Complexity:</span>
              <span className="font-semibold uppercase tracking-wider text-indigo-300">
                {summary.recommendedComplexity}
              </span>
            </div>
          </div>

          {/* Summary Cards Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Niche */}
            <div className="relative rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Niche & Focus
                </span>
                <button
                  onClick={() => jumpToStep(1)}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Edit
                </button>
              </div>
              <p className="mt-3 font-medium text-white">{summary.nicheLabel}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">{summary.nicheDetail}</p>
            </div>

            {/* Card 2: Audience */}
            <div className="relative rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Audience
                </span>
                <button
                  onClick={() => jumpToStep(2)}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Edit
                </button>
              </div>
              <p className="mt-3 font-medium text-white">{summary.audienceLabel}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">{summary.audienceDetail}</p>
            </div>

            {/* Card 3: Goal */}
            <div className="relative rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Primary Goal
                </span>
                <button
                  onClick={() => jumpToStep(3)}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Edit
                </button>
              </div>
              <p className="mt-3 font-medium text-white">{summary.goalLabel}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">{summary.goalDetail || "No additional notes"}</p>
            </div>

            {/* Card 4: Access Model */}
            <div className="relative rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Access & Entry
                </span>
                <button
                  onClick={() => jumpToStep(4)}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Edit
                </button>
              </div>
              <p className="mt-3 font-medium text-white">{summary.accessLabel}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">{summary.accessDetail}</p>
            </div>

            {/* Card 5: Interaction */}
            <div className="relative rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Interaction Style
                </span>
                <button
                  onClick={() => jumpToStep(5)}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Edit
                </button>
              </div>
              <p className="mt-3 font-medium text-white">{summary.interactionLabel}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">{summary.interactionDetail || "Standard chat pacing"}</p>
            </div>

            {/* Card 6: Moderation */}
            <div className="relative rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Moderation
                </span>
                <button
                  onClick={() => jumpToStep(6)}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Edit
                </button>
              </div>
              <p className="mt-3 font-medium text-white">{summary.moderationLabel}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">{summary.moderationDetail}</p>
            </div>

            {/* Card 7: Budget */}
            <div className="relative rounded-2xl border border-white/10 bg-black/30 p-5 sm:col-span-2 lg:col-span-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Budget & Monetization
                </span>
                <button
                  onClick={() => jumpToStep(7)}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Edit
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <p className="font-medium text-white">{summary.budgetLabel}</p>
                <span className="text-xs text-zinc-500">·</span>
                <p className="text-xs text-zinc-400">{summary.budgetDetail}</p>
              </div>
            </div>
          </div>

          {/* Recommended Baseline Spaces preview */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Suggested Initial Spaces ({summary.recommendedInitialSpaces.length})
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {summary.recommendedInitialSpaces.map((space) => (
                <span
                  key={space}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 font-mono"
                >
                  #{space}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              Based on your answers, these spaces will be prioritized in the upcoming blueprint generation.
            </p>
          </div>

          {/* Summary Actions */}
          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={handlePreviousStep}
              className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5"
            >
              ← Back to Questions
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmAndComplete}
                className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5"
              >
                Inspect Data Payload
              </button>
              <button
                type="button"
                onClick={handleGenerateBlueprint}
                disabled={isGeneratingBlueprint}
                className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50 shadow-lg shadow-white/5"
              >
                {isGeneratingBlueprint ? "Generating Blueprint..." : "Confirm Needs & Generate Blueprint →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion & Next Phase Readiness State */}
      {isCompleted && recommendationPayload && (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-950/10 p-6 shadow-2xl md:p-10">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-lg">
              ✓
            </span>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Phase 1 Complete
              </span>
              <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                Community Intelligence Captured
              </h2>
            </div>
          </div>

          <p className="mt-4 text-base leading-7 text-zinc-300">
            Your community discovery profile has been validated and compiled into the canonical data structure required for AI Platform Recommendation.
          </p>

          {/* Product Principle Card */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
              Product Principle in Action
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                <span className="text-xs font-bold text-emerald-300">01. DISCOVER</span>
                <p className="mt-1 text-xs text-zinc-400">Needs collected progressively without overwhelming jargon.</p>
              </div>
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3">
                <span className="text-xs font-bold text-indigo-300">02. PLAN (Next)</span>
                <p className="mt-1 text-xs text-zinc-400">AI proposes the ideal platform and structured blueprint.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="text-xs font-bold text-zinc-400">03. APPROVE & EXECUTE</span>
                <p className="mt-1 text-xs text-zinc-400">You review exact changes before deterministic execution.</p>
              </div>
            </div>
          </div>

          {/* Prepared Data Payload Inspector */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/50 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">Prepared AI Recommendation Data Structure</p>
                <p className="text-xs text-zinc-500">
                  Target: {recommendationPayload.creatorProfile.communityName} · Constraints: {recommendationPayload.promptContext.keyConstraints.length} defined
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 transition"
                >
                  {copied ? "✓ Copied to Clipboard!" : "Copy Payload JSON"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPayloadRaw(!showPayloadRaw)}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 transition"
                >
                  {showPayloadRaw ? "Hide Raw JSON" : "Inspect Raw JSON"}
                </button>
              </div>
            </div>

            {showPayloadRaw && (
              <pre className="mt-4 max-h-80 overflow-auto rounded-xl border border-white/10 bg-black/80 p-4 text-xs font-mono text-zinc-300">
                {JSON.stringify(recommendationPayload, null, 2)}
              </pre>
            )}

            {!showPayloadRaw && (
              <div className="mt-4 space-y-2 text-xs text-zinc-400">
                <p>
                  <strong className="text-zinc-200">Target Profile:</strong> {recommendationPayload.promptContext.targetAudienceProfile}
                </p>
                <div>
                  <strong className="text-zinc-200">Identified Constraints:</strong>
                  <ul className="mt-1 list-disc pl-5 space-y-1 text-zinc-400">
                    {recommendationPayload.promptContext.keyConstraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
                <p>
                  <strong className="text-zinc-200">Candidate Platforms:</strong> {recommendationPayload.promptContext.suggestedPlatformCandidates.join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
            <button
              onClick={() => {
                setIsCompleted(false);
              }}
              className="text-xs text-zinc-400 hover:text-white"
            >
              ← Re-open Summary Review
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={clearDraft}
                className="rounded-xl border border-white/15 px-4 py-2 text-xs text-zinc-300 hover:bg-white/5"
              >
                Start New Consultation
              </button>
              <button
                onClick={handleGenerateBlueprint}
                disabled={isGeneratingBlueprint}
                className="rounded-xl bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
              >
                {isGeneratingBlueprint ? "Generating Blueprint..." : "Proceed to Blueprint Editor →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
