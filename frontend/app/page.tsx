"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart2,
  Tags,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  Wallet,
} from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

const features = [
  {
    icon: <Wallet className="w-6 h-6 text-indigo-500" />,
    title: "Track Every Expense",
    desc: "Add any recurring cost - subscriptions, rent, utilities - and always know what you're paying.",
  },
  {
    icon: <Tags className="w-6 h-6 text-indigo-500" />,
    title: "Smart Categories",
    desc: "Organize expenses with built-in categories or create your own custom ones to match your lifestyle.",
  },
  {
    icon: <RefreshCw className="w-6 h-6 text-indigo-500" />,
    title: "Monthly & Yearly View",
    desc: "Instantly switch between monthly and yearly totals. See the real annual cost of your daily spending.",
  },
  {
    icon: <BarChart2 className="w-6 h-6 text-indigo-500" />,
    title: "Visual Insights",
    desc: "Beautiful charts show exactly where your money goes - broken down by category at a glance.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-indigo-500" />,
    title: "Private & Secure",
    desc: "Your data is tied to your account only. Nobody else sees your finances - ever.",
  },
  {
    icon: <GithubIcon className="w-6 h-6 text-indigo-500" />,
    title: "Free & Open Source",
    desc: "TrueBalance is completely free to use, forever. The full source code is open on GitHub.",
  },
];

const steps = [
  { num: "01", title: "Create a free account", desc: "Sign up in seconds with your email or Google." },
  { num: "02", title: "Add your expenses", desc: "Enter what you pay, how often, and which category it belongs to." },
  { num: "03", title: "See your True Balance", desc: "Instantly view your total monthly and yearly spending with visual breakdowns." },
];

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-indigo-600"
            onClick={(e) => {
              // Pokud jde o klasické levé kliknutí bez modifikátorů (Ctrl/Cmd)
              if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                // Pokud uživatel je na hlavní stránce, scrollneme nahoru
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }
              // Pokud uživatel klikl středním tlačítkem nebo s Ctrl, 
              // proběhne standardní chování Linku (otevření v nové kartě)
            }}
          >
            <BarChart2 className="w-5 h-5" />
            TrueBalance
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it works</a>
            <a href="https://github.com/slbububu/TrueBalance/tree/cloud" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-600 transition-colors"><GithubIcon className="w-4 h-4" />GitHub</a>
          </nav>
          <Link
            href="/login"
            className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 min-[400.01px]:pt-24 max-[400px]:pt-10 pb-20 text-center">
        <span className="inline-block text-indigo-900 italic text-lg underline decoration-indigo-400 font-semibold px-3 py-1 mb-6 tracking-wide uppercase">
          Free &amp; Open Source Expense tracking App
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Know exactly where <br />
          <span className="text-indigo-600">your money goes.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
          TrueBalance helps you track all your recurring expenses - subscriptions, rent, bills
          and shows you the real total you're spending every month and every year.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Get Started - It's Free <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://github.com/slbububu/TrueBalance/tree/cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            <GithubIcon className="w-4 h-4" /> View on GitHub
          </a>
        </div>

        {/* Hero image - upraveno pro responzivní chování */}
        <div className="mt-16 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full cursor-pointer hover:opacity-90 transition-opacity"
          >
            {/* Pomocí aspect-[16/9] zajistíš, že box bude mít vždy správný tvar */}
            <div className="relative w-full aspect-[16/9] overflow-hidden">
              <Image
                src="/app-preview.png"
                alt="TrueBalance app preview"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </button>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          >
            <div className="relative max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl font-bold"
              >
                ✕
              </button>
              <Image
                src="/app-preview.png"
                alt="TrueBalance app preview fullscreen"
                width={1919}
                height={1079}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        )}
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need, nothing you don't</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              A focused, no-bloat tool built to give you clarity over your recurring spending.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Up and running in minutes</h2>
            <p className="text-gray-500">Three simple steps to total financial clarity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="text-5xl font-black text-indigo-100 mb-4">{s.num}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-indigo-600 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to see your TrueBalance?</h2>
          <p className="text-indigo-200 mb-8">
            Completely free. Join now and start tracking.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Start for Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2 font-semibold text-gray-600">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            TrueBalance
          </div>
          <p className="text-center">Shipped to you by @JetLanzo and @slbububu</p>
          <a href="https://github.com/slbububu/TrueBalance/tree/cloud" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors flex items-center gap-1">
            <GithubIcon className="w-4 h-4" /> GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
