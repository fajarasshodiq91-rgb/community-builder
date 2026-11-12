"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  PlatformType,
  InsightsReport,
  ActionableInsight,
  ActivityEvent,
} from "@/lib/insights/types";

interface ActivityAndInsightsProps {
  initialPlatform?: PlatformType;
  communityName?: string;
  initialGuildId?: string;
  initialBotToken?: string;
  initialChatId?: string;
}

export default function ActivityAndInsights({
  initialPlatform = "discord",
  communityName = "Komunitas Kreator",
  initialGuildId = "",
  initialBotToken = "",
  initialChatId = "",
}: ActivityAndInsightsProps) {
  const [platform, setPlatform] = useState<PlatformType>(initialPlatform);
  const [guildId, setGuildId] = useState<string>(initialGuildId);
  const [botToken, setBotToken] = useState<string>(initialBotToken);
  const [chatId, setChatId] = useState<string>(initialChatId);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<InsightsReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedInsightId, setCopiedInsightId] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          communityName,
          credentials: {
            botToken: botToken.trim() || undefined,
            guildId: guildId.trim() || undefined,
            chatId: chatId.trim() || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal memuat ringkasan insight komunitas");
      }
      setReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  }, [platform, communityName, botToken, guildId, chatId]);

  // Initial load or on platform change
  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const handleCopyTemplate = (insight: ActionableInsight) => {
    if (!insight.actionPayload?.templateContent) return;
    navigator.clipboard.writeText(insight.actionPayload.templateContent);
    setCopiedInsightId(insight.id);
    setTimeout(() => setCopiedInsightId(null), 2500);
  };

  const getPriorityBadge = (priority: ActionableInsight["priority"]) => {
    switch (priority) {
      case "high":
        return (
          <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-rose-300 border border-rose-500/30">
            Prioritas Tinggi
          </span>
        );
      case "medium":
        return (
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-300 border border-amber-500/30">
            Rekomendasi
          </span>
        );
      case "low":
        return (
          <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-indigo-300 border border-indigo-500/30">
            Saran Tambahan
          </span>
        );
    }
  };

  const getPulseBadge = (pulse?: string) => {
    switch (pulse) {
      case "vibrant":
        return <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300">🔥 Sangat Aktif</span>;
      case "steady":
        return <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-300">⚡ Stabil</span>;
      case "quiet":
        return <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300">💤 Tenang</span>;
      default:
        return <span className="rounded-full bg-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-300">⚠️ Butuh Perhatian</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Platform Selector & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-400 mr-1">Platform:</span>
          {(["discord", "telegram", "whatsapp"] as PlatformType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                platform === p
                  ? "bg-white text-black shadow-lg shadow-white/5"
                  : "bg-black/40 text-zinc-400 hover:text-white border border-white/5"
              }`}
            >
              {p === "discord" ? "👾 Discord" : p === "telegram" ? "✈️ Telegram" : "💬 WhatsApp"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {report && (
            <span
              className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                report.source === "live_api"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/30"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${report.source === "live_api" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              {report.source === "live_api" ? "Data Akun Riil Terhubung" : "Mode Simulasi & Estimasi"}
            </span>
          )}

          <button
            onClick={fetchInsights}
            disabled={isLoading}
            className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/10 transition disabled:opacity-50"
          >
            {isLoading ? "Menghitung..." : "🔄 Segarkan Data"}
          </button>
        </div>
      </div>

      {/* Optional Credentials Expandable Bar */}
      <details className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-zinc-400">
        <summary className="cursor-pointer font-medium text-zinc-300 hover:text-white flex items-center justify-between">
          <span>⚙️ Hubungkan Kredensial Akun Riil (Opsional untuk pembacaan data langsung)</span>
          <span className="text-[11px] text-zinc-500">Klik untuk buka/tutup</span>
        </summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 pt-2 border-t border-white/5">
          {platform === "discord" && (
            <>
              <div>
                <label className="block text-[11px] text-zinc-400">Discord Guild / Server ID:</label>
                <input
                  type="text"
                  value={guildId}
                  onChange={(e) => setGuildId(e.target.value)}
                  placeholder="Contoh: 123456789012345678"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-white font-mono focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400">Discord Bot Token:</label>
                <input
                  type="password"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="Kosongkan untuk simulator aman"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-white font-mono focus:border-indigo-400 focus:outline-none"
                />
              </div>
            </>
          )}

          {platform === "telegram" && (
            <>
              <div>
                <label className="block text-[11px] text-zinc-400">Telegram Supergroup Chat ID:</label>
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="Contoh: -100xxxxxxxxxx"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-white font-mono focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400">Telegram Bot Token (@BotFather):</label>
                <input
                  type="password"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="Kosongkan untuk simulator aman"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-white font-mono focus:border-indigo-400 focus:outline-none"
                />
              </div>
            </>
          )}

          {platform === "whatsapp" && (
            <p className="col-span-2 text-[11px] text-zinc-500">
              WhatsApp menggunakan mode estimasi paket komunitas & analisis broadcast untuk menjaga nomor tetap 100% aman dari banned Meta.
            </p>
          )}
        </div>
      </details>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300">
          ⚠️ {error}
        </div>
      )}

      {/* Main Activity Overview Cards */}
      {report && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Health Score */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Skor Kesehatan</span>
                {getPulseBadge(report.summary.activityPulse)}
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-white">{report.summary.healthScore}</span>
                <span className="text-xs text-zinc-500">/ 100</span>
              </div>
              <p className="mt-2 text-[11px] text-zinc-400">
                Keseimbangan struktur channel, aktivitas anggota, dan sistem moderasi.
              </p>
            </div>

            {/* Total Members */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Total Anggota</span>
                {report.summary.onlineMembers !== undefined && (
                  <span className="text-[11px] font-medium text-emerald-400">
                    🟢 {report.summary.onlineMembers} online
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-white">{report.summary.totalMembers}</span>
                <span className="text-xs text-zinc-500">anggota</span>
              </div>
              <p className="mt-2 text-[11px] text-zinc-400">
                Populasi komunitas di server/grup saat ini.
              </p>
            </div>

            {/* Structure Breakdown */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <span className="text-xs font-medium text-zinc-400">Ruangan & Topik</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-white">{report.summary.channelsCount}</span>
                <span className="text-xs text-zinc-500">ruang aktif</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-zinc-400">
                {report.summary.breakdown.textChannels > 0 && <span>• {report.summary.breakdown.textChannels} Teks</span>}
                {report.summary.breakdown.voiceChannels > 0 && <span>• {report.summary.breakdown.voiceChannels} Suara</span>}
                {report.summary.breakdown.forumTopics > 0 && <span>• {report.summary.breakdown.forumTopics} Forum</span>}
                {report.summary.breakdown.announcementChannels > 0 && <span>• {report.summary.breakdown.announcementChannels} Info</span>}
              </div>
            </div>

            {/* Roles / Admin Security */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <span className="text-xs font-medium text-zinc-400">Tingkat Peran & Staf</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-white">{report.summary.rolesCount}</span>
                <span className="text-xs text-zinc-500">peran terdaftar</span>
              </div>
              <p className="mt-2 text-[11px] text-zinc-400">
                Hierarki izin untuk mencegah spam & menjaga ketertiban ruang.
              </p>
            </div>
          </div>

          {/* Activity Pulse / Live Events Feed */}
          <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Denyut Kegiatan Terbaru Komunitas</h3>
                <p className="text-xs text-zinc-400">Rekap aktivitas terkini dari akun yang disambungkan.</p>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">Diperbarui: {new Date(report.generatedAt).toLocaleTimeString()}</span>
            </div>

            <div className="mt-4 divide-y divide-white/5">
              {report.summary.recentEvents.map((evt: ActivityEvent) => (
                <div key={evt.id} className="flex items-center justify-between py-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/5 text-sm">
                      {evt.type === "message" && "💬"}
                      {evt.type === "join" && "👋"}
                      {evt.type === "voice_active" && "🎙️"}
                      {evt.type === "announcement" && "📢"}
                      {evt.type === "topic_created" && "📁"}
                    </span>
                    <div>
                      <p className="font-medium text-zinc-200">{evt.description}</p>
                      {evt.channelOrTopic && (
                        <p className="text-[11px] text-indigo-300 font-mono">{evt.channelOrTopic}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Insights Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-white">Tindakan Nyata yang Bisa Dilakukan (Actionable Insights)</h3>
              <p className="text-xs text-zinc-400">
                Rekomendasi taktis berbasis data riil komunitasmu untuk menaikkan keaktifan anggota dan mencegah ruangan sepi.
              </p>
            </div>

            <div className="grid gap-4">
              {report.insights.map((insight) => (
                <div
                  key={insight.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-white/20"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(insight.priority)}
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                        {insight.category}
                      </span>
                    </div>
                    {insight.actionPayload?.suggestedChannel && (
                      <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                        Target: {insight.actionPayload.suggestedChannel}
                      </span>
                    )}
                  </div>

                  <h4 className="mt-3 text-sm font-semibold text-white">{insight.title}</h4>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
                      <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Temuan Data Riil:</p>
                      <p className="mt-1 text-zinc-300 leading-relaxed">{insight.observation}</p>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
                      <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Dampak ke Komunitas:</p>
                      <p className="mt-1 text-zinc-300 leading-relaxed">{insight.impact}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                    <p className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">Langkah Disarankan:</p>
                    <p className="mt-1 text-xs text-zinc-200 leading-relaxed">{insight.actionRecommendation}</p>

                    {insight.actionPayload?.templateContent && (
                      <div className="mt-3 pt-3 border-t border-indigo-500/15">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-medium text-indigo-200">
                            {insight.actionPayload.templateTitle || "Template Siap Pakai:"}
                          </span>
                          <button
                            onClick={() => handleCopyTemplate(insight)}
                            className="rounded-lg border border-indigo-400/30 bg-indigo-500/20 px-2.5 py-1 text-[11px] font-medium text-indigo-200 hover:bg-indigo-500/30 transition"
                          >
                            {copiedInsightId === insight.id ? "✓ Berhasil Disalin!" : insight.actionPayload.actionButtonLabel || "Salin Template"}
                          </button>
                        </div>
                        <pre className="whitespace-pre-wrap rounded-xl bg-black/60 p-3 font-sans text-xs text-zinc-300 leading-relaxed max-h-48 overflow-y-auto border border-white/5">
                          {insight.actionPayload.templateContent}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
