'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function EnterprisePage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('growth');

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 499,
      users: '1-100',
      features: [
        'API access with 10K requests/month',
        'Basic data filtering',
        'Email support',
        'Standard SLA (99% uptime)',
        'Monthly data exports',
      ]
    },
    {
      id: 'growth',
      name: 'Growth',
      price: 1999,
      users: '100-1,000',
      popular: true,
      features: [
        'API access with 100K requests/month',
        'Advanced filtering & segmentation',
        'Dedicated account manager',
        'Priority SLA (99.9% uptime)',
        'Real-time data sync',
        'Custom data packages',
        'White-label options',
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      users: '1,000+',
      features: [
        'Unlimited API requests',
        'Custom integration & webhooks',
        'Dedicated infrastructure',
        'Premium SLA (99.99% uptime)',
        '24/7 phone support',
        'On-premise deployment option',
        'Custom contracts & compliance',
        'Strategic partnership opportunities',
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d1117] to-[#0a0a0a] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,217,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="backdrop-blur-xl bg-white/5 border-b border-white/10"
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  🏢 Enterprise Solutions
                </h1>
                <p className="text-sm text-gray-400">Scale your data acquisition with our B2B platform</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Access High-Quality Consumer Data at Scale
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Connect directly with users who consent to share their data. No scrapers, no bots, just real people with real insights.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Active Users', value: '50K+', icon: '👥' },
              { label: 'Data Sources', value: '26', icon: '🔗' },
              { label: 'Monthly Data Points', value: '2.5M+', icon: '📊' },
              { label: 'Enterprise Clients', value: '150+', icon: '🏢' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 text-center"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Pricing Plans */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Choose Your Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`backdrop-blur-xl rounded-2xl p-6 relative ${
                    plan.popular
                      ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/50'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-white text-xs font-semibold">
                      Most Popular
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h4 className="text-2xl font-bold text-white mb-2">{plan.name}</h4>
                    <div className="mb-2">
                      {typeof plan.price === 'number' ? (
                        <>
                          <span className="text-4xl font-bold text-cyan-400">${plan.price}</span>
                          <span className="text-gray-400">/month</span>
                        </>
                      ) : (
                        <span className="text-4xl font-bold text-cyan-400">{plan.price}</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{plan.users} users</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <span className="text-green-400 mt-0.5">✓</span>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {typeof plan.price === 'number' ? 'Start Free Trial' : 'Contact Sales'}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Built for Enterprise Use Cases</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Market Research',
                  icon: '📊',
                  description: 'Understand consumer behavior, preferences, and trends with real-time data from thousands of users.',
                  examples: ['Consumer segmentation', 'Brand perception analysis', 'Trend forecasting']
                },
                {
                  title: 'Product Development',
                  icon: '🚀',
                  description: 'Build better products by understanding how people use competing services and what features they need.',
                  examples: ['Feature validation', 'User journey mapping', 'Competitor analysis']
                },
                {
                  title: 'Personalization',
                  icon: '🎯',
                  description: 'Deliver hyper-personalized experiences using rich user preference and behavior data.',
                  examples: ['Content recommendations', 'Dynamic pricing', 'Targeted marketing']
                },
                {
                  title: 'Risk Assessment',
                  icon: '🛡️',
                  description: 'Make better underwriting and risk decisions with comprehensive user financial and behavioral data.',
                  examples: ['Credit scoring', 'Fraud detection', 'Insurance underwriting']
                },
              ].map((useCase, index) => (
                <motion.div
                  key={useCase.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{useCase.icon}</div>
                    <h4 className="text-xl font-bold text-white">{useCase.title}</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{useCase.description}</p>
                  <div className="space-y-2">
                    {useCase.examples.map((example) => (
                      <div key={example} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm">{example}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="backdrop-blur-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-8 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-3">Ready to Get Started?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join 150+ enterprises accessing high-quality, consented user data. Schedule a demo with our team today.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all">
                Schedule Demo
              </button>
              <button className="px-8 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-all">
                View API Docs
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
