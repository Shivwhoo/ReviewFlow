"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, RefreshCw, Sparkles, Star } from "lucide-react";

type Tone = "casual" | "professional" | "genz" | "short";
type Language = "en" | "hi";
type Length = "shorter" | "longer";

interface ReviewPair {
  topPick: string;
  personalTouch: string;
}

const ALL_TAGS = ["Food", "Service", "Ambience", "Staff", "Value"];

// Comprehensive generator covering all combinations of Rating, Tone, Topics, Language, Length, and Variation seed
function generateReview(
  rating: number,
  tone: Tone,
  tags: string[],
  language: Language,
  length: Length,
  variation: number
): ReviewPair {
  const activeTags = tags.length > 0 ? tags : ["Food", "Service"];
  const tagListEn = activeTags.join(" and ").toLowerCase();
  const primaryTag = activeTags[0] || "Food";

  // --- HINGLISH GENERATION ---
  if (language === "hi") {
    if (rating >= 5) {
      if (tone === "casual") {
        return length === "shorter"
          ? {
              topPick: variation % 2 === 0
                ? `BP PALACE ka ${tagListEn} sach mein kamaal tha! Staff ka nature bohot polite tha aur overall vibe 10/10. Definitely coming back soon!`
                : `Khana aur service dono lajawab the BP PALACE mein. Bilkul homely aur fresh feeling aayi. Dost aur family dono ke liye best jagah hai!`,
              personalTouch: variation % 2 === 0
                ? `Pehli baar BP PALACE try kiya aur dil khush ho gaya. Special mention for unka attentive staff jo har cheez ka dhyan rakh raha tha.`
                : `BP PALACE mein dinner ka experience ekdum unforgettable tha. Ambience itna peaceful tha ki humne kaafi relax feel kiya. Highly recommend!`
            }
          : {
              topPick: variation % 2 === 0
                ? `Kal shaam BP PALACE gaye the aur pura experience exceptional raha. Khana bilkul fresh aur authentic tha, aur ${tagListEn} mein unka dedication saaf dikhta hai. Staff ka polite attitude aur quick service ne dil jeet liya. 5 star experience! 🌟`
                : `BP PALACE ne hamari expectations exceed kar di! Khaane ka taste zabardast tha, portion sizes generous the aur presentation bhi premium thi. Service itni fast thi ki bilkul wait nahi karna pada. Sabhi ko ek baar zaroor aana chahiye.`,
              personalTouch: variation % 2 === 0
                ? `Family ke sath BP PALACE mein anniversary celebrate ki. Unhone hamare table ko bohot achhe se host kiya aur ${primaryTag} kaafi special tha. Shandar hospitality aur memorable shaam ke liye shukriya!`
                : `Weekends par relaxing time spend karne ke liye BP PALACE se better spot nahi mila. Music subtle tha, table spacing achhi thi aur service on-point thi. Har visit par quality same maintain rehti hai.`
            };
      }
      if (tone === "genz") {
        return length === "shorter"
          ? {
              topPick: `BP PALACE literally went crazyy fr 🔥 ${primaryTag} was absolutely peak aur aesthetic full on point tha. 10/10 no cap!`,
              personalTouch: `The vibes at BP PALACE are completely immaculate ✨ Unka service aur presentation itna aesthetic hai ki camera roll bhar gaya!`
            }
          : {
              topPick: `BP PALACE is officially my new obsession! The ${tagListEn} hit so different and the atmosphere is giving pure main character energy 🔥. Super aesthetic spot and staff was super friendly. Total must-visit fr!`,
              personalTouch: `Never gatekeeping BP PALACE! We pulled up for lunch and everything was 100/10. The staff made sure we had the best time, and the vibe was super chill. Will definitely be living here now! 😭✨`
            };
      }
      if (tone === "professional") {
        return length === "shorter"
          ? {
              topPick: `BP PALACE mein hospitality aur ${tagListEn} ka standard behad commendable hai. Prompt coordination aur shandar dining experience.`,
              personalTouch: `Business dinner ke liye BP PALACE select kiya tha. Unka refined atmosphere aur disciplined staff ne bohot positive impression banaya.`
            }
          : {
              topPick: `BP PALACE mein visit ke dauran unki high-quality service aur curated culinary standards ne prabhavit kiya. Unka staff professional hai aur unki management customer satisfaction ko priority deti hai. A highly recommended dining establishment.`,
              personalTouch: `Ek zaroori corporate gathering ke dauran BP PALACE ki team ne har ek requirement seamlessly handle ki. Clean environment, sophisticated arrangement, aur top-grade hospitality. A credible 5-star venue.`
            };
      }
      // Direct
      return length === "shorter"
        ? {
            topPick: `BP PALACE: Top-notch ${tagListEn}, fast turnaround, polite staff. 5/5 stars.`,
            personalTouch: `Spotless place, fresh food, and reasonable pricing. Definitely recommend BP PALACE.`
          }
        : {
            topPick: `Visited BP PALACE. Quick seating, delicious food, clean atmosphere, and attentive staff. Consistent quality on every visit. Fully recommended.`,
            personalTouch: `Ordered multiple items at BP PALACE. Prompt service, excellent preparation, and great value. Zero complaints, solid 5 stars.`
          };
    } else if (rating === 4) {
      return {
        topPick: `BP PALACE ka experience kaafi achha raha! ${primaryTag} was really good aur staff bhi helpful tha. Bas peak time pe thoda sa wait tha, baaki sab perfect! 👍`,
        personalTouch: `Enjoyed our visit to BP PALACE. Food taste aur quality bilkul solid thi. Definitely recommend karunga dosto ko.`
      };
    } else {
      // 3 stars or lower
      return {
        topPick: `BP PALACE mein experience decent tha. ${primaryTag} theek tha lekin service mein thoda improvement ho sakta hai. Average experience overall.`,
        personalTouch: `Visit okay rahi. Staff was polite but order aane mein thoda time lag gaya. Scope for improvement hai.`
      };
    }
  }

  // --- ENGLISH GENERATION ---
  if (rating >= 5) {
    if (tone === "casual") {
      return length === "shorter"
        ? {
            topPick: variation % 2 === 0
              ? `Had a wonderful time at BP PALACE! The ${tagListEn} was amazing and the whole staff made us feel right at home. Definitely coming back!`
              : `Really impressed with BP PALACE! Everything was fresh, delicious, and served with a genuine smile. A new favorite spot!`,
            personalTouch: variation % 2 === 0
              ? `Such a warm, welcoming vibe at BP PALACE. You can tell the team takes genuine pride in their ${primaryTag}. Couldn't have asked for more!`
              : `Visited BP PALACE for dinner and was blown away. The attention to detail and friendly energy made our whole evening special.`
          }
        : {
            topPick: variation % 2 === 0
              ? `Had an absolutely fantastic visit to BP PALACE! From the moment we walked in, the hospitality was warm and attentive. The ${tagListEn} exceeded our expectations, with incredible flavors and top-tier presentation. Easily one of the best dining experiences around. Highly recommend to everyone! ⭐⭐⭐⭐⭐`
              : `BP PALACE never fails to deliver a 5-star experience! The ${tagListEn} was prepared to perfection, and our server was courteous and speedy. The atmosphere was welcoming and comfortable for our entire group. We will definitely be back again soon!`,
            personalTouch: variation % 2 === 0
              ? `Brought our family to BP PALACE for a special dinner, and they took extraordinary care of us. The ${primaryTag} was an absolute hit with everyone at the table. It's rare to find a place that combines genuine warmth with this level of consistency. Thank you for a memorable evening!`
              : `My first time visiting BP PALACE, and I am officially hooked. The team went out of their way to ensure every single detail was right, especially the ${primaryTag}. Such a relaxing environment and remarkable hospitality. Five enthusiastic stars!`
          };
    }

    if (tone === "professional") {
      return length === "shorter"
        ? {
            topPick: `BP PALACE exemplifies high standards in ${tagListEn}. The operation is well-run, punctual, and delivered with genuine professionalism. Highly recommended.`,
            personalTouch: `An exemplary experience at BP PALACE. Attentive coordination, immaculate presentation, and an environment well-suited for professional gatherings.`
          }
        : {
            topPick: `BP PALACE maintains an admirable standard of hospitality and operational excellence. The ${tagListEn} demonstrated meticulous attention to quality, backed by a courteous, prompt, and well-trained staff. An exceptional venue that I recommend without hesitation.`,
            personalTouch: `Selected BP PALACE for a business dinner and was thoroughly impressed by the seamless execution. The team handled every detail with quiet efficiency, and the quality of their ${primaryTag} set a benchmark for the area. A distinguished 5-star establishment.`
          };
    }

    if (tone === "genz") {
      return length === "shorter"
        ? {
            topPick: `BP PALACE did not miss fr 🔥 The ${primaryTag} was absolutely elite and the aesthetic is 10/10. Definitely coming back every week!`,
            personalTouch: `Vibes at BP PALACE were completely immaculate ✨ Super aesthetic, sweetest staff, and food that actually slaps. Zero notes!`
          }
        : {
            topPick: `BP PALACE is officially my new hyperfixation! The ${tagListEn} hit so incredibly hard and the whole place has main character energy. Staff was super sweet and the aesthetic is ridiculously photogenic. 10/10 would recommend to everyone! 🔥✨`,
            personalTouch: `Run don't walk to BP PALACE! Came here with friends and everything was top tier. The ${primaryTag} blew our minds, service was crazy fast, and the vibe was so chill. Literally obsessing over this place!`
          };
    }

    // Direct
    return length === "shorter"
      ? {
          topPick: `Excellent visit to BP PALACE. High quality ${tagListEn}, quick service, and clean surroundings. 5/5 stars.`,
          personalTouch: `Fast seating, great food, and courteous staff at BP PALACE. Solid value for money. Recommended.`
        }
      : {
          topPick: `Visited BP PALACE today. Fast service, high-quality ${tagListEn}, and spotless facilities. Clear attention to customer satisfaction throughout. Will certainly return.`,
          personalTouch: `Reliable, consistent, and well-executed experience at BP PALACE. The ${primaryTag} was well-prepared, billing was transparent, and staff was attentive. Full 5 stars.`
        };
  }

  if (rating === 4) {
    return length === "shorter"
      ? {
          topPick: `Good overall experience at BP PALACE. The ${tagListEn} was very satisfying and staff was attentive. Slight wait during peak time, but well worth it.`,
          personalTouch: `Enjoyed our visit to BP PALACE. Solid quality and friendly atmosphere. Will certainly consider returning!`
        }
      : {
          topPick: `Had a very good visit at BP PALACE. The ${tagListEn} was of high quality and served with care. Just a small delay during the lunch rush, but the staff was communicative and polite. Overall a solid 4-star experience.`,
          personalTouch: `Good food and comfortable ambience at BP PALACE. The staff checked on us multiple times and ensured our order was accurate. A positive impression and worth checking out.`
        };
  }

  // 3 stars or lower
  return length === "shorter"
    ? {
        topPick: `Average experience at BP PALACE. The ${primaryTag} was acceptable, but service could be slightly faster. Decent overall.`,
        personalTouch: `Decent atmosphere at BP PALACE, though some room for improvement in speed. Okay experience.`
      }
    : {
        topPick: `An okay visit to BP PALACE. The ${primaryTag} was decent, though we experienced longer wait times than expected. Staff was polite, but there is room for better coordination during busy hours.`,
        personalTouch: `Fair experience at BP PALACE. Good ambience and polite team, but the ${primaryTag} fell slightly short of expectations. Hoping for better consistency next time.`
      };
}

type Preset = {
  emoji: string;
  title: string;
  sub: string;
  rating: number;
  tone: Tone;
  tags: string[];
  language: Language;
  length: Length;
};

const PRESETS: Preset[] = [
  { emoji: "🍔", title: "Casual foodie", sub: "5★ · English · short", rating: 5, tone: "casual", tags: ["Food", "Service"], language: "en", length: "shorter" },
  { emoji: "✨", title: "Hinglish Gen-Z", sub: "5★ · Hinglish · short", rating: 5, tone: "genz", tags: ["Ambience", "Food"], language: "hi", length: "shorter" },
  { emoji: "💼", title: "Corporate dinner", sub: "5★ · English · detailed", rating: 5, tone: "professional", tags: ["Service", "Staff"], language: "en", length: "longer" },
  { emoji: "⚡", title: "Direct 4-star", sub: "4★ · to the point", rating: 4, tone: "short", tags: ["Food", "Value"], language: "en", length: "shorter" },
];

const TONES: { val: Tone; label: string; sub: string }[] = [
  { val: "casual", label: "Conversational", sub: "Friendly & natural" },
  { val: "professional", label: "Professional", sub: "Polished & objective" },
  { val: "genz", label: "Modern", sub: "Contemporary styling" },
  { val: "short", label: "Direct", sub: "To the point" },
];

const MOOD: Record<number, string> = {
  1: "Rough visit",
  2: "Not great",
  3: "It was okay",
  4: "Pretty good",
  5: "Loved it",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block font-mono text-[11px] font-bold uppercase tracking-widest text-[#FBF6EC]/50">
      {children}
    </span>
  );
}

function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { val: T; name: string }[];
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="grid gap-1 rounded-full bg-[#FBF6EC]/10 p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => (
        <button
          key={o.val}
          type="button"
          aria-pressed={value === o.val}
          onClick={() => onChange(o.val)}
          className={`min-h-[40px] rounded-full px-3 font-body text-sm font-semibold transition ${
            value === o.val ? "bg-[#FBF6EC] text-[#17120E] shadow" : "text-[#FBF6EC]/70 hover:text-[#FBF6EC]"
          }`}
        >
          {o.name}
        </button>
      ))}
    </div>
  );
}

export default function DemoPreview() {
  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(["Food", "Service", "Ambience"]);
  const [tone, setTone] = useState<Tone>("casual");
  const [language, setLanguage] = useState<Language>("en");
  const [length, setLength] = useState<Length>("shorter");
  const [variationSeed, setVariationSeed] = useState<number>(0);
  const [copiedDraft, setCopiedDraft] = useState<number | null>(null);
  const [busy, setBusy] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<number | null>(0);
  const isFirst = useRef(true);

  const reviews = useMemo(() => {
    return generateReview(rating, tone, selectedTags, language, length, variationSeed);
  }, [rating, tone, selectedTags, language, length, variationSeed]);

  // Brief "writing…" shimmer whenever the draft changes
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    setBusy(true);
    const id = setTimeout(() => setBusy(false), 450);
    return () => clearTimeout(id);
  }, [reviews]);

  const manual = () => setActivePreset(null);

  const toggleTag = (tag: string) => {
    manual();
    setSelectedTags((prev) =>
      prev.includes(tag) ? (prev.length > 1 ? prev.filter((t) => t !== tag) : prev) : [...prev, tag]
    );
  };

  const applyPreset = (p: Preset, i: number) => {
    setRating(p.rating);
    setTone(p.tone);
    setSelectedTags(p.tags);
    setLanguage(p.language);
    setLength(p.length);
    setActivePreset(i);
  };

  const handleCopy = (index: number, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedDraft(index);
    setTimeout(() => setCopiedDraft(null), 2500);
  };

  const drafts = [
    { id: 1, label: "Top pick", text: reviews.topPick },
    { id: 2, label: "Personal touch", text: reviews.personalTouch },
  ];

  return (
    <section
      id="demo"
      className="relative w-full overflow-hidden bg-[#17120E] px-4 py-16 text-[#FBF6EC] sm:px-6 sm:py-24 lg:px-8"
    >
      <style>{`
        @keyframes rf-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes rf-rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .rf-shimmer { background: linear-gradient(90deg, #17120E10 25%, #17120E22 50%, #17120E10 75%); background-size: 200% 100%; animation: rf-shimmer 1.1s linear infinite; }
        .rf-rise { animation: rf-rise .35s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .rf-shimmer, .rf-rise { animation: none; } }
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-[#FF8A1F]/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 max-w-2xl sm:mb-14">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#FBF6EC]/15 bg-[#FBF6EC]/5 py-1.5 pl-2 pr-4 font-body text-xs font-semibold">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#FF8A1F] text-[#17120E]">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            Interactive live sandbox
          </p>
          <h2 className="mt-5 font-headline text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] text-[#FBF6EC] sm:text-5xl lg:text-6xl">
            Play with it.{" "}
            <span className="italic text-[#FF8A1F]">Right here.</span>
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-[#FBF6EC]/70 sm:text-lg">
            Change the rating, highlights, tone or language and watch the customer&rsquo;s review page rewrite
            itself in real time.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
          {/* ───────── Control deck ───────── */}
          <div className="order-2 space-y-8 rounded-3xl border border-[#FBF6EC]/10 bg-[#FBF6EC]/[0.04] p-5 sm:p-8 lg:order-1">
            {/* Scenarios */}
            <div>
              <FieldLabel>Quick scenarios</FieldLabel>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {PRESETS.map((p, i) => (
                  <button
                    key={p.title}
                    type="button"
                    aria-pressed={activePreset === i}
                    onClick={() => applyPreset(p, i)}
                    className={`rounded-2xl border p-3.5 text-left transition sm:p-4 ${
                      activePreset === i
                        ? "border-[#FF8A1F] bg-[#FF8A1F] text-[#17120E]"
                        : "border-[#FBF6EC]/15 bg-transparent hover:border-[#FBF6EC]/50"
                    }`}
                  >
                    <span className="text-xl" aria-hidden="true">
                      {p.emoji}
                    </span>
                    <span className="mt-1.5 block font-headline text-[15px] font-extrabold leading-tight sm:text-base">
                      {p.title}
                    </span>
                    <span
                      className={`mt-0.5 block font-body text-xs ${
                        activePreset === i ? "text-[#17120E]/70" : "text-[#FBF6EC]/55"
                      }`}
                    >
                      {p.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <FieldLabel>Customer rating</FieldLabel>
              <div className="flex items-center gap-3">
                <div className="flex gap-1" role="group" aria-label="Rating stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-label={`Set rating to ${s} stars`}
                      onClick={() => {
                        manual();
                        setRating(s);
                      }}
                      className="rounded-lg p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors sm:h-9 sm:w-9 ${
                          s <= rating
                            ? "fill-[#FF8A1F] text-[#FF8A1F]"
                            : "fill-transparent text-[#FBF6EC]/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="font-headline text-lg font-extrabold">{MOOD[rating]}</span>
              </div>
            </div>

            {/* Highlights */}
            <div>
              <FieldLabel>What stood out?</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map((t) => {
                  const on = selectedTags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleTag(t)}
                      className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-4 font-body text-sm font-semibold transition ${
                        on
                          ? "border-[#0B6E4F] bg-[#0B6E4F] text-white"
                          : "border-[#FBF6EC]/20 text-[#FBF6EC]/75 hover:border-[#FBF6EC]/60"
                      }`}
                    >
                      {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language + length */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <FieldLabel>Language</FieldLabel>
                <Segmented<Language>
                  label="Language"
                  value={language}
                  onChange={(v) => {
                    manual();
                    setLanguage(v);
                  }}
                  options={[
                    { val: "en", name: "English" },
                    { val: "hi", name: "Hinglish" },
                  ]}
                />
              </div>
              <div>
                <FieldLabel>Length</FieldLabel>
                <Segmented<Length>
                  label="Length"
                  value={length}
                  onChange={(v) => {
                    manual();
                    setLength(v);
                  }}
                  options={[
                    { val: "shorter", name: "Concise" },
                    { val: "longer", name: "Detailed" },
                  ]}
                />
              </div>
            </div>

            {/* Tone */}
            <div>
              <FieldLabel>Tone</FieldLabel>
              <div className="grid grid-cols-2 gap-2.5">
                {TONES.map((t) => (
                  <button
                    key={t.val}
                    type="button"
                    aria-pressed={tone === t.val}
                    onClick={() => {
                      manual();
                      setTone(t.val);
                    }}
                    className={`rounded-2xl border p-3 text-left transition ${
                      tone === t.val
                        ? "border-[#FBF6EC] bg-[#FBF6EC] text-[#17120E]"
                        : "border-[#FBF6EC]/15 text-[#FBF6EC]/80 hover:border-[#FBF6EC]/50"
                    }`}
                  >
                    <span className="block font-body text-sm font-bold">{t.label}</span>
                    <span className={`block font-body text-xs ${tone === t.val ? "text-[#17120E]/60" : "text-[#FBF6EC]/50"}`}>
                      {t.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ───────── Phone ───────── */}
          <div className="order-1 mx-auto w-full max-w-[400px] lg:sticky lg:top-24 lg:order-2">
            <div className="rounded-[44px] bg-[#2A221C] p-2.5 shadow-[0_40px_90px_-30px_#FF8A1F66] ring-1 ring-[#FBF6EC]/15">
              <div className="relative overflow-hidden rounded-[34px] bg-[#FBF6EC] text-[#17120E]">
                <div className="absolute left-1/2 top-3 h-5 w-24 -translate-x-1/2 rounded-full bg-[#17120E]" />
                <div className="px-5 pb-6 pt-11 sm:px-6">
                  {/* business */}
                  <div className="text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#FF8A1F] font-headline text-xl font-extrabold">
                      B
                    </div>
                    <h3 className="mt-3 font-headline text-2xl font-extrabold tracking-[-0.02em] text-[#17120E]">BP PALACE</h3>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-[#17120E]/10">
                      <span className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${
                              s <= rating ? "fill-[#FF8A1F] text-[#FF8A1F]" : "fill-transparent text-[#17120E]/20"
                            }`}
                          />
                        ))}
                      </span>
                      <span className="font-mono text-xs font-bold">{rating}.0</span>
                    </div>
                  </div>

                  {/* selected highlights */}
                  <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                    {selectedTags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-[#0B6E4F]/10 px-2.5 py-1 font-body text-[11px] font-semibold text-[#0B6E4F]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* drafts header */}
                  <div className="mb-3 mt-5 flex items-center justify-between">
                    <h4 className="font-headline text-base font-extrabold text-[#17120E]">
                      Curated <span className="italic text-[#0B6E4F]">drafts</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setVariationSeed((v) => v + 1)}
                      className="flex min-h-[36px] items-center gap-1.5 rounded-full px-3 font-body text-xs font-semibold text-[#17120E]/70 transition hover:bg-[#17120E]/10 hover:text-[#17120E]"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
                      Refresh
                    </button>
                  </div>

                  <div className="space-y-3">
                    {drafts.map((d) => (
                      <div key={d.id} className="rounded-2xl bg-white p-3.5 ring-1 ring-[#17120E]/10">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#0B6E4F]">
                            <Star className="h-3 w-3 fill-current" />
                            {d.label}
                          </span>
                          <span className="font-mono text-[10px] text-[#17120E]/40">
                            {d.text.length} chars
                          </span>
                        </div>

                        {busy ? (
                          <div className="mt-3 space-y-2" aria-hidden="true">
                            <div className="rf-shimmer h-3 w-full rounded" />
                            <div className="rf-shimmer h-3 w-11/12 rounded" />
                            <div className="rf-shimmer h-3 w-2/3 rounded" />
                          </div>
                        ) : (
                          <p key={`${d.text}`} className="rf-rise mt-2 min-h-[56px] font-body text-[13.5px] leading-relaxed">
                            {d.text}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopy(d.id, d.text)}
                          className={`mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-5 font-body text-sm font-semibold transition ${
                            copiedDraft === d.id
                              ? "bg-[#0B6E4F] text-white"
                              : "bg-[#17120E] text-[#FBF6EC] hover:bg-[#FF8A1F] hover:text-[#17120E]"
                          }`}
                        >
                          {copiedDraft === d.id ? (
                            <>
                              <Check className="h-4 w-4" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" /> Copy review
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-widest text-[#17120E]/50">
                    Powered by <strong className="text-[#17120E]">ReviewFlow AI</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}