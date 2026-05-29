import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
          <ArrowLeft size={16} />
          Back home
        </Link>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
          <Shield size={14} />
          Frontend demo policy
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Privacy</h1>
        <p className="mt-4 leading-7 text-white/65">
          CareCircle in this project is a frontend prototype. Demo names, queue data,
          notifications, and emergency events are simulated locally for presentation.
          No real patient data is collected or transmitted by this interface.
        </p>
      </section>
    </main>
  );
}
