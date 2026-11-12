import Link from "next/link";
import ActivityAndInsights from "@/app/onboarding/components/ActivityAndInsights";

export const metadata = {
  title: "Ringkasan Kegiatan & Insight Komunitas — Community Builder",
  description:
    "Pantau denyut kegiatan komunitas dan dapatkan rekomendasi tindakan taktis berbasis data akun riil Discord, Telegram, dan WhatsApp.",
};

export default function InsightsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8 sm:px-6 md:py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs text-zinc-400 hover:text-white transition"
            >
              ← Kembali ke Beranda
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-xs text-indigo-400 font-medium">Community Pulse</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Ringkasan & Insight Komunitas
          </h1>
          <p className="mt-1 text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Pantau denyut kesehatan server atau grup kamu, deteksi potensi masalah (seperti ruangan sepi atau over-segmentasi), dan ambil tindakan nyata berbasis data akun riil.
          </p>
        </div>

        <Link
          href="/onboarding"
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-white/10 transition shrink-0"
        >
          ⚙️ Rancang Cetak Biru Baru →
        </Link>
      </div>

      <ActivityAndInsights />
    </main>
  );
}
