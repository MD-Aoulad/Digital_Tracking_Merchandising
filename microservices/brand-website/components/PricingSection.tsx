'use client';

import { motion } from 'framer-motion';
import { Check, Star, Shield, Zap, Users, Database } from 'lucide-react';

const plans = [
  {
    name: 'Professional',
    price: '$99',
    period: '/user/month',
    description: 'For growing enterprises',
    features: [
      'Up to 500 users',
      'Advanced security features',
      'Real-time analytics',
      'API access',
      'Priority support',
      'Custom integrations',
      'Mobile applications',
      'Compliance reporting'
    ],
    popular: false,
    color: 'from-primary-blue to-primary-dark',
    icon: Shield
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: '/user/month',
    description: 'For large organizations',
    features: [
      'Unlimited users',
      'All Professional features',
      'Custom development',
      'Dedicated support',
      'White-label solution',
      'Advanced security',
      'Compliance reporting',
      'SLA guarantees'
    ],
    popular: true,
    color: 'from-accent-gold to-yellow-600',
    icon: Zap
  },
  {
    name: 'Ultimate',
    price: 'Custom',
    period: '/month',
    description: 'For Fortune 500 companies',
    features: [
      'All Enterprise features',
      'On-premise deployment',
      'Custom development',
      '24/7 dedicated support',
      'Enterprise SLA',
      'Advanced compliance',
      'Custom integrations',
      'Training & consulting'
    ],
    popular: false,
    color: 'from-purple-500 to-purple-600',
    icon: Database
  }
];

export default function PricingSection() {
  return (
    <section className="py-24 section-secondary" id="pricing">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Enterprise Pricing
          </h2>
          <p className="text-xl text-gray-light max-w-4xl mx-auto leading-relaxed">
            Scalable enterprise solutions designed for organizations of all sizes. 
            Choose the plan that fits your business requirements and scale as you grow.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative card-dark hover:border-accent transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-accent-gold scale-105' : ''
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-gold text-black px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Star size={16} />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-light mb-6">
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-light">
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                    <span className="text-gray-light">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-gold text-black hover:shadow-xl'
                  : 'bg-transparent text-white border-2 border-gray-dark hover:border-primary-blue'
              }`}>
                {plan.popular ? 'Get Started' : 'Contact Sales'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-black-primary border border-gray-dark rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 gradient-text">
              Need Custom Enterprise Solution?
            </h3>
            <p className="text-gray-light mb-8 text-lg">
              Our enterprise team will work with you to create a tailored solution that meets your specific requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-accent">
                Schedule Consultation
              </button>
              <button className="btn-secondary">
                Download Enterprise Guide
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 