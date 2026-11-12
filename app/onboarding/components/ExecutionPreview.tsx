"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ApprovalSnapshot, ChangePreview } from "@/lib/approvals/types";
import { DiscordExecutionResult } from "@/lib/integrations/discord/types";
import { TelegramExecutionResult } from "@/lib/integrations/telegram/types";
import { WhatsAppCommunityPackage } from "@/lib/integrations/whatsapp/types";
import { getDiscordOAuthInviteUrl } from "@/lib/integrations/discord/adapter";

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
  // Platform tab
  const [activePlatform, setActivePlatform] = useState<"discord" | "telegram" | "whatsapp">("discord");

  // Discord State
  const [guildName, setGuildName] = useState<string>(snapshot.blueprint.communityName);
  const [guildId, setGuildId] = useState<string>("");
  const [botToken, setBotToken] = useState<string>("");
  const [isExecutingDiscord, setIsExecutingDiscord] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<DiscordExecutionResult | null>(null);

  // Telegram State
  const [telegramChatId, setTelegramChatId] = useState<string>("");
  const [telegramBotToken, setTelegramBotToken] = useState<string>("");
  const [isExecutingTelegram, setIsExecutingTelegram] = useState<boolean>(false);
  const [telegramResult, setTelegramResult] = useState<TelegramExecutionResult | null>(null);

  // WhatsApp State
  const [whatsappPackage, setWhatsappPackage] = useState<WhatsAppCommunityPackage | null>(null);
  const [isLoadingWhatsApp, setIsLoadingWhatsApp] = useState<boolean>(false);
  const [copiedWelcome, setCopiedWelcome] = useState<boolean>(false);
  const [copiedRules, setCopiedRules] = useState<boolean>(false);

  // General State
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [showFullHash, setShowFullHash] = useState<boolean>(false);
  const [copiedAudit, setCopiedAudit] = useState<boolean>(false);

  const isLiveDiscordConfigured = Boolean(botToken.trim().length > 20 && /^\d{17,20}$/.test(guildId.trim()));
  const isLiveTelegramConfigured = Boolean(telegramBotToken.trim().length > 20 && telegramChatId.trim().length > 5);

  const loadWhatsAppPackage = useCallback(async () => {
    setIsLoadingWhatsApp(true);
    try {
      const res = await fetch("/api/integrations/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWhatsappPackage(data.whatsappPackage);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoadingWhatsApp(false);
    }
  }, [snapshot]);

  // Load WhatsApp package when switching to WhatsApp tab
  useEffect(() => {
    if (activePlatform === "whatsapp" && !whatsappPackage) {
      loadWhatsAppPackage();
    }
  }, [activePlatform, whatsappPackage, loadWhatsAppPackage]);

  const handleRunDiscordExecution = async () => {
    setIsExecutingDiscord(true);
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
      setIsExecutingDiscord(false);
    }
  };

  const handleRunTelegramExecution = async () => {
    setIsExecutingTelegram(true);
    setExecutionError(null);

    try {
      const res = await fetch("/api/integrations/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snapshot,
          botToken: telegramBotToken.trim() || undefined,
          chatId: telegramChatId.trim() || undefined,
          chatTitle: snapshot.blueprint.communityName,
          dryRun: false,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to execute Telegram topics setup");
      }

      setTelegramResult(data.executionResult);
    } catch (err) {
      setExecutionError(
        err instanceof Error ? err.message : "An unexpected Telegram execution error occurred."
      );
    } finally {
      setIsExecutingTelegram(false);
    }
  };

  const handleCopyAuditLog = async (logData: unknown) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(logData, null, 2));
      setCopiedAudit(true);
      setTimeout(() => setCopiedAudit(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyText = async (text: string, type: "welcome" | "rules") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "welcome") {
        setCopiedWelcome(true);
        setTimeout(() => setCopiedWelcome(false), 2500);
      } else {
        setCopiedRules(true);
        setTimeout(() => setCopiedRules(false), 2500);
      }
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
          disabled={isExecutingDiscord || isExecutingTelegram}
          className="text-sm font-medium text-zinc-400 transition hover:text-white disabled:opacity-50"
        >
          ← Back to Blueprint Customizer
        </button>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
          <span>Phase 4 & 5</span>
          <span className="text-zinc-600">/</span>
          <span>Multi-Platform Execution</span>
        </div>
      </div>

      {/* Execution Error Banner */}
      {executionError && (
        <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-200">
          ⚠️ {executionError}
        </div>
      )}

      {/* Approval Snapshot Seal */}
      <div className="mb-8 rounded-3xl border border-indigo-500/20 bg-indigo-950/20 p-6 md:p-8">
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

      {/* Planned Operations Summary Badge using preview */}
      <div className="mb-8 grid gap-3 sm:grid-cols-4 text-xs">
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

      {/* Platform Switcher Tabs */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {[
          { id: "discord", label: "Discord", icon: "🎮", badge: "Automated Bot API" },
          { id: "telegram", label: "Telegram", icon: "✈️", badge: "Supergroup Topics Bot" },
          { id: "whatsapp", label: "WhatsApp", icon: "💬", badge: "Guided Community Hub" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActivePlatform(tab.id as typeof activePlatform);
              setExecutionError(null);
            }}
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-xs font-medium transition ${
              activePlatform === tab.id
                ? "border-white bg-white text-black shadow-md font-semibold"
                : "border-white/10 bg-black/30 text-zinc-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] uppercase font-bold ${
                activePlatform === tab.id ? "bg-black/10 text-black" : "bg-white/10 text-zinc-400"
              }`}
            >
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 1. DISCORD TAB */}
      {/* ========================================================================= */}
      {activePlatform === "discord" && (
        <div className="space-y-8">
          {executionResult ? (
            <div className="space-y-6">
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-8 shadow-2xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-2xl font-bold">
                    ✓
                  </span>
                  <div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                      Discord Deployed
                    </span>
                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
                      Infrastructure Deployed to Discord
                    </h2>
                  </div>
                </div>

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
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-sm font-semibold text-white">Discord Audit Log ({executionResult.auditLog.length} events)</h3>
                  <button
                    onClick={() => handleCopyAuditLog(executionResult.auditLog)}
                    className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 transition"
                  >
                    {copiedAudit ? "✓ Copied!" : "Copy Audit Log JSON"}
                  </button>
                </div>
                <div className="mt-4 max-h-72 overflow-auto divide-y divide-white/5 font-mono text-xs">
                  {executionResult.auditLog.map((event) => (
                    <div key={event.id} className="py-2 flex items-start gap-3">
                      <span className="text-zinc-600 shrink-0 text-[11px]">{event.timestamp.split("T")[1]?.slice(0, 8)}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] uppercase font-bold border shrink-0 ${event.outcome === "success" ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "text-amber-400 border-amber-500/30 bg-amber-500/10"}`}>{event.outcome}</span>
                      <span className="text-zinc-400 flex-1"><strong className="text-zinc-200">{event.action}:</strong> {event.details}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={() => setExecutionResult(null)} className="text-xs text-zinc-400 hover:text-white">← Re-run or change settings</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Discord Bot Setup Guidance */}
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white text-sm">Official Discord Bot Install</p>
                    <p className="text-zinc-400 mt-1">
                      Invite the bot to your server with least-privilege permissions (Manage Channels, Manage Roles, View Channels).
                    </p>
                  </div>
                  <a
                    href={getDiscordOAuthInviteUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition text-center shrink-0"
                  >
                    Invite Bot to Discord Server ↗
                  </a>
                </div>
              </div>

              {/* Execution Form */}
              <div className="rounded-3xl border border-white/10 bg-black/40 p-6 md:p-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Discord Target Configuration
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${isLiveDiscordConfigured ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" : "text-indigo-300 border-indigo-500/30 bg-indigo-500/10"}`}>
                    {isLiveDiscordConfigured ? "● Live Discord API Mode" : "○ Safe Simulator Mode"}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300">Server Display Name:</label>
                    <input
                      type="text"
                      value={guildName}
                      onChange={(e) => setGuildName(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300">Discord Server ID (Guild Snowflake):</label>
                    <input
                      type="text"
                      value={guildId}
                      onChange={(e) => setGuildId(e.target.value)}
                      placeholder="e.g. 123456789012345678"
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white font-mono focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300">Discord Bot Token (Optional if in .env):</label>
                    <input
                      type="password"
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      placeholder="Leave blank to run simulation"
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white font-mono focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-white/10 pt-4">
                  <p className="text-[11px] text-zinc-500">
                    {isLiveDiscordConfigured
                      ? "Live credentials active. The adapter will create real categories, channels, and roles."
                      : "Running in Safe Simulation Mode (100% safe, instant verification & audit log generation)."}
                  </p>
                  <button
                    type="button"
                    onClick={handleRunDiscordExecution}
                    disabled={isExecutingDiscord}
                    className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition disabled:opacity-50 shrink-0"
                  >
                    {isExecutingDiscord ? "Executing Discord..." : "Execute on Discord →"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TELEGRAM TAB */}
      {/* ========================================================================= */}
      {activePlatform === "telegram" && (
        <div className="space-y-8">
          {telegramResult ? (
            <div className="space-y-6">
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-8 shadow-2xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-2xl font-bold">
                    ✓
                  </span>
                  <div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                      Telegram Provisioned
                    </span>
                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
                      Forum Topics Provisioned on Telegram
                    </h2>
                  </div>
                </div>

                <p className="mt-3 text-xs text-zinc-300">
                  Target Group: <strong>{telegramResult.chatTitle}</strong> ({telegramResult.chatId}) · Total {telegramResult.createdTopics.length} forum topics created.
                </p>

                <div className="mt-5 grid gap-2 sm:grid-cols-2 text-xs">
                  {telegramResult.createdTopics.map((topic, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-black/40 p-3 flex items-center justify-between">
                      <span className="font-semibold text-white">#{topic.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{topic.category} · ID: {topic.topicId}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Log */}
              <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-semibold text-white">Telegram Audit Log</h3>
                  <button
                    onClick={() => handleCopyAuditLog(telegramResult.auditLog)}
                    className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs text-zinc-300 hover:bg-white/10 transition"
                  >
                    {copiedAudit ? "✓ Copied!" : "Copy Audit JSON"}
                  </button>
                </div>
                <div className="mt-4 max-h-56 overflow-auto divide-y divide-white/5 font-mono text-xs">
                  {telegramResult.auditLog.map((event) => (
                    <div key={event.id} className="py-2 flex items-start gap-3">
                      <span className="text-zinc-500 text-[11px] shrink-0">{event.timestamp.split("T")[1]?.slice(0, 8)}</span>
                      <span className="text-zinc-300">{event.details}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button onClick={() => setTelegramResult(null)} className="text-xs text-zinc-400 hover:text-white">← Re-configure Telegram</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Telegram Guidance Box */}
              <div className="rounded-2xl border border-sky-500/20 bg-sky-950/20 p-5 text-xs">
                <p className="font-semibold text-white text-sm">How Telegram Supergroup Topics Work</p>
                <ol className="mt-2 list-decimal pl-5 space-y-1 text-zinc-300">
                  <li>Create a Telegram Group and enable <strong>Topics (Forum mode)</strong> in Group Settings.</li>
                  <li>Create a Bot via <strong>@BotFather</strong> on Telegram to get your Bot Token.</li>
                  <li>Add your bot to the group as an <strong>Administrator</strong> with <em>Manage Topics</em> permission.</li>
                </ol>
              </div>

              {/* Telegram Execution Form */}
              <div className="rounded-3xl border border-white/10 bg-black/40 p-6 md:p-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Telegram Supergroup Configuration
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${isLiveTelegramConfigured ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" : "text-sky-300 border-sky-500/30 bg-sky-500/10"}`}>
                    {isLiveTelegramConfigured ? "● Live Telegram API Mode" : "○ Safe Simulator Mode"}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300">Telegram Group Chat ID (e.g. -100...):</label>
                    <input
                      type="text"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="e.g. -1001987654321"
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white font-mono focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300">Telegram Bot Token (from @BotFather):</label>
                    <input
                      type="password"
                      value={telegramBotToken}
                      onChange={(e) => setTelegramBotToken(e.target.value)}
                      placeholder="Leave blank to use safe simulation"
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white font-mono focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-white/10 pt-4">
                  <p className="text-[11px] text-zinc-500">
                    {isLiveTelegramConfigured
                      ? "Live Telegram Bot active. Will create official forum topics."
                      : "Simulation Mode: Generates topic IDs and checks blueprint mapping safely."}
                  </p>
                  <button
                    type="button"
                    onClick={handleRunTelegramExecution}
                    disabled={isExecutingTelegram}
                    className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition disabled:opacity-50 shrink-0"
                  >
                    {isExecutingTelegram ? "Provisioning Telegram..." : "Provision Telegram Topics →"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. WHATSAPP TAB */}
      {/* ========================================================================= */}
      {activePlatform === "whatsapp" && (
        <div className="space-y-6">
          {isLoadingWhatsApp && (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-8 text-center text-xs text-zinc-400">
              Generating WhatsApp Community Package...
            </div>
          )}

          {whatsappPackage && (
            <div className="space-y-6">
              {/* WhatsApp Community Overview Card */}
              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-950/20 p-6 md:p-8">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
                  <div>
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 border border-emerald-500/30">
                      WhatsApp Community Blueprint
                    </span>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
                      {whatsappPackage.communityName}
                    </h2>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">
                    1 Announcement + {whatsappPackage.subGroups.length} Sub-Grup
                  </span>
                </div>
                <p className="mt-3 text-xs text-zinc-300">
                  {whatsappPackage.description}
                </p>
              </div>

              {/* 4-Step Checklist */}
              <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
                <h3 className="text-sm font-semibold text-white mb-3">Langkah Mudah Membuka Komunitas di WhatsApp</h3>
                <div className="space-y-2 text-xs">
                  {whatsappPackage.setupChecklist.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-zinc-300">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Copy-Ready Broadcast Texts */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Welcome Broadcast */}
                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-semibold text-zinc-300">Pesan Siaran Sambutan (Welcome)</span>
                    <button
                      onClick={() => handleCopyText(whatsappPackage.welcomeBroadcastText, "welcome")}
                      className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-200 hover:bg-white/10 transition"
                    >
                      {copiedWelcome ? "✓ Tersalin!" : "Salin Teks"}
                    </button>
                  </div>
                  <pre className="mt-3 whitespace-pre-wrap text-xs text-zinc-400 font-sans leading-5 max-h-48 overflow-auto">
                    {whatsappPackage.welcomeBroadcastText}
                  </pre>
                </div>

                {/* Rules Broadcast */}
                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-semibold text-zinc-300">Pesan Siaran Tata Tertib (Rules)</span>
                    <button
                      onClick={() => handleCopyText(whatsappPackage.rulesBroadcastText, "rules")}
                      className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-200 hover:bg-white/10 transition"
                    >
                      {copiedRules ? "✓ Tersalin!" : "Salin Teks"}
                    </button>
                  </div>
                  <pre className="mt-3 whitespace-pre-wrap text-xs text-zinc-400 font-sans leading-5 max-h-48 overflow-auto">
                    {whatsappPackage.rulesBroadcastText}
                  </pre>
                </div>
              </div>

              {/* Sub-groups mapping */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                  Rekomendasi Sub-Grup WhatsApp ({whatsappPackage.subGroups.length} Grup)
                </h3>
                <div className="grid gap-2 sm:grid-cols-2 text-xs">
                  {whatsappPackage.subGroups.map((group, idx) => (
                    <div key={idx} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{group.name}</span>
                        <span className="text-[10px] text-zinc-500">{group.type}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-zinc-400">{group.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Navigation */}
      <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">
        <button
          onClick={onBackToBlueprint}
          className="text-xs text-zinc-400 hover:text-white"
        >
          ← Back to Blueprint Customizer
        </button>
        <Link
          href="/"
          className="rounded-xl bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-zinc-200 transition"
        >
          Return to Home Dashboard
        </Link>
      </div>
    </div>
  );
}
