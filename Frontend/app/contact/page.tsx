import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
          <ArrowLeft size={16} />
          Back home
        </Link>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          <Mail size={14} />
          Demo contact
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Contact</h1>
        <p className="mt-4 leading-7 text-white/65">
          For this frontend prototype, use the portal and dashboard flows to review
          the experience. A production version would connect this page to a support
          inbox or hospital operations contact form.
        </p>
      </section>
    </main>
  );
}
