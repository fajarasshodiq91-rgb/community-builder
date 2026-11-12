import ConsultationWizard from "./components/ConsultationWizard";

export const metadata = {
  title: "Guided Community Discovery — Community Builder",
  description:
    "A conversational guided consultation to uncover your community goals, audience dynamics, and platform requirements.",
};

export default function OnboardingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8 sm:px-6 md:py-12">
      <ConsultationWizard />
    </main>
  );
}
