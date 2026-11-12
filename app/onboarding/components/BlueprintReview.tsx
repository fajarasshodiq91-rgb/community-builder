"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CommunityBlueprint, CommunityBlueprintSchema } from "@/lib/blueprint/types";
import { PlatformRecommendation } from "@/lib/recommendations/types";
import { ApprovalSnapshot, ChangePreview } from "@/lib/approvals/types";
import ExecutionPreview from "./ExecutionPreview";

interface BlueprintReviewProps {
  initialBlueprint: CommunityBlueprint;
  recommendation: PlatformRecommendation;
  onBackToConsultation: () => void;
}

export default function BlueprintReview({
  initialBlueprint,
  recommendation,
  onBackToConsultation,
}: BlueprintReviewProps) {
  const [blueprint, setBlueprint] = useState<CommunityBlueprint>(initialBlueprint);
  const [activeTab, setActiveTab] = useState<"spaces" | "roles" | "onboarding" | "tradeoffs">("spaces");
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [newChannelCatIndex, setNewChannelCatIndex] = useState<number | null>(null);
  const [newChannelName, setNewChannelName] = useState<string>("");
  const [newChannelPurpose, setNewChannelPurpose] = useState<string>("");
  const [newChannelKind, setNewChannelKind] = useState<"text" | "voice" | "announcement" | "forum">("text");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAddChannel = (catIndex: number) => {
    if (!newChannelName.trim()) return;

    const formattedName = newChannelName.toLowerCase().trim().replace(/\s+/g, "-");
    const updatedCategories = [...blueprint.categories];
    updatedCategories[catIndex] = {
      ...updatedCategories[catIndex],
      channels: [
        ...updatedCategories[catIndex].channels,
        {
          name: formattedName,
          purpose: newChannelPurpose.trim() || `Channel for ${formattedName}`,
          kind: newChannelKind,
        },
      ],
    };

    const updatedBlueprint = {
      ...blueprint,
      categories: updatedCategories,
    };

    const check = CommunityBlueprintSchema.safeParse(updatedBlueprint);
    if (!check.success) {
      setValidationError("Failed to add channel: " + check.error.issues[0]?.message);
      return;
    }

    setBlueprint(check.data);
    setNewChannelName("");
    setNewChannelPurpose("");
    setNewChannelCatIndex(null);
    setValidationError(null);
  };

  const handleDeleteChannel = (catIndex: number, channelIndex: number) => {
    const updatedCategories = [...blueprint.categories];
    const newChannels = [...updatedCategories[catIndex].channels];
    newChannels.splice(channelIndex, 1);
    updatedCategories[catIndex] = {
      ...updatedCategories[catIndex],
      channels: newChannels,
    };

    const updatedBlueprint = {
      ...blueprint,
      categories: updatedCategories,
    };

    const check = CommunityBlueprintSchema.safeParse(updatedBlueprint);
    if (!check.success) {
      setValidationError("Cannot delete channel: " + check.error.issues[0]?.message);
      return;
    }

    setBlueprint(check.data);
    setValidationError(null);
  };

  const [approvalData, setApprovalData] = useState<{
    snapshot: ApprovalSnapshot;
    preview: ChangePreview;
  } | null>(null);
  const [isApproving, setIsApproving] = useState<boolean>(false);

  const handleApproveBlueprint = async () => {
    setIsApproving(true);
    setValidationError(null);
    try {
      const res = await fetch("/api/approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprint }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create approval snapshot");
      }
      setApprovalData({
        snapshot: data.snapshot,
        preview: data.preview,
      });
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : "Approval failed"
      );
    } finally {
      setIsApproving(false);
    }
  };

  const totalChannelsCount = blueprint.categories.reduce(
    (acc, cat) => acc + cat.channels.length,
    0
  );

  if (approvalData) {
    return (
      <ExecutionPreview
        snapshot={approvalData.snapshot}
        preview={approvalData.preview}
        onBackToBlueprint={() => setApprovalData(null)}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Top Header */}
      <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
        <button
          onClick={onBackToConsultation}
          className="text-sm font-medium text-zinc-400 transition hover:text-white"
        >
          ← Back to Discovery Consultation
        </button>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
          <span>Phase 2 & 3</span>
          <span className="text-zinc-600">/</span>
          <span>Recommendation & Blueprint</span>
        </div>
      </div>

      {/* Approval Confirmation Banner */}
      {isApproved ? (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-2xl font-bold">
              ✓
            </span>
            <div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                Blueprint Approved
              </span>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                Ready for Platform Connection (Discord)
              </h2>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-zinc-300">
            You have approved this community structure. Under our core product principle,{" "}
            <strong className="text-white">no changes will be applied to any server</strong> until you connect your Discord account, select your target server, and confirm the exact change diff.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Approved Blueprint Snapshot
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-4 text-xs">
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <span className="text-zinc-500">Platform:</span>
                <p className="mt-1 font-semibold uppercase text-indigo-300">{blueprint.recommendedPlatform}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <span className="text-zinc-500">Categories:</span>
                <p className="mt-1 font-semibold text-white">{blueprint.categories.length}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <span className="text-zinc-500">Total Spaces:</span>
                <p className="mt-1 font-semibold text-white">{totalChannelsCount} channels</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <span className="text-zinc-500">Roles Configured:</span>
                <p className="mt-1 font-semibold text-white">{blueprint.roles.length} roles</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
            <button
              onClick={() => setIsApproved(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              ← Edit Blueprint Again
            </button>
            <div className="flex gap-3">
              <Link
                href="/"
                className="rounded-xl border border-white/15 px-4 py-2 text-xs text-zinc-300 hover:bg-white/5"
              >
                Return to Home
              </Link>
              <button
                disabled
                className="rounded-xl bg-indigo-600/40 px-5 py-2 text-xs font-semibold text-indigo-200 cursor-not-allowed"
                title="Discord Adapter is the next milestone (Phase 5)"
              >
                Connect Discord (Phase 5 Foundation)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Recommendation Card */}
          <div className="rounded-3xl border border-indigo-500/20 bg-indigo-950/20 p-6 md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-indigo-500/20 pb-5">
              <div>
                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200 border border-indigo-500/30">
                  AI Platform Recommendation
                </span>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
                  {recommendation.headline}
                </h1>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/30 bg-black/40 px-5 py-3">
                <div>
                  <p className="text-[11px] font-medium text-zinc-400">Platform Fit Score</p>
                  <p className="text-2xl font-bold text-indigo-400">{recommendation.fitScore}%</p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-zinc-300">
              {recommendation.rationale}
            </p>

            {/* Quick Pros / Cons Preview */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Key Advantages for You
                </span>
                <ul className="mt-2 space-y-1.5 text-xs text-zinc-300">
                  {recommendation.tradeoffs.pros.slice(0, 3).map((pro, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Trade-offs to Know
                </span>
                <ul className="mt-2 space-y-1.5 text-xs text-zinc-300">
                  {recommendation.tradeoffs.cons.slice(0, 2).map((con, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-200">
              ⚠️ {validationError}
            </div>
          )}

          {/* Blueprint Editor Header & Tabs */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-2xl md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  Canonical Blueprint (Version 1)
                </span>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                  {blueprint.communityName}
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  {blueprint.categories.length} categories · {totalChannelsCount} spaces · {blueprint.roles.length} roles
                </p>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-black/40 p-1">
                {[
                  { id: "spaces", label: "Spaces & Channels" },
                  { id: "roles", label: "Roles & Access" },
                  { id: "onboarding", label: "Onboarding & Rules" },
                  { id: "tradeoffs", label: "Platform Comparison" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      activeTab === tab.id
                        ? "bg-white text-black font-semibold shadow"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab 1: Spaces & Channels */}
            {activeTab === "spaces" && (
              <div className="mt-8 space-y-6">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Categories and intended channel spaces. You can customize, add, or remove channels.</span>
                </div>

                <div className="space-y-6">
                  {blueprint.categories.map((cat, catIdx) => (
                    <div
                      key={cat.name}
                      className="rounded-2xl border border-white/10 bg-black/30 p-5"
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                            {cat.name}
                          </span>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-zinc-400 font-mono">
                            {cat.channels.length}
                          </span>
                        </div>
                        <button
                          onClick={() => setNewChannelCatIndex(newChannelCatIndex === catIdx ? null : catIdx)}
                          className="rounded-lg border border-white/15 px-2.5 py-1 text-[11px] text-zinc-300 hover:bg-white/10 transition"
                        >
                          {newChannelCatIndex === catIdx ? "Cancel" : "+ Add Channel"}
                        </button>
                      </div>

                      {/* Add Channel Inline Form */}
                      {newChannelCatIndex === catIdx && (
                        <div className="mt-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 text-xs">
                          <p className="font-semibold text-white mb-3">Add Channel to {cat.name}</p>
                          <div className="grid gap-3 sm:grid-cols-3">
                            <input
                              type="text"
                              value={newChannelName}
                              onChange={(e) => setNewChannelName(e.target.value)}
                              placeholder="channel-name (e.g. daily-recap)"
                              className="rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-indigo-400 focus:outline-none"
                            />
                            <input
                              type="text"
                              value={newChannelPurpose}
                              onChange={(e) => setNewChannelPurpose(e.target.value)}
                              placeholder="Channel purpose (e.g. Share daily progress)"
                              className="rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-indigo-400 focus:outline-none"
                            />
                            <select
                              value={newChannelKind}
                              onChange={(e) =>
                                setNewChannelKind(
                                  e.target.value as "text" | "voice" | "announcement" | "forum"
                                )
                              }
                              className="rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-indigo-400 focus:outline-none"
                            >
                              <option value="text"># Text Channel</option>
                              <option value="forum">💬 Forum Topic</option>
                              <option value="announcement">📢 Announcement</option>
                              <option value="voice">🔊 Voice Room</option>
                            </select>
                          </div>
                          <div className="mt-3 flex justify-end gap-2">
                            <button
                              onClick={() => setNewChannelCatIndex(null)}
                              className="px-3 py-1 text-zinc-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleAddChannel(catIdx)}
                              className="rounded-lg bg-white px-4 py-1 font-semibold text-black hover:bg-zinc-200"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Channels List */}
                      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                        {cat.channels.map((chan, chanIdx) => {
                          const kindBadge =
                            chan.kind === "voice"
                              ? "🔊 Voice"
                              : chan.kind === "announcement"
                              ? "📢 Announcement"
                              : chan.kind === "forum"
                              ? "💬 Forum"
                              : "# Text";

                          return (
                            <div
                              key={chan.name}
                              className="group flex items-start justify-between rounded-xl border border-white/5 bg-black/20 p-3 hover:border-white/15 transition"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-semibold text-zinc-200">
                                    #{chan.name}
                                  </span>
                                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] text-zinc-400">
                                    {kindBadge}
                                  </span>
                                </div>
                                <p className="mt-1 text-[11px] leading-4 text-zinc-500">
                                  {chan.purpose}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteChannel(catIdx, chanIdx)}
                                title="Remove channel"
                                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-rose-400 text-xs px-1.5 py-0.5 transition"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Roles & Permissions */}
            {activeTab === "roles" && (
              <div className="mt-8 space-y-4">
                <p className="text-xs text-zinc-400">
                  Intent-based permission presets. Platform adapters map these safely to platform permissions without exposing raw bitfields.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {blueprint.roles.map((role) => {
                    const presetColor =
                      role.permissionPreset === "owner"
                        ? "text-amber-300 border-amber-500/30 bg-amber-500/10"
                        : role.permissionPreset === "moderator"
                        ? "text-indigo-300 border-indigo-500/30 bg-indigo-500/10"
                        : role.permissionPreset === "read_only"
                        ? "text-zinc-400 border-white/10 bg-white/5"
                        : "text-emerald-300 border-emerald-500/30 bg-emerald-500/10";

                    return (
                      <div
                        key={role.name}
                        className="rounded-2xl border border-white/10 bg-black/30 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-white text-sm">{role.name}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${presetColor}`}>
                            {role.permissionPreset}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-zinc-400">{role.purpose}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Onboarding & Rules */}
            {activeTab === "onboarding" && (
              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white">Member Onboarding Sequence</h3>
                  <div className="mt-3 space-y-2">
                    {blueprint.onboarding.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-zinc-300"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-sm font-semibold text-white">Community Code of Conduct & Guidelines</h3>
                  <ul className="mt-3 space-y-2 text-xs text-zinc-400">
                    {blueprint.moderationGuidelines.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-400">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 4: Platform Comparison */}
            {activeTab === "tradeoffs" && (
              <div className="mt-8 space-y-6">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <h3 className="text-sm font-semibold text-white">Why not other platforms?</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {recommendation.alternatives.map((alt) => (
                      <div
                        key={alt.platform}
                        className="rounded-xl border border-white/10 bg-black/20 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold uppercase tracking-wider text-xs text-zinc-300">
                            {alt.platform}
                          </span>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-zinc-400 font-mono">
                            Fit: {alt.fitScore}%
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-zinc-400">{alt.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Approval Footer Action */}
            <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={onBackToConsultation}
                className="text-xs text-zinc-400 hover:text-white"
              >
                ← Back to Consultation
              </button>

              <div className="flex items-center gap-3">
                <p className="text-[11px] text-zinc-500 hidden sm:block">
                  AI plans → <strong>You approve</strong> → System executes
                </p>
                <button
                  type="button"
                  onClick={handleApproveBlueprint}
                  disabled={isApproving}
                  className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 shadow-lg shadow-white/5 disabled:opacity-50"
                >
                  {isApproving ? "Generating Cryptographic Seal..." : "Approve Community Blueprint ✓"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
