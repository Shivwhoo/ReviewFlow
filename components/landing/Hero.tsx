"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Copy, ScanLine, Send, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Lang = "en" | "hi";
type Tag = "Food" | "Service" | "Ambience";

const TAGS: Tag[] = ["Food", "Service", "Ambience"];

const STEPS = [
  { n: "01", t: "Scan", d: "Customer scans the QR on your table, counter or bill." },
  { n: "02", t: "Pick the vibe", d: "Two taps on what stood out. No typing, no login." },
  { n: "03", t: "Post to Google", d: "AI drafts it, they copy it, and it lands on Google Maps." },
];

const STATS = [
  { n: "10K+", l: "Reviews generated" },
  { n: "98%", l: "Positive ratings" },
  { n: "<30s", l: "Scan to post" },
];

// Generic sample copy: no real business name, works for any type of business.
const COPY: Record<Lang, Record<Tag | "none", [string, string]>> = {
  en: {
    none: [
      "Had a nice visit here. Good overall experience and a friendly atmosphere. Definitely worth a try!",
      "Really good experience. The overall visit was great and the staff made sure we were well looked after.",
    ],
    Food: [
      "The food was fresh, full of flavour and served hot. Every dish we tried hit the spot. Will be back for more!",
      "Honestly impressed by the food. Great taste, generous portions and fair prices. Highly recommended.",
    ],
    Service: [
      "Super friendly team and really quick service. They made us feel welcome from the moment we walked in.",
      "The staff went out of their way to help us. Prompt, polite and genuinely caring. Loved it.",
    ],
    Ambience: [
      "Lovely atmosphere, clean and relaxing. A great spot to unwind with family or friends.",
      "The ambience is warm and inviting. We ended up staying much longer than planned. Great place!",
    ],
  },
  hi: {
    none: [
      "Yahan ka khana aur vibe sach mein kamaal thi! Friendly staff aur ekdum prompt service. Family ke saath aane ke liye best jagah hai.",
      "Yahan ka experience behad shandar raha. Staff ne bohot achhe se care kiya aur ambience kaafi relaxing tha.",
    ],
    Food: [
      "Khana ekdum fresh aur swaadisht tha, garma garam serve hua. Har dish mast thi. Phir aayenge zaroor!",
      "Khane ne dil jeet liya. Taste badhiya, portion achha aur daam bilkul sahi. Highly recommended.",
    ],
    Service: [
      "Staff bohot friendly hai aur service ekdum fast. Pehle minute se hi welcome feel hua.",
      "Team ne dil se help ki. Polite, prompt aur caring. Maza aa gaya!",
    ],
    Ambience: [
      "Mahaul bahut pyaara aur peaceful hai. Family ya dosto ke saath time bitane ki best jagah.",
      "Ambience warm aur relaxing hai. Plan se zyada der ruk gaye. Kya baat hai!",
    ],
  },
};

/** Tiny decorative QR: three finder squares plus seeded noise. */
function QrMark({ className = "" }: { className?: string }) {
  const n = 21;
  const cells = useMemo(() => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 48271) % 2147483647) / 2147483647);
    const out: [number, number][] = [];
    const inFinder = (x: number, y: number) =>
      (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) if (!inFinder(x, y) && rnd() > 0.52) out.push([x, y]);
    return out;
  }, []);
  const finder = (ox: number, oy: number) => (
    <g key={`${ox}-${oy}`}>
      <rect x={ox} y={oy} width="7" height="7" fill="currentColor" />
      <rect x={ox + 1} y={oy + 1} width="5" height="5" fill="#fff" />
      <rect x={ox + 2} y={oy + 2} width="3" height="3" fill="currentColor" />
    </g>
  );
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className={className} aria-hidden="true" shapeRendering="crispEdges">
      <rect width={n} height={n} fill="#fff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
      ))}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  );
}

function Stars({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span className="inline-flex gap-0.5 text-[#FF8A1F]" aria-label="5 out of 5 stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${className} fill-current`} />
      ))}
    </span>
  );
}

export default function Hero() {
  const { data: session } = useSession();
  const [copied, setCopied] = useState<number | null>(null);
  const [lang, setLang] = useState<Lang>("en");
  const [tag, setTag] = useState<Tag | null>("Food");

  const drafts = COPY[lang][tag ?? "none"];

  const handleCopy = (i: number, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2500);
  };

  return (
    <>
      <style>{`
        @keyframes rf-float { 0%,100% { transform: translateY(0) rotate(var(--r,0deg)); } 50% { transform: translateY(-8px) rotate(var(--r,0deg)); } }
        @keyframes rf-scan { 0% { top: 6%; } 50% { top: 88%; } 100% { top: 6%; } }
        .rf-float { animation: rf-float 5s ease-in-out infinite; }
        .rf-scan { animation: rf-scan 2.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .rf-float, .rf-scan { animation: none; } }
      `}</style>

      {/* ───────── HERO ───────── */}
      <section id="top" className="relative w-full overflow-hidden bg-[#FBF6EC] text-[#17120E]">
        {/* soft background glow + dot grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: "radial-gradient(#17120E22 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "linear-gradient(to bottom, black, transparent 80%)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent 80%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-[#FF8A1F]/25 blur-3xl"
        />

        <div className="relative mx-auto grid w-full max-w-[1240px] items-center gap-14 px-5 pb-16 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:pb-28 lg:pt-24">
          {/* ── Left: copy ── */}
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#17120E]/15 bg-white/70 py-1.5 pl-2 pr-4 font-body text-xs font-semibold backdrop-blur">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#17120E] text-[#FF8A1F]">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              AI-powered Google reviews
            </p>

            <h1 className="mt-6 font-headline text-[44px] font-extrabold leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-[84px]">
              Happy customers,{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10 italic text-[#0B6E4F]">five stars</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 300 18"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1 left-0 z-0 h-3 w-full text-[#FF8A1F] sm:h-4"
                >
                  <path d="M3 12 C 60 2, 120 18, 180 8 S 270 4, 297 10" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
                </svg>
              </span>{" "}
              later.
            </h1>

            <p className="mt-7 max-w-[540px] font-body text-base leading-relaxed text-[#17120E]/75 sm:text-lg lg:text-xl">
              Put a QR code on the table. Your customer scans, taps what they loved, and AI writes an honest
              review they post to Google Maps in under 30 seconds. No app, no login, fully policy compliant.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                href={session?.user ? "/dashboard" : "/signin"}
                className="group inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[#17120E] px-8 font-body text-base font-semibold text-[#FBF6EC] shadow-[0_10px_30px_-10px_#17120E99] transition hover:-translate-y-0.5 hover:bg-[#0B6E4F] sm:w-auto sm:text-lg"
              >
                {session?.user ? "Go to dashboard" : "Get started free"}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#demo"
                className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full border border-[#17120E]/25 bg-white/60 px-8 font-body text-base font-semibold transition hover:border-[#17120E] sm:w-auto sm:text-lg"
              >
                Try the live demo
              </a>
            </div>

            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 font-body text-sm font-semibold text-[#17120E]/80">
              {["No customer app needed", "Google policy compliant", "Set up in minutes"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-[#0B6E4F] text-white">
                    <Check className="h-3 w-3" strokeWidth={3.5} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right: phone + QR ── */}
          <div className="relative mx-auto w-full max-w-[380px] lg:max-w-[420px]">
            {/* QR card */}
            <div
              className="rf-float absolute -left-2 top-10 z-20 hidden w-[132px] rounded-2xl bg-white p-3 shadow-[0_20px_40px_-15px_#17120E66] ring-1 ring-[#17120E]/10 sm:block lg:-left-16"
              style={{ ["--r" as string]: "-8deg" }}
            >
              <div className="relative overflow-hidden rounded-lg">
                <QrMark className="block h-full w-full text-[#17120E]" />
                <div className="rf-scan absolute inset-x-0 h-0.5 bg-[#FF8A1F] shadow-[0_0_12px_2px_#FF8A1F]" />
              </div>
              <p className="mt-2 flex items-center justify-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest">
                <ScanLine className="h-3 w-3" /> Scan me
              </p>
            </div>

            {/* Floating notification */}
            <div
              className="rf-float absolute -right-1 bottom-24 z-20 hidden items-center gap-2.5 rounded-2xl bg-[#17120E] px-3.5 py-2.5 text-[#FBF6EC] shadow-[0_20px_40px_-15px_#17120E99] sm:flex lg:-right-10"
              style={{ ["--r" as string]: "5deg", animationDelay: "-2s" }}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#0B6E4F]">
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
              <span className="font-body text-xs leading-tight">
                <strong className="block text-[13px]">New review posted</strong>
                <span className="text-[#FBF6EC]/70">just now · 5.0 ★</span>
              </span>
            </div>

            {/* Phone */}
            <div className="relative mx-auto w-full max-w-[340px] rounded-[44px] bg-[#17120E] p-2.5 shadow-[0_40px_80px_-30px_#17120Ecc] sm:rotate-[2deg]">
              <div className="absolute left-1/2 top-3.5 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#17120E]" />
              <div className="overflow-hidden rounded-[34px] bg-[#FBF6EC]">
                <div className="px-5 pb-6 pt-10">
                  <div className="text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#FF8A1F] font-headline text-xl font-extrabold">
                      B
                    </div>
                    <h2 className="mt-3 font-headline text-xl font-extrabold tracking-[-0.02em]">
                      Your Business Name
                    </h2>
                    <div className="mt-1.5 flex items-center justify-center gap-2">
                      <Stars className="h-3.5 w-3.5" />
                      <span className="font-mono text-xs font-bold">5.0</span>
                    </div>
                  </div>

                  <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#17120E]/55">
                    What stood out?
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {TAGS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={tag === t}
                        onClick={() => setTag(tag === t ? null : t)}
                        className={`min-h-[40px] rounded-full border px-4 font-body text-xs font-semibold transition ${
                          tag === t
                            ? "border-[#0B6E4F] bg-[#0B6E4F] text-white"
                            : "border-[#17120E]/20 bg-white hover:border-[#17120E]"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div
                    role="group"
                    aria-label="Review language"
                    className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-[#17120E]/8 p-1"
                    style={{ backgroundColor: "#17120E14" }}
                  >
                    {([
                      { k: "en", name: "English" },
                      { k: "hi", name: "Hinglish" },
                    ] as { k: Lang; name: string }[]).map((l) => (
                      <button
                        key={l.k}
                        type="button"
                        aria-pressed={lang === l.k}
                        onClick={() => setLang(l.k)}
                        className={`min-h-[40px] rounded-full px-3 font-body text-sm font-semibold transition ${
                          lang === l.k ? "bg-white shadow" : "text-[#17120E]/60"
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 space-y-3">
                    {drafts.map((text, i) => (
                      <div key={`${lang}-${tag}-${i}`} className="rounded-2xl bg-white p-3.5 ring-1 ring-[#17120E]/10">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#0B6E4F]">
                            {i === 0 ? "Top pick" : "Personal touch"}
                          </span>
                          <Stars className="h-3 w-3" />
                        </div>
                        <p className="mt-2 font-body text-[13.5px] leading-relaxed">{text}</p>
                        <button
                          type="button"
                          onClick={() => handleCopy(i, text)}
                          className={`mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-5 font-body text-sm font-semibold transition ${
                            copied === i
                              ? "bg-[#0B6E4F] text-white"
                              : "bg-[#17120E] text-[#FBF6EC] hover:bg-[#FF8A1F] hover:text-[#17120E]"
                          }`}
                        >
                          {copied === i ? (
                            <>
                              <Check className="h-4 w-4" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" /> Copy &amp; post
                              <Send className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-[#17120E]/55">
                    Powered by <strong className="text-[#17120E]">ReviewFlow AI</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section aria-label="How it works" className="bg-[#17120E] text-[#FBF6EC]">
        <div className="mx-auto grid max-w-[1240px] gap-px bg-[#FBF6EC]/10 px-0 sm:grid-cols-3 sm:px-8">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-[#17120E] px-5 py-8 sm:px-8 sm:py-12">
              <span className="font-number text-sm font-bold text-[#FF8A1F]">{s.n}</span>
              <h3 className="mt-2 font-headline text-2xl font-extrabold tracking-[-0.02em]">{s.t}</h3>
              <p className="mt-2 max-w-[300px] font-body text-sm leading-relaxed text-[#FBF6EC]/65">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── RESULTS ───────── */}
      <section aria-label="Results" className="bg-[#FF8A1F] text-[#17120E]">
        <div className="mx-auto grid max-w-[1240px] grid-cols-3 gap-2 px-5 py-8 sm:px-8 sm:py-12">
          {STATS.map((s) => (
            <div key={s.l} className="text-center sm:text-left">
              <div className="font-number text-4xl font-extrabold leading-none tracking-[-0.03em] sm:text-7xl">
                {s.n}
              </div>
              <div className="mt-2 font-body text-[11px] font-semibold leading-tight sm:text-base">{s.l}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}