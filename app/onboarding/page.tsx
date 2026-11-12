export default function OnboardingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10">
      <a href="/" className="text-sm text-zinc-500 hover:text-white">← Community Builder</a>
      <div className="mt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Community discovery · Step 1</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Let’s understand the community you want to build.</h1>
        <p className="mt-4 leading-7 text-zinc-400">This guided consultation is the first product slice. The next implementation step is to add structured questions, save answers, and connect the server-side AI consultation service.</p>
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="font-medium">What is your creator niche?</p>
          <p className="mt-2 text-sm text-zinc-500">For example: gaming, education, design, fitness, music, or something else.</p>
          <div className="mt-5 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-600">Consultation form is the next build task.</div>
        </div>
      </div>
    </main>
  );
}
