"use client";

import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "$xx",
    period: "forever",
    description: "Perfect for testing ReviewFlow AI with a single location",
    features: [
      "50 AI reviews/month",
      "1 business location",
      "1 unique QR code",
      "Basic scan analytics",
      "Email support",
    ],
    cta: "Start Free",
    href: "/signin",
    popular: false,
    badge: "Instant Setup",
  },
  {
    name: "Pro",
    price: "$xx",
    period: "/month",
    description: "For growing businesses looking to dominate local search",
    features: [
      "500 AI reviews/month",
      "1 location with multiple tables",
      "5 custom QR codes",
      "Advanced rating analytics",
      "Priority WhatsApp & email support",
      "Custom business logo & branding",
      "AI review tone customization",
    ],
    cta: "Register & Upgrade",
    href: "/signin",
    popular: true,
    badge: "Offline Invoicing",
  },
  {
    name: "Multi-Location",
    price: "$xx",
    period: "/month",
    description: "For restaurant chains, franchises, and regional brands",
    features: [
      "Unlimited AI reviews",
      "Unlimited business locations",
      "Unlimited QR codes",
      "Location-by-location analytics",
      "Dedicated account manager",
      "Custom domain & full branding",
      "API & webhook integration",
      "Multi-user team permissions",
    ],
    cta: "Contact Sales",
    href: "mailto:support@reviewflow.app?subject=ReviewFlow%20AI%20-%20Multi-Location%20Plan%20Inquiry",
    popular: false,
    badge: "Custom Invoice",
  },
];

export default function Pricing() {
  return (
    <section className="landing-section-wrap max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24" id="pricing">
      <div className="text-left mb-8 sm:mb-10">
        <h2 className="landing-section-title font-headline font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#2B0E14]">
          Simple, transparent pricing
        </h2>
        <p className="landing-section-subtitle font-body text-base sm:text-lg text-[#2B0E14]/80 mt-2">
          Start free, scale with custom offline invoicing and zero surprises
        </p>
      </div>

      {/* Offline Billing Banner */}
      <div className="landing-billing-banner font-body mb-10 p-4 sm:p-5 bg-[#C8F04D] border-[3px] border-[#2B0E14] rounded-2xl flex items-start gap-3.5 shadow-[4px_4px_0_#2B0E14]">
        <ShieldCheck className="w-6 h-6 text-[#2B0E14] shrink-0 mt-0.5" />
        <p className="m-0 text-sm sm:text-base text-[#2B0E14] leading-relaxed">
          <strong>Offline Payment Model:</strong> We bill manually via bank transfer, invoice, or check. Zero automatic recurring credit card charges or unexpected billing surprises.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`landing-pricing-card flex flex-col justify-between p-6 sm:p-8 rounded-3xl border-[3px] border-[#2B0E14] relative transition-all hover:-translate-y-1 ${
              plan.popular
                ? "bg-[#C8F04D] shadow-[8px_8px_0_#2B0E14]"
                : "bg-[#FFF3EA] shadow-[6px_6px_0_#2B0E14]"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 right-6 bg-[#B0102F] text-[#FFF3EA] border-2 border-[#2B0E14] rounded-full px-4 py-1 font-headline font-extrabold text-xs shadow-[2px_2px_0_#2B0E14] rotate-[-2deg]">
                Most Popular
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <h3 className="landing-plan-name font-headline font-extrabold text-2xl sm:text-3xl text-[#2B0E14]">
                  {plan.name}
                </h3>
                <span className="inline-block px-3 py-1 bg-white/70 border-2 border-[#2B0E14] rounded-full font-body font-semibold text-xs text-[#2B0E14]">
                  {plan.badge}
                </span>
              </div>

              <p className="font-body text-sm sm:text-base text-[#2B0E14]/80 mt-3 leading-relaxed">
                {plan.description}
              </p>

              <div className="flex items-baseline gap-2 mt-6 pb-6 border-b border-[#2B0E14]/15">
                <span className="landing-plan-price-num font-headline font-extrabold text-4xl sm:text-5xl text-[#2B0E14]">
                  {plan.price}
                </span>
                <span className="landing-plan-period font-body text-base text-[#2B0E14]/75">
                  {plan.period}
                </span>
              </div>

              <ul className="list-none mt-6 p-0 flex flex-col gap-3 font-body">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm sm:text-[15px] text-[#2B0E14]">
                    <div className="w-5 h-5 rounded-full bg-[#B0102F] text-white flex items-center justify-center shrink-0 mt-0.5 border border-[#2B0E14]">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <Link
                href={plan.href}
                className={`w-full flex items-center justify-center py-3.5 px-6 rounded-full font-button font-semibold text-base border-2 border-[#2B0E14] transition-all ${
                  plan.popular
                    ? "bg-[#2B0E14] text-[#C8F04D] shadow-[4px_4px_0_#B0102F] hover:shadow-[2px_2px_0_#B0102F] hover:translate-x-0.5 hover:translate-y-0.5"
                    : "bg-[#B0102F] text-white shadow-[4px_4px_0_#2B0E14] hover:shadow-[2px_2px_0_#2B0E14] hover:translate-x-0.5 hover:translate-y-0.5"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
