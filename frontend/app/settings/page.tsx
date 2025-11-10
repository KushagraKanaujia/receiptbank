'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function SettingsPage() {
  const router = useRouter();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [dataRequests, setDataRequests] = useState(true);
  const [monthlyReports, setMonthlyReports] = useState(true);

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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Settings
              </h1>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="space-y-6">
            {/* Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value="demo@datahub.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">First Name</label>
                    <input
                      type="text"
                      placeholder="John"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Last Name</label>
                    <input
                      type="text"
                      placeholder="Doe"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-gray-400 text-sm">Receive updates via email</p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      emailNotifications ? 'bg-cyan-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-transform ${
                        emailNotifications ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Data Access Requests</p>
                    <p className="text-gray-400 text-sm">Get notified of new requests</p>
                  </div>
                  <button
                    onClick={() => setDataRequests(!dataRequests)}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      dataRequests ? 'bg-cyan-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-transform ${
                        dataRequests ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Monthly Reports</p>
                    <p className="text-gray-400 text-sm">Receive monthly earnings reports</p>
                  </div>
                  <button
                    onClick={() => setMonthlyReports(!monthlyReports)}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      monthlyReports ? 'bg-cyan-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-transform ${
                        monthlyReports ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Earnings & Referrals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">💰 Earnings & Referrals</h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/referrals')}
                  className="w-full px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-lg text-white hover:border-green-400/50 transition-all text-left flex items-center justify-between"
                >
                  <span>🎁 Referral Program ($60 earned)</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:border-cyan-400/50 transition-all text-left">
                  💳 Payout Methods
                </button>
                <button className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:border-cyan-400/50 transition-all text-left">
                  📊 Earnings History
                </button>
              </div>
            </motion.div>

            {/* Privacy & Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Privacy & Data</h2>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:border-cyan-400/50 transition-all text-left">
                  📥 Download All My Data
                </button>
                <button className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:border-cyan-400/50 transition-all text-left">
                  🗑️ Delete Specific Data
                </button>
                <button className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:border-cyan-400/50 transition-all text-left">
                  🔒 Privacy Settings
                </button>
              </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h2>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all text-left">
                  ⚠️ Revoke All Data Access
                </button>
                <button className="w-full px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all text-left">
                  🗑️ Delete Account
                </button>
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4 justify-end"
            >
              <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all">
                Cancel
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white hover:from-cyan-600 hover:to-blue-700 transition-all">
                Save Changes
              </button>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
