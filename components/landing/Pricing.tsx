"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out ReviewFlow",
    features: [
      "50 AI reviews/month",
      "1 location",
      "1 QR code",
      "Basic analytics",
      "Email support",
    ],
    cta: "Start Free",
    href: "/signin",
    popular: false,
    badge: "Instant Setup",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing businesses",
    features: [
      "500 AI reviews/month",
      "1 location",
      "5 QR codes",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "Review tone training",
    ],
    cta: "Register & Upgrade",
    href: "/signin",
    popular: true,
    badge: "Offline Billing",
  },
  {
    name: "Multi-Location",
    price: "$79",
    period: "/month",
    description: "For chains & franchises",
    features: [
      "Unlimited AI reviews",
      "Unlimited locations",
      "Unlimited QR codes",
      "Advanced analytics per location",
      "Dedicated support",
      "Custom branding",
      "API access",
      "Team members",
    ],
    cta: "Contact Support",
    href: "mailto:support@reviewflow.app?subject=ReviewFlow%20AI%20-%20Multi-Location%20Plan%20Inquiry",
    popular: false,
    badge: "Custom Invoice",
  },
];

export default function Pricing() {
  return (
    <section className="px-4 py-24 max-w-6xl mx-auto" id="pricing">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Simple, transparent pricing
        </h2>
        <p className="mt-3 text-white/40 text-lg">
          Start free, scale manually with custom offline invoicing
        </p>
      </motion.div>

      {/* Premium Offline Billing Notice Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto mb-16 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center text-sm text-violet-300 backdrop-blur-md flex items-center justify-center gap-3"
      >
        <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-ping shrink-0" />
        <p>
          <span className="font-semibold text-white">💳 Offline Payment Model:</span> We bill manually via bank transfer, invoice, or check. Zero automatic recurring card charges or surprises.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`relative rounded-2xl p-8 flex flex-col ${
              plan.popular
                ? "bg-gradient-to-b from-violet-500/10 to-fuchsia-500/5 border-2 border-violet-500/30"
                : "bg-glass"
              }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-xs font-semibold text-white">
                Most Popular
              </div>
            )}

            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/50">
                {plan.badge}
              </span>
            </div>
            <p className="text-sm text-white/40 mt-1">{plan.description}</p>

            <div className="mt-6 mb-6">
              <span className="text-4xl font-bold text-white">
                {plan.price}
              </span>
              <span className="text-white/40 ml-1">{plan.period}</span>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-white/60"
                >
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={`block text-center py-3 rounded-xl font-semibold transition-all ${
                plan.popular
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              {plan.cta}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

