'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function PackagesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'available' | 'active'>('available');

  // User's connected services for demo
  const connectedServices = ['spotify', 'fitbit', 'google'];

  const dataPackages = [
    {
      id: 1,
      name: 'Fitness Enthusiast',
      icon: '🏃',
      description: 'Complete health & fitness profile for wellness companies',
      services: ['Fitbit', 'Strava', 'MyFitnessPal', 'Apple Health'],
      servicesIds: ['fitbit', 'strava', 'myfitnesspal', 'apple_health'],
      insights: ['Activity patterns', 'Nutrition habits', 'Sleep quality', 'Heart rate trends', 'Workout routines'],
      price: 75,
      monthlyPrice: 15,
      demand: 'Very High',
      buyers: 12,
      color: '#10b981',
      category: 'Health & Wellness'
    },
    {
      id: 2,
      name: 'Entertainment Profile',
      icon: '🎬',
      description: 'Media consumption habits for content creators & advertisers',
      services: ['Spotify', 'Netflix', 'YouTube'],
      servicesIds: ['spotify', 'netflix', 'youtube'],
      insights: ['Music preferences', 'Video watch history', 'Content engagement', 'Time spent patterns'],
      price: 60,
      monthlyPrice: 12,
      demand: 'Very High',
      buyers: 18,
      color: '#f59e0b',
      category: 'Entertainment'
    },
    {
      id: 3,
      name: 'Digital Professional',
      icon: '💼',
      description: 'Work patterns & productivity insights for HR tech & SaaS',
      services: ['LinkedIn', 'GitHub', 'Slack', 'Google Calendar'],
      servicesIds: ['linkedin', 'github', 'slack', 'google'],
      insights: ['Work schedule', 'Communication patterns', 'Coding activity', 'Meeting frequency', 'Professional network'],
      price: 90,
      monthlyPrice: 18,
      demand: 'High',
      buyers: 8,
      color: '#0077B5',
      category: 'Productivity'
    },
    {
      id: 4,
      name: 'Consumer Behavior',
      icon: '🛍️',
      description: 'Shopping & lifestyle patterns for e-commerce & retail',
      services: ['Amazon', 'Uber', 'DoorDash'],
      servicesIds: ['amazon', 'uber', 'doordash'],
      insights: ['Purchase patterns', 'Location habits', 'Food preferences', 'Spending categories', 'Brand loyalty'],
      price: 85,
      monthlyPrice: 17,
      demand: 'Very High',
      buyers: 22,
      color: '#FF9900',
      category: 'Shopping & Lifestyle'
    },
    {
      id: 5,
      name: 'Financial Health',
      icon: '💰',
      description: 'Complete financial profile for fintech & banking',
      services: ['Plaid', 'Venmo', 'PayPal', 'Coinbase'],
      servicesIds: ['plaid', 'venmo', 'paypal', 'coinbase'],
      insights: ['Transaction patterns', 'Spending habits', 'Payment methods', 'Crypto activity', 'Financial health score'],
      price: 120,
      monthlyPrice: 24,
      demand: 'High',
      buyers: 6,
      color: '#00C9A7',
      category: 'Finance'
    },
    {
      id: 6,
      name: 'Social Influencer',
      icon: '📱',
      description: 'Social media engagement for marketing agencies & brands',
      services: ['Instagram', 'TikTok', 'Twitter/X'],
      servicesIds: ['instagram', 'tiktok', 'twitter'],
      insights: ['Engagement metrics', 'Audience demographics', 'Post performance', 'Viral content patterns', 'Influence score'],
      price: 95,
      monthlyPrice: 19,
      demand: 'Very High',
      buyers: 25,
      color: '#E1306C',
      category: 'Social Media'
    },
  ];

  const activePackages = [
    {
      id: 2,
      name: 'Entertainment Profile',
      icon: '🎬',
      services: ['Spotify', 'Netflix', 'YouTube'],
      monthlyEarnings: 12,
      totalEarned: 36,
      activeSince: '3 months',
      buyers: 3,
      nextPayment: '5 days'
    }
  ];

  const calculateCompletion = (serviceIds: string[]) => {
    const connected = serviceIds.filter(id => connectedServices.includes(id)).length;
    return Math.round((connected / serviceIds.length) * 100);
  };

  const canActivate = (serviceIds: string[]) => {
    return serviceIds.every(id => connectedServices.includes(id));
  };

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    📦 Data Packages
                  </h1>
                  <p className="text-sm text-gray-400">Curated data bundles • Earn 50% more than individual services</p>
                </div>
              </div>

              <div className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
                <p className="text-sm text-gray-400">Package Earnings</p>
                <p className="text-2xl font-bold text-green-400">$36/mo</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 backdrop-blur-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Why Data Packages?</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Packages combine multiple data sources to create valuable insights. Businesses pay <span className="text-cyan-400 font-semibold">50-100% more</span> for packaged data versus individual sources.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">✓ Higher earnings per service</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">✓ More business demand</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">✓ Automated bundling</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'available'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-cyan-500/30'
              }`}
            >
              Available Packages ({dataPackages.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'active'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-cyan-500/30'
              }`}
            >
              Active Packages ({activePackages.length})
            </button>
          </div>

          {/* Content */}
          {activeTab === 'available' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {dataPackages.map((pkg, index) => {
                const completion = calculateCompletion(pkg.servicesIds);
                const isReady = canActivate(pkg.servicesIds);

                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`backdrop-blur-xl bg-white/5 border rounded-2xl p-6 hover:border-cyan-400/30 transition-all ${
                      isReady ? 'border-cyan-500/30' : 'border-white/10'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                             style={{ background: `${pkg.color}20` }}>
                          {pkg.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                          <p className="text-xs text-gray-400">{pkg.category}</p>
                        </div>
                      </div>

                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        pkg.demand === 'Very High'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {pkg.demand === 'Very High' ? '🔥' : '⚡'} {pkg.demand} Demand
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>

                    {/* Services Required */}
                    <div className="mb-4">
                      <p className="text-gray-400 text-xs mb-2">Services Required:</p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.services.map((service, i) => (
                          <span
                            key={service}
                            className={`px-3 py-1 rounded-full text-xs ${
                              connectedServices.includes(pkg.servicesIds[i])
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}
                          >
                            {connectedServices.includes(pkg.servicesIds[i]) ? '✓' : '○'} {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Insights Included */}
                    <div className="mb-4">
                      <p className="text-gray-400 text-xs mb-2">Insights Included:</p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.insights.slice(0, 3).map((insight) => (
                          <span key={insight} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300">
                            {insight}
                          </span>
                        ))}
                        {pkg.insights.length > 3 && (
                          <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300">
                            +{pkg.insights.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Completion Bar */}
                    {!isReady && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400">Completion</span>
                          <span className="text-cyan-400 font-semibold">{completion}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${completion}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                          />
                        </div>
                      </div>
                    )}

                    {/* Pricing & Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-400 mb-1">You Earn</p>
                        <p className="text-lg font-bold text-green-400">${pkg.monthlyPrice}/mo</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-400 mb-1">Buyers</p>
                        <p className="text-lg font-bold text-white">{pkg.buyers}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-400 mb-1">Total Value</p>
                        <p className="text-lg font-bold text-cyan-400">${pkg.price}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    {isReady ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
                      >
                        ✓ Activate Package
                      </motion.button>
                    ) : (
                      <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-gray-400 rounded-lg font-medium hover:border-cyan-400/30 hover:text-cyan-400 transition-all"
                      >
                        Connect Missing Services
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {activeTab === 'active' && (
            <div className="space-y-4">
              {activePackages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="backdrop-blur-xl bg-white/5 border border-green-500/30 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-2xl">
                          {pkg.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                          <p className="text-green-400 text-sm">Active for {pkg.activeSince}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Services</p>
                          <div className="flex flex-wrap gap-1">
                            {pkg.services.map((service) => (
                              <span key={service} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-400 text-xs mb-1">Monthly</p>
                          <p className="text-white font-bold text-lg">${pkg.monthlyEarnings}/mo</p>
                        </div>

                        <div>
                          <p className="text-gray-400 text-xs mb-1">Total Earned</p>
                          <p className="text-green-400 font-bold text-lg">${pkg.totalEarned}</p>
                        </div>

                        <div>
                          <p className="text-gray-400 text-xs mb-1">Active Buyers</p>
                          <p className="text-white font-bold text-lg">{pkg.buyers}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-400">
                        Next payment in <span className="text-cyan-400 font-semibold">{pkg.nextPayment}</span>
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-all"
                    >
                      Deactivate
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
