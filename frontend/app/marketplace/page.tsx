'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function MarketplacePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'requests' | 'offers'>('requests');

  const dataRequests = [
    {
      id: 1,
      business: 'HealthTech Inc.',
      services: ['Fitbit', 'Google Calendar'],
      dataFields: ['Daily steps', 'Heart rate', 'Sleep data', 'Calendar events'],
      price: 25,
      frequency: 'Monthly',
      status: 'pending',
      verified: true,
      rating: 4.8,
      totalUsers: 1247,
      trustScore: 95,
      badges: ['✓ Verified', '🛡️ GDPR Compliant', '🔒 Encrypted'],
      companyInfo: 'Leading wellness technology company focused on preventive healthcare solutions.'
    },
    {
      id: 2,
      business: 'Music Analytics Co.',
      services: ['Spotify'],
      dataFields: ['Top songs', 'Listening history', 'Playlists'],
      price: 15,
      frequency: 'Monthly',
      status: 'pending',
      verified: true,
      rating: 4.6,
      totalUsers: 892,
      trustScore: 88,
      badges: ['✓ Verified', '🔒 Encrypted'],
      companyInfo: 'Music industry analytics platform helping artists understand their audience.'
    },
    {
      id: 3,
      business: 'Financial Insights LLC',
      services: ['Plaid'],
      dataFields: ['Transaction history', 'Spending patterns'],
      price: 50,
      frequency: 'Monthly',
      status: 'pending',
      verified: true,
      rating: 4.9,
      totalUsers: 2341,
      trustScore: 98,
      badges: ['✓ Verified', '🛡️ GDPR Compliant', '🔒 Encrypted', '🏦 SOC 2 Certified'],
      companyInfo: 'Enterprise fintech platform providing financial wellness insights to millions.'
    }
  ];

  const activeOffers = [
    {
      id: 4,
      business: 'Productivity Labs',
      services: ['Notion', 'Google Calendar'],
      price: 30,
      earnings: 90,
      since: '3 months ago'
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Data Marketplace
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-gray-400">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-400">$90.00</p>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'requests'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-cyan-500/30'
              }`}
            >
              Pending Requests ({dataRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'offers'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-cyan-500/30'
              }`}
            >
              Active Offers ({activeOffers.length})
            </button>
          </div>

          {/* Content */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {dataRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-cyan-400/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                          🏢
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-white">{request.business}</h3>
                            {request.verified && (
                              <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-400 font-medium">
                                ✓ Verified
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{request.companyInfo}</p>

                          {/* Trust Indicators */}
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400">★</span>
                              <span className="text-white font-semibold">{request.rating}</span>
                              <span className="text-gray-400">({request.totalUsers.toLocaleString()} users)</span>
                            </div>
                            <div className={`px-2 py-0.5 rounded ${
                              request.trustScore >= 95 ? 'bg-green-500/20 text-green-400' :
                              request.trustScore >= 85 ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              Trust Score: {request.trustScore}%
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {request.badges.map((badge) => (
                              <span key={badge} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-gray-300">
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Services Requested</p>
                          <div className="flex flex-wrap gap-2">
                            {request.services.map((service) => (
                              <span key={service} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-400 text-sm mb-1">Data Fields</p>
                          <div className="flex flex-wrap gap-2">
                            {request.dataFields.slice(0, 2).map((field) => (
                              <span key={field} className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-sm">
                                {field}
                              </span>
                            ))}
                            {request.dataFields.length > 2 && (
                              <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-sm">
                                +{request.dataFields.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <p className="text-gray-400">Offered Price</p>
                          <p className="text-green-400 font-bold text-lg">${request.price}/{request.frequency}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Frequency</p>
                          <p className="text-white font-medium">{request.frequency} sync</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
                      >
                        ✓ Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 bg-white/5 border border-white/10 text-gray-400 rounded-lg font-medium hover:border-red-500/30 hover:text-red-400 transition-all"
                      >
                        ✗ Decline
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'offers' && (
            <div className="space-y-4">
              {activeOffers.map((offer, index) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="backdrop-blur-xl bg-white/5 border border-green-500/30 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-2xl">
                          ✓
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{offer.business}</h3>
                          <p className="text-green-400 text-sm">Active since {offer.since}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Services</p>
                          <div className="flex flex-wrap gap-2">
                            {offer.services.map((service) => (
                              <span key={service} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-400 text-sm mb-1">Monthly Rate</p>
                          <p className="text-white font-bold text-lg">${offer.price}/mo</p>
                        </div>

                        <div>
                          <p className="text-gray-400 text-sm mb-1">Total Earned</p>
                          <p className="text-green-400 font-bold text-lg">${offer.earnings}</p>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-all"
                    >
                      Revoke Access
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
