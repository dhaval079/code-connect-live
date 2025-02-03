import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for small teams and side projects",
    features: ["Up to 3 team members", "5 active rooms", "Basic collaboration features", "Community support"],
  },
  {
    name: "Pro",
    price: "$19",
    description: "Great for growing teams and businesses",
    features: [
      "Unlimited team members",
      "Unlimited rooms",
      "Advanced collaboration tools",
      "Priority support",
      "Custom branding",
      "Analytics dashboard",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with custom needs",
    features: [
      "Everything in Pro",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantees",
      "Advanced security",
      "Custom deployment options",
    ],
  },
]

export default function Pricing() {
  return (
    <section className="py-24 relative">
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Choose the perfect plan for your team. All plans include our core features.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 ${
                plan.popular ? "ring-2 ring-cyan-500" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-cyan-500 text-white text-sm font-medium px-3 py-1 rounded-full">Most Popular</div>
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-2">{plan.price}</div>
                <p className="text-sm text-slate-400">{plan.description}</p>
              </div>
              <ul className="space-y-4 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm">
                    <Check className="w-5 h-5 text-cyan-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant={plan.popular ? "default" : "outline"} className="w-full">
                Get Started
              </Button>
              {plan.popular && (
                <motion.div
                  className="absolute inset-0 border-2 border-cyan-500 rounded-xl"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(6, 182, 212, 0.1)",
                      "0 0 40px rgba(6, 182, 212, 0.2)",
                      "0 0 20px rgba(6, 182, 212, 0.1)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

