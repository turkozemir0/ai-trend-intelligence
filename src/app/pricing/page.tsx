import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing | AI Trend Intelligence",
  description: "Choose the right plan for your AI intelligence needs",
};

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out the API",
      features: [
        "100 API requests/day",
        "Access to all endpoints",
        "Basic support",
        "7-day data history",
        "Community access",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$49",
      period: "per month",
      description: "For developers and small teams",
      features: [
        "10,000 API requests/day",
        "Access to all endpoints",
        "Priority support",
        "30-day data history",
        "Webhook notifications",
        "Export capabilities",
      ],
      cta: "Start Pro Trial",
      highlighted: true,
    },
    {
      name: "Team",
      price: "$199",
      period: "per month",
      description: "For growing companies",
      features: [
        "100,000 API requests/day",
        "Access to all endpoints",
        "Dedicated support",
        "90-day data history",
        "Webhook notifications",
        "Export capabilities",
        "Custom integrations",
        "Team management",
      ],
      cta: "Start Team Trial",
      highlighted: false,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large organizations",
      features: [
        "Unlimited API requests",
        "Access to all endpoints",
        "24/7 dedicated support",
        "Unlimited data history",
        "Webhook notifications",
        "Export capabilities",
        "Custom integrations",
        "Team management",
        "SLA guarantee",
        "Custom data sources",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-zinc-400">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg p-8 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-emerald-900/20 to-zinc-900 border-2 border-emerald-500"
                  : "bg-zinc-900 border border-zinc-800"
              } relative`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-zinc-950 px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && (
                    <span className="text-zinc-400 ml-2">/{plan.period}</span>
                  )}
                </div>
                <p className="text-zinc-400 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.name === "Enterprise" ? "/contact" : "/signup"}
                className={`block w-full text-center py-3 rounded-lg font-semibold transition ${
                  plan.highlighted
                    ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                    : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2 text-emerald-400">What happens if I exceed my rate limit?</h3>
              <p className="text-zinc-400 text-sm">
                Requests beyond your daily limit will receive a 429 error. You can upgrade your plan anytime to increase your limit.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-emerald-400">Can I cancel anytime?</h3>
              <p className="text-zinc-400 text-sm">
                Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-emerald-400">Do you offer refunds?</h3>
              <p className="text-zinc-400 text-sm">
                We offer a 14-day money-back guarantee for all paid plans. Contact support for a full refund within 14 days.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-emerald-400">What payment methods do you accept?</h3>
              <p className="text-zinc-400 text-sm">
                We accept all major credit cards (Visa, Mastercard, Amex) and support invoicing for Enterprise plans.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-zinc-400 mb-4">
            Need a custom solution? Have questions about our plans?
          </p>
          <Link
            href="/contact"
            className="inline-block bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-6 py-3 rounded-lg font-semibold transition"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  );
}
