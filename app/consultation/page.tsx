import { Suspense } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ConsultationClient } from "@/components/consultation/consultation-client";

export const metadata = {
  title: "Master Consultation",
  description:
    "Get a personalized Saju consultation — ask about career, love, timing, or any life question and receive a detailed analysis report.",
};

export default function ConsultationPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[rgba(168,85,247,0.12)] blur-[140px]" />
        <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] rounded-full bg-[rgba(217,119,6,0.08)] blur-[130px]" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full bg-[rgba(67,56,202,0.10)] blur-[130px]" />
      </div>
      <Navbar />
      <section className="pt-page pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
            <ConsultationClient />
          </Suspense>
        </div>
      </section>
      <Footer />
    </main>
  );
}
