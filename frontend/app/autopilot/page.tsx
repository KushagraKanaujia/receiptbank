'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function AutopilotPage() {
  const router = useRouter();
  const [autopilotEnabled, setAutopilotEnabled] = useState(true);
  const [maxPrice, setMaxPrice] = useState(50);
  const [autoApproveCategories, setAutoApproveCategories] = useState({
    'Health & Fitness': true,
    'Music & Entertainment': true,
    'Social Media': false,
    'Shopping & Travel': true,
    'Finance & Banking': false,
    'Productivity': true,
    'Gaming': true,
  });
  const [whitelistedCompanies, setWhitelistedCompanies] = useState([
    'Productivity Labs',
    'HealthTech Inc.',
    'Music Analytics Co.'
  ]);
  const [blacklistedCompanies, setBlacklistedCompanies] = useState([
    'Spam Marketing LLC'
  ]);
  const [newCompany, setNewCompany] = useState('');
  const [autoRenew, setAutoRenew] = useState(true);

  const recentActivity = [
    { id: 1, company: 'Productivity Labs', action: 'Auto-approved', amount: 30, category: 'Productivity', time: '2 hours ago', status: 'success' },
    { id: 2, company: 'HealthTech Inc.', action: 'Auto-approved', amount: 25, category: 'Health & Fitness', time: '5 hours ago', status: 'success' },
    { id: 3, company: 'Spam Marketing LLC', action: 'Auto-declined (Blacklisted)', amount: 40, category: 'Social Media', time: '1 day ago', status: 'declined' },
    { id: 4, company: 'Data Insights Corp', action: 'Needs Review (New)', amount: 75, category: 'Finance & Banking', time: '2 days ago', status: 'pending' },
  ];

  const addToWhitelist = () => {
    if (newCompany.trim()) {
      setWhitelistedCompanies([...whitelistedCompanies, newCompany.trim()]);
      setNewCompany('');
    }
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
                  ⚡ Autopilot Mode
                </h1>
                <p className="text-sm text-gray-400">Automate your data approvals with smart rules</p>
              </div>

              {/* Master Toggle */}
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                <span className="text-sm text-white font-medium">Autopilot</span>
                <button
                  onClick={() => setAutopilotEnabled(!autopilotEnabled)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    autopilotEnabled ? 'bg-cyan-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-transform ${
                      autopilotEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8 max-w-6xl">
          {autopilotEnabled ? (
            <div className="space-y-6">
              {/* Status Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-2xl p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">Autopilot is Active</h3>
                    <p className="text-green-400 text-sm">Your rules are automatically processing incoming requests</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-400">37</p>
                    <p className="text-sm text-gray-400">Auto-approved this month</p>
                  </div>
                </div>
              </motion.div>

              {/* Price Rules */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-white mb-4">💰 Price Rules</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Auto-approve requests up to
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="10"
                        max="200"
                        step="5"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                      <span className="text-2xl font-bold text-cyan-400 min-w-[80px]">${maxPrice}/mo</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Requests above ${maxPrice} will require manual review
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Auto-renew subscriptions</p>
                      <p className="text-gray-400 text-sm">Continue approved deals automatically</p>
                    </div>
                    <button
                      onClick={() => setAutoRenew(!autoRenew)}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        autoRenew ? 'bg-cyan-500' : 'bg-gray-600'
                      }`}
                    >
                      <div
                        className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-transform ${
                          autoRenew ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Category Rules */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-white mb-4">📊 Category Rules</h2>
                <p className="text-gray-400 text-sm mb-4">Choose which data categories to auto-approve</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(autoApproveCategories).map(([category, enabled]) => (
                    <div
                      key={category}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        enabled
                          ? 'bg-cyan-500/10 border-cyan-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                      onClick={() => setAutoApproveCategories({
                        ...autoApproveCategories,
                        [category]: !enabled
                      })}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{category}</span>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          enabled ? 'bg-cyan-500 border-cyan-500' : 'border-gray-500'
                        }`}>
                          {enabled && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Company Whitelist/Blacklist */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-white mb-4">🏢 Company Lists</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Whitelist */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-green-400 font-semibold">✓ Whitelist</span>
                      <span className="text-xs text-gray-500">(Always approve)</span>
                    </div>

                    <div className="space-y-2 mb-3">
                      {whitelistedCompanies.map((company, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <span className="text-white text-sm">{company}</span>
                          <button
                            onClick={() => setWhitelistedCompanies(whitelistedCompanies.filter((_, i) => i !== index))}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add company..."
                        value={newCompany}
                        onChange={(e) => setNewCompany(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addToWhitelist()}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                      />
                      <button
                        onClick={addToWhitelist}
                        className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-all"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Blacklist */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-red-400 font-semibold">✗ Blacklist</span>
                      <span className="text-xs text-gray-500">(Always decline)</span>
                    </div>

                    <div className="space-y-2">
                      {blacklistedCompanies.map((company, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <span className="text-white text-sm">{company}</span>
                          <button
                            onClick={() => setBlacklistedCompanies(blacklistedCompanies.filter((_, i) => i !== index))}
                            className="text-gray-400 hover:text-gray-300 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-white mb-4">📋 Recent Autopilot Activity</h2>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-4 rounded-lg border ${
                        activity.status === 'success'
                          ? 'bg-green-500/5 border-green-500/20'
                          : activity.status === 'declined'
                          ? 'bg-red-500/5 border-red-500/20'
                          : 'bg-yellow-500/5 border-yellow-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">{activity.company}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              activity.status === 'success'
                                ? 'bg-green-500/20 text-green-400'
                                : activity.status === 'declined'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {activity.action}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span>{activity.category}</span>
                            <span>•</span>
                            <span className="text-white font-semibold">${activity.amount}/mo</span>
                            <span>•</span>
                            <span>{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Save Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-4 justify-end"
              >
                <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all">
                  Reset to Defaults
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white hover:from-cyan-600 hover:to-blue-700 transition-all">
                  Save Autopilot Rules
                </button>
              </motion.div>
            </div>
          ) : (
            /* Autopilot Disabled State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center"
            >
              <div className="w-24 h-24 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">😴</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Autopilot is Disabled</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Enable autopilot mode to automatically approve data requests based on your rules
              </p>
              <button
                onClick={() => setAutopilotEnabled(true)}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white hover:from-cyan-600 hover:to-blue-700 transition-all"
              >
                Enable Autopilot
              </button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
