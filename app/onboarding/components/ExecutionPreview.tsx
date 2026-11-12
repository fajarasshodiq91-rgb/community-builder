"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ApprovalSnapshot, ChangePreview } from "@/lib/approvals/types";
import { DiscordExecutionResult } from "@/lib/integrations/discord/types";

interface ExecutionPreviewProps {
  snapshot: ApprovalSnapshot;
  preview: ChangePreview;
  onBackToBlueprint: () => void;
}

export default function ExecutionPreview({
  snapshot,
  preview,
  onBackToBlueprint,
}: ExecutionPreviewProps) {
  const [guildName, setGuildName] = useState<string>(snapshot.blueprint.communityName);
  const [guildId, setGuildId] = useState<string>("");
  const [botToken, setBotToken] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<DiscordExecutionResult | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [showFullHash, setShowFullHash] = useState<boolean>(false);
  const [copiedAudit, setCopiedAudit] = useState<boolean>(false);

  const isLiveConfigured = Boolean(botToken.trim().length > 20 && /^\d{17,20}$/.test(guildId.trim()));

  const handleRunExecution = async () => {
    setIsExecuting(true);
    setExecutionError(null);

    try {
      const res = await fetch("/api/execution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snapshot,
          guildName: guildName.trim() || snapshot.blueprint.communityName,
          guildId: guildId.trim() || undefined,
          botToken: botToken.trim() || undefined,
          dryRun: false,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to execute Discord setup");
      }

      setExecutionResult(data.executionResult);
    } catch (err) {
      setExecutionError(
        err instanceof Error ? err.message : "An unexpected execution error occurred."
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyAuditLog = async () => {
    if (!executionResult) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(executionResult.auditLog, null, 2));
      setCopiedAudit(true);
      setTimeout(() => setCopiedAudit(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full">
      {/* Top Header */}
      <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
        <button
          onClick={onBackToBlueprint}
          disabled={isExecuting}
          className="text-sm font-medium text-zinc-400 transition hover:text-white disabled:opacity-50"
        >
          ← Back to Blueprint Customizer
        </button>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
          <span>Phase 4 & 5</span>
          <span className="text-zinc-600">/</span>
          <span>Approval & Execution Engine</span>
        </div>
      </div>

      {/* Execution Error Banner */}
      {executionError && (
        <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-200">
          ⚠️ {executionError}
        </div>
      )}

      {/* Execution Completed State */}
      {executionResult ? (
        <div className="space-y-8">
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-8 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-2xl font-bold">
                ✓
              </span>
              <div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                  Execution Completed
                </span>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Community Infrastructure Deployed
                </h1>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-zinc-300">
              Your community spaces and roles have been processed deterministically through the Discord adapter. All changes follow the zero-deletion safety guarantee.
            </p>

            {/* Metrics */}
            <div className="mt-6 grid gap-3 sm:grid-cols-4 text-xs">
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <span className="text-zinc-500">Target Server:</span>
                <p className="mt-1 font-semibold text-white">{executionResult.targetGuildName}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <span className="text-zinc-500">Channels Created:</span>
                <p className="mt-1 font-semibold text-emerald-400">+{executionResult.summary.channelsCreated} spaces</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <span className="text-zinc-500">Roles Configured:</span>
                <p className="mt-1 font-semibold text-indigo-400">+{executionResult.summary.rolesCreated} roles</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <span className="text-zinc-500">Deletions:</span>
                <p className="mt-1 font-semibold text-emerald-400">0 (Safe)</p>
              </div>
            </div>
          </div>

          {/* Audit Log Box */}
          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Append-Only Audit Log</h2>
                <p className="text-xs text-zinc-500">
                  Immutable record of requested and completed setup actions ({executionResult.auditLog.length} events recorded).
                </p>
              </div>
              <button
                onClick={handleCopyAuditLog}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 transition"
              >
                {copiedAudit ? "✓ Copied Audit JSON!" : "Copy Audit Log JSON"}
              </button>
            </div>

            <div className="mt-4 max-h-80 overflow-auto divide-y divide-white/5 font-mono text-xs">
              {executionResult.auditLog.map((event) => {
                const outcomeColor =
                  event.outcome === "success"
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                    : event.outcome === "skipped"
                    ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                    : "text-rose-400 bg-rose-500/10 border-rose-500/30";

                return (
                  <div key={event.id} className="py-2.5 flex items-start gap-3">
                    <span className="text-zinc-600 shrink-0 text-[11px]">
                      {event.timestamp.split("T")[1]?.slice(0, 8)}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 text-[9px] uppercase font-bold border ${outcomeColor} shrink-0`}>
                      {event.outcome}
                    </span>
                    <div className="flex-1">
                      <span className="font-semibold text-zinc-200">{event.action}: </span>
                      <span className="text-zinc-400">{event.details}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
              <button
                onClick={() => setExecutionResult(null)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                ← Back to Change Preview
              </button>
              <Link
                href="/"
                className="rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition"
              >
                Return to Home Dashboard
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Approval Snapshot Seal */}
          <div className="rounded-3xl border border-indigo-500/20 bg-indigo-950/20 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-indigo-500/20 pb-5">
              <div>
                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200 border border-indigo-500/30">
                  Approved Snapshot
                </span>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
                  {snapshot.blueprint.communityName}
                </h1>
              </div>
              <div className="rounded-2xl border border-indigo-500/30 bg-black/40 p-4 text-xs">
                <span className="text-zinc-500">Cryptographic Seal (SHA-256):</span>
                <p className="mt-1 font-mono font-semibold text-indigo-300">
                  {showFullHash ? snapshot.blueprintHash : `${snapshot.blueprintHash.slice(0, 16)}...`}
                </p>
                <button
                  onClick={() => setShowFullHash(!showFullHash)}
                  className="mt-1 text-[10px] text-zinc-400 hover:text-white underline"
                >
                  {showFullHash ? "Collapse hash" : "View full hash"}
                </button>
              </div>
            </div>

            <p className="mt-4 text-xs text-zinc-400">
              Snapshot ID: <span className="font-mono text-zinc-300">{snapshot.id}</span> · Approved at: {new Date(snapshot.approvedAt).toLocaleString()}
            </p>
          </div>

          {/* Change Preview Summary Cards */}
          <div className="grid gap-3 sm:grid-cols-4 text-xs">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <span className="text-zinc-500">Categories Planned:</span>
              <p className="mt-1 text-xl font-bold text-white">+{preview.summary.categoriesToCreate}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <span className="text-zinc-500">Channels Planned:</span>
              <p className="mt-1 text-xl font-bold text-emerald-400">+{preview.summary.channelsToCreate}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <span className="text-zinc-500">Roles Planned:</span>
              <p className="mt-1 text-xl font-bold text-indigo-400">+{preview.summary.rolesToCreate}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4">
              <span className="text-emerald-400 font-medium">Deletions Planned:</span>
              <p className="mt-1 text-xl font-bold text-emerald-400">0 (Strictly Zero)</p>
            </div>
          </div>

          {/* Safety Invariants Checklist */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Safety Guarantees in Place
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-zinc-300">
              {preview.safetyInvariants.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0">✓</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Planned Operations Table */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
            <h2 className="text-lg font-semibold text-white">Exact Planned Channel Operations</h2>
            <p className="text-xs text-zinc-400 mt-1 mb-5">
              Review every planned operation before running execution against Discord.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-500">
                    <th className="pb-3 font-semibold">Action</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Channel</th>
                    <th className="pb-3 font-semibold">Kind</th>
                    <th className="pb-3 font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {preview.plannedChannels.map((op, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-2.5">
                        <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] text-emerald-300 font-bold">
                          CREATE
                        </span>
                      </td>
                      <td className="py-2.5 text-zinc-300">{op.categoryName}</td>
                      <td className="py-2.5 text-white font-semibold">#{op.channelName}</td>
                      <td className="py-2.5 text-zinc-400">{op.kind}</td>
                      <td className="py-2.5 font-sans text-zinc-500">{op.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Execution Form & CTA */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Adapter Execution Target
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                    isLiveConfigured
                      ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
                      : "text-indigo-300 border-indigo-500/30 bg-indigo-500/10"
                  }`}
                >
                  {isLiveConfigured ? "● Live Discord API Mode" : "○ Safe Simulator Mode"}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300">
                    Discord Server Name:
                  </label>
                  <input
                    type="text"
                    value={guildName}
                    onChange={(e) => setGuildName(e.target.value)}
                    placeholder="e.g. My Community Server"
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-indigo-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300">
                    Server / Guild ID (Optional for Live):
                  </label>
                  <input
                    type="text"
                    value={guildId}
                    onChange={(e) => setGuildId(e.target.value)}
                    placeholder="e.g. 123456789012345678"
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white font-mono focus:border-indigo-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300">
                    Discord Bot Token (Optional for Live):
                  </label>
                  <input
                    type="password"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="Leave blank to use simulator or env"
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white font-mono focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-white/10 pt-4">
                <p className="text-[11px] text-zinc-500">
                  {isLiveConfigured
                    ? "Live credentials detected. The adapter will create real categories, channels, and roles."
                    : "No token provided. Running in Safe Simulation Mode (100% safe, perfect for previewing & testing)."}
                </p>

                <button
                  type="button"
                  onClick={handleRunExecution}
                  disabled={isExecuting}
                  className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-xs font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50 shadow-lg shadow-white/5 shrink-0"
                >
                  {isExecuting ? (
                    <span>Executing Adapter...</span>
                  ) : (
                    <span>Execute Approved Plan →</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
