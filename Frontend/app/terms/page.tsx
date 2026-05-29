import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
          <ArrowLeft size={16} />
          Back home
        </Link>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-300">
          <FileText size={14} />
          Prototype terms
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Terms</h1>
        <p className="mt-4 leading-7 text-white/65">
          This frontend is intended for demonstration, design review, and product
          prototyping. Clinical, identity, queue, and emergency workflows are mock
          interactions and should not be used for real care delivery.
        </p>
      </section>
    </main>
  );
}
