import Link from "next/link";

const steps = [
  { number: "01", title: "Tell us about your community", detail: "A guided conversation about your audience, goals, and how members should interact." },
  { number: "02", title: "Review your recommendation", detail: "Understand which platforms fit your needs and why. No tool choices hidden from you." },
  { number: "03", title: "Approve your blueprint", detail: "Review channels, roles, permissions, and onboarding before anything changes." },
  { number: "04", title: "Build with confidence", detail: "Connect a platform and approve the exact setup actions before execution." },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 md:px-10">
      <header className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="text-sm font-semibold tracking-wide">COMMUNITY BUILDER</div>
        <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-400">Private MVP preview</span>
      </header>

      <section className="grid flex-1 items-center gap-12 py-20 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">Your community, thoughtfully built</p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-tight md:text-7xl">
            Build your community infrastructure. <span className="text-zinc-500">Not another platform.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-400">
            Tell us what kind of community you want. Get a practical platform recommendation and a setup blueprint you can review before anything goes live.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/onboarding" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200">Start guided setup <span aria-hidden="true">→</span></Link>
            <Link href="/insights" className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-5 py-3 text-sm font-medium text-indigo-200 hover:bg-indigo-500/20 transition">📊 Community Pulse & Insights</Link>
            <a href="#how-it-works" className="rounded-xl border border-white/15 px-5 py-3 text-sm text-zinc-200 hover:bg-white/5">How it works</a>
          </div>
          <p className="mt-4 text-xs text-zinc-600">Early MVP scaffold · No platform changes happen without your approval.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-indigo-950/20">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-sm font-medium">Your community blueprint</span>
            <span className="rounded-full bg-indigo-400/10 px-2.5 py-1 text-xs text-indigo-200">Preview</span>
          </div>
          <div className="mt-6 space-y-3">
            {[
              ["INFORMATION", "welcome · rules · announcements"],
              ["COMMUNITY", "introductions · general-chat · showcase"],
              ["LEARNING", "resources · questions · discussions"],
              ["SUPPORT", "help-desk · feedback"],
              ["VOICE", "community-room · events"],
            ].map(([name, channels]) => (
              <div key={name} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] font-bold tracking-[0.18em] text-indigo-300">{name}</p>
                <p className="mt-2 text-sm text-zinc-300">{channels}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs leading-5 text-zinc-500">Illustrative example only. The actual structure will be based on each creator’s goals.</p>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-white/10 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">A guided process</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">From idea to infrastructure.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <article key={step.number} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <p className="text-xs text-indigo-300">{step.number}</p>
              <h3 className="mt-5 font-medium">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{step.detail}</p>
            </article>
          ))}
        </div>
      </section>
      <footer className="border-t border-white/10 py-6 text-xs text-zinc-600">Community Builder · AI plans. You approve. We execute.</footer>
    </main>
  );
}
